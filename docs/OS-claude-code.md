# Claude Code — Operating System Template
# Copy this into any project's CLAUDE.md (or append to an existing one)
# Rev Vaughn | Last updated: 2026-05-15

---

## 1. PRE-FLIGHT PROTOCOL (The "All Allow" Pattern)

Before starting ANY non-trivial task, Claude MUST do the following in a single opening message — not spread across the session:

### 1A. Declare intent
State in plain language:
- What the task is
- Which files will be created or modified
- Which tools will be used (Bash, Read, Edit, Write, Agent, etc.)
- Any external services that will be called (Supabase, APIs, etc.)

### 1B. Request all permissions upfront
List every permission needed, then ask for one approval:

> "I'll need to: run npm/expo commands, read/write files in [paths], run git commands, and make network requests. Approve all of these now and I'll proceed without interrupting you again."

The user approves once. Claude does not stop for individual permissions mid-task unless something unexpected requires new access.

### 1C. Add permissions to settings.json
After approval, check `.claude/settings.json`. If the required permissions are not already allowlisted, add them. This survives session restarts.

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(git:*)",
      "Bash(find:*)",
      "Bash(ls:*)",
      "Read(*)",
      "Edit(*)",
      "Write(*)"
    ]
  }
}
```

### 1D. Ask clarifying questions BEFORE starting
If anything is ambiguous — ask now. Not mid-implementation. One question block, then execute.

---

## 2. PLANNING REQUIREMENTS

### Mandatory plan for ANY task that is:
- 3+ steps
- Touches more than 2 files
- Involves architectural decisions
- Has unclear requirements
- Could break existing functionality

### Plan format (write to `tasks/todo.md`):
```markdown
## Task: [name]
**Goal:** [one sentence]
**Files affected:** [list]
**Approach:** [how, not just what]
**Risks:** [what could break]
**Verification:** [how I'll prove it works]

### Steps
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

### Review
- Result:
- What I learned:
```

### Plan rules:
- Write the plan BEFORE touching any file
- Get user approval (or proceed autonomously if granted)
- Check items off as you go
- If something goes sideways mid-task, STOP and re-plan — do not push through
- Use plan mode for verification steps, not just building

---

## 3. VERIFICATION GATES ("Would a Staff Engineer Approve This?")

Never mark a task complete without proof it works. The bar is: would a senior engineer approve this PR?

### Code verification checklist:
- [ ] Code runs without errors
- [ ] The specific behavior requested was tested (not just adjacent behavior)
- [ ] Edge cases were considered
- [ ] No console errors or warnings introduced
- [ ] Existing functionality still works (no regressions)
- [ ] For UI changes: screenshot or describe the visual result

### How to verify:
1. Run the relevant command (build, test, lint, start)
2. Check logs for errors
3. If a UI change: open the simulator/browser and confirm visually
4. If a logic change: trace through the code path with a test case

### Non-negotiables:
- Do not say "this should work" — prove it
- Do not say "I believe this is correct" without testing
- If you can't run the code, explicitly say so and explain why

---

## 4. SUBAGENT STRATEGY (Keep Main Context Clean)

Use subagents liberally. The main context window is for decisions, not grunt work.

### When to spawn a subagent:
| Task | Use Subagent? |
|------|--------------|
| Reading/searching multiple files | Yes |
| Running a build and analyzing output | Yes |
| Research (docs, web, code exploration) | Yes |
| Writing a long spec or document | Yes |
| Multi-file refactors | Yes |
| Simple 1-file edits | No |
| Quick bug fixes with clear root cause | No |

### Subagent rules:
- One focused task per subagent
- Write self-contained prompts (include file paths, context, expected output)
- Verify the agent's output before using it — it reports intent, not always result
- Never write "based on your findings, implement it" — you implement, you synthesize

---

## 5. CONTEXT WINDOW HYGIENE (Karpathy Principle: Stay Focused)

A bloated context window makes the model slower and less accurate. Treat it like working memory.

### Rules:
- When exploring code, use `Explore` or `general-purpose` subagents — don't pipe file contents into main context
- When a task is done, summarize the result in 3 lines before moving on (not the full output)
- Use `/compact` proactively before starting a new major task — don't wait for the model to lose context
- For long builds/logs: read only the relevant section (error lines + surrounding context), not full output

### Karpathy's model of working with LLMs:
> "Treat the model like a highly capable junior engineer who just joined. They need specific context, clear requirements, and tight feedback loops — not vague goals and silence."

Translate to Claude Code:
- Specific > vague: "Edit line 47 of useAudioStore.ts to..." beats "fix the audio bug"
- Show examples: paste the pattern you want to follow
- Short iterations: check output after each step, don't queue 10 steps and hope
- The model learns from your corrections — update `tasks/lessons.md` after every mistake

---

## 6. SELF-IMPROVEMENT LOOP

After ANY correction or course change from the user, update `tasks/lessons.md`:

```markdown
### [Date] — [Short description of mistake]
- **What happened:** [What I did wrong]
- **Root cause:** [Why it happened]
- **Rule going forward:** [Specific rule that prevents recurrence]
```

At the start of each session involving this project, scan `tasks/lessons.md` for relevant patterns before starting.

**This is not optional.** The lessons file is the project's institutional memory. Skipping it means repeating the same mistakes.

---

## 7. AUTONOMY MODES

Ask the user which mode to use at the start of each session. Default is Supervised.

### Mode A — Supervised (default)
- Show plan, wait for approval
- Check in at major decision points
- Ask before irreversible actions (deletes, force pushes, payments)

### Mode B — Autonomous (user grants explicitly)
- Plan, execute, verify — no check-ins
- Stop ONLY for: real blockers, unexpected errors requiring a decision, irreversible actions
- Report results when done

### Mode C — Yolo (explicit grant only)
- Full autonomy, no stops, no check-ins
- Not recommended for production systems

**Irreversible actions always require explicit approval regardless of mode:**
- `git push --force`
- Database migrations on production
- Deleting files or data
- Payments or API calls that cost money
- Publishing to app stores

---

## 8. BUG FIXING PROTOCOL

When given a bug report: fix it. No clarifying questions needed if the bug is described clearly.

### Diagnostic order:
1. Read the error message exactly — don't guess at the cause
2. Find the file and line where it originates
3. Trace backwards to the root cause (not the symptom)
4. Fix the root cause, not the symptom
5. Verify the fix works
6. Check for regressions

### Common traps to avoid:
- Do not wrap errors in try/catch to silence them — fix the underlying issue
- Do not add fallback values to hide type mismatches — fix the type
- Do not add `// @ts-ignore` — fix the type error
- "It should work now" is not verification — run it

---

## 9. CODE QUALITY STANDARDS

### Simplicity first (Karpathy: prefer the boring solution)
- The simplest solution that works is usually right
- Don't add abstractions until you need them twice
- Don't add libraries when 10 lines of code solves it
- Don't over-engineer: "Would I be embarrassed showing this to a senior engineer?" If yes, simplify

### Minimal footprint
- Changes should touch only what's necessary
- If you're editing 5 files for a 1-file problem, re-examine the approach
- New files should have a clear reason to exist

### No lazy patterns:
- No `TODO` comments left in shipped code
- No commented-out code blocks
- No `console.log` in production code (use proper logging)
- No hardcoded values that belong in config/constants
- No duplicate logic when a shared utility would work

---

## 10. SECURITY BASELINE

These rules are non-negotiable regardless of project:

- **NEVER hardcode API keys, secrets, or tokens** — use `.env` and environment variables
- **All `.env` files must be in `.gitignore`** — verify before first commit
- **Validate all user input before writing to a database** — no direct passthrough
- **Row Level Security (RLS) is required on all Supabase tables** — no public read/write access
- **Never log sensitive data** (tokens, passwords, PII) to console or files
- **Service role keys stay in Edge Functions only** — never in client-side code

---

## 11. GIT DISCIPLINE

- Commit often — small, focused commits are better than one giant commit
- Commit message format: `[type]: [what changed]` — e.g. `fix: slider thumb drag conflict on Android`
- Never commit broken code to main — use feature branches for experimental work
- Before any destructive operation (`reset --hard`, `push --force`), ask explicitly
- Version files before editing: copy `SKILL.md` or `PRD.md` to `_versions/` with date stamp before modifying

---

## 12. TASK FILE STRUCTURE (Standard for Every Project)

```
tasks/
├── todo.md        ← active build plan (checklist format)
└── lessons.md     ← mistake log + pattern rules
```

- `todo.md` is the single source of truth for what's in progress
- Mark items complete as you go — don't batch-mark at the end
- `lessons.md` grows over time and is read at session start

---

## 13. SESSION START CHECKLIST

Run through this at the start of every session:

1. Read `CLAUDE.md` (this file) — done automatically if in project root
2. Skim `tasks/lessons.md` — look for patterns relevant to today's task
3. Read `tasks/todo.md` — know what's in progress and what's pending
4. Ask the user: "Supervised, Autonomous, or Yolo mode today?"
5. If the task is non-trivial: declare intent + request permissions upfront (Section 1)
6. Write or update the plan in `tasks/todo.md` before touching files

---

## 14. WHEN TO STOP AND ASK

Even in Autonomous mode, stop and ask the user when:
- The root cause of a bug is unclear after 2 attempts
- A decision would significantly change the architecture
- An action cannot be undone
- The requirements are contradicted by the existing code
- A third-party API returns unexpected behavior
- You're about to delete or overwrite data

**Do not keep pushing when you're going in circles.** Two failed attempts = re-plan.

---

## 15. EFFICIENCY PATTERNS (Karpathy + Claude Code Best Practices)

### Parallelize when possible
When multiple independent operations are needed, run them in parallel tool calls. Don't chain reads/checks sequentially if they don't depend on each other.

### Use the right tool tier
1. Dedicated MCP tool (Slack, Gmail, etc.) — fastest
2. Chrome extension (`mcp__Claude_in_Chrome__*`) — for web apps
3. Computer use — for native desktop apps only

### Token efficiency
- Short, specific prompts outperform long, vague ones
- For exploration tasks: give the agent a question, not a procedure
- For implementation tasks: give a precise spec, not a description
- Paste examples of the pattern you want — don't describe it abstractly

### Avoid these time sinks:
- Reading full files when you only need a function — use `offset` + `limit` params on Read
- Running full builds to check a syntax fix — run the linter instead
- Asking for permission to do what's already in the plan — get it upfront
- Recapping what just happened before doing the next thing — just do the next thing

---

*Template version: 1.0 | Build into every project CLAUDE.md for maximum Claude Code effectiveness*
