import { useQuery } from "@tanstack/react-query";
import { FilterParams, PaginatedResponse, ShareDataRow } from "@/types";

interface UseSharesProps extends FilterParams {
  page?: number;
  limit?: number;
}

const fetchShares = async (params: UseSharesProps): Promise<PaginatedResponse<ShareDataRow>> => {
  const query = new URLSearchParams();
  
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.date) query.append("date", params.date);
  if (params.shareCode) query.append("shareCode", params.shareCode);
  if (params.investorTypes && params.investorTypes.length > 0) {
    query.append("investorTypes", params.investorTypes.join(","));
  }
  if (params.localForeign) query.append("localForeign", params.localForeign);
  if (params.minPercentage) query.append("minPercentage", params.minPercentage.toString());
  if (params.searchInvestor) query.append("searchInvestor", params.searchInvestor);

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/api/shares?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    let errMsg = "Failed to fetch shares data";
    try {
      const json = JSON.parse(body);
      if (json?.error) errMsg = json.error;
    } catch {
      if (body) errMsg = body.slice(0, 200);
    }
    throw new Error(errMsg);
  }
  return res.json();
};

export const useShares = (params: UseSharesProps) => {
  return useQuery({
    queryKey: ["shares", params],
    queryFn: () => fetchShares(params),
    placeholderData: (previousData) => previousData, // keepPreviousData for smooth pagination
  });
};
