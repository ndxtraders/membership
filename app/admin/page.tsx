import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Founder
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin console
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Manage programs, modules, lessons, and members. Tools land here in
          Phase 2.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { title: "Programs", desc: "Create and organize programs" },
          { title: "Lessons", desc: "Add videos, PDFs, audio, and notes" },
          { title: "Members", desc: "View access and grant entitlements" },
          { title: "Settings", desc: "Brand, profile, and access rules" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-dashed border-zinc-200 px-4 py-5 dark:border-zinc-800"
          >
            <h2 className="text-sm font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Coming in Phase 2
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
