# Decisions Log — Membership Site Build
**Date:** 2026-05-15
**Owner:** Rev Vaughn
**Supersedes:** Stack choices in `PRD-v1-2026-05-15.md` section 7.1 and `HANDOFF-to-claude-code-2026-05-15.md` section 2.

This doc captures every binding decision made after the PRD was approved. When the PRD or handoff conflicts with this file, **this file wins**. The PRD and handoff are preserved as-is for context; do not edit them.

---

## 1. Final Stack (Locked)

| Layer | Choice | Replaces | Why |
|---|---|---|---|
| Framework | Next.js 16 (App Router) | — | unchanged |
| Language | TypeScript strict | — | unchanged |
| Hosting | Vercel (personal account) | — | unchanged |
| Auth | **Supabase Auth** | Clerk | Already owned. Magic link + Google. RLS gives second defense layer behind `canAccessLesson`. |
| Database | **Supabase Postgres** | Neon | Already owned. Same engine, same Drizzle usage. |
| ORM | Drizzle | — | unchanged |
| Asset storage | **Supabase Storage** | Vercel Blob | Already owned. Signed URLs supported. |
| Payments (web) | Stripe Checkout + Customer Portal | — | unchanged |
| Payments (native, future) | RevenueCat | — | Only if/when we ship a native wrapper. Not used in v1 PWA. |
| Video — embeds | Vimeo / Loom iframe (sandboxed) | — | Default lesson type for v1 |
| Video — owned | **Deferred. Add Mux later if needed.** | Mux v1 | No Mux account in v1. If we ever upload owned video that needs signed playback + adaptive bitrate, we add Mux then. |
| Email — transactional | **MailerLite API** | Resend | Already owned. Unifies transactional + marketing in one vendor. |
| Email — marketing/nurture | MailerLite | — | unchanged |
| UI | shadcn/ui + Tailwind v4 | — | unchanged |
| PWA | Next.js manifest + service worker | — | unchanged |
| Error tracking | Sentry free tier | — | Add Week 5 |

**Accounts the user has and we're using:** Vercel, GitHub (`ndxtraders/membership`), Supabase, Stripe, MailerLite, RevenueCat (future), Expo.dev (future), Xcode (future).

**Accounts we are NOT creating in v1:** Clerk, Neon, Mux, Resend, Vercel Blob (zero-cost not to provision; replaced by Supabase).

---

## 2. Native App Path — **B (PWA-first, native-ready)**

- v1 ships as a PWA only.
- Code is architected so a future Expo or Capacitor wrapper can hit the same Supabase backend without rewriting auth, data, or entitlement logic.
- Concrete implications during the build:
  - Use Supabase Auth in a way that works in mobile WebView (token in localStorage + refresh handling) so an Expo wrapper can reuse it.
  - Prefer cross-platform web APIs over web-only ones where alternatives are equivalent.
  - Keep RevenueCat as the planned IAP layer when we ship native (App Store rules require IAP, not Stripe, for digital goods in apps).
- v1.5+ decision (ship Expo wrapper or not) is deferred. Not in v1 scope.

---

## 3. Deployment

- **Vercel team:** personal account (`ndxtraders`).
- **Domain:** deferred. Use the Vercel-assigned preview/production URL during the build. Custom domain wired after the brand decision lands (candidates noted: `members.revvaughn.com`, `consultingaccelerator.com`, `leadsandclients.com`).
- **GitHub repo:** `git@github.com:ndxtraders/membership.git` (currently empty).

---

## 4. Operating Mode

- **Autonomy:** Autonomous. Claude executes phases end-to-end. Only stops for:
  - External account auth that requires a browser flow (e.g., `gh auth login`, `vercel login`, Supabase project creation if Marketplace can't auto-provision).
  - Decisions that change architecture or scope.
  - Anything irreversible: production migrations, force pushes, payments, data deletes, domain changes.
- **Senior dev on-call budget** mentioned in PRD section 11: **disregarded.** Not a real plan.

---

## 5. Architecture Adjustments Driven by the Stack Swap

These changes flow from picking Supabase over Clerk/Neon/Blob. They are binding for the build:

1. **Auth helpers** live in `/lib/auth/` and wrap `@supabase/ssr` (Server Component–friendly cookie auth). Not Clerk middleware.
2. **DB client** in `/lib/db/` connects to Supabase Postgres via Drizzle using the `postgres-js` driver and Supabase's pooled connection string.
3. **RLS:** Every table that holds user-scoped data has Row Level Security enabled in Supabase. Policies are written to allow only `auth.uid() = user_id` reads/writes for member-owned rows. Admin uses service role (server-only, never shipped to client).
4. **`canAccessLesson(userId, lessonId)`** remains the single source of truth in `/lib/entitlements/`. RLS is a defense in depth; the function is the authoritative gate.
5. **Asset access:** `/api/asset/[lessonId]` re-checks entitlement, then mints a Supabase Storage signed URL (short expiry, e.g., 1 hour) or returns the external embed URL.
6. **Email:** `/lib/email/` wraps MailerLite's transactional API. React Email templates render to HTML and are sent as raw HTML payloads to MailerLite. Welcome / purchase / access-revoked are transactional sends; signup / purchase / cancel events also fire to MailerLite Automations as triggers.
7. **No Mux client code in v1.** The `lessons.type` field still includes `video_mux` for forward compatibility, but no lesson can be created with that type until Mux is added.

---

## 6. What Changed vs. PRD (Quick Diff)

| PRD said | Now says |
|---|---|
| Clerk | Supabase Auth |
| Neon | Supabase Postgres |
| Vercel Blob | Supabase Storage |
| Mux at launch | Mux deferred; embeds only at launch |
| Resend | MailerLite (transactional + marketing) |
| Custom domain Week 1 | Domain deferred until brand name lands |
| Senior dev on-call insurance | Disregarded |

Everything else in the PRD stands.

---

**End of decisions log.**
