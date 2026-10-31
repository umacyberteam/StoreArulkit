import type { Metadata } from "next";
import "./globals.css";
import IntroLoader from "@/components/intro-loader";

export const metadata: Metadata = {
  title: "ArulKit Store — Digital Products",
  description: "Source code, website templates, bot projects, and scraper script.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://store.arulkit.my.id")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <IntroLoader />
        {children}
      </body>
    </html>
  );
}
