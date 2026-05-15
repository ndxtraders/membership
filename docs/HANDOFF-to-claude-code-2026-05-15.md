# Handoff Doc — Membership Site Build
**From:** Strategy session in Claude (cowork workspace)
**To:** Claude Code (build session)
**Date:** 2026-05-15
**Owner:** Rev Vaughn

---

## Purpose of This Doc
This handoff hands off PRD-approved context to a fresh Claude Code session so it can start building the membership site without re-deriving decisions. Read this top-to-bottom before writing any code.

## Where to Find the Source of Truth
- **PRD:** `/Users/raulvaughn/Desktop/claude-cowork/membership-site/outputs/PRD-v1-2026-05-15.md`
- **This handoff:** `/Users/raulvaughn/Desktop/claude-cowork/membership-site/outputs/HANDOFF-to-claude-code-2026-05-15.md`
- **Brand context:** `/Users/raulvaughn/Desktop/claude-cowork/_os/context/` (do not modify)
- **Workspace rules:** `/Users/raulvaughn/Desktop/claude-cowork/CLAUDE.md`

Read the PRD first. This handoff is a quickstart, not a replacement.

---

## 1. What We're Building (One Paragraph)
A mobile-first membership platform for Rev Vaughn (GTM strategist, fractional CMO) to sell digital programs (video, audio, PDF, Q&A recordings, markdown guides) to his clients. Under 100 members, 1–3 programs at launch. Premium feel, founder-branded, zero "Powered by" SaaS branding. Founder must be able to publish a new lesson from a phone in under 60 seconds. Comparable to Skool/Circle but lighter and easier.

---

## 2. Locked Decisions (Do Not Re-Litigate)

### Stack
- **Framework:** Next.js 16 (App Router, server components by default)
- **Language:** TypeScript strict mode
- **Hosting:** Vercel
- **Auth:** Clerk (magic link primary, Google secondary)
- **Database:** Neon Postgres (via Vercel Marketplace)
- **ORM:** Drizzle
- **Payments:** Stripe (Checkout + Customer Portal + Billing)
- **Video:** Mux (owned video) + iframe embeds (Vimeo/Loom external)
- **Asset storage:** Vercel Blob (PDFs, audio)
- **Email:** Resend with React Email
- **UI:** shadcn/ui + Tailwind v4
- **PWA:** Next.js manifest + service worker

### Architecture Non-Negotiables
1. Server-side entitlement checks ONLY. Client-side gating is a UX hint, never security.
2. Single function `canAccessLesson(userId, lessonId)` in `/lib/entitlements/` — called from every protected route.
3. Asset access goes through `/api/asset/[lessonId]` which re-checks entitlement and issues signed URLs.
4. Stripe webhooks are the only automated writer of the `entitlements` table.
5. Mux signed playback IDs with short expiry (1 hour).
6. PDFs watermarked at request time with buyer email (pdf-lib) for paid programs.

### Scope
- **Yes in v1:** auth, content delivery (video/audio/PDF/markdown), entitlements, Stripe (one-time + sub + tiered + free), in-product upgrade CTAs, progress tracking, resume playback, Start Here page per program, full admin (mobile-responsive), brand tokens, custom domain, PWA, transactional email, webhook to external email tool, basic title search.
- **No in v1:** community/comments, calendar, certificates, affiliate, custom email automation, cohort drips, native apps, white-label multi-tenant, custom landing page builder, gamification.

### Build Order (6-week target)
1. Week 1: Foundation, auth, dashboard shell
2. Week 2: Content schema + admin CRUD
3. Week 3: All content type renderers + access gating
4. Week 4: Stripe integration + entitlements
5. Week 5: PWA + mobile polish + emails
6. Week 6: Content load + beta launch
7. Weeks 7–8: Buffer (do not commit away)

---

## 3. Critical Constraints

### Founder is Non-Technical
- Rev does NOT read code. He cannot debug stack traces.
- The admin must work for a non-developer publishing from an iPhone in a coffee shop with no tutorial.
- If publishing a new lesson takes more than 60 seconds and 4 clicks, the admin UX has failed.

### Mobile is the Product
- Design every page at 390px width FIRST, scale up to desktop second.
- 70%+ of member sessions will be on phone.
- Lock-screen audio playback (Media Session API) is required.
- Video must play edge-to-edge on phone with native fullscreen.

### Premium Feel
- This reflects a personal brand selling $500–$15K programs.
- Zero "Powered by [vendor]" branding anywhere members see.
- Custom logo, primary color, header photo, custom domain.
- Black/white minimal default; brand accents sparingly.

