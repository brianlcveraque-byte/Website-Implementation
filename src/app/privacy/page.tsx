import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl flex-1 bg-white px-4 py-16 text-slate-900">
        <h1 className="text-2xl font-semibold">Privacy Notice</h1>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <p>
            When you submit an inquiry through this site, Strategnosis Solutions OPC collects
            your name, organization, email, phone number, and message so we can respond to your
            request. This information is used only to evaluate and follow up on your inquiry and
            is not sold or shared with third parties.
          </p>
          <p>
            If you subscribe to occasional email updates, we store your email address (and name,
            if given) for that purpose only. You can ask to be removed at any time.
          </p>
          <p>
            We do not publish client names, project details, or confidential information without
            explicit client approval. Information you submit is stored securely and access is
            restricted to authorized Strategnosis personnel.
          </p>
          <p>
            To request that we delete information you&apos;ve submitted, contact us using the
            details provided in our proposals or correspondence.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
