import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import "./globals.css";

const sans = Figtree({ subsets: ["latin"], variable: "--font-sans" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "LegalAid — courts, counsel, and the written law",
  description:
    "File disputes, consult lawyers, sit an AI hearing, and search constitutions, amendments, and statutes by country and language.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} antialiased gavel-grid`}>{children}</body>
    </html>
  );
}
