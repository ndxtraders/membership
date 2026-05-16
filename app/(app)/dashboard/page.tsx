import type { Metadata } from "next";
import { createClient } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Home",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Members
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {firstName ? `Welcome, ${firstName}` : "Welcome"}
        </h1>
      </header>

      <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center dark:border-zinc-800">
        <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6 text-zinc-400"
            aria-hidden="true"
          >
            <path d="M12 7v14" />
            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold">No programs yet</h2>
        <p className="max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
          Your programs will appear here as soon as they&apos;re published.
          Hang tight — good things are coming.
        </p>
      </div>
    </div>
  );
}