### AI-Risky Zones (Be Careful)
Lean on Claude Code freely for UI, CRUD, schemas, renderers, emails, admin tooling.
Be cautious — review every line, test manually — on:
- Auth flows (use Clerk primitives verbatim; do not paraphrase)
- Stripe webhook signature verification (copy from Stripe docs)
- `canAccessLesson` and all entitlement logic
- Database migrations against prod
- Service worker caching (do not cache auth tokens)
- Any code touching money (cents, currency codes, refunds)

---

## 4. Repository Layout
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
  /lesson              ← VideoPlayer, PdfViewer, AudioPlayer, MarkdownLesson
  /layout              ← MobileNav, AppShell
/lib
  /db                  ← Drizzle schema + client
  /auth                ← Clerk helpers
  /entitlements        ← canAccessLesson (SINGLE source of truth)
  /stripe              ← Stripe client + webhook handlers
/emails                ← React Email templates
```

---

## 5. Data Model (Drizzle Schema Spec)
See full schema in `PRD-v1-2026-05-15.md` section 7.2. Quick reference:

- **User** (mirrored from Clerk)
- **Program** → has many **Module** (optional) → has many **Lesson**
- **Lesson** has `type`, `asset_ref`, `required_tier`, `is_preview`
- **Product** maps to Stripe price IDs and grants access to one or more Programs
- **Entitlement** is the only thing the access layer reads
- **Progress** tracks per-user, per-lesson completion + resume position
- **Purchase** is an immutable audit log of Stripe events

---

## 6. First Session Bootstrapping Checklist
When Claude Code starts the build session, it should:

1. Read PRD-v1-2026-05-15.md in full
2. Read this handoff in full
3. Confirm Vercel account is linked (use the `vercel:bootstrap` skill)
4. Provision: Neon (Vercel Marketplace), Clerk (Vercel Marketplace), Vercel Blob
5. Set up Stripe in test mode, get test keys
6. Set up Mux account, get API keys
7. Set up Resend, get API key
8. `create-next-app` with TypeScript + Tailwind + App Router
9. Install: `@clerk/nextjs`, `drizzle-orm`, `drizzle-kit`, `stripe`, `@mux/mux-node`, `resend`, `react-email`, `shadcn-ui`
10. Run `shadcn-ui init`
11. Push initial commit to GitHub, connect to Vercel for auto-deploy
12. Deploy "coming soon" page on day one

---

## 7. Environment Variables Needed
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

# Database
DATABASE_URL (Neon, auto-provisioned by Vercel)

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Mux
MUX_TOKEN_ID
MUX_TOKEN_SECRET
MUX_SIGNING_KEY_ID
MUX_SIGNING_KEY_PRIVATE

# Vercel Blob
BLOB_READ_WRITE_TOKEN (auto-provisioned)

# Resend
RESEND_API_KEY

# External email webhook (for nurture)
EXTERNAL_EMAIL_WEBHOOK_URL

# App
NEXT_PUBLIC_APP_URL (e.g. https://members.revvaughn.com)
ADMIN_USER_IDS (comma-separated Clerk user IDs allowed in /admin)
```

---

## 8. Known Risks & Mitigations
1. **Solo non-dev builder gets stuck** → Budget $300–$500/week of a senior Next.js contractor as on-call insurance.
2. **iOS Safari PWA quirks** → Test on real iPhone every week; don't rely on push notifications in v1.
3. **Stripe webhook reliability** → Idempotency keys on every entitlement write; dead-letter logging.
4. **Scope creep mid-build** → Any new request after Week 2 goes to v1.1 list. No exceptions.

---

## 9. What's Explicitly OUT of Scope for v1
Document these as v1.1 candidates if anyone proposes them:
- Comments / discussion / threaded Q&A under lessons
- Calendar, event booking, live sessions
- Certificates of completion
- Affiliate / referral tracking
- Custom email automation builder (we only fire a webhook)
- Cohort-based drip schedules
- Native iOS/Android app
- Member directory or member-to-member features
- Custom landing page builder
- Multi-tenant white-label for clients
- Gamification (badges, streaks, leaderboards)
- Full-text search (basic title search only in v1)

---

## 10. The One Thing
If anything in this doc conflicts with day-to-day decisions during the build, the deciding question is:
**"Does this make Rev's iPhone experience worse?"**
If yes, kill it. The phone is the product.

---

**End of handoff.**
