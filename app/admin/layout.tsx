import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/auth/server";
import { isAdminUserId } from "@/lib/auth/admin";

/**
 * Authoritative admin gate. Proxy optimistically blocks unauth'd users from
 * /admin; this server check is the real boundary. Non-admins get a 404 (we
 * don't reveal that /admin exists). CLAUDE.md §4.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/admin");
  }
  if (!isAdminUserId(user.id)) {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/95">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/admin" className="text-sm font-semibold tracking-tight">
            Admin
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Exit to member view
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}
