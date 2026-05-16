import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign-in link expired",
};

export default function AuthCodeErrorPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-5">
        <h1 className="text-2xl font-semibold tracking-tight">
          That link didn&apos;t work
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Sign-in links expire after a short time and can only be used once.
          Request a fresh one to continue.
        </p>
        <Button
          render={<Link href="/sign-in" />}
          className="h-12 text-base"
        >
          Get a new link
        </Button>
      </div>
    </main>
  );
}
