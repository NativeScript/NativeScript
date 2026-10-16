#!/usr/bin/env node
// Every public type the kit's Swift declares, generated or hand-written, is one the kit manifest has, however
// swift-format laid its declaration out: the translator reaches a type the manifest lacks only by name, so its
// members fail at run time. A quick check before a build; kit-manifest-check.ts checks against the built module.
//   node tests/kit-index-check.ts [kit sources, default kit-apple/Sources/NativeScriptKit]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readKitManifest } from '../src/kit-manifest.ts';
import { readSwift } from '../src/swift-declarations.ts';

const kit = process.argv[2] ?? join(import.meta.dirname, '..', 'kit-apple', 'Sources', 'NativeScriptKit');
const manifest = readKitManifest(kit);
if (!manifest) {
  console.error(`${kit}/Core has no kit manifest: generate the kit (nx run compiler:kit)`);
  process.exit(1);
}
const missing: string[] = [];
let declared = 0;
for (const f of (readdirSync(kit, { recursive: true }) as string[]).filter((f) => f.endsWith('.swift')).sort()) {
  for (const t of readSwift(readFileSync(join(kit, f), 'utf8')).types) {
    if (t.kind === 'extension' || t.access !== 'public') continue;
    declared++;
    if (!Object.hasOwn(manifest.types, t.name)) missing.push(`${f}: ${t.name}`);
  }
}
if (missing.length) {
  console.error(`the kit manifest lacks ${missing.length} type(s) the kit declares:\n  ${missing.slice(0, 20).join('\n  ')}`);
  process.exit(1);
}
console.log(`kit manifest: all ${declared} public types the kit declares`);
