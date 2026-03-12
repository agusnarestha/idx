"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ShareDataRow } from "@/types";
import { getInvestorTypeName } from "@/lib/mappings";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface ShareTableProps {
  data: ShareDataRow[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  isLoading: boolean;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export function ShareTable({
  data,
  total,
  page,
  totalPages,
  onPageChange,
  isLoading,
  sortBy,
  sortOrder,
  onSortChange,
}: ShareTableProps) {
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking same column
      onSortChange(column, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      onSortChange(column, "asc");
    }
  };

  const columns = [
    {
      accessorKey: "SHARE_CODE",
      header: () => (
        <button
          onClick={() => handleSort("SHARE_CODE")}
          className="flex items-center gap-2 hover:text-blue transition"
        >
          Company
          <span className="inline">
            {sortBy === "SHARE_CODE" ? (
              sortOrder === "asc" ? (
                <ArrowUp size={16} />
              ) : (
                <ArrowDown size={16} />
              )
            ) : (
              <ArrowUpDown size={16} />
            )}
          </span>
        </button>
      ),
      cell: (info: any) => (
        <div className="flex flex-col">
          <Link
            href={`/company/${info.getValue()}`}
            className="text-blue font-bold hover:underline"
          >
            {info.getValue()}
          </Link>
          <span className="text-xs text-muted">
            {info.row.original.ISSUER_NAME}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "INVESTOR_NAME",
      header: "Investor Name",
      cell: (info: any) => (
        <Link
          href={`/investor/${encodeURIComponent(info.getValue())}`}
          className="text-foreground font-medium hover:text-blue transition"
        >
          {info.getValue() ?? "N/A"}
        </Link>
      ),
    },
    {
      accessorKey: "INVESTOR_TYPE",
      header: "Type",
      cell: (info: any) => {
        const type = info.getValue() as string;
        const name = getInvestorTypeName(type);
        return (
          <span className="px-2 py-1 bg-dim/50 text-muted text-xs font-semibold rounded-full border border-border">
            {name}
          </span>
        );
      },
    },
    {
      accessorKey: "LOCAL_FOREIGN",
      header: "Origin",
      cell: (info: any) => {
        const value = info.getValue();
        return value === "L" ? (
          <span className="text-green bg-green/20 px-2 py-1 rounded text-xs border border-green/30">
            Local
          </span>
        ) : (
          <span className="text-blue bg-blue/20 px-2 py-1 rounded text-xs border border-blue/30">
            Foreign
          </span>
        );
      },
    },
    {
      accessorKey: "TOTAL_HOLDING_SHARES",
      header: "Total Shares",
      cell: (info: any) => (
        <div className="text-right font-medium text-foreground">
          {Number(info.getValue()).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "PERCENTAGE",
      header: "Ownership %",
      cell: (info: any) => {
        const val = info.getValue();
        const numVal = typeof val === "number" ? val : Number(val ?? 0);
        return (
          <div className="text-right">
            <span className="font-semibold text-foreground">
              {numVal.toFixed(2)}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "DATE",
      header: "Date",
      cell: (info: any) => (
        <span className="text-muted">{info.getValue()}</span>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-muted uppercase bg-dim/30 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-5 font-bold tracking-wider text-foreground cursor-pointer hover:bg-dim/50 transition"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-muted"
                >
                  <div className="flex flex-col justify-center items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-border border-t-blue rounded-full animate-spin" />
                    <span className="font-medium animate-pulse">
                      Syncing Dataset...
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-muted flex flex-col items-center"
                >
                  <span className="text-xl font-semibold text-foreground">
                    No records found
                  </span>
                  <span className="text-sm mt-1">
                    Try adjusting your filters to broaden the search
                  </span>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-transparent hover:bg-dim/20 transition-colors duration-200 group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-5 whitespace-nowrap text-foreground group-hover:text-foreground transition-colors"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 border-t border-border bg-dim/20 gap-4">
        <div className="text-sm text-muted">
          Showing{" "}
          <span className="font-bold text-foreground">{data.length}</span> out
          of <span className="font-bold text-foreground">{total}</span> records
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted bg-card border border-border hover:text-blue hover:border-blue/50 hover:bg-blue/10 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 font-medium text-sm"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span className="text-sm font-semibold text-foreground px-2 py-1 bg-card rounded-md border border-border">
            {page} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || totalPages === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted bg-card border border-border hover:text-blue hover:border-blue/50 hover:bg-blue/10 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 font-medium text-sm"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
