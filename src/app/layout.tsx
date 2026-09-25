import { Figtree, Fraunces } from "next/font/google";
import "./globals.css";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { SkipLink } from "@/ui/skip-link";

const sans = Figtree({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata = buildMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = organizationJsonLd();
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${sans.variable} ${display.variable} antialiased gavel-grid`}>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
