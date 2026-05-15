# Membership Site

A mobile-first membership platform for Rev Vaughn's paid digital programs.

## Documentation
- [PRD v1](docs/PRD-v1-2026-05-15.md) — product spec
- [Handoff](docs/HANDOFF-to-claude-code-2026-05-15.md) — build quickstart + architecture non-negotiables
- [Decisions Log](docs/DECISIONS-LOG-2026-05-15.md) — binding decisions that override PRD where they conflict
- [Operating System](docs/OS-claude-code.md) — Claude Code workflow rules
- [Claude project rules](CLAUDE.md) — entry point for AI agents working in this repo

## Stack
Next.js 16 · TypeScript strict · Tailwind v4 · Supabase (Auth + Postgres + Storage) · Drizzle · Stripe · MailerLite · Vercel.

## Local dev
```bash
npm install
cp .env.example .env.local
# Fill .env.local from `vercel env pull` after `vercel link`
npm run dev
```
