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
  Dialog, DialogContent, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Minus, Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp,
  Filter, ChevronLeft, ChevronRight, X, Save, Loader2, Trash2,
} from "lucide-react";
import { createManualCashflow, deleteCashflow, type CashflowEntry } from "@/app/actions/cashflow";

type Category = { id: string; name: string; type: string };

interface Props {
  summary: { saldo: number; totalIncome: number; totalExpense: number; netProfit: number };
  entries: CashflowEntry[];
  totalEntries: number;
  currentPage: number;
  totalPages: number;
  categories: Category[];
  filters: { search: string; type: string; startDate: string; endDate: string };
}

export default function CashflowClient({
  summary, entries, totalEntries, currentPage, totalPages,
  categories, filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"income" | "expense">("income");
  const [dateStart, setDateStart] = useState(filters.startDate);
  const [dateEnd, setDateEnd] = useState(filters.endDate);
  const [amountForm, setAmountForm] = useState("");

  const [state, formAction, pending] = useActionState(createManualCashflow, undefined);

  useEffect(() => {
    if (state?.success) { setDialogOpen(false); setAmountForm(""); }
  }, [state?.success]);

  function openDialog(type: "income" | "expense") {
    setDialogType(type);
    setDialogOpen(true);
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (dateStart) params.set("startDate", dateStart);
    if (dateEnd) params.set("endDate", dateEnd);
    router.push(`/cashflow?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    router.push(`/cashflow?${params.toString()}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    await deleteCashflow(id);
  }

  const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const fmtInput = (v: string) => { const num = v.replace(/[^0-9]/g, ""); return num.replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  const fmtDate = (d: Date) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const fmtTime = (d: Date) => new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
  const startIdx = (currentPage - 1) * 10 + 1;
  const endIdx = Math.min(currentPage * 10, totalEntries);

  const filteredCategories = categories.filter((c) => c.type === dialogType);

  // Running saldo calculation for table display
  let runningSaldo = summary.saldo;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else if (currentPage <= 3) pages.push(1, 2, 3, "...", totalPages);
    else if (currentPage >= totalPages - 2) pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    else pages.push(1, "...", currentPage, "...", totalPages);
    return pages;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cashflow</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Ringkasan arus kas masuk dan keluar operasional.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="bg-white border-[#e5dcd1] h-9 text-xs sm:text-sm flex-1" />
            <span className="text-muted-foreground text-sm">–</span>
            <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="bg-white border-[#e5dcd1] h-9 text-xs sm:text-sm flex-1" />
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-[#e5dcd1] shrink-0" onClick={applyFilters}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <Button className="bg-[#8a6c5f] hover:bg-[#6b5247] text-white text-xs sm:text-sm" onClick={() => openDialog("income")}>
              <Plus className="w-4 h-4 mr-1 sm:mr-2" /> Pemasukan
            </Button>
            <Button variant="outline" className="border-[#8a6c5f] text-[#8a6c5f] hover:bg-[#8a6c5f]/10 bg-transparent text-xs sm:text-sm" onClick={() => openDialog("expense")}>
              <Minus className="w-4 h-4 mr-1 sm:mr-2" /> Pengeluaran
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fdfbf7] p-4 sm:p-6 rounded-2xl border border-[#e5dcd1] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo Kas</h3>
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><Wallet className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-foreground mb-1 break-all">{fmtRp(summary.saldo)}</div>
            <div className="text-xs text-muted-foreground mt-1">Saldo saat ini</div>
          </div>
        </div>
        <div className="bg-[#fdfbf7] p-4 sm:p-6 rounded-2xl border border-[#e5dcd1] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Pemasukan</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><ArrowDownLeft className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-foreground mb-1 break-all">{fmtRp(summary.totalIncome)}</div>
            <div className="text-xs text-muted-foreground mt-1">Periode ini</div>
          </div>
        </div>
        <div className="bg-[#fdfbf7] p-4 sm:p-6 rounded-2xl border border-[#e5dcd1] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Pengeluaran</h3>
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><ArrowUpRight className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-foreground mb-1 break-all">{fmtRp(summary.totalExpense)}</div>
            <div className="text-xs text-muted-foreground mt-1">Periode ini</div>
          </div>
        </div>
        <div className="bg-[#8a6c5f] p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col justify-between text-white">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-medium text-white/90">Laba Bersih</h3>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-white" /></div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold mb-1 break-all">{fmtRp(summary.netProfit)}</div>
            <div className="text-xs text-white/80 mt-1">Periode ini</div>
          </div>
        </div>
      </div>


      {/* Transaction Table */}
      <div className="bg-card border-border border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 flex justify-between items-center border-b border-border bg-[#fdfbf7]">
          <h2 className="text-lg font-semibold text-foreground">Riwayat Transaksi</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f8f6f3]">
              <TableRow className="border-[#e5dcd1]">
                <TableHead className="font-semibold text-foreground">Tanggal</TableHead>
                <TableHead className="font-semibold text-foreground">Jenis & Kategori</TableHead>
                <TableHead className="font-semibold text-foreground">Sumber/Keterangan</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Pemasukan</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Pengeluaran</TableHead>
                <TableHead className="font-semibold text-foreground text-center w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#fdfbf7]">
              {entries.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Tidak ada data transaksi.</TableCell></TableRow>
              ) : entries.map((trx) => {
                const isIncome = trx.type === "income";
                const isManual = trx.sourceType === "manual";
                return (
                  <TableRow key={trx.id} className="border-[#e5dcd1] hover:bg-[#f8f6f3]">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-foreground">{fmtDate(trx.cashflowDate)}</span>
                        <span className="text-sm text-muted-foreground">{fmtTime(trx.cashflowDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isIncome ? "bg-emerald-500" : "bg-rose-500"}`} />
                          <span className="font-medium text-foreground">{isIncome ? "Pemasukan" : "Pengeluaran"}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{trx.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-foreground">{trx.notes || "-"}</span>
                        {isManual ? (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 font-normal hover:bg-gray-100">Manual</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-normal hover:bg-blue-50">Otomatis</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isIncome ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                        {isIncome ? `+ ${fmtRp(trx.amount)}` : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={!isIncome ? "text-rose-600 font-medium" : "text-muted-foreground"}>
                        {!isIncome ? `- ${fmtRp(trx.amount)}` : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {isManual && (
                        <button onClick={() => handleDelete(trx.id)} className="text-red-400 hover:text-red-600" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalEntries > 0 && (
          <div className="border-t border-[#e5dcd1] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground bg-[#fdfbf7]">
            <div>Menampilkan {startIdx}–{endIdx} dari {totalEntries} transaksi</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-white border-[#e5dcd1]" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {getPageNumbers().map((page, idx) => (
                <Button key={idx} variant={page === currentPage ? "default" : "outline"} size="sm"
                  className={`w-8 h-8 rounded-md ${page === currentPage ? "bg-[#8a6c5f] text-white hover:bg-[#8a6c5f]/90 hover:text-white border-[#8a6c5f]" : page === "..." ? "bg-transparent border-transparent shadow-none cursor-default hover:bg-transparent text-muted-foreground" : "bg-white border-[#e5dcd1] text-muted-foreground hover:bg-muted"}`}
                  onClick={() => typeof page === "number" && goToPage(page)} disabled={page === "..."}>
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-white border-[#e5dcd1]" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Manual Cashflow Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[550px] max-h-[90vh] p-0 border-[#e5dcd1] bg-[#fdfbf7] shadow-lg overflow-hidden flex flex-col" showCloseButton={false}>
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#e5dcd1]">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">
              {dialogType === "income" ? "Tambah Pemasukan" : "Tambah Pengeluaran"}
            </DialogTitle>
            <DialogClose render={<Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-[#f0e8df]" />}>
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
          {state?.message && !state.success && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{state.message}</div>
          )}
          <form action={formAction} className="flex-1 flex flex-col overflow-hidden">
            <input type="hidden" name="type" value={dialogType} />
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <select name="category" className="flex h-9 w-full items-center rounded-lg border border-[#e5dcd1] bg-white px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                  <option value="">-- Pilih Kategori --</option>
                  {filteredCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                {state?.errors?.category && <p className="text-xs text-red-500">{state.errors.category[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Nominal (Rp)</Label>
                <input type="hidden" name="amount" value={amountForm.replace(/\./g, "") || "0"} />
                <Input type="text" inputMode="numeric" placeholder="0" value={amountForm} onChange={(e) => setAmountForm(fmtInput(e.target.value))} onFocus={(e) => e.target.select()} className="bg-white border-[#e5dcd1]" />
                {state?.errors?.amount && <p className="text-xs text-red-500">{state.errors.amount[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input name="cashflowDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="bg-white border-[#e5dcd1]" />
                {state?.errors?.cashflowDate && <p className="text-xs text-red-500">{state.errors.cashflowDate[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Keterangan (opsional)</Label>
                <Input name="notes" placeholder="Catatan transaksi..." className="bg-white border-[#e5dcd1]" />
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
  );
}
