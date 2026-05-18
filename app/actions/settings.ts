"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { type GeneralFormState } from "@/lib/definitions";

export async function getAdminProfile() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { id: true, name: true, email: true },
  });
}

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return map;
}

export async function updateProfile(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  const session = await getSession();
  if (!session) return { message: "Unauthorized" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) return { message: "Nama dan email wajib diisi." };

  await prisma.user.update({
    where: { id: session.userId as string },
    data: { name, email },
  });

  revalidatePath("/pengaturan");
  return { success: true, message: "Profil berhasil diperbarui." };
}



export async function updateMinStock(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  const value = formData.get("minStock") as string;
  if (!value) return { message: "Nilai tidak valid." };

  await prisma.setting.upsert({
    where: { key: "defaultMinStock" },
    update: { value },
    create: { key: "defaultMinStock", value },
  });

  revalidatePath("/pengaturan");
  return { success: true, message: "Konfigurasi stok berhasil diperbarui." };
}
