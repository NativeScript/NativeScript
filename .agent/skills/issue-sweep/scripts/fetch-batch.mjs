#!/usr/bin/env node
// Fetches the next batch of open issues (oldest first, after the sweep cursor)
// and writes <out>.json (raw) plus <out>.md (truncated digest for review).
//
// Usage: node fetch-batch.mjs [--limit 25] [--after <ISO createdAt>] [--out <path-without-ext>] [--repo owner/name]
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
	options: { limit: { type: 'string' }, after: { type: 'string' }, out: { type: 'string' }, repo: { type: 'string' } },
});

const repo = args.repo || 'NativeScript/NativeScript';
const stateDir = join(homedir(), '.cache', 'nativescript-issue-sweep');
const cursorFile = join(stateDir, 'cursor');
const limit = Math.min(Number(args.limit || 25), 100);
const after = args.after || (existsSync(cursorFile) ? readFileSync(cursorFile, 'utf8').trim() : '');
const out = args.out || join(stateDir, 'batch');

const BODY_MAX = 1500;
const COMMENT_MAX = 600;

const query = `
query($q: String!, $n: Int!) {
  search(query: $q, type: ISSUE, first: $n) {
    issueCount
    nodes {
      ... on Issue {
        number title url body createdAt updatedAt
        author { login }
        labels(first: 20) { nodes { name } }
        reactions { totalCount }
        comments(last: 4) { totalCount nodes { author { login } authorAssociation createdAt body } }
        timelineItems(itemTypes: [CROSS_REFERENCED_EVENT], last: 10) {
          nodes { ... on CrossReferencedEvent {
            source {
              ... on PullRequest { __typename number title state merged url }
              ... on Issue { __typename number title state url }
            }
          } }
        }
      }
    }
  }
}`;

const q = [`repo:${repo}`, 'is:issue', 'is:open', 'sort:created-asc', after && `created:>${after}`].filter(Boolean).join(' ');
const raw = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`, '-f', `q=${q}`, '-F', `n=${limit}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const { issueCount, nodes } = JSON.parse(raw).data.search;

const clip = (text, max) => {
	const s = (text || '').replace(/<!--[\s\S]*?-->/g, '').trim();
	return s.length > max ? `${s.slice(0, max)}\n…[${s.length - max} more chars]` : s;
};

const digest = [`# Issue sweep batch — ${nodes.length} of ${issueCount} remaining (${repo})`, `Query: \`${q}\``, ''];
for (const i of nodes) {
	const refs = i.timelineItems.nodes.map((n) => n.source).filter((s) => s?.number);
	digest.push(`## #${i.number} ${i.title}`, `${i.url} · by @${i.author?.login ?? 'ghost'} · created ${i.createdAt.slice(0, 10)} · updated ${i.updatedAt.slice(0, 10)} · ${i.comments.totalCount} comments · ${i.reactions.totalCount} reactions`, `Labels: ${i.labels.nodes.map((l) => l.name).join(', ') || '(none)'}`, refs.length ? `Cross-refs: ${refs.map((s) => `${s.__typename === 'PullRequest' ? 'PR' : 'issue'} #${s.number} [${s.merged ? 'MERGED' : s.state}] ${s.title}`).join(' | ')}` : 'Cross-refs: (none)', '', '### Body', clip(i.body, BODY_MAX) || '(empty)', '');
	if (i.comments.nodes.length) {
		digest.push(`### Last ${i.comments.nodes.length} comments`);
		for (const c of i.comments.nodes) {
			digest.push(`- **@${c.author?.login ?? 'ghost'}** (${c.authorAssociation.toLowerCase()}, ${c.createdAt.slice(0, 10)}): ${clip(c.body, COMMENT_MAX).replace(/\n+/g, ' ⏎ ')}`);
		}
		digest.push('');
	}
}

mkdirSync(stateDir, { recursive: true });
writeFileSync(`${out}.json`, JSON.stringify({ repo, query: q, issueCount, issues: nodes }, null, 2));
writeFileSync(`${out}.md`, digest.join('\n'));
console.log(`Fetched ${nodes.length} issues (${issueCount} open after cursor). Wrote ${out}.json and ${out}.md`);
