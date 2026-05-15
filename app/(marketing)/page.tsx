export default function ComingSoonPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Members
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Something new is coming.
        </h1>
        <p className="text-pretty text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          A new home for the programs, built for the way you actually
          use them — on your phone, in your pocket, in three taps.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Launching soon
        </div>
      </div>
    </main>
  );
}
