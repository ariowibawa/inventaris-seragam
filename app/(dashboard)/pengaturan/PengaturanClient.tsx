"use client";

import React, { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Box, Network, ChevronRight, Save, Tag, Truck, Building, ArrowLeftRight,
} from "lucide-react";
import { updateProfile, updateMinStock } from "@/app/actions/settings";
import { changePassword } from "@/app/actions/auth";

type Profile = { id: string; name: string; email: string } | null;

interface Props {
  profile: Profile;
  settings: Record<string, string>;
}

export default function PengaturanClient({ profile, settings }: Props) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, undefined);

  const [stockState, stockAction, stockPending] = useActionState(updateMinStock, undefined);
  const [pwState, pwAction, pwPending] = useActionState(changePassword, undefined);
  const [showPwSuccess, setShowPwSuccess] = useState(false);

  useEffect(() => {
    if (pwState?.success) { setShowPwSuccess(true); setTimeout(() => setShowPwSuccess(false), 3000); }
  }, [pwState?.success]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengaturan Sistem</h1>
        <p className="text-muted-foreground mt-2">Kelola preferensi akun dan konfigurasi inventaris utama Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profil Admin */}
          <form action={profileAction}>
            <div className="bg-[#fcfbf7] p-8 rounded-2xl border border-[#e5dcd1] shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#e5dcd1]">
                <User className="text-[#8a6c5f] w-5 h-5" />
                <h2 className="text-lg font-semibold text-foreground">Profil Admin</h2>
              </div>
              {profileState?.message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${profileState.success ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-red-50 border border-red-200 text-red-600"}`}>{profileState.message}</div>
              )}
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#f0e8df] flex items-center justify-center">
                    <User className="w-16 h-16 text-[#8a6c5f]" />
                  </div>
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Nama Lengkap</Label>
                      <Input name="name" defaultValue={profile?.name || ""} className="bg-[#fcfbf7] border-[#e5dcd1] h-12" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Peran</Label>
                      <Input defaultValue="Administrator" disabled className="bg-[#f0e8df]/50 border-[#e5dcd1] text-muted-foreground h-12" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input name="email" defaultValue={profile?.email || ""} className="bg-[#fcfbf7] border-[#e5dcd1] h-12" />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={profilePending} className="bg-[#8a6c5f] hover:bg-[#6b5247] text-white h-12 px-8 rounded-xl font-medium">
                      Simpan Profil
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>


          {/* Change Password */}
          <form action={pwAction}>
            <div className="bg-[#fcfbf7] p-8 rounded-2xl border border-[#e5dcd1] shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#e5dcd1]">
                <User className="text-[#8a6c5f] w-5 h-5" />
                <h2 className="text-lg font-semibold text-foreground">Ubah Password</h2>
              </div>
              {pwState?.message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${pwState.success || showPwSuccess ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-red-50 border border-red-200 text-red-600"}`}>{pwState.message}</div>
              )}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Password Saat Ini</Label>
                  <Input name="currentPassword" type="password" className="bg-[#fcfbf7] border-[#e5dcd1] h-12" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Password Baru</Label>
                    <Input name="newPassword" type="password" className="bg-[#fcfbf7] border-[#e5dcd1] h-12" />
                  </div>
                  <div className="space-y-3">
                    <Label>Konfirmasi Password Baru</Label>
                    <Input name="confirmPassword" type="password" className="bg-[#fcfbf7] border-[#e5dcd1] h-12" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={pwPending} className="bg-[#8a6c5f] hover:bg-[#6b5247] text-white h-12 px-8 rounded-xl font-medium">
                    Ubah Password
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Konfigurasi Stok */}
          <form action={stockAction}>
            <div className="bg-[#fcfbf7] p-8 rounded-2xl border border-[#e5dcd1] shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5dcd1]">
                <Box className="text-[#8a6c5f] w-5 h-5" />
                <h2 className="text-lg font-semibold text-foreground">Konfigurasi Stok</h2>
              </div>
              {stockState?.message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${stockState.success ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-red-50 border border-red-200 text-red-600"}`}>{stockState.message}</div>
              )}
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Stok Minimum Default</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Peringatan akan muncul saat stok produk mencapai angka ini.</p>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Input name="minStock" type="number" defaultValue={settings.defaultMinStock || "15"} onFocus={(e) => e.target.select()} className="w-24 text-center bg-[#fcfbf7] border-[#e5dcd1] h-12 text-lg font-medium" />
                  <span className="font-medium text-sm text-muted-foreground">Pcs</span>
                  <Button type="submit" variant="outline" size="icon" disabled={stockPending} className="h-12 w-12 ml-auto border-[#e5dcd1] hover:bg-[#f0e8df] text-[#8a6c5f] rounded-xl">
                    <Save className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Master Data */}
          <div className="bg-[#fcfbf7] p-8 rounded-2xl border border-[#e5dcd1] shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5dcd1]">
              <Network className="text-[#8a6c5f] w-5 h-5" />
              <h2 className="text-lg font-semibold text-foreground">Master Data</h2>
            </div>
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground mb-4">Kelola daftar referensi utama sistem.</p>
              <div className="space-y-4">
                {[
                  { icon: Tag, label: "Kategori Produk" },
                  { icon: Truck, label: "Daftar Supplier" },
                  { icon: Building, label: "Metode Pembayaran" },
                  { icon: ArrowLeftRight, label: "Kategori Cashflow" },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="w-full flex items-center justify-between p-4 rounded-xl border border-[#e5dcd1] bg-[#fdfbf7] hover:bg-[#f0e8df] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#f0e8df] group-hover:bg-white flex items-center justify-center text-[#8a6c5f] transition-colors border border-transparent group-hover:border-[#e5dcd1]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
