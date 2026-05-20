import { Suspense } from "react";
import { SigninForm } from "./signin-form";

export default function SigninPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-3xl">SMSF Echo</h1>
          <p className="text-sm text-muted-foreground">Admin Autopilot — Sign in to continue</p>
        </div>
        <Suspense fallback={null}>
          <SigninForm />
        </Suspense>
      </div>
    </div>
  );
}
