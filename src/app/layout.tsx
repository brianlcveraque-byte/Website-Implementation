import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Source_Serif_4 } from "next/font/google";
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

// Display face for the campaign funnels only.
//
// The serif above is the consultancy voice — quiet, editorial, borrowed from how
// the big firms typeset. That voice is wrong for an ad landing page, where the
// job is to stop a thumb, so the funnels get a geometric sans with real weight
// behind it. Kept to the funnels deliberately: if it spreads to the service
// pages the site stops looking like a consultancy and starts looking like a
// product launch.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  // Absolute base for Open Graph and canonical URLs. Without it, a link shared
  // to Facebook or LinkedIn resolves relative paths against nothing and the
  // preview breaks — which matters most on the pages meant to be shared.
  metadataBase: new URL("https://strategnosis.com"),
  title: "Strategnosis Growth and Delivery Hub",
  description: "Consultancy growth and project management for Strategnosis Solutions OPC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} ${outfit.variable} h-full antialiased`}
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
