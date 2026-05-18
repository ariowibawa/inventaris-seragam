"use client";

import React, { useState, useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
  Image as ImageIcon, X, Box, Tag, Layers, Save, Loader2,
} from "lucide-react";
import {
  createProduct, updateProduct, deleteProduct, toggleProductStatus,
  type ProductWithCategory,
} from "@/app/actions/products";

type Category = { id: string; name: string; _count: { products: number } };

interface Props {
  initialProducts: ProductWithCategory[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  categories: Category[];
  sizes: string[];
  filters: { search: string; categoryId: string; size: string; status: string };
}

export default function ProdukClient({
  initialProducts, totalProducts, currentPage, totalPages, perPage,
  categories, sizes, filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(filters.search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductWithCategory | null>(null);

  const [createState, createAction, createPending] = useActionState(createProduct, undefined);
  const [updateState, updateAction, updatePending] = useActionState(updateProduct, undefined);

  // Close dialog on success
  useEffect(() => {
    if (createState?.success || updateState?.success) {
      setDialogOpen(false);
      setEditProduct(null);
    }
  }, [createState?.success, updateState?.success]);

  const formState = editProduct ? updateState : createState;
  const formAction = editProduct ? updateAction : createAction;
  const formPending = editProduct ? updatePending : createPending;

  function updateFilters(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "semua" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/produk?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    router.push(`/produk?${params.toString()}`);
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const [hargaModalForm, setHargaModalForm] = useState("");
  const [hargaJualForm, setHargaJualForm] = useState("");

  const fmtInput = (v: string) => {
    const num = v.replace(/[^0-9]/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  function openCreateDialog() {
    setEditProduct(null);
    setHargaModalForm("");
    setHargaJualForm("");
    setDialogOpen(true);
  }

  function openEditDialog(p: ProductWithCategory) {
    setEditProduct(p);
    setHargaModalForm(fmtInput(String(p.costPrice)));
    setHargaJualForm(fmtInput(String(p.sellingPrice)));
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    await deleteProduct(id);
  }

  async function handleToggle(id: string) {
    await toggleProductStatus(id);
  }

  const startIdx = (currentPage - 1) * perPage + 1;
  const endIdx = Math.min(currentPage * perPage, totalProducts);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Produk</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditProduct(null); }}>
          <DialogTrigger render={<Button className="bg-[#8a6c5f] hover:bg-[#6b5247] text-white" onClick={openCreateDialog} />}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] p-0 border-[#e5dcd1] bg-[#fdfbf7] shadow-lg data-open:duration-300 data-open:animate-in data-open:zoom-in-95 data-open:slide-in-from-bottom-4 overflow-hidden" showCloseButton={false}>
            <div className="flex justify-between items-center p-6 border-b border-[#e5dcd1]">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {editProduct ? "Edit Produk" : "Tambah Produk"}
              </DialogTitle>
              <DialogClose render={<Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-[#f0e8df] hover:text-foreground" />}>
                <X className="h-5 w-5" />
              </DialogClose>
            </div>

            {formState?.message && !formState.success && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {formState.message}
              </div>
            )}

            <form action={formAction}>
              {editProduct && <input type="hidden" name="id" value={editProduct.id} />}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Group 1: Informasi Dasar */}
                <div className="bg-white p-5 rounded-xl border border-[#e5dcd1] shadow-sm space-y-4">
                  <h3 className="font-medium text-sm text-[#8a6c5f] mb-3 flex items-center gap-2">
                    <Box className="w-4 h-4" /> Informasi Dasar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama-produk">Nama Produk</Label>
                      <Input id="nama-produk" name="name" defaultValue={editProduct?.name || ""} placeholder="Masukkan nama produk..." className="bg-[#fdfbf7] border-[#e5dcd1]" />
                      {formState?.errors?.name && <p className="text-xs text-red-500">{formState.errors.name[0]}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kategori">Kategori</Label>
                      <Select name="categoryId" defaultValue={editProduct?.categoryId || ""}>
                        <SelectTrigger id="kategori" className="bg-[#fdfbf7] border-[#e5dcd1]">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formState?.errors?.categoryId && <p className="text-xs text-red-500">{formState.errors.categoryId[0]}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                      <Input id="sku" name="sku" defaultValue={editProduct?.sku || ""} placeholder="Contoh: KSP-001-WHT" className="bg-[#fdfbf7] border-[#e5dcd1]" />
                      {formState?.errors?.sku && <p className="text-xs text-red-500">{formState.errors.sku[0]}</p>}
                    </div>
                  </div>
                </div>

                {/* Group 2: Detail & Harga */}
                <div className="bg-white p-5 rounded-xl border border-[#e5dcd1] shadow-sm space-y-4">
                  <h3 className="font-medium text-sm text-[#8a6c5f] mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Detail & Harga
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ukuran">Ukuran</Label>
                      <Input id="ukuran" name="size" defaultValue={editProduct?.size || ""} placeholder="Contoh: L, M, 32, All Size" className="bg-[#fdfbf7] border-[#e5dcd1]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warna">Warna</Label>
                      <Input id="warna" name="color" defaultValue={editProduct?.color || ""} placeholder="Contoh: Putih, Hitam..." className="bg-[#fdfbf7] border-[#e5dcd1]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="harga-modal">Harga Modal</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                        <input type="hidden" name="costPrice" value={hargaModalForm.replace(/\./g, "")} />
                        <Input id="harga-modal" type="text" placeholder="0" value={hargaModalForm} onChange={(e) => setHargaModalForm(fmtInput(e.target.value))} className="pl-9 bg-[#fdfbf7] border-[#e5dcd1]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="harga-jual">Harga Jual</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                        <input type="hidden" name="sellingPrice" value={hargaJualForm.replace(/\./g, "")} />
                        <Input id="harga-jual" type="text" placeholder="0" value={hargaJualForm} onChange={(e) => setHargaJualForm(fmtInput(e.target.value))} className="pl-9 bg-[#fdfbf7] border-[#e5dcd1]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group 3: Inventaris */}
                <div className="bg-white p-5 rounded-xl border border-[#e5dcd1] shadow-sm space-y-4">
                  <h3 className="font-medium text-sm text-[#8a6c5f] mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Inventaris
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {!editProduct && (
                      <div className="space-y-2">
                        <Label htmlFor="stok">Stok Awal</Label>
                        <Input id="stok" name="stock" type="number" defaultValue={0} placeholder="0" onFocus={(e) => e.target.select()} className="bg-[#fdfbf7] border-[#e5dcd1]" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="min-stok">Stok Minimum</Label>
                      <Input id="min-stok" name="minimumStock" type="number" defaultValue={editProduct?.minimumStock || 15} placeholder="15" onFocus={(e) => e.target.select()} className="bg-[#fdfbf7] border-[#e5dcd1]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status-produk">Status Produk</Label>
                      <Select name="isActive" defaultValue={editProduct ? String(editProduct.isActive) : "true"}>
                        <SelectTrigger id="status-produk" className="bg-[#fdfbf7] border-[#e5dcd1]">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Aktif</SelectItem>
                          <SelectItem value="false">Non-aktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#e5dcd1] bg-white flex justify-end gap-3 rounded-b-xl">
                <DialogClose render={<Button variant="outline" className="border-[#8a6c5f] text-[#8a6c5f] hover:bg-[#8a6c5f]/10" />}>
                  Batal
                </DialogClose>
                <Button type="submit" disabled={formPending} className="bg-[#8a6c5f] hover:bg-[#6b5247] text-white">
                  {formPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {editProduct ? "Simpan Perubahan" : "Simpan Produk"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border-border border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-background/50 border-border"
            placeholder="Cari SKU atau Nama Produk..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") updateFilters("search", searchValue); }}
          />
        </div>
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <Select value={filters.categoryId} onValueChange={(v) => updateFilters("category", v || "")}>
            <SelectTrigger className="w-[160px] bg-background/50"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Kategori</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.size} onValueChange={(v) => updateFilters("size", v || "")}>
            <SelectTrigger className="w-[140px] bg-background/50"><SelectValue placeholder="Semua Ukuran" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Ukuran</SelectItem>
              {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => updateFilters("status", v || "")}>
            <SelectTrigger className="w-[140px] bg-background/50"><SelectValue placeholder="Semua Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="non-aktif">Non-aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border-border border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[280px] font-semibold text-foreground">Produk</TableHead>
                <TableHead className="font-semibold text-foreground">SKU</TableHead>
                <TableHead className="font-semibold text-foreground">Kategori</TableHead>
                <TableHead className="font-semibold text-foreground">Detail</TableHead>
                <TableHead className="font-semibold text-foreground">Harga Modal</TableHead>
                <TableHead className="font-semibold text-foreground">Harga Jual</TableHead>
                <TableHead className="font-semibold text-foreground">Stok</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
                <TableHead className="w-[80px] text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialProducts.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">Tidak ada produk ditemukan.</TableCell></TableRow>
              ) : initialProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
                        <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    <div className="flex flex-col">
                      <span>{product.sku.split("-").slice(0, 2).join("-")}-</span>
                      <span>{product.sku.split("-")[2]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.category.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex flex-col"><span>{product.size}</span><span className="text-sm">{product.color}</span></div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatRupiah(product.costPrice)}</TableCell>
                  <TableCell className="font-medium text-foreground">{formatRupiah(product.sellingPrice)}</TableCell>
                  <TableCell>
                    <span className={`${product.stock === 0 ? "text-destructive font-semibold" : product.stock < product.minimumStock ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {product.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200">Non-aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0")}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openEditDialog(product)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleToggle(product.id)}>
                          {product.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => handleDelete(product.id)}>Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>Menampilkan {totalProducts > 0 ? startIdx : 0} - {endIdx} dari {totalProducts} produk</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-background" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant="outline" size="sm" onClick={() => goToPage(p)}
                className={`w-8 h-8 rounded-md ${p === currentPage ? "bg-[#8a6c5f] text-white hover:bg-[#8a6c5f]/90 hover:text-white border-[#8a6c5f]" : "bg-background"}`}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-background" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
