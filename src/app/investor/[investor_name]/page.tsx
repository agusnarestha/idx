import { Metadata } from "next";
import { InvestorPageClient } from "./InvestorPageClient";

export async function generateMetadata({
  params,
}: {
  params: { investor_name: string };
}): Promise<Metadata> {
  const investorName = decodeURIComponent(params.investor_name);
  return {
    title: `${investorName} - Investor Portfolio | IDX Market Explorer`,
    description: `View ${investorName}'s shareholdings and portfolio across Indonesian Stock Exchange (IDX) companies.`,
    openGraph: {
      title: `${investorName} - IDX Investor Profile`,
      description: `Investor portfolio and shareholding analysis for ${investorName}`,
      type: "website",
    },
    alternates: {
      canonical: `https://idx.agusnarestha.dev/investor/${encodeURIComponent(investorName)}`,
    },
  };
}

export default function InvestorPage() {
  return <InvestorPageClient />;
}
