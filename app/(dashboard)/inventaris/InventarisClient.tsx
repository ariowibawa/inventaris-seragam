"use client";

import React, { useState, useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Plus, Filter, Shirt, Package, AlertTriangle, AlertCircle,
  PlusCircle, MinusCircle, History, ChevronLeft, ChevronRight,
  X, Save, Loader2,
} from "lucide-react";
import { adjustStock, getStockMovements } from "@/app/actions/inventory";

type InventoryProduct = {
  id: string; sku: string; name: string; size: string; color: string;
  stock: number; minimumStock: number;
  category: { id: string; name: string }; stockStatus: string;
};

type ProductListItem = { id: string; name: string; stock: number };

interface Props {
  summary: { totalProducts: number; totalStock: number; lowStockCount: number; outOfStockCount: number };
  products: InventoryProduct[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  allProductsList: ProductListItem[];
  filters: { search: string };
}

export default function InventarisClient({
  summary, products, totalProducts, currentPage, totalPages,
  allProductsList, filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<"in" | "out">("in");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<Array<{
    id: string; type: string; quantityBefore: number; quantityChange: number;
    quantityAfter: number; notes: string | null; createdAt: Date; referenceType: string | null;
  }>>([]);
  const [historyProductName, setHistoryProductName] = useState("");

  const [state, formAction, pending] = useActionState(adjustStock, undefined);

  useEffect(() => {
    if (state?.success) { setAdjustOpen(false); setSelectedProductId(""); }
  }, [state?.success]);

  function updateSearch() {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) params.set("search", searchValue);
    else params.delete("search");
    params.delete("page");
    router.push(`/inventaris?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    router.push(`/inventaris?${params.toString()}`);
  }

  function openAdjust(productId: string, type: "in" | "out") {
    setSelectedProductId(productId);
    setAdjustType(type);
    setAdjustOpen(true);
  }

  async function openHistory(product: InventoryProduct) {
    setHistoryProductName(`${product.name} - ${product.color} (${product.size})`);
    const movements = await getStockMovements(product.id);
    setHistoryData(movements);
    setHistoryOpen(true);
  }

  const fmtNum = (n: number) => new Intl.NumberFormat("id-ID").format(n);
  const startIdx = (currentPage - 1) * 10 + 1;
  const endIdx = Math.min(currentPage * 10, totalProducts);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Inventaris</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Kelola stok seragam dan riwayat pergerakan barang.</p>
        </div>
        <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogTrigger render={<Button className="w-full sm:w-auto bg-[#8a6c5f] hover:bg-[#6b5247] text-white" onClick={() => { setSelectedProductId(""); setAdjustType("in"); setAdjustOpen(true); }} />}>
            <Plus className="mr-2 h-4 w-4" /> Penyesuaian Stok
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[550px] p-0 border-[#e5dcd1] bg-[#fdfbf7] shadow-lg overflow-hidden flex flex-col max-h-[90vh]" showCloseButton={false}>
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#e5dcd1]">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">Penyesuaian Stok</DialogTitle>
              <DialogClose render={<Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-[#f0e8df]" />}>
                <X className="h-5 w-5" />
              </DialogClose>
            </div>
            {state?.message && !state.success && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{state.message}</div>
            )}
            <form action={formAction} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <Label>Produk</Label>
                  <select
                    name="productId"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex h-9 w-full items-center rounded-lg border border-[#e5dcd1] bg-white px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">-- Pilih Produk --</option>
                    {allProductsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                    ))}
                  </select>
                  {state?.errors?.productId && <p className="text-xs text-red-500">{state.errors.productId[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Jenis Penyesuaian</Label>
                  <select
                    name="type"
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as "in" | "out")}
                    className="flex h-9 w-full items-center rounded-lg border border-[#e5dcd1] bg-white px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="in">Tambah Stok (Masuk)</option>
                    <option value="out">Kurangi Stok (Keluar)</option>
                    <option value="adjustment">Set Stok Manual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Jumlah</Label>
                  <Input name="quantity" type="number" min="1" placeholder="0" onFocus={(e) => e.target.select()} className="bg-white border-[#e5dcd1]" />
                  {state?.errors?.quantity && <p className="text-xs text-red-500">{state.errors.quantity[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Alasan / Catatan</Label>
                  <Textarea name="notes" placeholder="Tuliskan alasan penyesuaian stok..." className="bg-white border-[#e5dcd1] min-h-[80px]" />
                  {state?.errors?.notes && <p className="text-xs text-red-500">{state.errors.notes[0]}</p>}
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t border-[#e5dcd1] bg-white flex flex-col-reverse sm:flex-row justify-end gap-3">
                <DialogClose render={<Button variant="outline" className="w-full sm:w-auto border-[#8a6c5f] text-[#8a6c5f] hover:bg-[#8a6c5f]/10" />}>Batal</DialogClose>
                <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-[#8a6c5f] hover:bg-[#6b5247] text-white">
                  {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fdfbf7] p-4 sm:p-6 rounded-2xl border border-[#e5dcd1] shadow-sm flex flex-col justify-between">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#f0e8df] flex items-center justify-center mb-3 sm:mb-4"><Shirt className="h-5 w-5 text-[#8a6c5f]" /></div>
          <div><p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Produk</p><p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{fmtNum(summary.totalProducts)}</p></div>
        </div>
        <div className="bg-[#fdfbf7] p-4 sm:p-6 rounded-2xl border border-[#e5dcd1] shadow-sm flex flex-col justify-between">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#f0e8df] flex items-center justify-center mb-3 sm:mb-4"><Package className="h-5 w-5 text-[#8a6c5f]" /></div>
          <div><p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Stok</p><p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{fmtNum(summary.totalStock)}</p></div>
        </div>
        <div className="bg-[#fdfbf7] p-4 sm:p-6 rounded-2xl border border-[#e5dcd1] shadow-sm flex flex-col justify-between">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3 sm:mb-4"><AlertTriangle className="h-5 w-5 text-orange-600" /></div>
          <div><p className="text-xs sm:text-sm text-muted-foreground font-medium">Stok Hampir Habis</p><p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1">{summary.lowStockCount}</p></div>
        </div>
        <div className="bg-[#fdfbf7] p-4 sm:p-6 rounded-2xl border border-[#e5dcd1] shadow-sm flex flex-col justify-between">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center mb-3 sm:mb-4"><AlertCircle className="h-5 w-5 text-red-600" /></div>
          <div><p className="text-xs sm:text-sm text-muted-foreground font-medium">Stok Habis</p><p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{summary.outOfStockCount}</p></div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-[#fdfbf7] border border-[#e5dcd1] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-[#e5dcd1] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Daftar Inventaris</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[280px] w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 bg-white border-[#e5dcd1] w-full" placeholder="Cari SKU atau nama produk..."
                value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") updateSearch(); }} />
            </div>
            <Button variant="outline" className="bg-white border-[#e5dcd1] text-foreground gap-2 w-full sm:w-auto justify-center" onClick={updateSearch}>
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>


        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#fdfbf7] border-b border-[#e5dcd1]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground w-[300px]">Produk</TableHead>
                <TableHead className="font-semibold text-foreground">SKU</TableHead>
                <TableHead className="font-semibold text-foreground">Kategori</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Stok Saat Ini</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Stok Min.</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Tidak ada data inventaris.</TableCell></TableRow>
              ) : products.map((item) => (
                <TableRow key={item.id} className="hover:bg-[#f0e8df]/30 border-b border-[#e5dcd1] last:border-0">
                  <TableCell className="font-medium text-foreground py-4">
                    {item.name} - {item.color} ({item.size})
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{item.sku.split("-")[0]}-</span>
                      <span>{item.sku.split("-").slice(1).join("-")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.category.name}</TableCell>
                  <TableCell className="text-center font-medium">
                    <span className={item.stockStatus === "Habis" ? "text-red-500" : item.stockStatus === "Stok Rendah" ? "text-orange-500" : "text-foreground"}>
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{item.minimumStock}</TableCell>
                  <TableCell className="text-center">
                    {item.stockStatus === "Tersedia" ? (
                      <Badge className="bg-emerald-100/50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 font-normal">Tersedia</Badge>
                    ) : item.stockStatus === "Stok Rendah" ? (
                      <Badge className="bg-orange-100/50 text-orange-600 hover:bg-orange-100 border-orange-200 font-normal">Stok Rendah</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100/50 text-red-600 hover:bg-red-100 border-red-200 font-normal">Habis</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3 text-[#8a6c5f]">
                      <button className="hover:text-[#6b5247] transition-colors" title="Tambah Stok" onClick={() => openAdjust(item.id, "in")}>
                        <PlusCircle className="h-5 w-5" />
                      </button>
                      <button className="hover:text-[#6b5247] transition-colors" title="Kurangi Stok" onClick={() => openAdjust(item.id, "out")}>
                        <MinusCircle className="h-5 w-5" />
                      </button>
                      <button className="hover:text-[#6b5247] transition-colors" title="Riwayat Stok" onClick={() => openHistory(item)}>
                        <History className="h-5 w-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="border-t border-[#e5dcd1] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground bg-[#fdfbf7]">
          <div>Menampilkan {totalProducts > 0 ? startIdx : 0}–{endIdx} dari {totalProducts} produk</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-white border-[#e5dcd1]" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" /><span className="sr-only">Previous</span>
            </Button>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-white border-[#e5dcd1]" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" /><span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[650px] p-0 border-[#e5dcd1] bg-[#fdfbf7] shadow-lg overflow-hidden" showCloseButton={false}>
          <div className="flex justify-between items-center p-6 border-b border-[#e5dcd1]">
            <DialogTitle className="text-lg font-semibold text-foreground">Riwayat Stok</DialogTitle>
            <DialogClose render={<Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-[#f0e8df]" />}>
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-foreground mb-4">{historyProductName}</p>
            {historyData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada riwayat pergerakan stok.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {historyData.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#e5dcd1]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.quantityChange > 0 ? "bg-emerald-100" : "bg-red-100"}`}>
                      {m.quantityChange > 0 ? <PlusCircle className="h-4 w-4 text-emerald-600" /> : <MinusCircle className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-foreground">
                          {m.quantityChange > 0 ? "+" : ""}{m.quantityChange} unit
                        </p>
                        <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.quantityBefore} → {m.quantityAfter}</p>
                      {m.notes && <p className="text-xs text-muted-foreground mt-1">{m.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
