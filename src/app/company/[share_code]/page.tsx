"use client";

import { ShareTable } from "@/components/ShareTable";
import { useShares } from "@/hooks/useShares";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ShareChart } from "@/components/ShareChart";
import { CompanyInvestorNetwork } from "@/components/CompanyInvestorNetwork";

export default function CompanyPage() {
  const params = useParams();
  const shareCode = (params.share_code as string) ?? "";
  const decodedCode = decodeURIComponent(shareCode);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("SHARE_CODE");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const limit = 10;

  const { data, isLoading, error } = useShares({
    shareCode: decodedCode,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const companyName = data?.data?.[0]?.ISSUER_NAME ?? decodedCode;

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-blue hover:text-foreground transition mb-2"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-card rounded-xl border border-border p-6 flex items-start gap-4">
        <div className="w-16 h-16 bg-dim text-blue rounded-xl flex items-center justify-center shrink-0">
          <Building2 size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {companyName}
          </h1>
          <p className="text-muted text-lg font-medium">{decodedCode}</p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Shareholders Distribution
        </h2>
        {error ? (
          <div className="p-4 bg-red/10 text-red rounded-lg border border-red/30">
            <p className="font-medium">Failed to load data.</p>
            {error.message && (
              <p className="text-sm mt-1 opacity-90">{error.message}</p>
            )}
          </div>
        ) : (
          <>
            <section className="pb-2">
              <ShareChart aggregates={data?.aggregates} />
            </section>
            <section className="pt-2">
              <CompanyInvestorNetwork
                shareCode={decodedCode}
                companyName={companyName}
              />
            </section>
            <section className="pt-4">
              <ShareTable
                data={data?.data ?? []}
                total={data?.total ?? 0}
                page={page}
                totalPages={data?.totalPages ?? 0}
                onPageChange={setPage}
                isLoading={isLoading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(newSortBy, newSortOrder) => {
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setPage(1);
                }}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
