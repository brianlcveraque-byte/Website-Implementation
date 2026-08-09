"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button, Card, ErrorBlock, Field, Input } from "@/components/ui/Primitives";

export default function LoginPage() {
  const { signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const err = await signInWithPassword(email, password);
        if (err) {
          setError(err);
        } else {
          router.push("/app/dashboard");
        }
      } else {
        const err = await signUpWithPassword(email, password, fullName);
        if (err) {
          setError(err);
        } else {
          setSignedUp(true);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <Link href="/" className="text-lg font-semibold">
          Strategnosis Growth and Delivery Hub
        </Link>
      </div>
      <Card className="w-full max-w-sm p-6">
        {signedUp ? (
          <div className="text-center text-sm text-slate-600 dark:text-slate-300">
            <p className="font-medium text-slate-900 dark:text-white">Account created.</p>
            <p className="mt-2">
              An owner needs to activate your account and assign a role before you can sign
              in. Ask the person who invited you to approve access.
            </p>
            <Button className="mt-4" variant="secondary" onClick={() => setMode("signin")}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="secondary"
              type="button"
              className="w-full"
              onClick={() => signInWithGoogle()}
            >
              Continue with Google
            </Button>
            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              or
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <Field label="Full name">
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Field>
              )}
              <Field label="Email">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {error && <ErrorBlock message={error} />}
              <Button type="submit" className="w-full" disabled={busy}>
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500">
              {mode === "signin" ? (
                <>
                  Need an account?{" "}
                  <button
                    className="font-medium underline"
                    onClick={() => setMode("signup")}
                    type="button"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <button
                    className="font-medium underline"
                    onClick={() => setMode("signin")}
                    type="button"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </Card>
    </main>
  );
}
