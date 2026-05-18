import { getInventorySummary, getInventoryProducts } from "@/app/actions/inventory";
import { getProducts } from "@/app/actions/products";
import InventarisClient from "./InventarisClient";

export default async function InventarisPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const [summary, inventoryData, allProducts] = await Promise.all([
    getInventorySummary(),
    getInventoryProducts({ search, status, page, perPage: 10 }),
    getProducts({ perPage: 200 }),
  ]);

  return (
    <InventarisClient
      summary={summary}
      products={inventoryData.products}
      totalProducts={inventoryData.total}
      currentPage={inventoryData.page}
      totalPages={inventoryData.totalPages}
      allProductsList={allProducts.products.map((p) => ({
        id: p.id,
        name: `${p.name} - ${p.color} (${p.size})`,
        stock: p.stock,
      }))}
      filters={{ search }}
    />
  );
}
