"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PaymentMethodSchema, type GeneralFormState } from "@/lib/definitions";

export async function createPaymentMethod(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  const name = formData.get("name") as string;
  const validatedFields = PaymentMethodSchema.safeParse({ name });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Check if existing
  const existing = await prisma.paymentMethod.findUnique({
    where: { name: validatedFields.data.name },
  });

  if (existing) {
    return {
      errors: { name: ["Metode pembayaran sudah ada."] },
    };
  }

  await prisma.paymentMethod.create({
    data: { name: validatedFields.data.name },
  });

  revalidatePath("/pengaturan");
  revalidatePath("/pengaturan/metode-pembayaran");
  revalidatePath("/penjualan");

  return { success: true, message: "Metode pembayaran berhasil ditambahkan." };
}

export async function deletePaymentMethod(id: string) {
  const method = await prisma.paymentMethod.findUnique({
    where: { id },
  });

  if (!method) {
    return { error: "Metode pembayaran tidak ditemukan." };
  }

  // Check if used in any sales
  const salesCount = await prisma.sale.count({
    where: { paymentMethod: method.name },
  });

  if (salesCount > 0) {
    return {
      error: `Metode pembayaran "${method.name}" tidak dapat dihapus karena sudah digunakan dalam ${salesCount} transaksi penjualan.`,
    };
  }

  await prisma.paymentMethod.delete({
    where: { id },
  });

  revalidatePath("/pengaturan");
  revalidatePath("/pengaturan/metode-pembayaran");
  revalidatePath("/penjualan");

  return { success: true };
}
