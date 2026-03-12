"use client";

interface StructuredDataProps {
  type: "Company" | "Investor" | "Organization";
  name: string;
  description?: string;
}

export function StructuredData({
  type,
  name,
  description,
}: StructuredDataProps) {
  const baseUrl = "https://idx.agusnarestha.dev/";

  const getSchema = () => {
    switch (type) {
      case "Company":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name,
          url: `${baseUrl}/company/${encodeURIComponent(name)}`,
          description:
            description || `Share ownership and investor data for ${name}`,
          image: `${baseUrl}/og-image.png`,
        };
      case "Investor":
        return {
          "@context": "https://schema.org",
          "@type": "Person",
          name,
          url: `${baseUrl}/investor/${encodeURIComponent(name)}`,
          description:
            description || `Investor profile and portfolio data for ${name}`,
        };
      case "Organization":
      default:
        return {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "IDX Market Explorer",
          description:
            "Comprehensive dashboard for Indonesia Stock Exchange share ownership analysis",
          url: baseUrl,
          applicationCategory: "FinanceApplication",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        };
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchema()) }}
    />
  );
}
