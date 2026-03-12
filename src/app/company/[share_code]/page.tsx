import { Metadata } from "next";
import { CompanyPageClient } from "./CompanyPageClient";

export async function generateMetadata({
  params,
}: {
  params: { share_code: string };
}): Promise<Metadata> {
  const shareCode = decodeURIComponent(params.share_code);
  return {
    title: `${shareCode} - Share Ownership & Investors | IDX Market Explorer`,
    description: `Explore ${shareCode} share ownership distribution, major shareholders, and investor information on Indonesia Stock Exchange.`,
    openGraph: {
      title: `${shareCode} - IDX Share Analysis`,
      description: `Detailed share ownership data and investor analysis for ${shareCode}`,
      type: "website",
    },
    alternates: {
      canonical: `https://idx.agusnarestha.dev/company/${shareCode}`,
    },
  };
}

export default function CompanyPage() {
  return <CompanyPageClient />;
}
