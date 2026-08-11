import type { Metadata } from "next";
import { PillarDetail } from "@/components/public/PillarDetail";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { PILLARS } from "@/lib/pillars";

const pillar = PILLARS.find((p) => p.slug === "strategy-leadership")!;

export const metadata: Metadata = {
  title: `${pillar.tag} — Strategnosis Growth and Delivery Hub`,
  description: pillar.summary,
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <PillarDetail pillar={pillar} />
      <SiteFooter />
    </>
  );
}
