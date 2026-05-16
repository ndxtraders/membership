import type { Metadata } from "next";
import { createClient } from "@/lib/auth/server";
import { isAdminUserId } from "@/lib/auth/admin";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "—";
  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ?? null;
  const admin = isAdminUserId(user?.id);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Account
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {fullName ?? "Your account"}
        </h1>
      </header>

      <dl className="mt-8 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <dt className="text-sm text-zinc-500">Email</dt>
          <dd className="truncate text-sm font-medium">{email}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <dt className="text-sm text-zinc-500">Role</dt>
          <dd className="text-sm font-medium">
            {admin ? "Admin" : "Member"}
          </dd>
        </div>
      </dl>

      <form action={signOut} className="mt-8">
        <Button
          type="submit"
          variant="outline"
          className="h-12 w-full text-base"
        >
          Sign out
        </Button>
      </form>
    </div>
  );
}
