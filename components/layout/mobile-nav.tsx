"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  match: (path: string) => boolean;
};

const baseItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Home,
    match: (p) => p === "/dashboard" || p.startsWith("/programs") || p.startsWith("/lessons"),
  },
  {
    href: "/account",
    label: "Account",
    icon: User,
    match: (p) => p.startsWith("/account"),
  },
];

export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const items: NavItem[] = isAdmin
    ? [
        ...baseItems,
        {
          href: "/admin",
          label: "Admin",
          icon: Shield,
          match: (p) => p.startsWith("/admin"),
        },
      ]
    : baseItems;

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/95"
    >
      <ul
        className="mx-auto flex max-w-2xl items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.4 : 1.8}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
