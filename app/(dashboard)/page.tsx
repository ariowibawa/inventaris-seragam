import StatsCard from "@/components/dashboard/StatsCard";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
import { Package, ShoppingBag, ShoppingCart, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { getDashboardStats, getChartData, getTopProducts } from "@/app/actions/dashboard";

export default async function DashboardPage() {
  const [stats, chartData, topProducts] = await Promise.all([
    getDashboardStats(),
    getChartData(),
    getTopProducts(),
  ]);

  const fmtShort = (n: number) => {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(1)}K`;
    return `Rp ${n}`;
  };

  const fmtNum = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <section>
        <h2 className="text-3xl font-bold text-foreground">Selamat datang kembali, Admin</h2>
        <p className="text-muted-foreground mt-1">Ringkasan bisnis bulan ini.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="TOTAL STOK" value={fmtNum(stats.totalStock)} trend="" isPositive={true} Icon={Package} />
        <StatsCard title="TOTAL PENJUALAN" value={fmtNum(stats.totalSalesCount)} trend="" isPositive={true} Icon={ShoppingBag} iconBgColor="bg-[#f5ebe6]" iconColor="text-[#c28e67]" />
        <StatsCard title="TOTAL PEMBELIAN" value={fmtNum(stats.totalPurchasesCount)} trend="" isPositive={true} Icon={ShoppingCart} />
        <StatsCard title="TOTAL PEMASUKAN" value={fmtShort(stats.totalIncome)} trend="" isPositive={true} Icon={ArrowUpRight} iconBgColor="bg-[#f5ebe6]" iconColor="text-[#c28e67]" />
        <StatsCard title="TOTAL PENGELUARAN" value={fmtShort(stats.totalExpense)} trend="" isPositive={false} Icon={ArrowDownRight} />
        <StatsCard title="LABA BERSIH" value={fmtShort(stats.netProfit)} trend="" isPositive={stats.netProfit >= 0} Icon={Wallet} iconBgColor="bg-[#e3b596]" iconColor="text-[#2d201c]" cardBgColor="bg-gradient-to-br from-white to-[#fdf8f5]" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={chartData} />
        </div>
        <div className="lg:col-span-1">
          <TopProducts products={topProducts} />
        </div>
      </section>
    </div>
  );
}
