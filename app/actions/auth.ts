"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { verifyPassword, hashPassword, verifyAuth } from "@/lib/auth";
import {
  LoginSchema,
  ChangePasswordSchema,
  type LoginFormState,
  type GeneralFormState,
} from "@/lib/definitions";

export async function login(
  state: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: email }, { name: email }],
    },
  });

  if (!user) {
    return {
      message: "Email/username atau password salah.",
    };
  }

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    return {
      message: "Email/username atau password salah.",
    };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function changePassword(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  const user = await verifyAuth();

  const validatedFields = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!fullUser) {
    return { message: "User tidak ditemukan." };
  }

  const isValidPassword = await verifyPassword(
    currentPassword,
    fullUser.password
  );

  if (!isValidPassword) {
    return { message: "Password saat ini salah." };
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { success: true, message: "Password berhasil diubah." };
}
