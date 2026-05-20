"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function SigninForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Default landing is /dashboard for staff. For client portal users the
  // /dashboard layout redirects to /portal on first paint.
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setSubmitting(false);
    if (!res || res.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(res.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@aap.com.au"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
          <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium">Demo accounts (password <code>demo123</code>)</p>
            <ul className="space-y-0.5">
              <li>sarah@aap.com.au — Master Owner</li>
              <li>emma@aap.com.au — Bookkeeper</li>
              <li>michael@aap.com.au — Compliance Officer</li>
              <li>rachel@aap.com.au — Tax Agent</li>
              <li>john.smith@example.com — Client</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
