"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [
    stockAgg,
    totalSalesCount,
    totalPurchasesCount,
    incomeAgg,
    expenseAgg,
  ] = await Promise.all([
    prisma.product.aggregate({
      _sum: { stock: true },
    }),
    prisma.sale.count(),
    prisma.purchase.count(),
    prisma.cashflow.aggregate({
      where: { type: "income" },
      _sum: { amount: true },
    }),
    prisma.cashflow.aggregate({
      where: { type: "expense" },
      _sum: { amount: true },
    }),
  ]);

  const totalStock = stockAgg._sum.stock || 0;
  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpense = expenseAgg._sum.amount || 0;
  const netProfit = totalIncome - totalExpense;

  return { totalStock, totalSalesCount, totalPurchasesCount, totalIncome, totalExpense, netProfit };
}

export async function getChartData() {
  const sales = await prisma.sale.findMany({
    select: { salesDate: true, totalAmount: true },
    orderBy: { salesDate: "asc" },
  });

  const purchases = await prisma.purchase.findMany({
    select: { purchaseDate: true, totalAmount: true },
    orderBy: { purchaseDate: "asc" },
  });

  // Group by month
  const monthMap: Record<string, { penjualan: number; pengeluaran: number }> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (const s of sales) {
    const d = new Date(s.salesDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthMap[key]) monthMap[key] = { penjualan: 0, pengeluaran: 0 };
    monthMap[key].penjualan += s.totalAmount;
  }

  for (const p of purchases) {
    const d = new Date(p.purchaseDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthMap[key]) monthMap[key] = { penjualan: 0, pengeluaran: 0 };
    monthMap[key].pengeluaran += p.totalAmount;
  }

  // Sort and format
  const sortedKeys = Object.keys(monthMap).sort();
  const last6 = sortedKeys.slice(-6);

  return last6.map((key) => {
    const [, monthIdx] = key.split("-");
    return {
      month: monthNames[parseInt(monthIdx)],
      penjualan: Math.round(monthMap[key].penjualan / 1000000),
      pengeluaran: Math.round(monthMap[key].pengeluaran / 1000000),
    };
  });
}

export async function getTopProducts() {
  const topItems = await prisma.salesItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { subtotal: "desc" } },
    take: 3,
  });

  const productIds = topItems.map((i) => i.productId).filter((id): id is string => id !== null);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });

  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  return topItems.map((item) => ({
    name: item.productId ? (productMap[item.productId] || "Unknown") : "Produk Terhapus",
    sales: item._sum.subtotal || 0,
    qty: item._sum.quantity || 0,
  }));
}

export async function getReportData(filters: {
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const { search, page = 1, perPage = 10 } = filters;
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        stockMovements: { select: { type: true, quantityChange: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  const reportItems = products.map((p) => {
    const masuk = p.stockMovements.filter((m) => m.type === "in").reduce((s, m) => s + m.quantityChange, 0);
    const keluar = Math.abs(p.stockMovements.filter((m) => m.type === "out").reduce((s, m) => s + m.quantityChange, 0));
    const stokAwal = p.stock - masuk + keluar; // reverse calculate

    return {
      id: p.id,
      sku: p.sku,
      nama: p.name,
      kategori: p.category.name,
      ukuran: p.size,
      stokAwal: Math.max(0, stokAwal),
      masuk,
      keluar,
      stokAkhir: p.stock,
      status: p.stock === 0 ? "Habis" : p.stock <= p.minimumStock ? "Stok Rendah" : "Tersedia",
    };
  });

  // Summary stats — use aggregate + targeted query
  const [stockSummary, outOfStockCount, activeWithStock] = await Promise.all([
    prisma.product.aggregate({
      _sum: { stock: true },
    }),
    prisma.product.count({
      where: { stock: 0 },
    }),
    prisma.product.findMany({
      where: { stock: { gt: 0 } },
      select: { stock: true, costPrice: true, minimumStock: true },
    }),
  ]);

  const totalStockValue = activeWithStock.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const totalItems = stockSummary._sum.stock || 0;
  const lowStockCount = activeWithStock.filter((p) => p.stock <= p.minimumStock).length + outOfStockCount;

  return {
    items: reportItems,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    summary: { totalStockValue, totalItems, lowStockCount },
  };
}
