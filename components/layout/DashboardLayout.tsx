import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SidebarToggleProvider from "@/components/layout/SidebarToggleProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarToggleProvider>
      <Sidebar />

      <div className="flex-1 flex flex-col transition-all duration-300 md:ml-64">
        <Header />
        <main className="flex-1 overflow-x-hidden p-6 md:p-8">
          {children}
        </main>
        <Footer />
      </div>
    </SidebarToggleProvider>
  );
}
