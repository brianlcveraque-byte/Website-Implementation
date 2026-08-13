import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial serif for headlines on the public site — the light-weight-serif
// treatment is a deliberate nod to how established consulting firms
// (McKinsey, BCG) typeset headlines, distinct from the bold-sans-everything
// look of SaaS/tech marketing sites.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "Strategnosis Growth and Delivery Hub",
  description: "Consultancy growth and project management for Strategnosis Solutions OPC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
      {/* Cloudflare Web Analytics — privacy-first, no cookies, so no consent
          banner is required. The beacon token is public by design; it ships in
          the page HTML on every request. */}
      <Script
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "885658c230e245a288ac89f68dc4bcf0"}'
        strategy="afterInteractive"
      />
    </html>
  );
}
