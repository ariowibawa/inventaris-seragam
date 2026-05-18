"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { Shirt, Archive, Mail, Lock, EyeOff, Eye, ArrowRight, Loader2 } from "lucide-react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen w-full bg-[#fdfaf7]">
      {/* Left Panel - Image Background */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-end p-12 overflow-hidden">
        <Image
          src="/images/login-bg.png"
          alt="Wardrobe background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay with brown tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3d2410]/90 via-[#3d2410]/60 to-[#3d2410]/30" />
        
        <div className="relative z-10 max-w-lg mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md mb-6">
            <Shirt size={14} className="text-[#e2c3a5]" />
            <span className="text-xs font-medium text-white/90 tracking-wide uppercase">Sistem Inventaris</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            SMP Al-Azhar<br />Pasuruan.
          </h1>
          
          <p className="text-lg text-white/80 leading-relaxed">
            Kelola stok, penjualan, pembelian, dan keuntungan seragam dalam satu sistem terpadu yang dirancang untuk kemudahan dan keandalan.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[420px] flex flex-col items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-10">
            <div className="relative flex h-16 w-16 items-center justify-center shrink-0">
              <Image src="/images/logo.png" alt="Logo SMP Al-Azhar" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#3a2517] leading-tight">SMP Al-Azhar</span>
              <span className="text-xs font-semibold text-[#7a4e2e] tracking-widest uppercase">Inventaris Seragam</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="w-full rounded-2xl bg-white p-8 shadow-sm border border-black/5">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[#3a2517] mb-2">Selamat Datang Kembali</h2>
              <p className="text-sm text-muted-foreground">
                Silakan masukkan kredensial Anda untuk melanjutkan ke dashboard.
              </p>
            </div>

            {state?.message && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {state.message}
              </div>
            )}

            <form className="space-y-5" action={formAction}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#3a2517]">
                  Email atau Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
                  <input 
                    name="email"
                    type="text" 
                    placeholder="admin@uniform.com" 
                    className="flex h-11 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                {state?.errors?.email && (
                  <p className="text-xs text-red-500 mt-1">{state.errors.email[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#3a2517]">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-medium text-[#7a4e2e] hover:text-[#5a3820] hover:underline">
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
                  <input 
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="flex h-11 w-full rounded-lg border border-input bg-transparent pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground/70 hover:text-[#3a2517] transition-colors"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                {state?.errors?.password && (
                  <p className="text-xs text-red-500 mt-1">{state.errors.password[0]}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 pb-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="h-4 w-4 rounded border-gray-300 text-[#7a4e2e] focus:ring-[#7a4e2e]" 
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Ingat saya di perangkat ini
                </label>
              </div>

              <button 
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#7a4e2e] text-white hover:bg-[#633f25] h-11 px-4 py-2 w-full shadow-sm"
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Butuh bantuan akses?{" "}
            <Link href="#" className="font-semibold text-[#7a4e2e] hover:text-[#5a3820] hover:underline underline-offset-2">
              Hubungi Administrator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
