@AGENTS.md

# Membership Site — Project Rules

This file is Claude Code's operating manual for this repo. Read top to bottom at session start.

## 1. What This Is

A mobile-first, founder-branded membership platform for **Rev Vaughn**. Used by Rev to deliver his own paid digital programs — **not** resold to clients. Comparable to Skool/Circle but lighter, with no community feed and no calendar. Under 100 members, 1–3 programs at launch.

## 2. Sources of Truth (Read These)

In priority order — when they conflict, the higher one wins:

1. **`docs/DECISIONS-LOG-2026-05-15.md`** — binding decisions made after the PRD. Stack swap, native path, accounts, autonomy mode.
2. **`docs/HANDOFF-to-claude-code-2026-05-15.md`** — quickstart, architecture non-negotiables, AI-risky zones.
3. **`docs/PRD-v1-2026-05-15.md`** — product spec, flows, scope, build plan.
4. **`docs/OS-claude-code.md`** — Rev's Claude Code operating system (planning, verification, autonomy modes, lessons loop).
5. **`AGENTS.md`** — Next.js 16 warning: don't trust training data, read `node_modules/next/dist/docs/` for breaking-change topics.

## 3. Stack (Locked)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, server components by default) |
| Language | TypeScript strict |
| Hosting | Vercel (personal account: `raulvaughn-9434`) |
| Auth | Supabase Auth (magic link + Google) |
| Database | Supabase Postgres + Drizzle ORM |
| Storage | Supabase Storage |
| Payments (web) | Stripe Checkout + Customer Portal |
| Payments (future native) | RevenueCat — not in v1 |
| Video | Vimeo / Loom embeds (sandboxed). Mux deferred. |
| Email (transactional + marketing) | MailerLite |
| UI | shadcn/ui + Tailwind v4 |
| PWA | Next.js manifest + service worker |
| Error tracking | Sentry free tier (Week 5) |

GitHub: `ndxtraders/membership`. Domain deferred until brand decision.

## 4. Non-Negotiables

1. **Mobile-first.** Every page designed at 390px width first. 70%+ of sessions will be on iPhone.
2. **Premium feel.** Zero "Powered by" branding anywhere members see.
3. **Founder-easy.** Admin must work from an iPhone with no tutorial. Publishing a lesson = 60 seconds, 4 clicks max.
4. **Server-side entitlement checks only.** Client UI gating is a hint, never security.
5. **Single source of truth for access:** `lib/entitlements/canAccessLesson(userId, lessonId)` is called from every protected route. Nothing else gates.
6. **Asset access through `/api/asset/[lessonId]`** which re-checks entitlement and mints signed Supabase Storage URLs.
7. **Stripe webhooks are the only automated writer of the `entitlements` table.** Manual admin grant is the only other write path.
8. **The deciding question for every judgment call:** *Does this make Rev's iPhone experience worse?* If yes, kill it.

## 5. AI-Risky Zones (Be Careful — Review Every Line)

Lean on Claude freely for UI, CRUD, schemas, renderers, emails, admin. **Slow down and verify manually on:**

- Supabase Auth flows (use `@supabase/ssr` primitives verbatim; don't paraphrase)
- Stripe webhook signature verification (copy from Stripe docs)
- `canAccessLesson` and all entitlement logic
- Database migrations against prod
- Service worker caching (do not cache auth tokens or signed URLs)
- Any code touching money (cents, currency codes, refunds)
- RLS policies (default-deny, then explicit allow per role)

## 6. Repository Layout

```
/app
  /(marketing)         ← public pages
  /(app)               ← authenticated member experience
    /dashboard
    /programs/[slug]
    /lessons/[id]
    /account
  /(admin)             ← founder-only
    /programs
    /members
    /settings
  /api
    /webhooks/stripe
    /asset/[lessonId]  ← signed-URL gateway
/components
  /ui                  ← shadcn primitives (do not modify these directly)
  /lesson              ← VideoPlayer, VideoEmbed, PdfViewer, AudioPlayer, MarkdownLesson
  /layout              ← MobileNav, AppShell
/lib
  /db                  ← Drizzle schema + Supabase client
  /auth                ← Supabase Auth helpers (@supabase/ssr)
  /entitlements        ← canAccessLesson (SINGLE source of truth)
  /stripe              ← Stripe client + webhook handlers
  /email               ← MailerLite client + React Email templates
/emails                ← React Email templates
/docs                  ← PRD, handoff, decisions, OS template
/tasks                 ← todo.md (active plan) + lessons.md (mistake log)
/_versions             ← versioned snapshots before doc edits
```

## 7. Operating Mode

**Autonomy: Autonomous.** Plan, execute, verify, report. Only stop for:
- External auth flows that need a browser (CLI logins, account creation)
- Architecture or scope changes
- Anything irreversible: prod migrations, force pushes, payments, data deletes, domain changes

Use `tasks/todo.md` as the active build plan. Update it as work progresses.

After any user correction or course change, append to `tasks/lessons.md` with date, what happened, root cause, and the rule going forward.

## 8. Verification Gates

Before marking any task complete:
- [ ] Code runs without errors
- [ ] The specific behavior was tested (not just adjacent behavior)
- [ ] No console errors or warnings introduced
- [ ] Existing functionality still works (no regressions)
- [ ] For UI changes: screenshot or describe the visual result

Never write "this should work." Run it.

## 9. Git Discipline

- Small, focused commits. Format: `[type]: [what changed]` (e.g., `feat: coming-soon page`)
- Commit message footer: `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`
- Never `--force` push to `main` without explicit approval
- Before editing any doc in `docs/` or `CLAUDE.md`, copy current version to `_versions/` with date stamp

## 10. Out of Scope for v1

If anyone proposes these, log them in `docs/v1.1-backlog.md` and move on:
- Community / comments / threaded Q&A
- Calendar, event booking, live sessions
- Certificates of completion
- Affiliate / referral
- Custom email automation builder (we only fire webhooks to MailerLite)
- Cohort drip schedules
- Native iOS/Android app (PWA-first; native is v1.5+ decision)
- Member directory / member-to-member features
- Custom landing page builder
- Multi-tenant white-label
- Gamification
- Full-text search (basic title search only in v1)
