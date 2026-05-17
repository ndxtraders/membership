# Active Build Plan — Membership Site

**Last updated:** 2026-05-15
**Build mode:** Autonomous (see `CLAUDE.md` §7)

This is the single source of truth for what's in progress. Mark items as you complete them — don't batch.

---

## Phase 0 — Bootstrap (Day 1)

- [x] Install `gh` + `vercel` CLIs, authenticate both
- [x] Remove bogus `GITHUB_TOKEN` placeholder from `.zshrc`
- [x] Write `docs/DECISIONS-LOG-2026-05-15.md`
- [x] `create-next-app` — Next 16.2.6, TS strict, Tailwind v4, App Router, Turbopack
- [x] Set up folder structure: `app/(marketing|app|admin)`, `lib/{db,auth,entitlements,stripe,email}`, `components/{ui,lesson,layout}`, `emails`, `docs`, `tasks`, `_versions`
- [x] Copy PRD + handoff + decisions log + OS template into `docs/`
- [x] Write project `CLAUDE.md`
- [ ] Write `.env.example` + initial coming-soon page
- [ ] Init git, add `ndxtraders/membership` remote, push first commit
- [ ] `vercel link` to personal account, create Vercel project
- [ ] Provision Supabase via Vercel Marketplace, pull env vars locally
- [ ] Deploy coming-soon page to production

## Phase 1 — Auth + App Shell (Week 1, remainder) — ✅ COMPLETE 2026-05-16

- [x] Install `@supabase/ssr`, `@supabase/supabase-js` (done Phase 0)
- [x] Server-side Supabase client (`lib/auth/server.ts`)
- [x] Client-side Supabase client (`lib/auth/client.ts`)
- [x] **`proxy.ts`** (Next 16 renamed `middleware.ts` → `proxy.ts`): refresh session cookies, optimistic-gate `/dashboard`, `/account`, `/admin`
- [x] `app/(marketing)/sign-in/page.tsx` — magic link (Google deferred per decision)
- [x] `app/(marketing)/auth/callback/route.ts` — PKCE code exchange
- [x] `app/(marketing)/auth/auth-code-error/page.tsx` — expired-link fallback
- [x] `app/(app)/layout.tsx` — authoritative server auth gate + mobile shell
- [x] `app/(app)/dashboard/page.tsx` — empty-state dashboard
- [x] `app/(app)/account/page.tsx` + sign-out server action
- [x] `app/admin/layout.tsx` — admin gate via `ADMIN_USER_IDS` (literal `/admin`, not a route group — see lessons)
- [x] `components/layout/{mobile-nav,app-shell}.tsx` — bottom-tab nav, iOS safe-area aware
- [x] Build green + curl smoke test (all protected routes 307 → /sign-in)
- [ ] Playwright smoke test scaffold — deferred to Phase 6 QA per plan

### Phase 1 follow-ups (not blockers)
- [x] Capture Rev's Supabase user ID after his first sign-in → set `ADMIN_USER_IDS` (done 2026-05-17: `92f5a614-…c00c40` / raulvaughn@gmail.com; set in `.env.local` + Vercel prod & dev; redeployed). Magic-link flow verified end-to-end.
- [ ] Public `users` mirror table + first-login upsert → deferred to Phase 2 (needs Drizzle schema + RLS; avoided building throwaway schema now)
- [ ] Branded auth emails → Phase 5 (MailerLite). Until then Supabase default sender (low rate limit, fine for beta)
- [ ] **Vercel `preview` env vars not set** — `vercel env add … preview` via stdin fails; needs `--value … --yes --force`. Not needed until PR preview deploys are used. Wire before Phase 6 QA. Production + development are set.
- [ ] Supabase project migrated to Rev-owned org (ref `ntxbxeuqzlmxqdmberki`) — see DECISIONS-LOG amendment 2026-05-17. Verify Postgres pooler strings in `.env.local` before first Drizzle migration in Phase 2.

## Phase 2 — Content Schema + Admin v1 (Week 2)

- [ ] Install Drizzle + Drizzle Kit + postgres-js
- [ ] Schema: `users`, `programs`, `modules`, `lessons`, `products`, `entitlements`, `progress`, `purchases`
- [ ] RLS policies for member-owned tables (`auth.uid() = user_id`)
- [ ] Migrate to Supabase
- [ ] Admin Programs CRUD (list, create, edit, archive, duplicate)
- [ ] Admin Modules CRUD with mobile-friendly drag-reorder
- [ ] Admin Lessons quick-add (type picker → URL paste or upload → title → publish)
- [ ] Supabase Storage upload route for PDF + audio

## Phase 3 — Renderers + Access Gating (Week 3)

- [ ] `lib/entitlements/canAccessLesson.ts` — returns `{ ok, reason }`
- [ ] `/api/asset/[lessonId]` signed-URL gateway
- [ ] `VideoEmbed` component (sandboxed Vimeo/Loom iframe)
- [ ] `AudioPlayer` with Media Session API (lock-screen controls)
- [ ] `PdfViewer` (react-pdf) + per-request watermarking via pdf-lib
- [ ] `MarkdownLesson` (react-markdown + shiki)
- [ ] Progress tracking (`completed_at`, `last_position_seconds`)
- [ ] "Continue where you left off" pinned on dashboard

## Phase 4 — Stripe + Monetization (Week 4)

- [ ] Stripe products seeded via script
- [ ] Stripe Checkout launch endpoint
- [ ] `/api/webhooks/stripe` with sig verify + idempotency keys
- [ ] Webhook → entitlements writer
- [ ] Stripe Customer Portal link
- [ ] In-product upgrade CTAs on locked lessons
- [ ] Manual grant/revoke from admin

## Phase 5 — PWA + Polish + Email (Week 5)

- [ ] PWA manifest + service worker (no auth-token caching)
- [ ] Edge-to-edge video, native fullscreen
- [ ] Skeletons, error boundaries, empty states
- [ ] MailerLite transactional sends (welcome, purchase, access revoked)
- [ ] MailerLite Automations webhook firing on signup/purchase/cancel
- [ ] Start Here page per program
- [ ] Brand settings (logo, primary color, header photo, founder profile)
- [ ] Basic title search

## Phase 6 — QA + Soft Launch (Week 6)

- [ ] Playwright E2E green (sign up → buy → view lesson → mark complete → sign out)
- [ ] `tasks/pre-deploy.md` manual checklist
- [ ] Sentry wired
- [ ] Load 1–3 real programs (Rev does this)
- [ ] CSV import 5–10 beta members
- [ ] Custom domain wired (after brand decision)

## Ongoing

- [ ] Test on real iPhone every Friday
- [ ] Update `tasks/lessons.md` after any correction
- [ ] New feature requests after Week 2 → `docs/v1.1-backlog.md`

---

## Open Questions

_(None right now. Add here when blockers arise.)_

---

## Recently Completed

_See checked items above. When this section gets long, archive to `tasks/done.md`._
