import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Company, PaginatedResult } from "@/lib/types";
import { SearchForm } from "@/components/SearchForm";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Number(page ?? "1");

  const result = await apiGet<PaginatedResult<Company>>("/companies", {
    q,
    page: String(currentPage),
  });

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/companies?${params.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">企業一覧</h1>
        <Link
          href="/companies/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          企業を作成
        </Link>
      </div>

      <div className="mb-6">
        <SearchForm />
      </div>

      <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {result.items.map((company) => (
          <li key={company.id}>
            <Link
              href={`/companies/${company.id}`}
              className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <p className="font-medium">{company.name}</p>
              {company.description && (
                <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                  {company.description}
                </p>
              )}
            </Link>
          </li>
        ))}
        {result.items.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-zinc-500">
            該当する企業がありません
          </li>
        )}
      </ul>

      <div className="mt-6 flex items-center justify-between text-sm text-zinc-500">
        <span>
          {result.meta.total}件中{" "}
          {result.meta.total === 0
            ? 0
            : (result.meta.page - 1) * result.meta.limit + 1}
          -{Math.min(result.meta.page * result.meta.limit, result.meta.total)}
          件を表示
        </span>
        <div className="flex gap-2">
          <Link
            href={pageHref(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage <= 1}
            className={`rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 ${
              currentPage <= 1 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            前へ
          </Link>
          <Link
            href={pageHref(currentPage + 1)}
            aria-disabled={currentPage >= result.meta.totalPages}
            className={`rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 ${
              currentPage >= result.meta.totalPages
                ? "pointer-events-none opacity-40"
                : ""
            }`}
          >
            次へ
          </Link>
        </div>
      </div>
    </div>
  );
}
