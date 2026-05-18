import { getPurchases } from "@/app/actions/purchases";
import { getSuppliers } from "@/app/actions/suppliers";
import { getProducts } from "@/app/actions/products";
import PembelianClient from "./PembelianClient";

export default async function PembelianPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const startDate = typeof params.startDate === "string" ? params.startDate : "";
  const endDate = typeof params.endDate === "string" ? params.endDate : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const [purchasesData, suppliers, productsData] = await Promise.all([
    getPurchases({ search, startDate, endDate, page, perPage: 10 }),
    getSuppliers(),
    getProducts({ perPage: 200 }),
  ]);

  return (
    <PembelianClient
      purchases={purchasesData.purchases}
      totalPurchases={purchasesData.total}
      currentPage={purchasesData.page}
      totalPages={purchasesData.totalPages}
      suppliers={suppliers}
      products={productsData.products.map((p) => ({
        id: p.id,
        name: `${p.name} - ${p.color} (${p.size})`,
        sku: p.sku,
        costPrice: p.costPrice,
      }))}
      filters={{ search, startDate, endDate }}
    />
  );
}
