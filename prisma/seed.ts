import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  // ============ Admin User ============
  const hashedPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@uniform.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@uniform.com",
      password: hashedPassword,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ============ Categories ============
  const categoryNames = ["Kemeja", "Celana", "Atasan", "Aksesoris", "Lainnya"];
  const categories: Record<string, string> = {};

  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = cat.id;
  }
  console.log(`✅ ${categoryNames.length} categories created`);

  // ============ Suppliers ============
  const supplierData = [
    {
      name: "PT. Textile Indonesia",
      phone: "021-555-1234",
      address: "Jl. Industri No. 10, Jakarta",
    },
    {
      name: "CV. Benang Emas",
      phone: "022-555-5678",
      address: "Jl. Kain No. 25, Bandung",
    },
    {
      name: "PT. Seragam Jaya",
      phone: "031-555-9012",
      address: "Jl. Garmen No. 8, Surabaya",
    },
  ];

  const suppliers: Record<string, string> = {};
  for (const data of supplierData) {
    const supplier = await prisma.supplier.create({
      data,
    });
    suppliers[data.name] = supplier.id;
  }
  console.log(`✅ ${supplierData.length} suppliers created`);

  // ============ Payment Methods ============
  const paymentMethods = [
    "Tunai",
    "Transfer Bank",
    "Kartu Kredit",
    "E-Wallet",
  ];
  for (const name of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ ${paymentMethods.length} payment methods created`);

  // ============ Cashflow Categories ============
  const cashflowCategories = [
    { name: "Penjualan Seragam", type: "income" },
    { name: "Pemasukan Lain", type: "income" },
    { name: "Pembelian Stok", type: "expense" },
    { name: "Gaji Pegawai", type: "expense" },
    { name: "Listrik & Air", type: "expense" },
    { name: "Transport", type: "expense" },
    { name: "Operasional Lain", type: "expense" },
  ];
  for (const data of cashflowCategories) {
    await prisma.cashflowCategory.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    });
  }
  console.log(`✅ ${cashflowCategories.length} cashflow categories created`);

  // ============ Settings ============
  const settings = [
    { key: "default_minimum_stock", value: "15" },
  ];
  for (const data of settings) {
    await prisma.setting.upsert({
      where: { key: data.key },
      update: {},
      create: data,
    });
  }
  console.log(`✅ ${settings.length} settings created`);

  // ============ Products ============
  const productData = [
    {
      sku: "KSP-001-WHT",
      name: "Kemeja Seragam Pria",
      categoryId: categories["Kemeja"],
      size: "L",
      color: "Putih",
      costPrice: 120000,
      sellingPrice: 185000,
      stock: 145,
      minimumStock: 20,
      isActive: true,
    },
    {
      sku: "CPF-042-BLK",
      name: "Celana Panjang Formal",
      categoryId: categories["Celana"],
      size: "32",
      color: "Hitam",
      costPrice: 150000,
      sellingPrice: 250000,
      stock: 12,
      minimumStock: 20,
      isActive: false,
    },
    {
      sku: "BZW-011-NVY",
      name: "Blazer Wanita",
      categoryId: categories["Atasan"],
      size: "M",
      color: "Navy",
      costPrice: 220000,
      sellingPrice: 380000,
      stock: 0,
      minimumStock: 10,
      isActive: false,
    },
    {
      sku: "DSE-088-MRN",
      name: "Dasi Eksekutif",
      categoryId: categories["Aksesoris"],
      size: "All Size",
      color: "Maroon",
      costPrice: 45000,
      sellingPrice: 85000,
      stock: 85,
      minimumStock: 15,
      isActive: true,
    },
    {
      sku: "KLP-P-M",
      name: "Kemeja Lengan Pendek Pria",
      categoryId: categories["Kemeja"],
      size: "M",
      color: "Putih",
      costPrice: 100000,
      sellingPrice: 160000,
      stock: 150,
      minimumStock: 20,
      isActive: true,
    },
    {
      sku: "CPP-H-L",
      name: "Celana Panjang Pria",
      categoryId: categories["Celana"],
      size: "L",
      color: "Hitam",
      costPrice: 130000,
      sellingPrice: 220000,
      stock: 18,
      minimumStock: 20,
      isActive: true,
    },
    {
      sku: "RE-BN-S",
      name: "Rompi Eksekutif",
      categoryId: categories["Atasan"],
      size: "S",
      color: "Biru Navy",
      costPrice: 180000,
      sellingPrice: 300000,
      stock: 0,
      minimumStock: 5,
      isActive: true,
    },
    {
      sku: "BW-K-XL",
      name: "Blus Wanita",
      categoryId: categories["Atasan"],
      size: "XL",
      color: "Krem",
      costPrice: 95000,
      sellingPrice: 155000,
      stock: 85,
      minimumStock: 15,
      isActive: true,
    },
  ];

  const products: Record<string, string> = {};
  for (const data of productData) {
    const product = await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: data,
    });
    products[data.sku] = product.id;
  }
  console.log(`✅ ${productData.length} products created`);

  // ============ Sample Purchases ============
  const purchase1 = await prisma.purchase.create({
    data: {
      purchaseNumber: "PO-202310-001",
      supplierId: suppliers["PT. Textile Indonesia"],
      purchaseDate: new Date("2023-10-12"),
      totalAmount: 15500000,
      notes: "Pembelian stok awal bulan Oktober",
      purchaseItems: {
        create: [
          {
            productId: products["KSP-001-WHT"],
            quantity: 50,
            costPrice: 120000,
            subtotal: 6000000,
          },
          {
            productId: products["CPF-042-BLK"],
            quantity: 30,
            costPrice: 150000,
            subtotal: 4500000,
          },
          {
            productId: products["DSE-088-MRN"],
            quantity: 100,
            costPrice: 50000,
            subtotal: 5000000,
          },
        ],
      },
    },
  });

  const purchase2 = await prisma.purchase.create({
    data: {
      purchaseNumber: "PO-202310-002",
      supplierId: suppliers["CV. Benang Emas"],
      purchaseDate: new Date("2023-10-10"),
      totalAmount: 5200000,
      notes: "Pembelian blazer dan rompi",
      purchaseItems: {
        create: [
          {
            productId: products["BZW-011-NVY"],
            quantity: 20,
            costPrice: 220000,
            subtotal: 4400000,
          },
          {
            productId: products["RE-BN-S"],
            quantity: 5,
            costPrice: 160000,
            subtotal: 800000,
          },
        ],
      },
    },
  });
  console.log("✅ 2 sample purchases created");

  // Record cashflow for purchases
  await prisma.cashflow.createMany({
    data: [
      {
        type: "expense",
        category: "Pembelian Stok",
        sourceType: "purchase",
        sourceId: purchase1.id,
        amount: 15500000,
        cashflowDate: new Date("2023-10-12"),
        notes: "Pembelian PO-202310-001",
      },
      {
        type: "expense",
        category: "Pembelian Stok",
        sourceType: "purchase",
        sourceId: purchase2.id,
        amount: 5200000,
        cashflowDate: new Date("2023-10-10"),
        notes: "Pembelian PO-202310-002",
      },
    ],
  });

  // ============ Sample Sales ============
  const sale1 = await prisma.sale.create({
    data: {
      salesNumber: "TRX-2310-001",
      salesDate: new Date("2023-10-12T10:30:00"),
      totalAmount: 4500000,
      discount: 0,
      paymentMethod: "Transfer Bank",
      totalHpp: 2700000,
      grossProfit: 1800000,
      notes: "Penjualan ke PT. Adhi Karya",
      salesItems: {
        create: [
          {
            productId: products["KSP-001-WHT"],
            quantity: 15,
            sellingPrice: 185000,
            costPrice: 120000,
            discount: 0,
            subtotal: 2775000,
            profit: 975000,
          },
          {
            productId: products["DSE-088-MRN"],
            quantity: 15,
            sellingPrice: 85000,
            costPrice: 45000,
            discount: 0,
            subtotal: 1275000,
            profit: 600000,
          },
        ],
      },
    },
  });

  const sale2 = await prisma.sale.create({
    data: {
      salesNumber: "TRX-2310-002",
      salesDate: new Date("2023-10-11T14:15:00"),
      totalAmount: 2250000,
      discount: 0,
      paymentMethod: "Kartu Kredit",
      totalHpp: 1350000,
      grossProfit: 900000,
      notes: "Penjualan ke Bina Nusantara",
      salesItems: {
        create: [
          {
            productId: products["KLP-P-M"],
            quantity: 10,
            sellingPrice: 160000,
            costPrice: 100000,
            discount: 0,
            subtotal: 1600000,
            profit: 600000,
          },
          {
            productId: products["BW-K-XL"],
            quantity: 5,
            sellingPrice: 155000,
            costPrice: 95000,
            discount: 50000,
            subtotal: 650000,
            profit: 300000,
          },
        ],
      },
    },
  });
  console.log("✅ 2 sample sales created");

  // Record cashflow for sales
  await prisma.cashflow.createMany({
    data: [
      {
        type: "income",
        category: "Penjualan Seragam",
        sourceType: "sale",
        sourceId: sale1.id,
        amount: 4500000,
        cashflowDate: new Date("2023-10-12"),
        notes: "Penjualan TRX-2310-001",
      },
      {
        type: "income",
        category: "Penjualan Seragam",
        sourceType: "sale",
        sourceId: sale2.id,
        amount: 2250000,
        cashflowDate: new Date("2023-10-11"),
        notes: "Penjualan TRX-2310-002",
      },
    ],
  });

  // ============ Sample Stock Movements ============
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: products["KSP-001-WHT"],
        type: "in",
        referenceType: "purchase",
        referenceId: purchase1.id,
        quantityBefore: 95,
        quantityChange: 50,
        quantityAfter: 145,
        notes: "Stok masuk dari PO-202310-001",
      },
      {
        productId: products["KSP-001-WHT"],
        type: "out",
        referenceType: "sale",
        referenceId: sale1.id,
        quantityBefore: 160,
        quantityChange: -15,
        quantityAfter: 145,
        notes: "Stok keluar dari TRX-2310-001",
      },
      {
        productId: products["DSE-088-MRN"],
        type: "in",
        referenceType: "purchase",
        referenceId: purchase1.id,
        quantityBefore: 0,
        quantityChange: 100,
        quantityAfter: 100,
        notes: "Stok masuk dari PO-202310-001",
      },
      {
        productId: products["DSE-088-MRN"],
        type: "out",
        referenceType: "sale",
        referenceId: sale1.id,
        quantityBefore: 100,
        quantityChange: -15,
        quantityAfter: 85,
        notes: "Stok keluar dari TRX-2310-001",
      },
    ],
  });
  console.log("✅ Sample stock movements created");

  // ============ Sample Manual Cashflow ============
  await prisma.cashflow.createMany({
    data: [
      {
        type: "expense",
        category: "Listrik & Air",
        sourceType: "manual",
        amount: 1200000,
        cashflowDate: new Date("2023-10-21"),
        notes: "Tagihan Bulanan Gudang",
      },
      {
        type: "expense",
        category: "Gaji Pegawai",
        sourceType: "manual",
        amount: 5000000,
        cashflowDate: new Date("2023-10-25"),
        notes: "Gaji bulanan 2 pegawai",
      },
    ],
  });
  console.log("✅ Sample manual cashflow entries created");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Login credentials:");
  console.log("  Email: admin@uniform.com");
  console.log("  Password: admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
