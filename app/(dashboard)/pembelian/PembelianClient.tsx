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
  Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  Search, Plus, Filter, ChevronLeft, ChevronRight, X, Save,
  Loader2, Trash2, ShoppingCart,
} from "lucide-react";
import { createPurchase, deletePurchase, type PurchaseWithDetails } from "@/app/actions/purchases";

type Supplier = { id: string; name: string };
type ProductOption = { id: string; name: string; sku: string; costPrice: number };
type CartItem = { productId: string; name: string; quantity: number; costPrice: number };

interface Props {
  purchases: PurchaseWithDetails[];
  totalPurchases: number;
  currentPage: number;
  totalPages: number;
  suppliers: Supplier[];
  products: ProductOption[];
  filters: { search: string; startDate: string; endDate: string };
}

export default function PembelianClient({
  purchases, totalPurchases, currentPage, totalPages,
  suppliers, products, filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [dateStart, setDateStart] = useState(filters.startDate);
  const [dateEnd, setDateEnd] = useState(filters.endDate);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Cart for new purchase
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemCost, setItemCost] = useState("");

  const [state, formAction, pending] = useActionState(createPurchase, undefined);

  useEffect(() => {
    if (state?.success) { setDialogOpen(false); setCart([]); }
  }, [state?.success]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (searchValue) params.set("search", searchValue);
    if (dateStart) params.set("startDate", dateStart);
    if (dateEnd) params.set("endDate", dateEnd);
    router.push(`/pembelian?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    router.push(`/pembelian?${params.toString()}`);
  }

  function addToCart() {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const qty = parseInt(itemQty) || 1;
    const cost = parseInt(itemCost.replace(/\./g, "")) || product.costPrice;
    // Check if already in cart
    const existing = cart.find((c) => c.productId === selectedProductId);
    if (existing) {
      setCart(cart.map((c) =>
        c.productId === selectedProductId
          ? { ...c, quantity: c.quantity + qty, costPrice: cost }
          : c
      ));
    } else {
      setCart([...cart, { productId: selectedProductId, name: product.name, quantity: qty, costPrice: cost }]);
    }
    setSelectedProductId("");
    setItemQty("1");
    setItemCost("");
  }

  function removeFromCart(productId: string) {
    setCart(cart.filter((c) => c.productId !== productId));
  }

  function onProductSelect(id: string) {
    setSelectedProductId(id);
    const p = products.find((pr) => pr.id === id);
    if (p) setItemCost(fmtInput(String(p.costPrice)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus pembelian ini? Stok akan dikembalikan.")) return;
    await deletePurchase(id);
  }

  const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const fmtInput = (v: string) => { const num = v.replace(/[^0-9]/g, ""); return num.replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  const fmtDate = (d: Date) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const cartTotal = cart.reduce((sum, c) => sum + c.quantity * c.costPrice, 0);
  const cartTotalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const startIdx = (currentPage - 1) * 10 + 1;
  const endIdx = Math.min(currentPage * 10, totalPurchases);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pembelian</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Kelola data pembelian seragam dari supplier.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="w-full sm:w-auto bg-[#8a6c5f] hover:bg-[#6b5247] text-white" onClick={() => { setCart([]); setDialogOpen(true); }} />}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pembelian
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[720px] max-h-[90vh] p-0 border-[#e5dcd1] bg-[#fdfbf7] shadow-lg overflow-hidden flex flex-col" showCloseButton={false}>
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#e5dcd1]">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">Tambah Pembelian</DialogTitle>
              <DialogClose render={<Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-[#f0e8df]" />}>
                <X className="h-5 w-5" />
              </DialogClose>
            </div>
            {state?.message && !state.success && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{state.message}</div>
            )}
            <form action={(fd) => {
              fd.set("items", JSON.stringify(cart.map((c) => ({ productId: c.productId, quantity: c.quantity, costPrice: c.costPrice }))));
              formAction(fd);
            }} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar flex-1">
                {/* Supplier & Date */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e5dcd1] shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Supplier</Label>
                      <Input name="supplierName" placeholder="Nama Supplier..." required className="bg-[#fdfbf7] border-[#e5dcd1] h-9" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tanggal Pembelian</Label>
                      <Input name="purchaseDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="bg-[#fdfbf7] border-[#e5dcd1]" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Catatan (opsional)</Label>
                      <Input name="notes" placeholder="Catatan pembelian..." className="bg-[#fdfbf7] border-[#e5dcd1]" />
                    </div>
                  </div>
                </div>

                {/* Add Item */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e5dcd1] shadow-sm">
                  <h3 className="font-medium text-sm text-[#8a6c5f] mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Tambah Item
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-xs">Produk</Label>
                      <select value={selectedProductId} onChange={(e) => onProductSelect(e.target.value)}
                        className="flex h-9 w-full items-center rounded-lg border border-[#e5dcd1] bg-[#fdfbf7] px-2.5 py-1 text-sm outline-none">
                        <option value="">Pilih produk</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 sm:contents gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input type="number" min="1" value={itemQty} onChange={(e) => setItemQty(e.target.value)} onFocus={(e) => e.target.select()} className="bg-[#fdfbf7] border-[#e5dcd1] h-9" />
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <Label className="text-xs">Harga Modal</Label>
                        <Input type="text" inputMode="numeric" placeholder="0" value={itemCost} onChange={(e) => setItemCost(fmtInput(e.target.value))} onFocus={(e) => e.target.select()} className="bg-[#fdfbf7] border-[#e5dcd1] h-9" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Button type="button" onClick={addToCart} className="w-full h-9 bg-[#8a6c5f] hover:bg-[#6b5247] text-white text-xs whitespace-nowrap px-3">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cart Items */}
                {cart.length > 0 && (
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e5dcd1] shadow-sm">
                    <h3 className="font-medium text-sm text-[#8a6c5f] mb-3">Item Pembelian ({cart.length})</h3>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between p-3 bg-[#fdfbf7] rounded-lg border border-[#e5dcd1]">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity} x {fmtRp(item.costPrice)} = {fmtRp(item.quantity * item.costPrice)}</p>
                          </div>
                          <button type="button" onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 ml-2 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-between pt-3 border-t border-[#e5dcd1] text-sm font-semibold">
                        <span>Total ({cartTotalItems} item)</span>
                        <span className="text-[#c07a4a]">{fmtRp(cartTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 border-t border-[#e5dcd1] bg-white flex flex-col-reverse sm:flex-row justify-end gap-3">
                <DialogClose render={<Button variant="outline" className="w-full sm:w-auto border-[#8a6c5f] text-[#8a6c5f] hover:bg-[#8a6c5f]/10" />}>Batal</DialogClose>
                <Button type="submit" disabled={pending || cart.length === 0} className="w-full sm:w-auto bg-[#8a6c5f] hover:bg-[#6b5247] text-white">
                  {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Pembelian
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#fdfbf7] border border-[#e5dcd1] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-sm items-stretch sm:items-center">
        <div className="relative flex-1 w-full">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Cari Supplier / Invoice</div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyFilters(); }}
              className="pl-9 bg-white border-[#e5dcd1] w-full" placeholder="Masukkan nama..." />
          </div>
        </div>
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
          <div className="w-full sm:flex-1">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Tanggal Mulai - Akhir</div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="bg-white border-[#e5dcd1] text-xs sm:text-sm" />
              <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="bg-white border-[#e5dcd1] text-xs sm:text-sm" />
            </div>
          </div>
          <Button variant="outline" className="h-10 px-4 bg-white border-[#e5dcd1] text-muted-foreground w-full sm:w-auto justify-center gap-2" onClick={applyFilters}>
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>


      {/* Table Section */}
      <div className="bg-[#fdfbf7] border border-[#e5dcd1] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 pb-4 border-b border-[#e5dcd1]">
          <h2 className="text-xl font-bold text-foreground">Riwayat Pembelian</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#fdfbf7]">
              <TableRow className="border-b border-[#e5dcd1] hover:bg-transparent">
                <TableHead className="font-semibold text-foreground py-4">Tanggal</TableHead>
                <TableHead className="font-semibold text-foreground py-4">No. Invoice</TableHead>
                <TableHead className="font-semibold text-foreground py-4">Supplier</TableHead>
                <TableHead className="font-semibold text-foreground py-4 text-left">Total Items</TableHead>
                <TableHead className="font-semibold text-foreground py-4 text-right">Total Nominal</TableHead>
                <TableHead className="font-semibold text-foreground py-4 text-center w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Tidak ada data ditemukan.</TableCell></TableRow>
              ) : purchases.map((purchase) => {
                const totalItems = purchase.purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <TableRow key={purchase.id} className="hover:bg-[#f0e8df]/30 border-b border-[#e5dcd1] last:border-0">
                    <TableCell className="text-muted-foreground py-4">{fmtDate(purchase.purchaseDate)}</TableCell>
                    <TableCell className="font-medium text-[#8a6c5f]">{purchase.purchaseNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{purchase.supplier.name}</TableCell>
                    <TableCell className="text-left text-muted-foreground">{totalItems} Pcs</TableCell>
                    <TableCell className="text-right font-medium text-[#c07a4a]">{fmtRp(purchase.totalAmount)}</TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => handleDelete(purchase.id)} className="text-red-400 hover:text-red-600" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPurchases > 0 && (
          <div className="border-t border-[#e5dcd1] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground bg-[#fdfbf7]">
            <div>Menampilkan {startIdx} hingga {endIdx} dari {totalPurchases} data</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-white border-[#e5dcd1]" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4" /><span className="sr-only">Previous</span>
              </Button>
              {getPageNumbers().map((page, idx) => (
                <Button key={idx} variant={page === currentPage ? "default" : "outline"} size="sm"
                  className={`w-8 h-8 rounded-md ${page === currentPage ? "bg-[#8a6c5f] text-white hover:bg-[#8a6c5f]/90 hover:text-white border-[#8a6c5f]" : page === "..." ? "bg-transparent border-transparent shadow-none cursor-default hover:bg-transparent text-muted-foreground" : "bg-white border-[#e5dcd1] text-muted-foreground hover:bg-muted"}`}
                  onClick={() => typeof page === "number" && goToPage(page)} disabled={page === "..."}>
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-white border-[#e5dcd1]" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
                <ChevronRight className="h-4 w-4" /><span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
