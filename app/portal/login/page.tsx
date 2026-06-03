import { isDemoMode } from "@/lib/env";
import { PortalLoginForm } from "./login-form";

export default function PortalLoginPage() {
  return <PortalLoginForm showDemoAccounts={isDemoMode()} />;
}
