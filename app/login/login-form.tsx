"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_ACCOUNTS } from "@/lib/mock-data";
import { authClient } from "@/lib/auth-client";

type LoginFormProps = {
  showDemoAccounts: boolean;
};

function MicrosoftIcon() {
  return (
    <img
      src="/logos/microsoft.png"
      alt=""
      aria-hidden
      className="h-4 w-4"
    />
  );
}

export function LoginForm({ showDemoAccounts }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(showDemoAccounts ? "demo123" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authClient.getSession().then(async ({ data }) => {
      if (!data?.user) return;

      if (data.user.accountType === "STAFF") {
        router.replace("/dashboard");
        return;
      }

      if (data.user.accountType === "CLIENT") {
        await authClient.signOut();
        setError("Please use the client portal to sign in.");
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
    if (session?.user?.accountType === "CLIENT") {
      await authClient.signOut();
      setError("Please use the client portal to sign in.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const handleMicrosoftSignIn = async () => {
    setLoading(true);
    setError("");

    const result = await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: "/login",
    });

    if (result.error) {
      setError(result.error.message ?? "Microsoft sign in failed");
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const signInEmail =
      email || (showDemoAccounts ? DEMO_ACCOUNTS[0].email : "");
    if (!signInEmail) {
      setError("Email is required");
      return;
    }
    signIn(signInEmail, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-brand-border bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,.08),0_4px_16px_rgba(0,0,0,.06)]">
        <Logo className="mb-6" />
        <h1 className="text-xl font-extrabold tracking-tight">Staff sign in</h1>
        <p className="mb-5 text-[13px] text-brand-text-2">
          Administration platform — authorised staff only
        </p>

        <Button
          variant="outline"
          className="mb-4 w-full justify-center gap-2"
          disabled={loading}
          onClick={handleMicrosoftSignIn}
        >
          <MicrosoftIcon />
          {loading ? "Redirecting…" : "Sign in with Microsoft"}
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wide">
            <span className="bg-white px-2 text-brand-text-3">or</span>
          </div>
        </div>

        {showDemoAccounts && (
          <div className="mb-4 rounded-brand-sm bg-brand-surface p-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand-text-3">
              Demo accounts
            </div>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                disabled={loading}
                onClick={() => signIn(acc.email, "demo123")}
                className="mb-1.5 flex w-full cursor-pointer items-center justify-between rounded-md border border-brand-border bg-white px-2.5 py-2 text-left transition-colors hover:border-brand-orange-border disabled:opacity-50"
              >
                <div>
                  <div className="text-[13px] font-semibold">{acc.name}</div>
                  <div className="text-[11px] text-brand-text-3">{acc.role}</div>
                </div>
                <span className="text-[11px] text-brand-text-3">→</span>
              </button>
            ))}
          </div>
        )}

        <div className="mb-3">
          <label className="mb-1 block text-xs font-semibold">Email</label>
          <Input
            placeholder="your@aap.com.au"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
