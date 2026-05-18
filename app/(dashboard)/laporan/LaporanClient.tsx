"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Printer, Landmark, ClipboardList, AlertTriangle,
  Search, ChevronLeft, ChevronRight, TrendingUp,
} from "lucide-react";

type ReportItem = {
  id: string; sku: string; nama: string; kategori: string; ukuran: string;
  stokAwal: number; masuk: number; keluar: number; stokAkhir: number; status: string;
};

type Category = { id: string; name: string };

interface Props {
  items: ReportItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  summary: { totalStockValue: number; totalItems: number; lowStockCount: number };
  categories: Category[];
  filters: { search: string };
}

export default function LaporanClient({
  items, total, currentPage, totalPages, summary, filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [activeTab] = useState("Laporan Stok");

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

  const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const fmtNum = (n: number) => new Intl.NumberFormat("id-ID").format(n);
  const startIdx = (currentPage - 1) * 10 + 1;
  const endIdx = Math.min(currentPage * 10, total);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-[#4a3a31]">Laporan</h1>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[#8a6c5f] text-[#8a6c5f] hover:bg-[#8a6c5f]/10">
            <FileText className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button className="bg-[#8a6c5f] hover:bg-[#6b5247] text-white">
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
