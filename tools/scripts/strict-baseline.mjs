// Ratchet for type-checking packages/core under strictNullChecks: per-file error
// counts must match packages/core/strict-baseline.json. Counts are kept per file
// so an error fixed in one file cannot hide one added in another.
//
//   node tools/scripts/strict-baseline.mjs           check against the baseline
//   node tools/scripts/strict-baseline.mjs --update  record lowered counts
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const coreDir = join(root, 'packages/core');
const baselinePath = join(coreDir, 'strict-baseline.json');
const baselineName = relative(root, baselinePath);
const update = process.argv.includes('--update');

const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
const run = spawnSync(process.execPath, [tsc, '-p', 'tsconfig.strict.json', '--pretty', 'false'], { cwd: coreDir, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
if (run.error) throw run.error;

// A diagnostic starts at column 0; its continuation lines are indented.
const FILE_ERROR = /^(.+)\(\d+,\d+\): error TS\d+:/;
const diagnostics = [];
for (const line of run.stdout.split('\n')) {
	if (/^\S/.test(line)) diagnostics.push(line);
	else if (line && diagnostics.length) diagnostics[diagnostics.length - 1] += '\n' + line;
}

const current = {};
const errorsByFile = {};
for (const diagnostic of diagnostics) {
	const match = FILE_ERROR.exec(diagnostic);
	if (!match) {
		// Errors without a file (bad config, missing lib) cannot be baselined.
		console.error(run.stdout + run.stderr);
		fail('tsc reported an error that is not tied to a file.');
	}
	const file = match[1];
	current[file] = (current[file] ?? 0) + 1;
	(errorsByFile[file] ??= []).push(diagnostic);
}
if (run.status !== 0 && diagnostics.length === 0) {
	console.error(run.stdout + run.stderr);
	fail(`tsc exited with ${run.status} without reporting errors.`);
}

const hasBaseline = existsSync(baselinePath);
if (!hasBaseline && !update) fail(`${baselineName} is missing; create it with --update.`);
const baseline = hasBaseline ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {};
const files = [...new Set([...Object.keys(baseline), ...Object.keys(current)])].sort();
const increased = files.filter((file) => (current[file] ?? 0) > (baseline[file] ?? 0));
const decreased = files.filter((file) => (current[file] ?? 0) < (baseline[file] ?? 0));
const total = (counts) => Object.values(counts).reduce((sum, count) => sum + count, 0);
const describe = (file) => `  ${file}: ${baseline[file] ?? 0} -> ${current[file] ?? 0}`;

if (hasBaseline && increased.length) {
	for (const file of increased) console.error(errorsByFile[file].join('\n'));
	console.error(`\nstrictNullChecks errors increased in ${increased.length} file(s):`);
	console.error(increased.map(describe).join('\n'));
	fail(`Fix the new errors above; ${baselineName} only goes down${update ? ', so it was not updated' : ''}.`);
}

if (update) {
	const next = Object.fromEntries(
		Object.keys(current)
			.sort()
			.map((file) => [file, current[file]]),
	);
	writeFileSync(baselinePath, JSON.stringify(next, null, '\t') + '\n');
	console.log(`Wrote ${baselineName}: ${total(next)} errors in ${Object.keys(next).length} files (was ${total(baseline)}).`);
	process.exit(0);
}

if (decreased.length) {
	console.error(`strictNullChecks errors decreased in ${decreased.length} file(s):`);
	console.error(decreased.map(describe).join('\n'));
	fail(`Lower the baseline in the same change: npx nx run core:typecheck-strict --update`);
}

console.log(`strictNullChecks: ${total(current)} errors in ${Object.keys(current).length} files, matching ${baselineName}.`);

function fail(message) {
	console.error(message);
	process.exit(1);
}
