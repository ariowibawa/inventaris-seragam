import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shirt } from "lucide-react";
import Link from "next/link";

interface TopProductsProps {
  products: Array<{ name: string; sales: number; qty: number }>;
}

export default function TopProducts({ products }: TopProductsProps) {
  const fmtRp = (n: number) => {
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(1)}K`;
    return `Rp ${n}`;
  };

  return (
    <Card className="flex flex-col h-full border-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Produk Paling Laris</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 flex-1">
        <div className="space-y-6 flex-1">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada data penjualan.</p>
          ) : products.map((product, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Shirt className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Terjual: {product.qty} pcs</p>
              </div>
              <div className="text-sm font-bold text-primary whitespace-nowrap">
                {fmtRp(product.sales)}
              </div>
            </div>
          ))}
        </div>
        <Link href="/produk" className="text-sm font-medium text-primary hover:underline w-full text-center mt-4">
          Lihat Semua Produk
        </Link>
      </CardContent>
    </Card>
  );
}
