"use client";

import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Printer, Landmark, ClipboardList, AlertTriangle,
  Search, ChevronLeft, ChevronRight, TrendingUp, Loader2,
} from "lucide-react";

type ReportItem = {
  id: string; sku: string; nama: string; kategori: string; ukuran: string;
  stokAwal: number; masuk: number; keluar: number; stokAkhir: number; status: string;
};



interface Props {
  items: ReportItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  summary: { totalStockValue: number; totalItems: number; lowStockCount: number };
  filters: { search: string };
}

export default function LaporanClient({
  items, total, currentPage, totalPages, summary, filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [activeTab] = useState("Laporan Stok");
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const tabs = ["Laporan Stok"];

  function applySearch() {
    const params = new URLSearchParams();
    if (searchValue) params.set("search", searchValue);
    router.push(`/laporan?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    router.push(`/laporan?${params.toString()}`);
  }

  async function handleExportExcel() {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      const response = await fetch(`/api/laporan/export?${params.toString()}`);
      if (!response.ok) throw new Error("Export gagal");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `Laporan_Stok_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Gagal mengexport file. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup diblokir. Silakan izinkan popup untuk mencetak.");
      return;
    }

    const today = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const totalStokAwal = items.reduce((s, i) => s + i.stokAwal, 0);
    const totalMasuk = items.reduce((s, i) => s + i.masuk, 0);
    const totalKeluar = items.reduce((s, i) => s + i.keluar, 0);
    const totalStokAkhir = items.reduce((s, i) => s + i.stokAkhir, 0);

    const rows = items
      .map(
        (item, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${item.sku}</td>
        <td>${item.nama}</td>
        <td>${item.kategori}</td>
        <td style="text-align:center;">${item.ukuran}</td>
        <td style="text-align:center;">${item.stokAwal}</td>
        <td style="text-align:center; color:#059669;">${item.masuk > 0 ? `+${item.masuk}` : item.masuk}</td>
        <td style="text-align:center; color:#e11d48;">${item.keluar > 0 ? `-${item.keluar}` : item.keluar}</td>
        <td style="text-align:center; font-weight:600;">${item.stokAkhir}</td>
        <td style="text-align:center;">
          <span style="
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            ${item.status === 'Habis' ? 'background:#fee2e2; color:#be123c;' : ''}
            ${item.status === 'Stok Rendah' ? 'background:#fff1f2; color:#e11d48;' : ''}
            ${item.status === 'Tersedia' ? 'background:#f3f4f6; color:#4b5563;' : ''}
          ">${item.status}</span>
        </td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Stok Seragam</title>
        <style>
          @page { size: landscape; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #2d201c;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #8a6c5f;
          }
          .header h1 {
            font-size: 22px;
            font-weight: 700;
            color: #4a3a31;
            margin-bottom: 4px;
          }
          .header p {
            font-size: 12px;
            color: #8a6c5f;
          }
          .summary {
            display: flex;
            gap: 16px;
            margin-bottom: 20px;
          }
          .summary-card {
            flex: 1;
            border: 1px solid #e5dcd1;
            border-radius: 8px;
            padding: 12px 16px;
            background: #fdfbf7;
          }
          .summary-card .label {
            font-size: 11px;
            color: #8a6c5f;
            margin-bottom: 4px;
          }
          .summary-card .value {
            font-size: 18px;
            font-weight: 700;
            color: #4a3a31;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background: #8a6c5f;
            color: white;
            padding: 8px 10px;
            text-align: center;
            font-weight: 600;
            font-size: 11px;
          }
          td {
            padding: 7px 10px;
            border-bottom: 1px solid #e5dcd1;
          }
          tr:nth-child(even) { background: #fdfbf7; }
          tr:hover { background: #f0e8df; }
          .footer-row td {
            font-weight: 700;
            background: #f8f5f1;
            border-top: 2px solid #8a6c5f;
            border-bottom: 2px solid #8a6c5f;
            color: #4a3a31;
          }
          .footer {
            margin-top: 24px;
            text-align: center;
            font-size: 10px;
            color: #8a6c5f;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN STOK SERAGAM</h1>
          <p>${today}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="label">Total Nilai Stok</div>
            <div class="value">${fmtRp(summary.totalStockValue)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Item Tersedia</div>
            <div class="value">${fmtNum(summary.totalItems)} pcs</div>
          </div>
          <div class="summary-card">
            <div class="label">Item Stok Rendah</div>
            <div class="value" style="color:#e11d48;">${summary.lowStockCount} SKU</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Kode SKU</th>
              <th>Nama Item</th>
              <th>Kategori</th>
              <th>Ukuran</th>
              <th>Stok Awal</th>
              <th>Masuk</th>
              <th>Keluar</th>
              <th>Stok Akhir</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="footer-row">
              <td colspan="5" style="text-align:right;">TOTAL</td>
              <td style="text-align:center;">${totalStokAwal}</td>
              <td style="text-align:center;">${totalMasuk}</td>
              <td style="text-align:center;">${totalKeluar}</td>
              <td style="text-align:center;">${totalStokAkhir}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          Dicetak pada ${today} — Inventaris Seragam
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const fmtNum = (n: number) => new Intl.NumberFormat("id-ID").format(n);
  const startIdx = (currentPage - 1) * 10 + 1;
  const endIdx = Math.min(currentPage * 10, total);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6" ref={printRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-[#4a3a31]">Laporan</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-[#8a6c5f] text-[#8a6c5f] hover:bg-[#8a6c5f]/10"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isExporting ? "Mengexport..." : "Export Excel"}
          </Button>
          <Button
            className="bg-[#8a6c5f] hover:bg-[#6b5247] text-white"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        {tabs.map((tab) => (
          <button key={tab}
            className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === tab ? "text-[#6b5247] border-b-2 border-[#6b5247]" : "text-muted-foreground hover:text-[#6b5247]"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fdfbf7] border border-[#e5dcd1] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-muted-foreground font-medium">Total Nilai Stok</span>
            <Landmark className="h-5 w-5 text-[#8a6c5f]" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#4a3a31] mb-2">{fmtRp(summary.totalStockValue)}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 text-emerald-600" />
              <span className="text-emerald-600 font-medium mr-1">Berdasarkan harga modal</span>
            </div>
          </div>
        </div>
        <div className="bg-[#fdfbf7] border border-[#e5dcd1] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-muted-foreground font-medium">Total Item Tersedia</span>
            <ClipboardList className="h-5 w-5 text-[#8a6c5f]" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#4a3a31] mb-2">{fmtNum(summary.totalItems)} <span className="text-xl font-semibold">pcs</span></div>
            <div className="text-sm text-muted-foreground">Total stok aktif</div>
          </div>
        </div>
        <div className="bg-[#fcf8f8] border border-rose-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-muted-foreground font-medium">Item Stok Rendah</span>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-rose-600 mb-2">{summary.lowStockCount} SKU</div>
            <div className="flex items-center text-sm text-rose-600 font-medium">
              <AlertTriangle className="h-4 w-4 mr-1" /> Perlu re-order segera
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#fdfbf7] border border-[#e5dcd1] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#e5dcd1] flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-[#4a3a31]">Rincian Stok Seragam</h2>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 bg-white border-[#e5dcd1]" placeholder="Cari kode atau nama..."
              value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f8f5f1]">
              <TableRow className="border-[#e5dcd1]">
                <TableHead className="font-semibold text-[#4a3a31]">Kode SKU</TableHead>
                <TableHead className="font-semibold text-[#4a3a31]">Nama Item</TableHead>
                <TableHead className="font-semibold text-[#4a3a31]">Kategori</TableHead>
                <TableHead className="font-semibold text-[#4a3a31]">Ukuran</TableHead>
                <TableHead className="font-semibold text-[#4a3a31]">Stok Awal</TableHead>
                <TableHead className="font-semibold text-[#4a3a31]">Masuk</TableHead>
                <TableHead className="font-semibold text-[#4a3a31]">Keluar</TableHead>
                <TableHead className="font-semibold text-[#4a3a31]">Stok Akhir</TableHead>
                <TableHead className="font-semibold text-[#4a3a31]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">Tidak ada data.</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id} className="border-[#e5dcd1] hover:bg-[#f0e8df]/20">
                  <TableCell className="font-medium text-[#8a6c5f]">{item.sku}</TableCell>
                  <TableCell className="text-foreground">{item.nama}</TableCell>
                  <TableCell className="text-muted-foreground">{item.kategori}</TableCell>
                  <TableCell className="text-muted-foreground">{item.ukuran}</TableCell>
                  <TableCell className="text-muted-foreground">{item.stokAwal}</TableCell>
                  <TableCell className="text-muted-foreground">{item.masuk > 0 ? `+${item.masuk}` : item.masuk}</TableCell>
                  <TableCell className="text-rose-500">{item.keluar > 0 ? `-${item.keluar}` : item.keluar}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    <span className={item.stokAkhir === 0 ? "text-rose-600" : ""}>{item.stokAkhir}</span>
                  </TableCell>
                  <TableCell>
                    {item.status === "Tersedia" && <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-300 border-none font-medium">Tersedia</Badge>}
                    {item.status === "Stok Rendah" && <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-200 border-none font-medium">Stok Rendah</Badge>}
                    {item.status === "Habis" && <Badge className="bg-rose-700 text-white hover:bg-rose-800 border-none font-medium">Habis</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground bg-[#f8f5f1]">
          <div>Menampilkan {total > 0 ? startIdx : 0}-{endIdx} dari {total} item</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-white border-[#e5dcd1]" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-white border-[#e5dcd1]" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
