"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SidebarToggleProvider, { useSidebar } from "@/components/layout/SidebarToggleProvider";

function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? "md:ml-0" : "md:ml-64"}`}>
      <Header />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarToggleProvider>
      <Sidebar />
      <MainContent>{children}</MainContent>
    </SidebarToggleProvider>
  );
}

