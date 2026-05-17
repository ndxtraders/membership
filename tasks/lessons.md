# Lessons Log — Membership Site

Read at session start. Append after every correction.

Format:
```
### YYYY-MM-DD — Short description
- **What happened:** ...
- **Root cause:** ...
- **Rule going forward:** ...
```

---

### 2026-05-15 — Bogus `GITHUB_TOKEN` placeholder broke `gh` auth
- **What happened:** `gh auth status` failed with "token is invalid" despite no `gh` login attempt because `GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx` was exported from `~/.zshrc`. The literal string `ghp_xxx...` was a copy-paste placeholder, not a real token, but it overrode keyring auth.
- **Root cause:** Some prior tutorial or session wrote a placeholder env var to `.zshrc`.
- **Rule going forward:** Before debugging `gh` or any CLI auth issue, grep shell init files (`~/.zshrc`, `~/.zprofile`, `~/.bash_profile`) for the relevant `*_TOKEN` env var. Placeholders override real keyring auth silently.

### 2026-05-15 — Stack swapped from PRD baseline before any code shipped
- **What happened:** The PRD locked Clerk/Neon/Mux/Resend/Vercel Blob. After confirming the user's existing accounts (Supabase, MailerLite, Stripe), we swapped to Supabase Auth/DB/Storage + MailerLite + deferred Mux.
- **Root cause:** PRD was written before the cowork session that surfaced the user's actual tool stack.
- **Rule going forward:** At session start, ask what accounts the user already has before treating PRD stack choices as locked. Most "needs you to create" blockers evaporate when you check existing tools first.

### 2026-05-16 — Next.js 16 renamed `middleware.ts` → `proxy.ts`
- **What happened:** Almost wrote `middleware.ts` from training data. AGENTS.md said read `node_modules/next/dist/docs/` first; doing so revealed Next 16 deprecated `middleware` and renamed the file convention to `proxy.ts` (function `proxy`, same `config.matcher`).
- **Root cause:** Training data predates Next 16's rename.
- **Rule going forward:** For any Next.js file-convention or API in this repo, check `node_modules/next/dist/docs/` before writing. Codemod exists: `npx @next/codemod@canary middleware-to-proxy .`

### 2026-05-16 — shadcn `base-nova` preset is Base UI, not Radix (`render` not `asChild`)
- **What happened:** `<Button asChild>` failed type check. The `base-nova` shadcn preset builds on `@base-ui/react`, whose composition prop is `render={<Link/>}`, not Radix's `asChild`.
- **Root cause:** Assumed shadcn = Radix from training data; this project's preset uses Base UI.
- **Rule going forward:** For polymorphic shadcn components in this repo use `render={<El/>}`. Read `components/ui/<name>.tsx` to confirm the underlying primitive before using composition props.

### 2026-05-17 — Vercel Marketplace Supabase lives in a Vercel-managed org
- **What happened:** Phase 0 provisioned Supabase via Vercel Marketplace. The project landed in a Vercel-managed Supabase org — Rev couldn't see it when logging into Supabase directly (only his own "awakened-mind" project showed). Reachable only via Vercel SSO; billing + data entangled with Vercel.
- **Root cause:** Vercel Marketplace integrations create resources under Vercel's managed org, not the user's own provider account.
- **Rule going forward:** For services the user will own long-term with customer data (DB, auth), prefer provisioning in the user's own provider account from the start. If a Marketplace integration was used, surface the ownership/access tradeoff early. Migrating is cheap pre-launch (zero data), expensive later. The authenticated `supabase` CLI + keychain mgmt token (`security find-generic-password -s "Supabase CLI" -w` → strip `go-keyring-base64:` → base64 -d) lets Claude create projects and set auth config autonomously.

### 2026-05-16 — Admin lives at literal `/admin`, not an `(admin)` route group
- **What happened:** PRD/CLAUDE.md sketch showed `app/(admin)/`. Route groups are URL-transparent, so `(admin)/programs` would collide with member `(app)/programs/[slug]` at `/programs`.
- **Root cause:** Conceptual grouping in docs read as literal routing.
- **Rule going forward:** Founder area is `app/admin/*` (real `/admin` prefix) with its own gating layout. Member area uses the `(app)` group (no path segment). Keep them on separate path namespaces.
