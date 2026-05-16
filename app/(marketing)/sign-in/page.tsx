import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Members
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to continue
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter your email and we&apos;ll send you a secure sign-in link.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-40 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
