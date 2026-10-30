---
name: issue-sweep
description: Sweep the GitHub issue backlog oldest-first in batches — fetch the next batch, classify each issue (already shipped, obsolete, duplicate, abandoned, won't do, still valid) with evidence from the codebase, present a review table, and close only what the maintainer approves. Use when asked to triage, clean up, or close stale/old/invalid issues.
argument-hint: [batch-size]
---

# Issue Backlog Sweep

Closing an issue posts a public comment under the maintainer's account and notifies every subscriber. Nothing is closed, labeled, or commented until the maintainer has approved the table from Phase 3.

State lives in `~/.cache/nativescript-issue-sweep/`: `cursor` (the `createdAt` of the last fully swept issue), `log.jsonl` (every action taken), and the default batch files.

## Phase 1: Fetch the next batch

```bash
node .agent/skills/issue-sweep/scripts/fetch-batch.mjs --limit 25
```

Writes `batch.json` (raw) and `batch.md` (digest: truncated body, last 4 comments, labels, cross-referenced PRs/issues) to the state dir. `--after <ISO date>` overrides the cursor; `--out <path>` writes elsewhere. Read `batch.md`.

## Phase 2: Classify each issue

Assign exactly one bucket, and back it with evidence — a `file:line`, a commit/PR, or a quote from the thread. No evidence, no close.

| Bucket | Action | Evidence required |
| --- | --- | --- |
| **Shipped** | close `completed` | The feature/fix exists today: grep `packages/core` (read both platform files), `git log -S`, or a MERGED cross-ref PR. Name the API in the comment. |
| **Obsolete** | close `not planned` | Targets something gone: `tns-*` packages, JSC iOS runtime, Sidekick, NativeScript < 7 APIs, Bountysource/ideas-portal workflows, Android Support Library. |
| **Duplicate** | close `not planned` + `duplicateOf` | The canonical issue number; keep the one with more discussion/reactions open. |
| **Abandoned** | close `not planned` | Bug with no repro or `needs more info`, reporter silent > 1 year. |
| **Won't do in core** | close `not planned` | Out of scope for core, or covered by a plugin (name it), or a workaround is posted in the thread (link it). |
| **Still valid** | keep | Genuine gap, active PR, recent member engagement, or strong demand (many reactions / recent comments). Suggest label fixes. |
| **Your call** | flag | Mixed signals — present both readings; the maintainer decides. |

Judgment rules:

- Recent member activity (a maintainer commented in the last ~2 years, or an open PR references it) means **keep** unless that member said otherwise.
- For bugs, check whether the code path in the report still exists; if it was rewritten, lean toward Abandoned with a "please reopen with a repro on current `@nativescript/core`" invitation.
- Partial delivery: if the core ask shipped and leftovers have no demand, close `completed` and say what remains.
- Note related open issues found along the way (likely duplicates later in the backlog) so later batches can close them against a canonical one.

## Phase 3: Present for review

Write `decisions.json` (format in the header of `scripts/apply.mjs`; `batch` is a path relative to the decisions file) with a draft comment per close, then dry-run it:

```bash
node .agent/skills/issue-sweep/scripts/apply.mjs <decisions.json>
```

Show the maintainer a table — `#`, title, age, bucket, one-line evidence, proposed action — grouped by action, plus the "your call" items. Accept edits ("keep #59", "close #254 as dup of #27", "reword #944").

Closing comments: 2–4 sentences, warm and specific. Thank the reporter, state the evidence (the API/PR that shipped it, the plugin to use, or why it's out of scope), and invite a reopen or new issue against current `@nativescript/core` if it still matters. No boilerplate apologies, no "stale bot" tone.

## Phase 4: Apply

Only after explicit approval:

```bash
node .agent/skills/issue-sweep/scripts/apply.mjs <decisions.json> --execute
```

Before each action it re-checks the issue; anything closed or updated since the fetch is skipped for re-review. The cursor advances only when every decision applied, so skipped items come back in the next batch. Report the summary line and any FAIL/SKIP lines verbatim.
