#!/usr/bin/env node
// Every public top-level type the generated iOS kit declares is one the kit index knows, however swift-format wrapped
// its declaration: the translator reaches a type the index lacks only by name, so its members fail at run time.
//   node tests/kit-index-check.ts [kit sources, default kit-apple/Sources/NativeScriptKit]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kitIndex } from '../src/kit-index.ts';

const kit = process.argv[2] ?? join(import.meta.dirname, '..', 'kit-apple', 'Sources', 'NativeScriptKit');
const index = kitIndex(kit);
const missing: string[] = [];
for (const f of readdirSync(kit, { recursive: true }) as string[]) {
  if (!f.endsWith('.swift')) continue;
  const text = readFileSync(join(kit, f), 'utf8').replace(/("(?:\\.|[^"\\\n])*")|\/\/.*$/gm, (_, s) => s ?? '');
  for (const m of text.matchAll(/^(?:@\w+\s+)*(?:(?:final|indirect)\s+)*(?:public|open)\s+(?:(?:final|indirect)\s+)*(?:class|struct|enum|protocol)\s+(\w+)/gm)) {
    if (!index.has(m[1])) missing.push(`${f}: ${m[1]}`);
  }
}
if (missing.length) {
  console.error(`the kit index lacks ${missing.length} type(s) the kit declares:\n  ${missing.slice(0, 20).join('\n  ')}`);
  process.exit(1);
}
console.log(`kit index: all ${index.size} types`);
