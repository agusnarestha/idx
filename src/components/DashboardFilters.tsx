"use client";

import { INVESTOR_TYPE_MAP } from "@/lib/mappings";
import { FilterParams } from "@/types";
import { Search, Filter, X } from "lucide-react";
import { useState, FormEvent } from "react";

interface DashboardFiltersProps {
  initialFilters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}

export function DashboardFilters({ initialFilters, onFilterChange }: DashboardFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleClear = () => {
    const cleared: FilterParams = {
      date: "",
      shareCode: "",
      searchInvestor: "",
      localForeign: "",
      minPercentage: 0,
      investorTypes: [],
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const toggleInvestorType = (code: string) => {
    const current = filters.investorTypes ?? [];
    if (current.includes(code)) {
      setFilters({ ...filters, investorTypes: current.filter((c) => c !== code) });
    } else {
      setFilters({ ...filters, investorTypes: [...current, code] });
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border mb-8 overflow-hidden">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue/20 text-blue flex items-center justify-center">
            <Filter size={18} strokeWidth={2.5} />
          </div>
          Data Filters
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm font-semibold text-blue hover:text-foreground md:hidden flex items-center gap-1 bg-blue/10 px-3 py-1.5 rounded-full transition-colors"
        >
          {isOpen ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className={`p-6 ${isOpen ? "block" : "hidden md:block"}`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Investor Name</label>
              <div className="relative group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-blue transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. NEGARA REPUBLIK..."
                  value={filters.searchInvestor ?? ""}
                  onChange={(e) => setFilters({ ...filters, searchInvestor: e.target.value })}
                  className="pl-9 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Company Code / Name</label>
              <input
                type="text"
                placeholder="e.g. BBCA or Telkom"
                value={filters.shareCode ?? ""}
                onChange={(e) => setFilters({ ...filters, shareCode: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Date Reference</label>
              <input
                type="date"
                value={filters.date ?? ""}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Origin</label>
              <select
                value={filters.localForeign ?? ""}
                onChange={(e) => setFilters({ ...filters, localForeign: e.target.value })}
                className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all"
              >
                <option value="">All Origins</option>
                <option value="L">Local (L)</option>
                <option value="F">Foreign (F)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 items-end">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-foreground">Investor Types</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(INVESTOR_TYPE_MAP).map(([code, name]) => {
                  const isActive = (filters.investorTypes ?? []).includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleInvestorType(code)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                        isActive
                          ? "bg-blue text-white border-blue"
                          : "bg-card text-muted border-border hover:border-dim hover:text-foreground"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto mt-6 xl:mt-0">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-dim/50 text-muted rounded-xl text-sm font-bold hover:bg-dim hover:text-foreground transition-all border border-border"
              >
                <X size={16} strokeWidth={2.5} />
                Clear Filters
              </button>
              <button
                type="submit"
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
              >
                <Filter size={16} strokeWidth={2.5} />
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
