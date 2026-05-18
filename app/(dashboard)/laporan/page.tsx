import { getReportData } from "@/app/actions/dashboard";
import LaporanClient from "./LaporanClient";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const reportData = await getReportData({ search, page, perPage: 10 });

  return (
    <LaporanClient
      items={reportData.items}
      total={reportData.total}
      currentPage={reportData.page}
      totalPages={reportData.totalPages}
      summary={reportData.summary}
      filters={{ search }}
    />
  );
}
