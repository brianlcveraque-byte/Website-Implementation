import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-16">
      <Link href="/" className="text-sm text-slate-500 underline">
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Privacy Notice</h1>
      <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p>
          When you submit an inquiry through this site, Strategnosis Solutions OPC collects
          your name, organization, email, phone number, and message so we can respond to your
          request. This information is used only to evaluate and follow up on your inquiry and
          is not sold or shared with third parties.
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
  );
}
