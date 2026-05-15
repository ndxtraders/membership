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
