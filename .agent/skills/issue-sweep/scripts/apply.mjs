#!/usr/bin/env node
// Applies reviewed sweep decisions. Dry run by default; pass --execute to act.
//
// Usage: node apply.mjs <decisions.json> [--execute]
//
// decisions.json:
// {
//   "batch": "<path to batch .json from fetch-batch.mjs>",
//   "decisions": [
//     { "number": 53, "action": "close", "reason": "completed", "comment": "...", "addLabels": [], "removeLabels": [] },
//     { "number": 99, "action": "close", "reason": "not planned", "duplicateOf": 42, "comment": "..." },
//     { "number": 27, "action": "keep", "comment": "optional", "addLabels": ["planned"] }
//   ]
// }
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({ allowPositionals: true, options: { execute: { type: 'boolean', default: false } } });
if (!positionals[0]) {
	console.error('Usage: node apply.mjs <decisions.json> [--execute]');
	process.exit(1);
}

const decisionsPath = resolve(positionals[0]);
const { batch: batchRef, decisions } = JSON.parse(readFileSync(decisionsPath, 'utf8'));
const batch = JSON.parse(readFileSync(resolve(dirname(decisionsPath), batchRef), 'utf8'));
const { repo } = batch;
const byNumber = new Map(batch.issues.map((i) => [i.number, i]));

const errors = [];
const decided = new Set(decisions.map((d) => d.number));
for (const i of batch.issues) if (!decided.has(i.number)) errors.push(`#${i.number} has no decision`);
for (const d of decisions) {
	if (!byNumber.has(d.number)) errors.push(`#${d.number} is not in the batch`);
	if (!['close', 'keep'].includes(d.action)) errors.push(`#${d.number}: action must be close|keep`);
	if (d.action === 'close' && !['completed', 'not planned'].includes(d.reason)) errors.push(`#${d.number}: close needs reason completed|not planned`);
	if (d.action === 'close' && !d.comment) errors.push(`#${d.number}: close needs a comment`);
}
if (errors.length) {
	console.error(errors.join('\n'));
	process.exit(1);
}

const stateDir = join(homedir(), '.cache', 'nativescript-issue-sweep');
mkdirSync(stateDir, { recursive: true });
const gh = (args) => execFileSync('gh', [...args, '-R', repo], { encoding: 'utf8' });
const logFile = join(stateDir, 'log.jsonl');
const log = (d, result, extra = {}) => appendFileSync(logFile, JSON.stringify({ at: new Date().toISOString(), repo, ...d, result, ...extra }) + '\n');
// Re-running a partially applied batch must not repeat actions or count them as failures.
const applied = new Set(
	(existsSync(logFile) ? readFileSync(logFile, 'utf8').split('\n').filter(Boolean) : [])
		.map((l) => JSON.parse(l))
		.filter((e) => e.repo === repo && e.result === 'done')
		.map((e) => e.number),
);

let failures = 0;
for (const d of decisions) {
	const fetched = byNumber.get(d.number);
	const comment = d.duplicateOf ? `Duplicate of #${d.duplicateOf}\n\n${d.comment ?? ''}`.trim() : d.comment;
	const addLabels = [...(d.addLabels ?? []), ...(d.duplicateOf ? ['duplicate'] : [])];
	const summary = `#${d.number} ${d.action === 'close' ? `CLOSE (${d.reason}${d.duplicateOf ? `, dup of #${d.duplicateOf}` : ''})` : 'KEEP'}${addLabels.length ? ` +[${addLabels}]` : ''}${d.removeLabels?.length ? ` -[${d.removeLabels}]` : ''} — ${fetched.title}`;

	if (!values.execute) {
		console.log(`${summary}${comment ? `\n    ${comment.replace(/\n/g, '\n    ')}` : ''}\n`);
		continue;
	}

	if (applied.has(d.number)) {
		console.log(`ALREADY ${summary}`);
		continue;
	}

	try {
		// Skip issues that moved since the batch was fetched; the decision was made on stale context.
		const live = JSON.parse(gh(['issue', 'view', String(d.number), '--json', 'state,updatedAt']));
		if (live.state !== 'OPEN' || live.updatedAt !== fetched.updatedAt) {
			console.log(`SKIP ${summary} (state ${live.state}, updated ${live.updatedAt} since fetch — re-review)`);
			log(d, 'skipped-changed');
			failures++;
			continue;
		}
		if (addLabels.length || d.removeLabels?.length) {
			gh(['issue', 'edit', String(d.number), ...addLabels.flatMap((l) => ['--add-label', l]), ...(d.removeLabels ?? []).flatMap((l) => ['--remove-label', l])]);
		}
		if (d.action === 'close') {
			gh(['issue', 'close', String(d.number), '--reason', d.reason, '--comment', comment]);
		} else if (comment) {
			gh(['issue', 'comment', String(d.number), '--body', comment]);
		}
		console.log(`DONE ${summary}`);
		log(d, 'done');
	} catch (e) {
		failures++;
		console.error(`FAIL ${summary}\n    ${String(e.stderr || e.message).trim()}`);
		log(d, 'failed', { error: String(e.stderr || e.message) });
	}
}

const closes = decisions.filter((d) => d.action === 'close').length;
console.log(`${values.execute ? 'Applied' : 'Dry run'}: ${closes} close, ${decisions.length - closes} keep${values.execute ? `, ${failures} failed/skipped` : ' — re-run with --execute to apply'}`);

// Advancing the cursor past a batch with skipped/failed items would drop them from future sweeps.
if (values.execute && failures === 0) {
	const last = batch.issues[batch.issues.length - 1];
	writeFileSync(join(stateDir, 'cursor'), last.createdAt);
	console.log(`Cursor advanced to ${last.createdAt} (#${last.number})`);
}
