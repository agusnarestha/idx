import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "IDX Share Ownership Dashboard",
  description: "Dashboard for viewing IDX share ownership",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-blue/20 text-foreground bg-page">
        <Providers>
          <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md">
            <div className="container mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue flex items-center justify-center">
                  <span className="text-white font-bold text-sm tracking-wider">IX</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Market Explorer
                </h1>
              </div>
              <nav>
                <a href="/" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                  Dashboard
                </a>
              </nav>
            </div>
          </header>

          <main className="flex-grow container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
            {children}
          </main>

          <footer className="mt-auto border-t border-border bg-card/80 py-6">
            <div className="container mx-auto px-4 text-center text-sm text-muted">
              © {new Date().getFullYear()} IDX Data Explorer.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
