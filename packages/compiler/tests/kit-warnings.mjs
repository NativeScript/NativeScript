#!/usr/bin/env node
// The warnings of a build of the kit (and the fixture app's code) against tests/kit-warnings.txt:
//   node kit-warnings.mjs <xcodebuild log>
// Fails on a warning the list does not allow; a listed one that no longer occurs (in a full build) is named, to be removed.
// The list's `deprecated <API>` lines are platform deprecations core calls on purpose; its `pending <file> | <message>`
// lines are generated-code warnings not fixed yet, keyed without line numbers.
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const log = readFileSync(process.argv[2], 'utf8');
const allowed = readFileSync(join(here, 'kit-warnings.txt'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const deprecated = new Set(allowed.filter((l) => l.startsWith('deprecated ')).map((l) => l.slice(11)));
const pending = new Map(allowed.filter((l) => l.startsWith('pending ')).map((l) => [l.slice(8), 0]));

const seen = new Set();
const unexpected = [];
for (const line of log.split('\n')) {
  const m = /^((?:\/|@nativescript\/)[^:]+\.(?:swift|ts|vue|xml)):(\d+):\d+: warning: (.*?)(?: \(in target .*\))?$/.exec(line);
  if (!m) continue;
  const [, file, at, message] = m;
  // Kit code reports the line of core it was made from, at a path Xcode may resolve against the project
  // (`<project>/@nativescript/core/ui.label.index.ios.ts`): keyed from `@nativescript/core/`.
  const core = /(?:^|\/)(@nativescript\/core\/[^/]+)$/.exec(file)?.[1];
  // Only the kit's and the app's own code: not an SDK's or a pod's headers.
  if (!core && !/\/NativeScriptKit\/|\/Sources\/|\/app\//.test(file)) continue;
  const name = core ?? basename(file);
  if (seen.has(`${name}:${at}: ${message}`)) continue;
  seen.add(`${name}:${at}: ${message}`);
  const api = /^'([^']+)' was deprecated in iOS/.exec(message)?.[1];
  if (api && deprecated.has(api)) continue;
  const key = `${name} | ${message.replace(/\s*\[#\w+\]$/, '')}`;
  if (pending.has(key)) { pending.set(key, pending.get(key) + 1); continue; }
  unexpected.push(`${name}:${at}: ${message}`);
}
const stale = [...pending].filter(([, n]) => !n).map(([k]) => k);
for (const w of unexpected) console.error(`warning not allowed: ${w}`);
// An incremental build compiles only what changed: a warning missing from it may still be there.
for (const k of stale) console.log(`listed but not seen (remove it from kit-warnings.txt if a full build agrees): ${k}`);
if (unexpected.length) process.exit(1);
console.log(`kit warnings: ${seen.size} lines, all on the list (${pending.size} pending, ${deprecated.size} deprecated APIs)`);
