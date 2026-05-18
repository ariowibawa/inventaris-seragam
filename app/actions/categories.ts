"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CategorySchema, type GeneralFormState } from "@/lib/definitions";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function createCategory(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.category.findUnique({
    where: { name: validatedFields.data.name },
  });

  if (existing) {
    return {
      errors: { name: ["Kategori sudah ada."] },
    };
  }

  await prisma.category.create({
    data: { name: validatedFields.data.name },
  });

  revalidatePath("/produk");
  revalidatePath("/pengaturan");

  return { success: true, message: "Kategori berhasil ditambahkan." };
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    return { error: "Kategori tidak ditemukan." };
  }

  if (category._count.products > 0) {
    return {
      error: `Kategori "${category.name}" tidak bisa dihapus karena masih digunakan oleh ${category._count.products} produk.`,
    };
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/produk");
  revalidatePath("/pengaturan");

  return { success: true };
}
