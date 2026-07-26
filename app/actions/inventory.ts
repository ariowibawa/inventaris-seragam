"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { StockAdjustmentSchema, type GeneralFormState } from "@/lib/definitions";

export type InventoryProduct = {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  stock: number;
  minimumStock: number;
  category: { id: string; name: string };
};

export type InventoryFilters = {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
};

export async function getInventorySummary() {
  const [totalProducts, totalStockResult, allProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.aggregate({
        _sum: { stock: true },
      }),
      prisma.product.findMany({
        select: { stock: true, minimumStock: true },
      }),
    ]);

  const lowStock = allProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.minimumStock
  ).length;

  const outOfStock = allProducts.filter((p) => p.stock === 0).length;

  return {
    totalProducts,
    totalStock: totalStockResult._sum.stock || 0,
    lowStockCount: lowStock,
    outOfStockCount: outOfStock,
  };
}

export async function getInventoryProducts(filters: InventoryFilters = {}) {
  const { search, status, page = 1, perPage = 10 } = filters;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "tersedia") {
    // stock > minimumStock — handle via post-filter or raw. Use simpler approach:
    // We can't do field comparison in Prisma, so we fetch all and filter.
    // For small datasets this is fine.
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  // Add computed status
  const inventoryProducts = products.map((p) => ({
    ...p,
    stockStatus:
      p.stock === 0
        ? "Habis"
        : p.stock <= p.minimumStock
          ? "Stok Rendah"
          : "Tersedia",
  }));

  return {
    products: inventoryProducts,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getStockMovements(productId: string) {
  return prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function adjustStock(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  const validatedFields = StockAdjustmentSchema.safeParse({
    productId: formData.get("productId"),
    type: formData.get("type"),
    quantity: Number(formData.get("quantity")) || 0,
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Mohon lengkapi semua field.",
    };
  }

  const { productId, type, quantity, notes } = validatedFields.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { message: "Produk tidak ditemukan." };

  let newStock: number;
  let quantityChange: number;

  if (type === "in") {
    newStock = product.stock + quantity;
    quantityChange = quantity;
  } else if (type === "out") {
    if (product.stock < quantity) {
      return { message: `Stok tidak cukup. Stok saat ini: ${product.stock}` };
    }
    newStock = product.stock - quantity;
    quantityChange = -quantity;
  } else {
    // adjustment — set to exact value
    newStock = quantity;
    quantityChange = quantity - product.stock;
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        type,
        referenceType: "manual",
        quantityBefore: product.stock,
        quantityChange,
        quantityAfter: newStock,
        notes,
      },
    }),
  ]);

  revalidatePath("/inventaris");
  revalidatePath("/produk");

  return { success: true, message: "Stok berhasil diperbarui." };
}
