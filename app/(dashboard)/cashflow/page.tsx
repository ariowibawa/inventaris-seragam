import { getCashflowSummary, getCashflowEntries, getCashflowCategories } from "@/app/actions/cashflow";
import CashflowClient from "./CashflowClient";

export default async function CashflowPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const type = typeof params.type === "string" ? params.type : "";
  const startDate = typeof params.startDate === "string" ? params.startDate : "";
  const endDate = typeof params.endDate === "string" ? params.endDate : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const [summary, entriesData, categories] = await Promise.all([
    getCashflowSummary(startDate || undefined, endDate || undefined),
    getCashflowEntries({ search, type, startDate, endDate, page, perPage: 10 }),
    getCashflowCategories(),
  ]);

  return (
    <CashflowClient
      summary={summary}
      entries={entriesData.entries}
      totalEntries={entriesData.total}
      currentPage={entriesData.page}
      totalPages={entriesData.totalPages}
      categories={categories}
      filters={{ search, type, startDate, endDate }}
    />
  );
}
