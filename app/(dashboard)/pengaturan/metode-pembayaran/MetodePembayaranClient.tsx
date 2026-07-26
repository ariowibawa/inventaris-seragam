"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building, Trash2, Plus } from "lucide-react";
import { createPaymentMethod, deletePaymentMethod } from "@/app/actions/payment-methods";

type PaymentMethod = {
  id: string;
  name: string;
};

interface Props {
  initialPaymentMethods: PaymentMethod[];
}

export default function MetodePembayaranClient({ initialPaymentMethods }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, formAction, isPending] = useActionState(createPaymentMethod, undefined);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (formState?.success) {
      formRef.current?.reset();
      setDeleteError(null);
    }
  }, [formState]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus metode pembayaran ini?")) {
      return;
    }

    setDeleteError(null);
    setDeleteSuccess(null);

    const result = await deletePaymentMethod(id);
    if (result.success) {
      setDeleteSuccess("Metode pembayaran berhasil dihapus.");
      setTimeout(() => setDeleteSuccess(null), 3000);
    } else {
      setDeleteError(result.error || "Gagal menghapus metode pembayaran.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link
              href="/pengaturan"
              className="inline-flex items-center justify-center p-2 rounded-lg border border-[#e5dcd1] bg-[#fcfbf7] hover:bg-[#f0e8df] text-[#8a6c5f] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Metode Pembayaran</h1>
          </div>
          <p className="text-muted-foreground ml-11">
            Kelola metode pembayaran yang digunakan dalam transaksi penjualan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - List of Payment Methods */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#fcfbf7] p-8 rounded-2xl border border-[#e5dcd1] shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5dcd1]">
              <Building className="text-[#8a6c5f] w-5 h-5" />
              <h2 className="text-lg font-semibold text-foreground">Daftar Metode Pembayaran</h2>
            </div>

            {deleteSuccess && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-emerald-50 border border-emerald-200 text-emerald-600">
                {deleteSuccess}
              </div>
            )}
            {deleteError && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-600">
                {deleteError}
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-[#e5dcd1]">
              <table className="w-full border-collapse bg-white text-left text-sm text-foreground">
                <thead className="bg-[#fdfbf7] text-xs font-semibold uppercase text-muted-foreground border-b border-[#e5dcd1]">
                  <tr>
                    <th scope="col" className="px-6 py-4 w-16">No</th>
                    <th scope="col" className="px-6 py-4">Metode Pembayaran</th>
                    <th scope="col" className="px-6 py-4 text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5dcd1]">
                  {initialPaymentMethods.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                        Belum ada metode pembayaran yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    initialPaymentMethods.map((method, idx) => (
                      <tr key={method.id} className="hover:bg-[#faf7f5]/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-muted-foreground">{idx + 1}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{method.name}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(method.id)}
                            className="inline-flex items-center justify-center p-2 rounded-lg border border-red-100 hover:border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                            title="Hapus Metode Pembayaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Add Form */}
        <div>
          <form ref={formRef} action={formAction} className="bg-[#fcfbf7] p-8 rounded-2xl border border-[#e5dcd1] shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#e5dcd1]">
              <Plus className="text-[#8a6c5f] w-5 h-5" />
              <h2 className="text-lg font-semibold text-foreground">Tambah Metode</h2>
            </div>

            {formState?.message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  formState.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                    : "bg-red-50 border border-red-200 text-red-600"
                }`}
              >
                {formState.message}
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium">
                Nama Metode Pembayaran
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: Transfer Bank, QRIS, Tunai"
                className="bg-[#fcfbf7] border-[#e5dcd1] h-12"
                required
              />
              {formState?.errors?.name && (
                <p className="text-xs text-red-500">{formState.errors.name[0]}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#8a6c5f] hover:bg-[#6b5247] text-white h-12 rounded-xl font-medium"
            >
              {isPending ? "Menyimpan..." : "Tambah Metode Pembayaran"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
