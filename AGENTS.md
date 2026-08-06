# Blog agent guide

This repo is the Astro implementation of **Signal Press**, the blog's own visual identity.

> Self-contained fleet rules (source: chirag127/workspace/knowledge/, manual sync):

<!-- CANONICAL-RULES v1 (manual sync — source of truth: chirag127/workspace/knowledge/) -->
<!--
  This block is copied verbatim into every active repo's AGENTS.md so rules
  enforce even when the repo is cloned/opened standalone (outside the workspace
  umbrella). MANUAL SYNC: when a rule changes, edit the source in
  workspace/knowledge/ AND hand-update this block in each repo. The v1 marker
  makes stale copies greppable. Full rule text lives in workspace/knowledge/.
-->

## Fleet rules (canonical — apply on every task)

### Prose + output
- **Caveman/terse.** Drop articles, filler, pleasantries, hedging. Fragments > sentences. Answer in word 1 — no preamble, no restatement. Code/data BEFORE prose. Explanation ≤3 lines trivial, ≤10 complex. Concrete not abstract (file:line, exact command, next action). Same terseness for commit messages, PR/issue bodies, code comments. Full sentences ONLY for irreversible-action confirmations (`rm -rf`, force-push, `DROP TABLE`, prod deploy).
- **Terse GitHub issues.** Bug ≤150 words, feature ≤100, comment ≤50. Use repo's template. No speculation/unverified versions/API names. Shorter = fewer hallucinations.

### Code
- **Minimum everything.** Smallest unit that works. LOC/tool-calls/files/imports = what the task needs, not one more. Zero comments unless the line is non-obvious. Trivial fix ≤3 tool calls, routine ≤10, multi-step ≤30 (else delegate).
- **The ladder** (stop at first rung): does it need to exist? → native platform/OS/browser? → already in codebase (reuse)? → stdlib? → one line? → only then minimal own code. Trace the problem end-to-end before coding.
- **No speculative scaffolding, no defensive code for impossible cases, no premature optimization.** `// shouldn't happen` → delete the code. **Edit > Write** (Write only for new files / full replacement). Reuse existing patterns/style even if suboptimal. Don't re-read unchanged files.
- **MAXIMIZE community packages, MINIMIZE own code.** Reach for a well-kept package before writing logic; every line not written is a line not maintained. Own code only where no package fits. Shared own-code = the atomic `@chirag127/*` set — reuse mechanism, theme each site's OWN look.
- **Build COMPLETE, not MVP.** Full feature set, latest dep versions (beta/alpha ok when newest), unit + integration tests everywhere. Ship same session.

### Code intelligence — codebase-memory-mcp FIRST
- On ANY code question use a **cbm** tool BEFORE Grep/Glob/Read: `search_graph` (find symbol), `trace_path` (callers/callees/blast-radius), `get_code_snippet` (exact source), `get_architecture` (overview), `query_graph` (openCypher), `search_code` (grep over indexed), `detect_changes` (diff impact). If the repo isn't indexed → `index_repository` first. Grep/Read only for non-code files or a file you're about to edit. **Use cbm VERY frequently** — 120× fewer tokens than grep/read; many calls per task is good.

### Git
- **main only.** Direct commit on own repos (`chirag127/*`), push by default, never force-push main. Conventional commits (they ARE the changelog). Branches only for upstream PRs. Identity = chirag127 noreply. Scan for secrets before push (no hardcoded secrets; sops+age vault).

### Web + facts
- **Search the web ≥2× before any non-trivial decision** on tools/pricing/library-status/URLs (two phrasings, cross-check). No memory-only answers on externally-knowable, mutable facts.

### Product + security posture
- **No auth on FREE surfaces** — free features 100% public; auth ONLY gates paid goods. Clerk = shared `*.oriz.in` SSO; `PUBLIC_CLERK_PUBLISHABLE_KEY` client-side, secret key server/deploy only, never `PUBLIC_*_SECRET`.
- **No card-on-file for own tooling** (donations via BMC/GH-Sponsors/UPI); customers may pay any method. Never hit free-tier quotas.
- **Every site its OWN distinct visual identity** — reuse `@chirag127/*` for mechanism/a11y/token-contract; never reuse another site's palette/type/layout/motion/signature. Run the frontend-design process per site.

### Interaction (STT-friendly)
- User uses speech-to-text: infer intent from typos/homophones, pick the most-likely reading, STATE it, proceed. Don't ask the user to re-type. Ask only when truly blocked.

<!-- /CANONICAL-RULES v1 -->

## Design contract

- Keep Signal Press's mineral-paper palette, coral signal ink, Source Serif + Inter + JetBrains Mono pairing, ruled editorial rhythm, and field-note series spine distinct from every other family site.
- Reuse shared `@chirag127/*` packages only for framework-agnostic behavior, accessibility, and token contracts. Do not import another site's finished visual skin.
- Shared packages may support Astro, React, Next.js, Vue, Svelte, or plain HTML consumers, but each consuming site must choose its own subject-led palette, typography, layout, motion, and signature element.
- Do not create a second visual template for the family. Mechanism is reusable; identity is local. If a new atomic package is genuinely useful, keep it zero-dependency, semantic-token based, accessible, independently publishable, and framework-neutral.
- Before a visual change, use the frontend-design brief process: name the audience and page job, choose an opinionated subject-grounded direction, critique generic defaults, then validate desktop and mobile.

## Product and accessibility

- Preserve keyboard focus, reduced-motion behavior, readable article measure, useful empty states, visible focus rings, and no emoji in site chrome.
- The public blog is readable without an account. Clerk is optional here and gates only account features such as synchronized bookmarks.
- Keep search shortcuts unambiguous: local blog search is Cmd/Ctrl+K; family search is Cmd/Ctrl+Shift+K.
- Preserve existing routes and helpers rather than inventing route families. Use the existing Astro content collections and components.

## Clerk SSO

- Clerk is the shared identity layer for the `oriz.in` family: one Clerk instance provides SSO across `oriz.in` and its subdomains when the domains and cookie/session settings are configured in the Clerk Dashboard.
- Browser islands use `PUBLIC_CLERK_PUBLISHABLE_KEY`. Never expose `CLERK_SECRET_KEY` or create a `PUBLIC_CLERK_SECRET_KEY`.
- Keep the env names documented in `.env.example`; deployment secrets belong in the configured secret manager, not source control.
- Do not add auth gates to public reading routes. Sign-in copy must explain that it is optional and used for account features.

## Verification

This is a static Astro site. Run `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`, and `corepack pnpm build` from this repo before reporting completion. Inspect the generated page at desktop and mobile widths when a visual change is made.
