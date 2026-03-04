export interface ShareDataRow {
  DATE: string;
  SHARE_CODE: string;
  ISSUER_NAME: string;
  INVESTOR_NAME: string;
  INVESTOR_TYPE: string;
  LOCAL_FOREIGN: string;
  NATIONALITY: string;
  DOMICILE: string;
  HOLDINGS_SCRIPLESS: number;
  HOLDINGS_SCRIP: number;
  TOTAL_HOLDING_SHARES: number;
  PERCENTAGE: number;
}

export interface FilterParams {
  date?: string;
  shareCode?: string;
  investorTypes?: string[];
  localForeign?: string;
  minPercentage?: number;
  searchInvestor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  aggregates?: {
    uniqueInvestors?: number;
    origin: { name: string; value: number; percentage: number }[];
    topInvestors: { name: string; value: number }[];
  };
}
