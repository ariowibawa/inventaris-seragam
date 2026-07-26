import { getProducts, getUniqueSizes } from "@/app/actions/products";
import { getCategories } from "@/app/actions/categories";
import ProdukClient from "./ProdukClient";

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const categoryId =
    typeof params.category === "string" ? params.category : "semua";
  const size = typeof params.size === "string" ? params.size : "semua";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const [productsData, categories, sizes] = await Promise.all([
    getProducts({ search, categoryId, size, page, perPage: 10 }),
    getCategories(),
    getUniqueSizes(),
  ]);

  return (
    <ProdukClient
      initialProducts={productsData.products}
      totalProducts={productsData.total}
      currentPage={productsData.page}
      totalPages={productsData.totalPages}
      perPage={productsData.perPage}
      categories={categories}
      sizes={sizes}
      filters={{ search, categoryId, size }}
    />
  );
}
