"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PurchaseSchema, type GeneralFormState } from "@/lib/definitions";

export type PurchaseWithDetails = {
  id: string;
  purchaseNumber: string;
  purchaseDate: Date;
  supplierId: string;
  supplier: { id: string; name: string };
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
  purchaseItems: Array<{
    id: string;
    productId: string;
    product: { id: string; name: string; sku: string };
    quantity: number;
    costPrice: number;
    subtotal: number;
  }>;
};

export type PurchaseFilters = {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
};

export async function getPurchases(filters: PurchaseFilters = {}) {
  const { search, startDate, endDate, page = 1, perPage = 10 } = filters;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { purchaseNumber: { contains: search, mode: "insensitive" } },
      { supplier: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (startDate || endDate) {
    where.purchaseDate = {};
    if (startDate)
      (where.purchaseDate as Record<string, unknown>).gte = new Date(startDate);
    if (endDate)
      (where.purchaseDate as Record<string, unknown>).lte = new Date(
        endDate + "T23:59:59"
      );
  }

  const [purchases, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: {
        supplier: true,
        purchaseItems: { include: { product: true } },
      },
      orderBy: { purchaseDate: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.purchase.count({ where }),
  ]);

  return {
    purchases: purchases as PurchaseWithDetails[],
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `PUR-${y}${m}-${rand}`;
}

export async function createPurchase(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  // Parse items from formData
  const itemsJson = formData.get("items") as string;
  let parsedItems: Array<{
    productId: string;
    quantity: number;
    costPrice: number;
  }> = [];

  try {
    parsedItems = JSON.parse(itemsJson);
  } catch {
    return { message: "Format data item tidak valid." };
  }

  const rawData = {
    supplierId: formData.get("supplierId") as string,
    purchaseDate: formData.get("purchaseDate") as string,
    notes: (formData.get("notes") as string) || undefined,
    items: parsedItems,
  };

  const validatedFields = PurchaseSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Mohon lengkapi semua field.",
    };
  }

  const { supplierId, purchaseDate, notes, items } = validatedFields.data;

  // Calculate total
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0
  );

  const purchaseNumber = generateInvoiceNumber();

  // Use transaction: create purchase, update stock, create stock movements, create cashflow
  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber,
        supplierId,
        purchaseDate: new Date(purchaseDate),
        totalAmount,
        notes,
        purchaseItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            costPrice: item.costPrice,
            subtotal: item.quantity * item.costPrice,
          })),
        },
      },
    });

    // Update stock for each item
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) continue;

      const newStock = product.stock + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: newStock, costPrice: item.costPrice },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "in",
          referenceType: "purchase",
          referenceId: purchase.id,
          quantityBefore: product.stock,
          quantityChange: item.quantity,
          quantityAfter: newStock,
          notes: `Pembelian ${purchaseNumber}`,
        },
      });
    }

    // Create cashflow entry (expense)
    await tx.cashflow.create({
      data: {
        type: "expense",
        category: "Pembelian Stok",
        amount: totalAmount,
        sourceType: "purchase",
        sourceId: purchase.id,
        cashflowDate: new Date(purchaseDate),
        notes: `Pembelian ${purchaseNumber}`,
      },
    });
  });

  revalidatePath("/pembelian");
  revalidatePath("/inventaris");
  revalidatePath("/produk");
  revalidatePath("/cashflow");
  revalidatePath("/");

  return { success: true, message: "Pembelian berhasil disimpan." };
}

export async function deletePurchase(id: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { purchaseItems: true },
  });

  if (!purchase) return { error: "Pembelian tidak ditemukan." };

  await prisma.$transaction(async (tx) => {
    // Reverse stock
    for (const item of purchase.purchaseItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) continue;

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: Math.max(0, product.stock - item.quantity) },
      });
    }

    // Delete related records
    await tx.stockMovement.deleteMany({
      where: { referenceType: "purchase", referenceId: id },
    });
    await tx.cashflow.deleteMany({
      where: { sourceType: "purchase", sourceId: id },
    });
    await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
    await tx.purchase.delete({ where: { id } });
  });

  revalidatePath("/pembelian");
  revalidatePath("/inventaris");
  revalidatePath("/produk");
  revalidatePath("/cashflow");

  return { success: true };
}
