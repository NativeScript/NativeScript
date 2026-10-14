#!/usr/bin/env node
// Host perf harness: the bench app's CPU workloads (workloads/cpu.ts, bench/app/cpu.ts with the same
// checksums) compiled as a release build of each native backend, timed against Node: `node --jitless`
// is the iOS reference (V8 without a JIT, as on devices), `node` the Android one.
//   node tests/perf/run.ts [workload…] [--swift | --kotlin] [--repeat N] [--json out.json] [--baseline before.json]
// A workload name selects every workload starting with it. Each program runs --repeat times (default 3),
// the three alternating; a cell is the median of the runs' medians. --json saves the table's numbers, and
// --baseline adds a column with an earlier run's (same target) for before/after.
// The backends' own switches: tests/perf/swift.ts (--O, --no-lto).
// Build products go to $NS_PERF_BUILD (default: <tmp>/ns-native-perf).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import type { Backend } from './backend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const build = process.env.NS_PERF_BUILD ?? join(tmpdir(), 'ns-native-perf');
const argv = process.argv.slice(2);
const option = (name: string) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
};
const valued = new Set(['--repeat', '--json', '--baseline']);
const selection = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
const repeat = Number(option('--repeat') ?? 3);
const known = readdirSync(here).filter((f) => f.endsWith('.ts') && !['run.ts', 'backend.ts'].includes(f)).map((f) => f.replace(/\.ts$/, ''));
const targets = known.filter((t) => argv.includes(`--${t}`));
if (!targets.length) targets.push(...known);

interface Stat { m: number; p90: number; n: number; c: number }
type Results = Record<string, Stat>;

/** The workloads copied into `dir` with the selection written beside them, as both Node and the backends build them. */
function stage(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(join(here, 'workloads'))) writeFileSync(join(dir, f), readFileSync(join(here, 'workloads', f)));
  const names = selection.length ? workloadNames().filter((n) => selection.some((s) => n.startsWith(s))) : [];
  if (selection.length && !names.length) throw new Error(`no workload starts with ${selection.join(', ')}`);
  writeFileSync(join(dir, 'selection.ts'), `export const selection: string[] = ${JSON.stringify(names)};\n`);
}

function workloadNames(): string[] {
  return [...readFileSync(join(here, 'workloads/cpu.ts'), 'utf8').matchAll(/progress\('([^']+)'\)/g)].map((m) => m[1]);
}

/** The staged workloads as JavaScript for Node, as an app's bundler compiles TypeScript. */
function toJavaScript(src: string, out: string): string {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'package.json'), '{ "type": "module" }');
  for (const f of readdirSync(src).filter((f) => f.endsWith('.ts') && !/\.(ios|android)\.ts$/.test(f))) {
    const { outputText } = ts.transpileModule(readFileSync(join(src, f), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, rewriteRelativeImportExtensions: true } });
    writeFileSync(join(out, f.replace(/\.ts$/, '.js')), outputText.replace(/(from\s+'\.\/[\w-]+)(')/g, '$1.js$2'));
  }
  return join(out, 'bench.js');
}

function runOnce(command: string[]): Results {
  const r = spawnSync(command[0], command.slice(1), { encoding: 'utf8', maxBuffer: 64 << 20, timeout: 15 * 60_000 });
  const line = r.stdout.trim().split('\n').pop() ?? '';
  if (r.status !== 0 || !line.startsWith('{')) throw new Error(`${command.join(' ')} exited ${r.status ?? r.signal}:\n${(r.stderr || r.stdout).slice(0, 2000)}`);
  const all = JSON.parse(line) as Results;
  return Object.fromEntries(Object.entries(all).filter(([name, s]) => s.n > 0 && name !== 'json-bytes'));
}

const median = (xs: number[]) => {
  const s = xs.slice().sort((a, b) => a - b);
  const k = Math.floor(s.length / 2);
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
};

/** Each command run `repeat` times, alternating; per workload, the median of the runs' medians and the checksums seen. */
function measureAll(commands: Record<string, string[]>): Record<string, Record<string, { ms: number; checks: Set<number> }>> {
  const runs: Record<string, Results[]> = Object.fromEntries(Object.keys(commands).map((k) => [k, []]));
  for (let i = 0; i < repeat; i++) for (const [k, c] of Object.entries(commands)) runs[k].push(runOnce(c));
  return Object.fromEntries(Object.entries(runs).map(([k, rs]) => [k, Object.fromEntries(Object.keys(rs[0]).map((w) => [w, { ms: median(rs.map((r) => r[w].m)), checks: new Set(rs.map((r) => r[w].c)) }]))]));
}

const fmt = (ms: number) => (ms >= 100 ? ms.toFixed(0) : ms >= 10 ? ms.toFixed(1) : ms.toFixed(2));
const ratio = (a: number, b: number) => (b > 0 ? (a / b).toFixed(2) + '×' : '—');

let failed = false;
const stageDir = join(build, 'src');
stage(stageDir);
const nodeMain = toJavaScript(stageDir, join(build, 'js'));
for (const target of targets) {
  const { backend } = (await import(`./${target}.ts`)) as { backend: Backend };
  const out = join(build, target);
  console.log(`${target}: building (${backend.describe(argv)})…`);
  const native = backend.build(stageDir, out, argv);
  console.log(`${target}: running ${repeat}× each against node --jitless and node…`);
  const m = measureAll({ native, jitless: [process.execPath, '--jitless', nodeMain], node: [process.execPath, nodeMain] });
  const baseline = option('--baseline') ? (JSON.parse(readFileSync(option('--baseline')!, 'utf8')) as Record<string, Record<string, number>>)[target] : undefined;
  const rows = Object.keys(m.native).map((w) => {
    const n = m.native[w], j = m.jitless[w], v = m.node[w];
    const same = n.checks.size === 1 && j.checks.size === 1 && [...n.checks][0] === [...j.checks][0];
    if (!same) failed = true;
    return [w, ...(baseline ? [baseline[w] !== undefined ? fmt(baseline[w]) : '—'] : []), fmt(n.ms), fmt(j.ms), fmt(v.ms), ...(baseline ? [baseline[w] !== undefined ? ratio(baseline[w], j.ms) : '—'] : []), ratio(n.ms, j.ms), ratio(n.ms, v.ms), same ? '✓' : `✗ ${[...n.checks].join('/')} vs ${[...j.checks].join('/')}`];
  });
  const head = ['Workload', ...(baseline ? ['Before ms'] : []), `${target} ms`, 'jitless ms', 'node ms', ...(baseline ? ['Before ÷ jitless'] : []), `÷ jitless`, `÷ node`, 'Check'];
  const right = (i: number) => i > 0 && i < head.length - 1;
  console.log(`\n| ${head.join(' | ')} |\n| ${head.map((_, i) => (right(i) ? '---:' : '---')).join(' | ')} |`);
  for (const r of rows) console.log(`| ${r.join(' | ')} |`);
  console.log('');
  if (option('--json')) {
    const file = option('--json')!;
    const saved = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
    saved[target] = Object.fromEntries(Object.entries(m.native).map(([w, s]) => [w, s.ms]));
    saved[`${target}:jitless`] = Object.fromEntries(Object.entries(m.jitless).map(([w, s]) => [w, s.ms]));
    writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
  }
}
if (failed) console.log('✗ a checksum differs from Node: the native program did different work');
process.exit(failed ? 1 : 0);
