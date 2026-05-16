import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div
        className="flex flex-1 flex-col"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-8 pt-6">
          {children}
        </main>
      </div>
      <MobileNav isAdmin={isAdmin} />
    </div>
  );
}
