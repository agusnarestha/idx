"use client";

import { DashboardFilters } from "@/components/DashboardFilters";
import { ShareChart } from "@/components/ShareChart";
import { ShareTable } from "@/components/ShareTable";
import { StructuredData } from "@/components/StructuredData";
import { useShares } from "@/hooks/useShares";
import { FilterParams } from "@/types";
import { useState } from "react";
import { Download, TrendingUp, Users } from "lucide-react";

export default function Home() {
  const [filters, setFilters] = useState<FilterParams>({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("SHARE_CODE");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const limit = 10;

  const { data, isLoading, error } = useShares({
    ...filters,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setPage(1);
  };

  const exportCsv = () => {
    if (!data?.data) return;
    const headers = Object.keys(data.data[0]).join(",");
    const rows = data.data
      .map((row) => Object.values(row).join(","))
      .join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "idx_shares_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      <StructuredData
        type="Organization"
        name="IDX Market Explorer"
        description="Comprehensive dashboard for Indonesia Stock Exchange share ownership analysis and investor information"
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Market Overview
          </h1>
          <p className="text-muted mt-1">
            Analyze top shareholders and ownership distribution across the
            Indonesian Stock Exchange.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data || data.data.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md font-medium hover:bg-dim transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Export Current Page to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="overflow-hidden bg-card rounded-2xl p-6 border border-border flex items-center gap-5">
          <div className="w-14 h-14 bg-blue text-white rounded-xl flex items-center justify-center shrink-0">
            <Users size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">
              Total Records Found
            </p>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              {isLoading ? (
                <span className="animate-pulse bg-dim h-8 w-24 rounded inline-block" />
              ) : (
                (data?.total?.toLocaleString() ?? 0)
              )}
            </h3>
          </div>
        </div>

        <div className="overflow-hidden bg-card rounded-2xl p-6 border border-border flex items-center gap-5">
          <div className="w-14 h-14 bg-green text-white rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">
              Displaying Data Points
            </p>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              {isLoading ? (
                <span className="animate-pulse bg-dim h-8 w-24 rounded inline-block" />
              ) : (
                (data?.data?.length?.toLocaleString() ?? 0)
              )}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="overflow-hidden bg-card rounded-2xl p-6 border border-border flex items-center gap-5">
          <div className="w-14 h-14 bg-blue text-white rounded-xl flex items-center justify-center shrink-0">
            <Users size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">
              Total Investors Found
            </p>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              {isLoading ? (
                <span className="animate-pulse bg-dim h-8 w-24 rounded inline-block" />
              ) : (
                (data?.aggregates?.uniqueInvestors?.toLocaleString() ?? 0)
              )}
            </h3>
          </div>
        </div>

        <div className="overflow-hidden bg-card rounded-2xl p-6 border border-border flex items-center gap-5">
          <div className="w-14 h-14 bg-green text-white rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">
              Displaying Data Points
            </p>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              {isLoading ? (
                <span className="animate-pulse bg-dim h-8 w-24 rounded inline-block" />
              ) : (
                (data?.data?.length?.toLocaleString() ?? 0)
              )}
            </h3>
          </div>
        </div>
      </div>

      <DashboardFilters
        initialFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {error ? (
        <div className="p-4 bg-red/10 text-red rounded-lg border border-red/30">
          Failed to load data. Please try again.
        </div>
      ) : (
        <>
          <ShareChart aggregates={data?.aggregates} />
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
        </>
      )}
    </div>
  );
}
