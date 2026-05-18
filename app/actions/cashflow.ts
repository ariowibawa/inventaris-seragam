"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ManualCashflowSchema, type GeneralFormState } from "@/lib/definitions";

export type CashflowEntry = {
  id: string;
  type: string;
  category: string;
  sourceType: string | null;
  sourceId: string | null;
  amount: number;
  cashflowDate: Date;
  notes: string | null;
  createdAt: Date;
};

export type CashflowFilters = {
  search?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
};

export async function getCashflowSummary(startDate?: string, endDate?: string) {
  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.cashflowDate = {};
    if (startDate) (where.cashflowDate as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.cashflowDate as Record<string, unknown>).lte = new Date(endDate + "T23:59:59");
  }

  const allEntries = await prisma.cashflow.findMany({ where, select: { type: true, amount: true } });

  const totalIncome = allEntries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = allEntries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Saldo = all-time balance
  const allTime = await prisma.cashflow.findMany({ select: { type: true, amount: true } });
  const saldo = allTime.reduce((s, e) => e.type === "income" ? s + e.amount : s - e.amount, 0);

  return { saldo, totalIncome, totalExpense, netProfit };
}

export async function getCashflowEntries(filters: CashflowFilters = {}) {
  const { search, type, startDate, endDate, page = 1, perPage = 10 } = filters;
  const where: Record<string, unknown> = {};

  if (type && type !== "all") where.type = type;

  if (search) {
    where.OR = [
      { category: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  if (startDate || endDate) {
    where.cashflowDate = {};
    if (startDate) (where.cashflowDate as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.cashflowDate as Record<string, unknown>).lte = new Date(endDate + "T23:59:59");
  }

  const [entries, total] = await Promise.all([
    prisma.cashflow.findMany({
      where,
      orderBy: { cashflowDate: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.cashflow.count({ where }),
  ]);

  return {
    entries: entries as CashflowEntry[],
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getCashflowCategories() {
  return prisma.cashflowCategory.findMany({ orderBy: { name: "asc" } });
}

export async function createManualCashflow(
  state: GeneralFormState | undefined,
  formData: FormData
): Promise<GeneralFormState> {
  const validatedFields = ManualCashflowSchema.safeParse({
    type: formData.get("type"),
    category: formData.get("category"),
    amount: Number(formData.get("amount")) || 0,
    cashflowDate: formData.get("cashflowDate"),
    notes: (formData.get("notes") as string) || undefined,
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: "Mohon lengkapi semua field." };
  }

  const { type, category, amount, cashflowDate, notes } = validatedFields.data;

  await prisma.cashflow.create({
    data: {
      type,
      category,
      amount,
      sourceType: "manual",
      cashflowDate: new Date(cashflowDate),
      notes,
    },
  });

  revalidatePath("/cashflow");
  revalidatePath("/");

  return { success: true, message: "Transaksi berhasil ditambahkan." };
}

export async function deleteCashflow(id: string) {
  const entry = await prisma.cashflow.findUnique({ where: { id } });
  if (!entry) return { error: "Transaksi tidak ditemukan." };

  // Only allow deleting manual entries
  if (entry.sourceType !== "manual") {
    return { error: "Hanya transaksi manual yang bisa dihapus." };
  }

  await prisma.cashflow.delete({ where: { id } });
  revalidatePath("/cashflow");
  revalidatePath("/");

  return { success: true };
}
