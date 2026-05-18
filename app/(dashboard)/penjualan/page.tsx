import { getSales, getPaymentMethods } from "@/app/actions/sales";
import { getProducts } from "@/app/actions/products";
import PenjualanClient from "./PenjualanClient";

export default async function PenjualanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const startDate = typeof params.startDate === "string" ? params.startDate : "";
  const endDate = typeof params.endDate === "string" ? params.endDate : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const [salesData, paymentMethods, productsData] = await Promise.all([
    getSales({ search, startDate, endDate, page, perPage: 10 }),
    getPaymentMethods(),
    getProducts({ perPage: 200 }),
  ]);

  return (
    <PenjualanClient
      sales={salesData.sales}
      totalSales={salesData.total}
      currentPage={salesData.page}
      totalPages={salesData.totalPages}
      paymentMethods={paymentMethods}
      products={productsData.products.map((p) => ({
        id: p.id,
        name: `${p.name} - ${p.color} (${p.size})`,
        sku: p.sku,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
      }))}
      filters={{ search, startDate, endDate }}
    />
  );
}
