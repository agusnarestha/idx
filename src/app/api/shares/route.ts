import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { ShareDataRow, FilterParams, PaginatedResponse } from "@/types";

// Simple in-memory cache for parsed CSV
let cachedData: ShareDataRow[] | null = null;

function loadCsvData(): ShareDataRow[] {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), "data", "data.csv");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found: ${filePath} (cwd: ${process.cwd()})`);
  }
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const results = Papa.parse<ShareDataRow>(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  cachedData = results.data.map((row) => {
    let percentage: any = row.PERCENTAGE;
    if (typeof percentage === "string") {
      percentage =
        parseFloat(percentage.replace(/,/g, ".").replace(/%/g, "")) || 0;
    }

    let totalShares: any = row.TOTAL_HOLDING_SHARES;
    if (typeof totalShares === "string") {
      totalShares =
        parseFloat(totalShares.replace(/\./g, "").replace(/,/g, ".")) || 0;
    }

    return {
      ...row,
      PERCENTAGE: Number(percentage) || 0,
      TOTAL_HOLDING_SHARES: Number(totalShares) || 0,
    };
  });

  return cachedData;
}

export async function GET(req: NextRequest) {
  try {
    const data = loadCsvData();
    const { searchParams } = new URL(req.url);

    // Parse filters
    const date = searchParams.get("date");
    const shareCode = searchParams.get("shareCode");
    const investorTypes = searchParams
      .get("investorTypes")
      ?.split(",")
      .filter(Boolean);
    const localForeign = searchParams.get("localForeign");
    const minPercentage = parseFloat(searchParams.get("minPercentage") || "0");
    const searchInvestor = searchParams.get("searchInvestor")?.toLowerCase();
    const sortBy = searchParams.get("sortBy") || "SHARE_CODE";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as
      | "asc"
      | "desc";

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Apply filters
    let filteredData = data.filter((row) => {
      let match = true;
      if (date && String(row.DATE ?? "") !== date) match = false;
      if (shareCode) {
        const code = String(row.SHARE_CODE ?? "").toUpperCase();
        const search = String(shareCode).toUpperCase();
        if (code !== search) match = false;
      }
      if (investorTypes && investorTypes.length > 0) {
        const type = String(row.INVESTOR_TYPE ?? "");
        const typeMatch =
          investorTypes.includes(type) ||
          (type === "" && investorTypes.includes("nan"));
        if (!typeMatch) match = false;
      }
      if (localForeign) {
        const rowLf = String(row.LOCAL_FOREIGN ?? "")
          .toUpperCase()
          .trim();
        const isLocal = rowLf === "L";
        const isForeign = rowLf === "F" || rowLf === "A";
        if (localForeign === "L" && !isLocal) match = false;
        else if (localForeign === "F" && !isForeign) match = false;
      }
      if (minPercentage > 0 && row.PERCENTAGE < minPercentage) match = false;
      if (
        searchInvestor &&
        row.INVESTOR_NAME != null &&
        !String(row.INVESTOR_NAME).toLowerCase().includes(searchInvestor)
      )
        match = false;

      return match;
    });

    // Handle sort based on sortBy and sortOrder parameters
    filteredData = filteredData.sort((a, b) => {
      let aVal: any = a[sortBy as keyof ShareDataRow];
      let bVal: any = b[sortBy as keyof ShareDataRow];

      // Handle numeric values
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Handle string values
      aVal = String(aVal || "").toLowerCase();
      bVal = String(bVal || "").toLowerCase();
      const comparison = aVal.localeCompare(bVal);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    // Apply pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

    // Calculate aggregates across all filtered data
    let local = 0;
    let foreign = 0;
    const investorMap = new Map<string, number>();

    filteredData.forEach((row) => {
      const shares = Number(row.TOTAL_HOLDING_SHARES) || 0;
      const lf = String(row.LOCAL_FOREIGN ?? "")
        .toUpperCase()
        .trim();
      if (lf === "L") local += shares;
      else if (lf === "F" || lf === "A") foreign += shares; // A = Asing (Foreign)

      const invName =
        row.INVESTOR_NAME != null ? String(row.INVESTOR_NAME) : "";
      if (invName) {
        investorMap.set(invName, (investorMap.get(invName) || 0) + shares);
      }
    });

    const totalOrigin = local + foreign;
    const originDistribution = [
      {
        name: "Local",
        value: local,
        percentage: totalOrigin > 0 ? (local / totalOrigin) * 100 : 0,
      },
      {
        name: "Foreign",
        value: foreign,
        percentage: totalOrigin > 0 ? (foreign / totalOrigin) * 100 : 0,
      },
    ];

    const topInvestors = Array.from(investorMap.entries())
      .map(([name, value]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const response: PaginatedResponse<ShareDataRow> = {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
      aggregates: {
        uniqueInvestors: investorMap.size,
        origin: originDistribution,
        topInvestors: topInvestors,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("Shares API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
