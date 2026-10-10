#!/usr/bin/env node
// The check that keeps a worker's shared imports immutable (src/worker-state.ts): each case a small
// app of a worker script, the module it imports and the app code beside it, compiled from a temp dir.
//   node tests/worker-state/run.ts
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { sharedWorkerState, sharedWorkerStateError } from '../../src/worker-state.ts';

interface Case { name: string; files: Record<string, string>; fails: RegExp | null }

const worker = `import { read } from './shared';\nlet handled = 0;\n(globalThis as any).onmessage = () => { handled++; read(); };\n`;
const cases: Case[] = [
  {
    name: 'consts read, filled at the module top level, and the worker entry keeping its own state',
    files: {
      'shared.ts': `export const LIST: number[] = [];\nLIST.push(1);\nexport let ready = false;\nready = true;\nexport const TABLE = new Float32Array(4);\nexport function read() { return LIST[0] + TABLE[0]; }\n`,
      'main.ts': `import { LIST, read } from './shared';\nexport const copy = [...LIST].sort();\nexport const firstFive = LIST.filter((x) => x < 5).sort();\nread();\n`,
      'other.ts': `export const unshared: number[] = [];\nexport function grow() { unshared.push(1); }\n`,
    },
    fails: null,
  },
  { name: 'a module let assigned later', files: { 'shared.ts': `export let count = 0;\nexport function read() { count++; return count; }\n`, 'main.ts': '' }, fails: /`count` of shared\.ts is assigned/ },
  { name: 'an element written from app code', files: { 'shared.ts': `export const TABLE = [0, 1];\nexport function read() { return TABLE[0]; }\n`, 'main.ts': `import { TABLE } from './shared';\nexport function poke() { TABLE[0] = 5; }\n` }, fails: /main\.ts:2:\d+: `TABLE` of shared\.ts is written \(`TABLE\[0\]`\)/ },
  { name: 'a property written', files: { 'shared.ts': `export const CONFIG = { rate: 1 };\nexport function read() { return CONFIG.rate; }\n`, 'main.ts': `import { CONFIG } from './shared';\nCONFIG.rate = 2;\n` }, fails: /`CONFIG` of shared\.ts is written/ },
  { name: 'a mutating call in a function of the module', files: { 'shared.ts': `const LIST: number[] = [];\nexport function read() { LIST.push(1); return LIST.length; }\n`, 'main.ts': '' }, fails: /`LIST` of shared\.ts is mutated by push\(\)/ },
  { name: 'a mutating call through a namespace import', files: { 'shared.ts': `export const LIST = [3, 1];\nexport function read() { return LIST[0]; }\n`, 'main.ts': `import * as shared from './shared';\nexport function order() { shared.LIST.sort(); }\n` }, fails: /`LIST` of shared\.ts is mutated by sort\(\)/ },
  { name: 'a property deleted', files: { 'shared.ts': `export const CACHE: Record<string, number> = { a: 1 };\nexport function read() { return CACHE.a; }\n`, 'main.ts': `import { CACHE } from './shared';\nexport function drop() { delete CACHE.a; }\n` }, fails: /`CACHE` of shared\.ts is deleted from/ },
  {
    name: 'a module the worker reaches through another',
    files: { 'shared.ts': `import { inner } from './inner';\nexport function read() { return inner(); }\n`, 'inner.ts': `export const STACK: number[] = [];\nexport function inner() { STACK.pop(); return 0; }\n`, 'main.ts': '' },
    fails: /`STACK` of inner\.ts is mutated by pop\(\)/,
  },
  { name: 'a map set', files: { 'shared.ts': `export const SEEN = new Map<string, number>();\nexport function read() { return SEEN.get('a'); }\n`, 'main.ts': `import { SEEN } from './shared';\nexport function see() { SEEN.set('a', 1); }\n` }, fails: /`SEEN` of shared\.ts is mutated by set\(\)/ },
];

let failed = 0;
for (const c of cases) {
  const dir = mkdtempSync(join(tmpdir(), 'worker-state-'));
  try {
    mkdirSync(dir, { recursive: true });
    const files = { 'audio.worker.ts': worker, ...c.files };
    for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
    const paths = Object.keys(files).map((f) => join(dir, f));
    const program = ts.createProgram(paths, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, noEmit: true, strict: true, types: [] });
    const writes = sharedWorkerState(program, [join(dir, 'audio.worker.ts')], new Set(paths));
    const message = writes.length ? sharedWorkerStateError(writes, dir).message : null;
    const ok = c.fails ? !!message && c.fails.test(message) && /move this state into the worker script, or pass it with postMessage/.test(message) : message === null;
    if (!ok) failed++;
    console.log(`${ok ? '✓' : '✗'} ${c.name}${ok ? '' : `\n  got: ${message ?? 'no error'}`}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
console.log(`${cases.length - failed} of ${cases.length} cases pass`);
process.exit(failed ? 1 : 0);
