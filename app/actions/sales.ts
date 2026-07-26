"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SaleSchema, type GeneralFormState } from "@/lib/definitions";

export type SaleWithDetails = {
  id: string;
  salesNumber: string;
  salesDate: Date;
  totalAmount: number;
  discount: number;
  paymentMethod: string;
  totalHpp: number;
  grossProfit: number;
  notes: string | null;
  createdAt: Date;
  salesItems: Array<{
    id: string;
    productId: string | null;
    productName?: string | null;
    productSku?: string | null;
    product: { id: string; name: string; sku: string } | null;
    quantity: number;
    sellingPrice: number;
    costPrice: number;
    discount: number;
    subtotal: number;
    profit: number;
  }>;
};

export type SaleFilters = {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
};

export async function getSales(filters: SaleFilters = {}) {
  const { search, startDate, endDate, page = 1, perPage = 10 } = filters;
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { salesNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  if (startDate || endDate) {
    where.salesDate = {};
    if (startDate) (where.salesDate as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.salesDate as Record<string, unknown>).lte = new Date(endDate + "T23:59:59");
  }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: { salesItems: { include: { product: true } } },
      orderBy: { salesDate: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    sales: sales as SaleWithDetails[],
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

function generateSalesNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const time = String(now.getTime()).slice(-4);
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `TRX-${y}${m}${d}-${time}${rand}`;
}

export async function createSale(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  try {
    const itemsJson = formData.get("items") as string;
    let parsedItems: Array<{ productId: string; quantity: number; sellingPrice: number; discount: number }> = [];

    try {
      parsedItems = JSON.parse(itemsJson);
    } catch {
      return { message: "Format data item tidak valid." };
    }

    const rawData = {
      salesDate: formData.get("salesDate") as string,
      paymentMethod: formData.get("paymentMethod") as string,
      discount: Number(formData.get("discount")) || 0,
      notes: (formData.get("notes") as string) || undefined,
      items: parsedItems,
    };

    const validatedFields = SaleSchema.safeParse(rawData);
    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors, message: "Mohon lengkapi semua field." };
    }

    const { salesDate, paymentMethod, discount, notes, items } = validatedFields.data;

    if (!items || items.length === 0) {
      return { message: "Minimal 1 item penjualan." };
    }

    // Validate discount vs item subtotal sum
    const totalSubtotalBeforeDiscount = items.reduce(
      (sum, item) => sum + (item.quantity * item.sellingPrice - (item.discount || 0)),
      0
    );

    if (discount > totalSubtotalBeforeDiscount) {
      return { message: "Diskon global tidak boleh melebihi total subtotal item." };
    }

    const salesNumber = generateSalesNumber();

    // Validate stock availability
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return { message: `Produk tidak ditemukan.` };
      if (product.stock < item.quantity) {
        return { message: `Stok "${product.name}" tidak cukup. Tersedia: ${product.stock}, diminta: ${item.quantity}` };
      }
    }

    await prisma.$transaction(async (tx) => {
      // Build sale items with profit calculation
      const saleItemsData = [];
      let totalAmount = 0;
      let totalHpp = 0;

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        const itemSubtotal = item.quantity * item.sellingPrice - (item.discount || 0);
        const itemHpp = item.quantity * product.costPrice;
        const itemProfit = itemSubtotal - itemHpp;

        totalAmount += itemSubtotal;
        totalHpp += itemHpp;

        saleItemsData.push({
          productId: item.productId,
          productName: product.name,
          productSku: product.sku,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
          costPrice: product.costPrice,
          discount: item.discount || 0,
          subtotal: itemSubtotal,
          profit: itemProfit,
        });
      }

      const finalTotalAmount = Math.max(0, totalAmount - discount);
      const grossProfit = finalTotalAmount - totalHpp;

      const sale = await tx.sale.create({
        data: {
          salesNumber,
          salesDate: new Date(salesDate),
          totalAmount: finalTotalAmount,
          discount,
          paymentMethod,
          totalHpp,
          grossProfit,
          notes,
          salesItems: { create: saleItemsData },
        },
      });

      // Update stock & create movements
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        const newStock = product.stock - item.quantity;
        await tx.product.update({ where: { id: item.productId }, data: { stock: newStock } });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "out",
            referenceType: "sale",
            referenceId: sale.id,
            quantityBefore: product.stock,
            quantityChange: -item.quantity,
            quantityAfter: newStock,
            notes: `Penjualan ${salesNumber}`,
          },
        });
      }

      // Cashflow income
      await tx.cashflow.create({
        data: {
          type: "income",
          category: "Penjualan",
          amount: finalTotalAmount,
          sourceType: "sale",
          sourceId: sale.id,
          cashflowDate: new Date(salesDate),
          notes: `Penjualan ${salesNumber}`,
        },
      });
    });

    try {
      revalidatePath("/penjualan");
      revalidatePath("/inventaris");
      revalidatePath("/produk");
      revalidatePath("/cashflow");
      revalidatePath("/");
    } catch {
      // Ignore revalidatePath errors outside Next.js request context
    }

    return { success: true, message: "Penjualan berhasil disimpan." };
  } catch (error) {
    console.error("Error creating sale:", error);
    return {
      success: false,
      message: error instanceof Error ? `Gagal menyimpan penjualan: ${error.message}` : "Gagal menyimpan penjualan.",
    };
  }
}

export async function deleteSale(id: string) {
  try {
    const sale = await prisma.sale.findUnique({ where: { id }, include: { salesItems: true } });
    if (!sale) return { error: "Penjualan tidak ditemukan." };

    await prisma.$transaction(async (tx) => {
      for (const item of sale.salesItems) {
        if (!item.productId) continue;
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;
        await tx.product.update({ where: { id: item.productId }, data: { stock: product.stock + item.quantity } });
      }
      await tx.stockMovement.deleteMany({ where: { referenceType: "sale", referenceId: id } });
      await tx.cashflow.deleteMany({ where: { sourceType: "sale", sourceId: id } });
      await tx.salesItem.deleteMany({ where: { saleId: id } });
      await tx.sale.delete({ where: { id } });
    });

    try {
      revalidatePath("/penjualan");
      revalidatePath("/inventaris");
      revalidatePath("/produk");
      revalidatePath("/cashflow");
    } catch {
      // Ignore revalidatePath errors outside Next.js request context
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting sale:", error);
    return { error: error instanceof Error ? error.message : "Gagal menghapus penjualan." };
  }
}

export async function getPaymentMethods() {
  return prisma.paymentMethod.findMany({ orderBy: { name: "asc" } });
}
