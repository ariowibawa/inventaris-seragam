"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Shirt, 
  Archive, 
  ShoppingCart, 
  CreditCard, 
  Wallet, 
  FileText, 
  Settings,
  Power
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useSidebar } from "@/components/layout/SidebarToggleProvider";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/produk", icon: Shirt, label: "Produk" },
  { to: "/inventaris", icon: Archive, label: "Inventaris" },
  { to: "/penjualan", icon: ShoppingCart, label: "Penjualan" },
  { to: "/pembelian", icon: CreditCard, label: "Pembelian" },
  { to: "/cashflow", icon: Wallet, label: "Cashflow" },
  { to: "/laporan", icon: FileText, label: "Laporan" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground w-64 flex flex-col transition-all duration-300 z-50 ${isCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
      <div className="p-6 flex items-center gap-3">
        <div className="relative w-10 h-10 flex-shrink-0 bg-white rounded-full p-1 shadow-sm">
          <Image src="/images/logo.png" alt="Logo" fill className="object-contain p-0.5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">SMP Al-Azhar</h1>
          <p className="text-[10px] text-white/70">Inventaris Seragam</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-sidebar-accent text-primary" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-sidebar-foreground/70"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <Link
            href="/pengaturan"
            className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith("/pengaturan") 
                ? "bg-sidebar-accent text-primary" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <Settings className="w-5 h-5 text-sidebar-foreground/70" />
            Pengaturan
          </Link>
          <form action={logout}>
            <button 
              type="submit"
              className="p-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
              title="Keluar"
            >
              <Power className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
