export const INVESTOR_TYPE_MAP: Record<string, string> = {
  CP: "Corporate",
  ID: "Individual",
  IB: "Bank",
  IS: "Insurance",
  SC: "Securities Company",
  PF: "Pension Fund",
  MF: "Mutual Fund",
  FD: "Foundation",
  OT: "Others",
  nan: "Unknown",
};

export function getInvestorTypeName(code: string): string {
  // Handle empty or actual "nan" strings, or undefined
  if (!code || code === "nan" || code === "NaN") return INVESTOR_TYPE_MAP["nan"];
  return INVESTOR_TYPE_MAP[code] || "Unknown";
}
