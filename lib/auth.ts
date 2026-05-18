import "server-only";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function verifyAuth() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}
