import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  // Fetch ALL products (no pagination for export)
  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      stockMovements: { select: { type: true, quantityChange: true } },
    },
    orderBy: { name: "asc" },
  });

  const reportItems = products.map((p) => {
    const masuk = p.stockMovements
      .filter((m) => m.type === "in")
      .reduce((s, m) => s + m.quantityChange, 0);
    const keluar = Math.abs(
      p.stockMovements
        .filter((m) => m.type === "out")
        .reduce((s, m) => s + m.quantityChange, 0)
    );
    const stokAwal = p.stock - masuk + keluar;

    return {
      sku: p.sku,
      nama: p.name,
      kategori: p.category.name,
      ukuran: p.size,
      stokAwal: Math.max(0, stokAwal),
      masuk,
      keluar,
      stokAkhir: p.stock,
      status:
        p.stock === 0
          ? "Habis"
          : p.stock <= p.minimumStock
            ? "Stok Rendah"
            : "Tersedia",
    };
  });

  // Build Excel workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Inventaris Seragam";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Laporan Stok");

  // Title row
  worksheet.mergeCells("A1:I1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "LAPORAN STOK SERAGAM";
  titleCell.font = { size: 16, bold: true, color: { argb: "FF4A3A31" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  // Date row
  worksheet.mergeCells("A2:I2");
  const dateCell = worksheet.getCell("A2");
  const now = new Date();
  dateCell.value = `Tanggal: ${now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`;
  dateCell.font = { size: 10, italic: true, color: { argb: "FF8A6C5F" } };
  dateCell.alignment = { horizontal: "center" };
  worksheet.getRow(2).height = 20;

  // Empty row
  worksheet.addRow([]);

  // Header row
  const headerRow = worksheet.addRow([
    "Kode SKU",
    "Nama Item",
    "Kategori",
    "Ukuran",
    "Stok Awal",
    "Masuk",
    "Keluar",
    "Stok Akhir",
    "Status",
  ]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF8A6C5F" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF6B5247" } },
      bottom: { style: "thin", color: { argb: "FF6B5247" } },
      left: { style: "thin", color: { argb: "FF6B5247" } },
      right: { style: "thin", color: { argb: "FF6B5247" } },
    };
  });
  headerRow.height = 24;

  // Data rows
  for (const item of reportItems) {
    const row = worksheet.addRow([
      item.sku,
      item.nama,
      item.kategori,
      item.ukuran,
      item.stokAwal,
      item.masuk,
      item.keluar,
      item.stokAkhir,
      item.status,
    ]);

    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5DCD1" } },
        bottom: { style: "thin", color: { argb: "FFE5DCD1" } },
        left: { style: "thin", color: { argb: "FFE5DCD1" } },
        right: { style: "thin", color: { argb: "FFE5DCD1" } },
      };
      cell.alignment = { vertical: "middle" };

      // Center numeric columns
      if (colNumber >= 5 && colNumber <= 8) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      // Status coloring
      if (colNumber === 9) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        if (item.status === "Habis") {
          cell.font = { bold: true, color: { argb: "FFBE123C" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFEE2E2" },
          };
        } else if (item.status === "Stok Rendah") {
          cell.font = { color: { argb: "FFE11D48" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFF1F2" },
          };
        } else {
          cell.font = { color: { argb: "FF4B5563" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3F4F6" },
          };
        }
      }

      // Keluar column in red
      if (colNumber === 7 && item.keluar > 0) {
        cell.font = { color: { argb: "FFE11D48" } };
      }

      // Masuk column in green
      if (colNumber === 6 && item.masuk > 0) {
        cell.font = { color: { argb: "FF059669" } };
      }
    });
  }

  // Column widths
  worksheet.columns = [
    { width: 15 }, // SKU
    { width: 30 }, // Nama
    { width: 18 }, // Kategori
    { width: 12 }, // Ukuran
    { width: 12 }, // Stok Awal
    { width: 10 }, // Masuk
    { width: 10 }, // Keluar
    { width: 12 }, // Stok Akhir
    { width: 14 }, // Status
  ];

  // Summary row
  worksheet.addRow([]);
  const summaryRow = worksheet.addRow([
    "",
    "",
    "",
    "TOTAL",
    reportItems.reduce((s, i) => s + i.stokAwal, 0),
    reportItems.reduce((s, i) => s + i.masuk, 0),
    reportItems.reduce((s, i) => s + i.keluar, 0),
    reportItems.reduce((s, i) => s + i.stokAkhir, 0),
    "",
  ]);
  summaryRow.eachCell((cell, colNumber) => {
    if (colNumber >= 4) {
      cell.font = { bold: true, color: { argb: "FF4A3A31" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8F5F1" },
      };
      cell.border = {
        top: { style: "medium", color: { argb: "FF8A6C5F" } },
        bottom: { style: "medium", color: { argb: "FF8A6C5F" } },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  const filename = `Laporan_Stok_${now.toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
