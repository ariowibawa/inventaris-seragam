"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SupplierSchema, type GeneralFormState } from "@/lib/definitions";

export async function getSuppliers() {
  return prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createSupplier(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  const validatedFields = SupplierSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  await prisma.supplier.create({ data: validatedFields.data });

  revalidatePath("/pembelian");
  return { success: true, message: "Supplier berhasil ditambahkan." };
}
