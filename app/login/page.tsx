import { isDemoMode } from "@/lib/env";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return <LoginForm showDemoAccounts={isDemoMode()} />;
}
