import { redirect } from "next/navigation";
import { createClient } from "@/lib/auth/server";
import { isAdminUserId } from "@/lib/auth/admin";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Authoritative auth gate for the member area. Proxy is optimistic only;
 * this server check is the real boundary (CLAUDE.md §4).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <AppShell isAdmin={isAdminUserId(user.id)}>{children}</AppShell>;
}
