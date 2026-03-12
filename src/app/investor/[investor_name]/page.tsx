"use client";

import { ShareTable } from "@/components/ShareTable";
import { useShares } from "@/hooks/useShares";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getInvestorTypeName } from "@/lib/mappings";

export default function InvestorPage() {
  const params = useParams();
  const investorName = params.investor_name as string;
  const decodedName = decodeURIComponent(investorName);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("SHARE_CODE");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const limit = 10;

  const { data, isLoading, error } = useShares({
    searchInvestor: decodedName,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const investorType = data?.data?.[0]
    ? getInvestorTypeName(data.data[0].INVESTOR_TYPE)
    : "Unknown Type";
  const origin = data?.data?.[0]?.LOCAL_FOREIGN === "L" ? "Local" : "Foreign";

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
          <User size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {decodedName}
          </h1>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-dim/50 text-muted text-xs font-semibold rounded-full border border-border">
              {investorType}
            </span>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full border ${origin === "Local" ? "text-green bg-green/20 border-green/30" : "text-blue bg-blue/20 border-blue/30"}`}
            >
              {origin}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Portfolio Holdings
        </h2>
        {error ? (
          <div className="p-4 bg-red/10 text-red rounded-lg border border-red/30">
            Failed to load data.
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
