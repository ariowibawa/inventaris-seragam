"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ProductSchema, type ProductFormState } from "@/lib/definitions";

export type ProductWithCategory = {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  category: { id: string; name: string };
  size: string;
  color: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  size?: string;
  status?: string;
  page?: number;
  perPage?: number;
};

export async function getProducts(filters: ProductFilters = {}) {
  const { search, categoryId, size, status, page = 1, perPage = 10 } = filters;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId && categoryId !== "semua") {
    where.categoryId = categoryId;
  }

  if (size && size !== "semua") {
    where.size = size;
  }

  if (status && status !== "semua") {
    where.isActive = status === "aktif";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products as ProductWithCategory[],
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function createProduct(
  state: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  const rawData = {
    name: formData.get("name") as string,
    sku: formData.get("sku") as string,
    categoryId: formData.get("categoryId") as string,
    size: formData.get("size") as string,
    color: formData.get("color") as string,
    costPrice: Number(String(formData.get("costPrice")).replace(/[^0-9]/g, "")) || 0,
    sellingPrice: Number(String(formData.get("sellingPrice")).replace(/[^0-9]/g, "")) || 0,
    stock: Number(formData.get("stock")) || 0,
    minimumStock: Number(formData.get("minimumStock")) || 15,
    isActive: formData.get("isActive") === "true",
  };

  const validatedFields = ProductSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Mohon lengkapi semua field yang diperlukan.",
    };
  }

  // Check SKU uniqueness
  const existingSku = await prisma.product.findUnique({
    where: { sku: validatedFields.data.sku },
  });

  if (existingSku) {
    return {
      errors: { sku: ["SKU sudah digunakan oleh produk lain."] },
      message: "SKU duplikat.",
    };
  }

  await prisma.product.create({
    data: validatedFields.data,
  });

  // If stock > 0, create initial stock movement
  if (validatedFields.data.stock > 0) {
    const product = await prisma.product.findUnique({
      where: { sku: validatedFields.data.sku },
    });

    if (product) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "in",
          referenceType: "manual",
          quantityBefore: 0,
          quantityChange: validatedFields.data.stock,
          quantityAfter: validatedFields.data.stock,
          notes: "Stok awal produk baru",
        },
      });
    }
  }

  revalidatePath("/produk");
  revalidatePath("/inventaris");

  return { success: true, message: "Produk berhasil ditambahkan." };
}

export async function updateProduct(
  state: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  const id = formData.get("id") as string;

  if (!id) {
    return { message: "ID produk tidak ditemukan." };
  }

  const rawData = {
    name: formData.get("name") as string,
    sku: formData.get("sku") as string,
    categoryId: formData.get("categoryId") as string,
    size: formData.get("size") as string,
    color: formData.get("color") as string,
    costPrice: Number(String(formData.get("costPrice")).replace(/[^0-9]/g, "")) || 0,
    sellingPrice: Number(String(formData.get("sellingPrice")).replace(/[^0-9]/g, "")) || 0,
    stock: Number(formData.get("stock")) || 0,
    minimumStock: Number(formData.get("minimumStock")) || 15,
    isActive: formData.get("isActive") === "true",
  };

  const validatedFields = ProductSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Mohon lengkapi semua field yang diperlukan.",
    };
  }

  // Check SKU uniqueness (excluding current product)
  const existingSku = await prisma.product.findFirst({
    where: {
      sku: validatedFields.data.sku,
      NOT: { id },
    },
  });

  if (existingSku) {
    return {
      errors: { sku: ["SKU sudah digunakan oleh produk lain."] },
      message: "SKU duplikat.",
    };
  }

  // Get current product for stock comparison
  const currentProduct = await prisma.product.findUnique({ where: { id } });

  if (!currentProduct) {
    return { message: "Produk tidak ditemukan." };
  }

  const { stock, ...updateData } = validatedFields.data;

  await prisma.product.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/produk");
  revalidatePath("/inventaris");

  return { success: true, message: "Produk berhasil diperbarui." };
}

export async function toggleProductStatus(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return { error: "Produk tidak ditemukan." };
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });

  revalidatePath("/produk");
  revalidatePath("/inventaris");

  return { success: true };
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      purchaseItems: { take: 1 },
      salesItems: { take: 1 },
    },
  });

  if (!product) {
    return { error: "Produk tidak ditemukan." };
  }

  // If product has transactions, soft delete
  if (product.purchaseItems.length > 0 || product.salesItems.length > 0) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/produk");
    return {
      success: true,
      message: "Produk telah dinonaktifkan karena memiliki riwayat transaksi.",
    };
  }

  // No transactions, hard delete
  await prisma.stockMovement.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  revalidatePath("/produk");
  revalidatePath("/inventaris");

  return { success: true, message: "Produk berhasil dihapus." };
}

// Helper: get unique sizes from products
export async function getUniqueSizes() {
  const products = await prisma.product.findMany({
    select: { size: true },
    distinct: ["size"],
    orderBy: { size: "asc" },
  });
  return products.map((p) => p.size);
}
