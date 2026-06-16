"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const DEMO_CLIENT_EMAIL = "john@smithfamily.com.au";
const DEMO_CLIENT_PASSWORD = "demo123";

type PortalLoginFormProps = {
  showDemoAccounts: boolean;
};

export function PortalLoginForm({ showDemoAccounts }: PortalLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(showDemoAccounts ? DEMO_CLIENT_EMAIL : "");
  const [password, setPassword] = useState(
    showDemoAccounts ? DEMO_CLIENT_PASSWORD : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user?.accountType === "CLIENT") {
        router.replace("/portal");
      }
    });
  }, [router]);

  const signIn = async (signInEmail: string, signInPassword: string) => {
    setLoading(true);
    setError("");
    const result = await authClient.signIn.email({
      email: signInEmail,
      password: signInPassword,
    });

    if (result.error) {
      setError(result.error.message ?? "Sign in failed");
      setLoading(false);
      return;
    }

    const { data: session } = await authClient.getSession();
    if (session?.user?.accountType === "STAFF") {
      await authClient.signOut();
      setError("Please use the staff login page.");
      setLoading(false);
      return;
    }

    router.push("/portal");
  };

  const handleSubmit = () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    signIn(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-brand-border bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,.08),0_4px_16px_rgba(0,0,0,.06)]">
        <Logo className="mb-6" />
        <h1 className="text-xl font-extrabold tracking-tight">Client portal</h1>
        <p className="mb-5 text-[13px] text-brand-text-2">
          Sign in to view your SMSF matter
        </p>

        {showDemoAccounts && (
          <div className="mb-4 rounded-brand-sm bg-brand-surface p-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand-text-3">
              Demo account
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => signIn(DEMO_CLIENT_EMAIL, DEMO_CLIENT_PASSWORD)}
              className="flex w-full cursor-pointer items-center justify-between rounded-md border border-brand-border bg-white px-2.5 py-2 text-left transition-colors hover:border-brand-orange-border disabled:opacity-50"
            >
              <div>
                <div className="text-[13px] font-semibold">John Smith</div>
                <div className="text-[11px] text-brand-text-3">Smith Family SMSF</div>
              </div>
              <span className="text-[11px] text-brand-text-3">→</span>
            </button>
          </div>
        )}

        <div className="mb-3">
          <label className="mb-1 block text-xs font-semibold">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="mb-3 text-xs text-brand-red">{error}</p>
        )}
        <Button
          className="w-full justify-center"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Signing in…" : "Sign in →"}
        </Button>
      </div>
    </div>
  );
}
