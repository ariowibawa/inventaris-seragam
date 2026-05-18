"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-0" : "md:ml-64"
        }`}
      >
        <Header 
          onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <main className="flex-1 overflow-x-hidden p-6 md:p-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
