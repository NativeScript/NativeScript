#!/usr/bin/env node
// Type-violation fuzzing: each diff case (tests/diff/cases) and each case here (tests/fuzz/cases) is instrumented so that
// one typed value at a boundary (an argument, a callback's argument, a field, an object literal's field, a return, an `as`
// operand, an optional chain's operand, a typed variable) can be replaced by undefined, null, a wrong primitive or a wrong
// object, through `any`, keeping the site's static type. The instrumented case is built once per backend; each run picks
// one site and one value. Node is the referee: the native run must print what Node prints and fail as Node fails, with the
// same error text when an error is uncaught.
//   node tests/fuzz/run.ts [case-prefix…] [--swift | --kotlin] [--set merge|nightly] [--seed n] [--jobs n] [--keep]
//                          [--json <file>] [--update-baseline] [--variant <line:col:kind>/<value>]
// --set merge (the default) is the per-merge subset: the cases and sites `--seed` draws, sized for about three minutes per backend.
// --set nightly runs every reached site of every case with four values each.
// Failures listed in known-fuzz-failures.json are reported and don't fail the run; anything else does.
// Build products go to $NS_FUZZ_BUILD (default: <tmp>/ns-native-fuzz), one case at a time, deleted after it unless --keep.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { cpus, tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { createProgram } from '../../src/program.ts';
import { buildKotlinRuntime, buildSwiftRuntime, kotlinc, kotlinStdlib, modulesDir, SWIFT_HEADER, translateKotlin, translateSwift } from '../native-build.ts';
import { appLenient, kotlinOptions, lenient, pluginCase, runsOn, swiftOptions } from '../diff/case-options.ts';
import { BAD_VALUES, findSites, groups, hookSource, HOOK, instrument, nodeHookSource, standalone, valueKind, valuesFor, type Site } from './instrument.ts';

const here = dirname(fileURLToPath(import.meta.url));
const diffCases = join(here, '../diff/cases');
const ownCases = join(here, 'cases');
const argv = process.argv.slice(2);
const flag = (name: string) => { const k = argv.indexOf(name); return k >= 0 ? argv[k + 1] : undefined; };
const valued = new Set(['--set', '--seed', '--jobs', '--json', '--variant']);
const prefixes = argv.filter((a, k) => !a.startsWith('--') && !valued.has(argv[k - 1]));
const targets = argv.includes('--swift') ? ['swift'] : argv.includes('--kotlin') ? ['kotlin'] : ['swift', 'kotlin'];
const set = flag('--set') ?? 'merge';
const seed = Number(flag('--seed') ?? 1);
const jobs = Number(flag('--jobs') ?? Math.max(2, Math.min(8, cpus().length >> 1)));
const keep = argv.includes('--keep');
const only = flag('--variant');
const build = process.env.NS_FUZZ_BUILD ?? join(tmpdir(), 'ns-native-fuzz');
const baselineFile = join(here, 'known-fuzz-failures.json');
if (set !== 'merge' && set !== 'nightly') throw new Error(`--set is merge or nightly, not ${set}`);
process.env.NS_NATIVE_DIAGNOSTICS = '1000';

/** The per-merge subset: this many cases (less those slower than slowMs under Node), and per case this many sites with two of their values. */
const MERGE = { cases: 70, sites: 6, values: 2, slowMs: 1500 };
const TIMEOUT = { node: 10_000, swift: 10_000, kotlin: 30_000 };

// ---- Seeded choice ---------------------------------------------------------------------------------

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 0x01000193);
  return h >>> 0;
}
/** A generator seeded by `key`, so one site's draw doesn't depend on which other sites exist. */
function random(key: string): () => number {
  let a = hash(`${seed}/${key}`);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function sample<T>(list: T[], n: number, key: string): T[] {
  const r = random(key);
  return list.map((x) => [r(), x] as const).sort((a, b) => a[0] - b[0]).slice(0, n).map((p) => p[1]);
}

// ---- Processes ---------------------------------------------------------------------------------------

interface Run { stdout: string; stderr: string; status: number | null; signal: string | null; timedOut: boolean }

function exec(cmd: string, args: string[], timeout: number, env?: Record<string, string>): Promise<Run> {
  return new Promise((done) => {
    const p = spawn(cmd, args, { env: env ? { ...process.env, ...env } : process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false;
    p.stdout.on('data', (d) => { if (stdout.length < 1 << 20) stdout += d; });
    p.stderr.on('data', (d) => { if (stderr.length < 1 << 16) stderr += d; });
    const timer = setTimeout(() => { timedOut = true; p.kill('SIGKILL'); }, timeout);
    p.on('close', (status, signal) => { clearTimeout(timer); done({ stdout, stderr, status, signal, timedOut }); });
  });
}

async function pool<T, R>(items: T[], n: number, f: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) { const k = next++; out[k] = await f(items[k]); }
  }));
  return out;
}

// ---- Comparing -----------------------------------------------------------------------------------------

/** The uncaught error's `Name: message` as either side prints it. */
function errorText(stderr: string): string | null {
  const m = /(?:^|\s)([A-Z][A-Za-z]*Error): (.*)$/m.exec(stderr);
  return m ? `${m[1]}: ${m[2].trim()}` : null;
}

/** A trap: a signal, or on the JVM an exception the runtime never turns into a JS error. */
function trapText(target: string, r: Run): string | null {
  if (r.signal && !r.timedOut) {
    const fatal = /Fatal error: ([^\n]*)/.exec(r.stderr)?.[1] ?? /(\S+: )?(error|precondition failure|assertion failure)[^\n]*/i.exec(r.stderr)?.[0] ?? '';
    return `${r.signal}${fatal ? ': ' + fatal : ''}`;
  }
  if (target === 'kotlin' && r.status !== 0) {
    const m = /Exception in thread "main" ((?:java|kotlin)\.[\w.$]+(?:Exception|Error))(?:: ([^\n]*))?/.exec(r.stderr);
    if (m && !/JSException/.test(m[1])) return `${m[1]}${m[2] ? ': ' + m[2] : ''}`;
  }
  return null;
}

/** The error names a printed line holds (`TypeError` in `caught TypeError: …`). */
const errorNames = (s: string | undefined) => new Set(s?.match(/\b[A-Z][A-Za-z]*Error\b/g) ?? []);
/** What a message says with the program's own names and numbers taken out, to group failures by cause. */
const normalize = (s: string) => s.replace(/\/[^\s:]+/g, '<path>').replace(/'[^']*'|"[^"]*"/g, "'…'").replace(/\b\d+(\.\d+)?\b/g, 'N').slice(0, 140);

/** From a printed line, the part from its first error name on. */
const errorAt = (s: string) => /\b[A-Z][A-Za-z]*Error\b.*/.exec(s)?.[0] ?? s;

/** A native program reports an uncaught error and goes on, as an app does: the run failed all the same. */
const succeeded = (r: Run) => r.status === 0 && !/^Uncaught /m.test(r.stderr);

/** A compiler's message without the code it quotes, which kotlinc appends after the message's first sentence. */
const compileCause = (s: string) => normalize(s.replace(/^\S*: (error: )?/, '').split(/\.\s|\s{2,}/)[0]);

interface Outcome { pass: boolean; cause?: string; detail?: string; node?: string; native?: string }

/** What the first differing word of a line became, by shape: `null → undefined`, `N → NaN`. */
function valueChange(node: string | undefined, native: string | undefined): string {
  if (native === undefined) return 'output stops early';
  if (node === undefined) return 'output Node does not print';
  const words = (s: string) => s.split(/(\s+|[|,;()[\]{}])/).filter((w) => w && !/^\s+$/.test(w));
  const a = words(node), b = words(native);
  let k = 0;
  while (k < a.length && k < b.length && a[k] === b[k]) k++;
  const shape = (w: string | undefined) => (w === undefined ? '(nothing)' : /^-?\d+(\.\d+)?(e[+-]?\d+)?$/.test(w) ? 'N' : /^(null|undefined|NaN|true|false|object|Object]|\[object|Infinity)$/.test(w) ? w : w.length <= 1 ? JSON.stringify(w) : 'text');
  return `${shape(a[k])} → ${shape(b[k])}`;
}

/** V8 names the callee as written in its "is not a function" messages; the guards around a site change how it is written. */
const calleeFree = (s: string) => s.replace(/\(intermediate value\)/g, 'IV').replace(/\S+ is not (a function|iterable|a constructor)/g, '… is not $1');

function compare(target: string, wantRaw: Run, gotRaw: Run): Outcome {
  const want = { ...wantRaw, stdout: calleeFree(wantRaw.stdout), stderr: calleeFree(wantRaw.stderr) };
  const got = { ...gotRaw, stdout: calleeFree(gotRaw.stdout), stderr: calleeFree(gotRaw.stderr) };
  const wantOk = succeeded(want), gotOk = succeeded(got);
  const wantErr = wantOk ? null : errorText(want.stderr), gotErr = gotOk ? null : errorText(got.stderr);
  if (got.stdout === want.stdout && wantOk === gotOk && (wantOk || !wantErr || wantErr === gotErr)) return { pass: true };
  const e = want.stdout.split('\n'), a = got.stdout.split('\n');
  let k = 0;
  while (k < Math.max(e.length, a.length) && e[k] === a[k]) k++;
  const first = { node: e[k], native: a[k] };
  if (got.timedOut) return { pass: false, cause: 'timeout', detail: 'timed out', ...first };
  const trap = trapText(target, got);
  if (trap) return { pass: false, cause: 'trap', detail: normalize(trap), ...first };
  // Output up to where one side stopped matches: the difference is whether, or with what, it threw.
  const prefixSame = k >= Math.min(e.length, a.length) - 1;
  if (wantOk && !gotOk && prefixSame) return { pass: false, cause: 'throws (Node does not)', detail: normalize(gotErr ?? got.stderr.split('\n')[0] ?? ''), node: e[k], native: gotErr ?? '' };
  if (!wantOk && gotOk && prefixSame) return { pass: false, cause: 'no throw (Node throws)', detail: normalize(wantErr ?? ''), node: wantErr ?? '', native: a[k] };
  if (!wantOk && !gotOk && prefixSame) return { pass: false, cause: 'other error text', detail: `${normalize(gotErr ?? '?')}  (Node: ${normalize(wantErr ?? '?')})`, node: wantErr ?? '', native: gotErr ?? '' };
  const nodeNames = errorNames(first.node), nativeNames = errorNames(first.native);
  const extra = [...nativeNames].some((n) => !nodeNames.has(n)), missing = [...nodeNames].some((n) => !nativeNames.has(n));
  if (extra && !missing) return { pass: false, cause: 'throws (Node does not)', detail: normalize(errorAt(first.native!)), ...first };
  if (missing && !extra) return { pass: false, cause: 'no throw (Node throws)', detail: normalize(errorAt(first.node!)), ...first };
  if (extra && missing) return { pass: false, cause: 'other error text', detail: `${normalize(errorAt(first.native!))}  (Node: ${normalize(errorAt(first.node!))})`, ...first };
  if (nativeNames.size && first.native !== undefined && first.node !== undefined && errorAt(first.native) !== errorAt(first.node)) return { pass: false, cause: 'other error text', detail: `${normalize(errorAt(first.native))}  (Node: ${normalize(errorAt(first.node))})`, ...first };
  return { pass: false, cause: 'other value', detail: valueChange(first.node, first.native), ...first };
}

// ---- Cases -----------------------------------------------------------------------------------------

interface Prepared {
  name: string;
  file: string;
  text: string;
  sites: Site[];
  dir: string;
  instrumented: string;
  /** Sites the instrumented case doesn't type-check with, each with the diagnostic. */
  dropped: Map<number, string>;
}

/** One build of a case: its sites in one group (instrument.ts `groups`), in a directory of their own. */
interface Unit extends Prepared {
  caseName: string;
  group: Site[];
}

function unitOf(p: Prepared, k: number, group: Site[]): Unit {
  const dir = join(p.dir, `g${k}`);
  mkdirSync(dir, { recursive: true });
  linkHelpers(dir, dirname(p.file));
  writeFileSync(join(dir, HOOK + '.ts'), hookSource());
  const instrumented = join(dir, basename(p.instrumented));
  writeFileSync(instrumented, instrument(p.text, group).text);
  return { ...p, name: `${p.name}-g${k}`, caseName: p.name, dir, instrumented, group };
}

function overrides(file: string): ts.CompilerOptions {
  return lenient(file) ? { strict: false, useDefineForClassFields: false } : pluginCase(file) || appLenient(file) ? { strict: false, useUnknownInCatchVariables: false } : {};
}

function linkHelpers(dir: string, from: string) {
  const helpers = join(from, 'helpers');
  if (existsSync(helpers) && !existsSync(join(dir, 'helpers'))) symlinkSync(helpers, join(dir, 'helpers'));
}

/** The case's sites, and its instrumented text in `<build>/src/<name>/`, without the sites it doesn't type-check with. */
function prepare(file: string): Prepared | { name: string; error: string } {
  const name = basename(file, '.ts');
  const text = readFileSync(file, 'utf8');
  let sites: Site[];
  try {
    const { checker, program } = createProgram([file], new Map(), 'ios', modulesDir, undefined, [], {}, overrides(file));
    sites = findSites(checker, program.getSourceFile(file)!);
  } catch (e) {
    return { name, error: `does not type-check: ${(e as Error).message.split('\n').slice(0, 3).join(' ')}` };
  }
  const dir = join(build, 'src', name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  linkHelpers(dir, dirname(file));
  writeFileSync(join(dir, HOOK + '.ts'), hookSource());
  const target = join(dir, name + '.ts');
  writeFileSync(target, instrument(text, sites).text);
  return { name, file, text, sites, dir, instrumented: target, dropped: new Map() };
}

/**
 * The sites a build's type-check error is in: the innermost site holding each diagnostic, whose replacement doesn't fit
 * there. They are left out on every backend, as not a variant at all.
 */
function untypable(p: Prepared, kept: Site[], message: string): Site[] {
  if (!/does not type-check/.test(message)) return [];
  const { text: out, spans } = instrument(p.text, kept);
  const lines = out.split('\n');
  const starts = lines.reduce<number[]>((acc, l, k) => (acc.push(k ? acc[k - 1] + lines[k - 1].length + 1 : 0), acc), []);
  const found: Site[] = [];
  for (const m of message.matchAll(/^(\S+)\((\d+),(\d+)\): (error [^\n]*)/gm)) {
    if (m[1] !== p.instrumented) continue;
    const at = starts[Number(m[2]) - 1] + Number(m[3]) - 1;
    const site = kept.filter((s) => spans.get(s.id)![0] <= at && at < spans.get(s.id)![1]).sort((x, y) => spans.get(y.id)![0] - spans.get(x.id)![0])[0];
    if (site && !found.includes(site)) { found.push(site); p.dropped.set(site.id, m[4]); }
  }
  return found;
}

// ---- Node, the referee ------------------------------------------------------------------------------

const nodeShim = join(here, '../diff/native-shim.js');

function toNode(p: Prepared): string {
  const dir = join(build, 'node', p.name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(build, 'node', 'package.json'), '{ "type": "module" }');
  const js = (text: string) => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, rewriteRelativeImportExtensions: true, ...(text.startsWith('// @lenient') ? { useDefineForClassFields: false } : {}) } }).outputText;
  writeFileSync(join(dir, p.name + '.js'), js(readFileSync(p.instrumented, 'utf8')));
  writeFileSync(join(dir, HOOK + '.js'), nodeHookSource());
  const helpers = join(dirname(p.file), 'helpers');
  if (existsSync(helpers)) {
    const out = join(build, 'node-helpers', basename(dirname(p.file)));
    if (!existsSync(out)) {
      for (const f of readdirSync(helpers, { recursive: true }) as string[]) {
        if (!f.endsWith('.ts')) continue;
        mkdirSync(dirname(join(out, f)), { recursive: true });
        writeFileSync(join(out, f.replace(/\.ts$/, '.js')), js(readFileSync(join(helpers, f), 'utf8')));
      }
    }
    symlinkSync(out, join(dir, 'helpers'));
  }
  return join(dir, p.name + '.js');
}

const runNode = (entry: string, env: Record<string, string>) => exec('node', ['--expose-gc', '--import', nodeShim, entry], TIMEOUT.node, env);

// ---- Native builds -----------------------------------------------------------------------------------

interface Native { run: (variant: string) => Promise<Run>; cleanup: () => void }

/**
 * The sites a compiler's errors are in: the guards (`__fz(<id>)`) on or just above the generated line an error names, or,
 * where an error names the case's own line, the sites on that line.
 */
function blame(p: Prepared, errors: string[], sites: Site[]): Site[] {
  const ids = new Set<number>();
  const lines = new Set<number>();
  for (const e of errors) {
    const m = /^(\/[^:]+):(\d+):/.exec(e);
    if (!m) continue;
    if (m[1] === p.instrumented) { lines.add(Number(m[2])); continue; }
    if (!existsSync(m[1])) continue;
    const generated = readFileSync(m[1], 'utf8').split('\n');
    for (let k = Number(m[2]) - 1; k >= Math.max(0, Number(m[2]) - 4); k--) {
      const found = [...(generated[k] ?? '').matchAll(/__fz\((\d+)/g)].map((x) => Number(x[1]));
      if (found.length) { found.forEach((id) => ids.add(id)); break; }
    }
  }
  return sites.filter((s) => ids.has(s.id) || lines.has(s.line));
}

type Built = { native: Native | null; failed: Map<number, string>; error?: string };

/** The case translated and compiled with guards at `sites`: null when it builds, else what stopped it. */
async function swiftOnce(p: Prepared, sites: Site[], dir: string): Promise<{ refused?: string; errors?: string[] } | null> {
  writeFileSync(p.instrumented, instrument(p.text, sites).text);
  try {
    const modules = translateSwift([p.instrumented], join(dir, 'Sources'), swiftOptions(p.file));
    writeFileSync(join(dir, 'Sources', 'main.swift'), `${SWIFT_HEADER}try! jsSet(jsGlobalThis, "__fuzz", CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "")\n${modules.filter((m) => m.init).map((m) => `${m.init}()\n`).join('')}JSEventLoop.runUntilIdle()\n`);
  } catch (e) {
    return { refused: (e as Error).message };
  }
  // Without the case's line directives, swiftc's errors name generated lines, where the guards' ids are.
  for (const f of readdirSync(join(dir, 'Sources'))) writeFileSync(join(dir, 'Sources', f), readFileSync(join(dir, 'Sources', f), 'utf8').replace(/^[ \t]*#sourceLocation\(.*\)[ \t]*$/gm, ''));
  const errors = await swiftcAsync(readdirSync(join(dir, 'Sources')).map((f) => join(dir, 'Sources', f)), join(dir, p.name));
  return errors ? { errors } : null;
}

async function buildSwift(p: Prepared, sites: Site[]): Promise<Built> {
  const failed = new Map<number, string>();
  const dir = join(build, 'swift', p.name);
  for (let round = 0; round < 10; round++) {
    const kept = sites.filter((s) => !failed.has(s.id) && !p.dropped.has(s.id));
    const r = await swiftOnce(p, kept, dir);
    if (!r) {
      const exe = join(dir, p.name);
      return { native: { run: (v) => exec(exe, v ? [v] : [], TIMEOUT.swift), cleanup: () => rmSync(dir, { recursive: true, force: true }) }, failed };
    }
    if (r.refused !== undefined && untypable(p, kept, r.refused).length) continue;
    const why = r.refused !== undefined ? `refused: ${r.refused.split('\n')[0].slice(0, 160)}` : `swiftc: ${r.errors![0].replace(/^.*?error: /, '')}`;
    let bad = r.errors ? blame(p, r.errors, kept) : [];
    // An error no guard is on (the translator's, or swiftc's in the shapes file): the sites causing it, by halves.
    if (!bad.length) bad = (await bisect(kept, async (subset) => !(await swiftOnce(p, subset, dir)))) ?? [];
    if (!bad.length) return { native: null, failed, error: why };
    for (const s of bad) failed.set(s.id, why);
  }
  return { native: null, failed, error: 'swiftc: still failing after dropping sites' };
}

function swiftcAsync(sources: string[], exe: string): Promise<string[] | null> {
  // swiftc blocks: run it in a child so several compile at once.
  const script = `import { swiftc } from ${JSON.stringify(join(here, '../native-build.ts'))};\nconst e = swiftc(${JSON.stringify(sources)}, ${JSON.stringify(exe)}, ${JSON.stringify(build)}, '-Onone');\nprocess.stdout.write(JSON.stringify(e));\n`;
  return exec('node', ['--input-type=module', '-e', script], 600_000).then((r) => (r.status === 0 ? JSON.parse(r.stdout || 'null') : [r.stderr.slice(0, 500)]));
}

/** The sites without which `ok` holds, found by halving; null when even none of them holds. */
async function bisect(sites: Site[], ok: (subset: Site[]) => boolean | Promise<boolean>): Promise<Site[] | null> {
  if (!(await ok([]))) return null;
  const bad: Site[] = [];
  const search = async (list: Site[], others: Site[]) => {
    if (!list.length || (await ok([...others, ...list]))) return;
    if (list.length === 1) { bad.push(list[0]); return; }
    const half = list.length >> 1;
    await search(list.slice(0, half), others);
    await search(list.slice(half), others.concat(list.slice(0, half).filter((s) => !bad.includes(s))));
  };
  await search(sites, []);
  return bad;
}

/** Every case's Kotlin compiled in one kotlinc run, as the diff run does; a case that breaks it is compiled alone. */
async function buildKotlin(ps: { p: Prepared; sites: Site[] }[]): Promise<Map<string, Built>> {
  const out = new Map<string, Built>();
  const runtime = buildKotlinRuntime(build);
  const pkg = (name: string) => 'fz_' + name.replace(/\W/g, '_');
  const sourcesDir = (name: string) => join(build, 'kotlin', name);
  const translate = (p: Prepared, all: Site[]): string | null => {
    for (let round = 0; round < 10; round++) {
      const kept = all.filter((s) => !p.dropped.has(s.id));
      const error = translateOnce(p, kept);
      if (!error || !untypable(p, kept, error).length) return error && error.split('\n')[0];
    }
    return 'the instrumented case does not type-check after dropping sites';
  };
  const translateOnce = (p: Prepared, kept: Site[]): string | null => {
    writeFileSync(p.instrumented, instrument(p.text, kept).text);
    try {
      const modules = translateKotlin([p.instrumented], sourcesDir(p.name), pkg(p.name), kotlinOptions(p.file));
      const inits = modules.filter((m) => m.init).map((m) => `    ${m.init}()\n`).join('');
      writeFileSync(join(sourcesDir(p.name), '__Main.kt'), `package ${pkg(p.name)}.entry\n\nimport org.nativescript.kit.*\nimport ${pkg(p.name)}.*\n\nfun main(args: Array<String>) {\n    jsGlobalThis.jsSet("__fuzz", args.firstOrNull() ?: "")\n${inits}    JSEventLoop.runUntilIdle()\n    System.out.flush()\n}\n`);
      return null;
    } catch (e) { return (e as Error).message; }
  };
  const ready: { p: Prepared; kept: Site[]; failed: Map<number, string> }[] = [];
  for (const { p, sites } of ps) {
    const failed = new Map<number, string>();
    let error = translate(p, sites);
    if (error) {
      const refused = await bisect(sites, (subset) => translate(p, subset) === null);
      if (refused === null) { out.set(p.name, { native: null, failed, error: `translator: ${error}` }); continue; }
      for (const s of refused) failed.set(s.id, `refused: ${error.slice(0, 160)}`);
      error = translate(p, sites.filter((s) => !failed.has(s.id)));
      if (error) { out.set(p.name, { native: null, failed, error: `translator: ${error}` }); continue; }
    }
    ready.push({ p, kept: sites.filter((s) => !failed.has(s.id)), failed });
  }
  const sourcesOf = (name: string) => readdirSync(sourcesDir(name)).map((f) => join(sourcesDir(name), f));
  const classes = join(build, 'kotlin-classes');
  const runner = (name: string): Native => ({
    run: (v) => exec('java', ['-Xss16m', '-XX:TieredStopAtLevel=1', '-cp', [classes, runtime, kotlinStdlib()].join(':'), `${pkg(name)}.entry.__MainKt`, ...(v ? [v] : [])], TIMEOUT.kotlin),
    cleanup: () => rmSync(sourcesDir(name), { recursive: true, force: true }),
  });
  // One kotlinc run for every case; the cases its errors are in lose the sites the errors are at, and it runs again.
  let compiled = false;
  for (let round = 0; round < 6 && ready.length; round++) {
    const errors = kotlinc(ready.flatMap((r) => sourcesOf(r.p.name)), classes, [runtime]);
    if (!errors) { compiled = true; break; }
    const byCase = new Map<string, string[]>();
    for (const e of errors) {
      const r = ready.find((x) => e.startsWith(sourcesDir(x.p.name) + '/'));
      if (r) byCase.set(r.p.name, [...(byCase.get(r.p.name) ?? []), e]);
    }
    if (!byCase.size) {
      for (const r of ready) out.set(r.p.name, { native: null, failed: r.failed, error: `kotlinc: ${errors[0]}` });
      ready.length = 0;
      break;
    }
    for (const [name, errs] of byCase) {
      const r = ready.find((x) => x.p.name === name)!;
      const blamed = blame(r.p, errs, r.kept.filter((s) => !r.failed.has(s.id)));
      const error = blamed.length ? (blamed.forEach((s) => r.failed.set(s.id, `kotlinc: ${errs[0].replace(/^.*?error: /, '')}`)), translate(r.p, r.kept.filter((s) => !r.failed.has(s.id)))) : `kotlinc: ${errs[0]}`;
      if (error) {
        out.set(name, { native: null, failed: r.failed, error: error.startsWith('kotlinc') ? error : `translator: ${error}` });
        rmSync(sourcesDir(name), { recursive: true, force: true });
        ready.splice(ready.indexOf(r), 1);
      }
    }
  }
  for (const r of ready) out.set(r.p.name, compiled ? { native: runner(r.p.name), failed: r.failed } : { native: null, failed: r.failed, error: 'kotlinc: still failing after dropping sites' });
  return out;
}

// ---- The run -----------------------------------------------------------------------------------------

interface Variant { p: Prepared; site: Site; value: number; key: string; want?: Run }
interface Failure { key: string; target: string; case: string; site: string; kind: string; value: string; cause: string; detail: string; node?: string; native?: string; repro: string; known: boolean }

const variantKey = (p: Prepared, s: Site, v: number) => `${p.name}|${s.key}|${BAD_VALUES[v]}`;

/** The statement holding the site, with the site replaced: what a failure's report shows to reproduce it. */
function snippet(p: Prepared, s: Site, v: number): string {
  const text = standalone(p.text, s, v);
  const lineStart = p.text.lastIndexOf('\n', s.start) + 1;
  let lineEnd = text.indexOf('\n', s.start + (text.length - p.text.length));
  if (lineEnd < 0) lineEnd = text.length;
  return text.slice(lineStart, lineEnd).trim().slice(0, 220);
}

const caseFiles = [
  ...readdirSync(diffCases).filter((f) => f.endsWith('.ts')).map((f) => join(diffCases, f)),
  ...(existsSync(ownCases) ? readdirSync(ownCases).filter((f) => f.endsWith('.ts')).map((f) => join(ownCases, f)) : []),
].filter((f) => !prefixes.length || prefixes.some((a) => basename(f).startsWith(a))).sort((a, b) => basename(a).localeCompare(basename(b)));
const knownDiff = JSON.parse(readFileSync(join(diffCases, '../known-failures.json'), 'utf8'));
const baseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')) : {};

mkdirSync(build, { recursive: true });
const started = Date.now();
const report: Record<string, unknown> = { seed, set, targets, started: new Date().toISOString() };
const allFailures: Failure[] = [];
let regressions = 0;
const nowPassing: string[] = [];
const ranKeys: Record<string, Set<string>> = {};

// The merge subset's cases: a seeded draw, the same for both backends.
const chosenCases = set === 'merge' && !prefixes.length ? new Set(sample(caseFiles, MERGE.cases, 'cases').map((f) => basename(f, '.ts'))) : null;

const prepared: Prepared[] = [];
const skipped: Record<string, string> = {};
for (const file of caseFiles) {
  const name = basename(file, '.ts');
  if (chosenCases && !chosenCases.has(name)) continue;
  if (!targets.some((t) => runsOn(file, t as 'swift' | 'kotlin') && !knownDiff[t]?.[name])) continue;
  const p = prepare(file);
  if ('error' in p) { skipped[name] = p.error; continue; }
  prepared.push(p);
}
console.log(`fuzz: ${prepared.length} cases instrumented, ${Object.keys(skipped).length} skipped (${((Date.now() - started) / 1000).toFixed(0)} s)`);

// Node once per case: the baseline and which sites a run reaches; then each variant.
const variants = new Map<string, Variant[]>();
const nodeBaseline = new Map<string, Run>();
const nodeEntry = new Map<string, string>();
const units: Unit[] = [];
await pool(prepared, jobs, async (p) => {
  const entry = toNode(p);
  const census = join(build, 'node', p.name, 'census.json');
  const t0 = Date.now();
  const base = await runNode(entry, { NS_FUZZ: '', NS_FUZZ_CENSUS: census });
  if (base.timedOut || !existsSync(census)) { skipped[p.name] = 'Node baseline timed out or wrote no census'; return; }
  // Every variant runs the whole case: the per-merge subset leaves out cases that wait on timers.
  if (chosenCases && Date.now() - t0 > MERGE.slowMs) { skipped[p.name] = `slow under Node (${Date.now() - t0} ms)`; return; }
  nodeBaseline.set(p.name, base);
  const reached = new Set((JSON.parse(readFileSync(census, 'utf8')) as [number, number][]).map(([id]) => id));
  let sites = p.sites.filter((s) => reached.has(s.id));
  if (chosenCases) sites = sample(sites, MERGE.sites, `sites/${p.name}`);
  const list: Variant[] = [];
  for (const s of sites) {
    let values = [...new Set(valuesFor(s, random(`${p.name}/${s.key}`)))];
    if (chosenCases) values = sample(values, MERGE.values, `values/${p.name}/${s.key}`);
    for (const v of values) {
      const key = variantKey(p, s, v);
      if (only && `${s.key}/${v}` !== only && `${s.key}/${BAD_VALUES[v]}` !== only) continue;
      list.push({ p, site: s, value: v, key });
    }
  }
  variants.set(p.name, list);
  nodeEntry.set(p.name, entry);
  units.push(...groups([...new Set(list.map((x) => x.site))]).map((g, k) => unitOf(p, k, g)));
});
await pool([...variants.values()].flat(), jobs * 3, async (x) => { x.want = await runNode(nodeEntry.get(x.p.name)!, { NS_FUZZ: `${x.site.id}:${x.value}` }); });
for (const [name, list] of variants) variants.set(name, list.filter((x) => !x.want!.timedOut));
const total = [...variants.values()].reduce((n, l) => n + l.length, 0);
console.log(`fuzz: ${total} variants over ${variants.size} cases, Node done (${((Date.now() - started) / 1000).toFixed(0)} s)`);

for (const target of targets) {
  const t0 = Date.now();
  const failures: Failure[] = [];
  const knownHere: Record<string, string> = baseline[target] ?? {};
  const ran = (ranKeys[target] = new Set());
  let passed = 0, counted = 0, untyped = 0, unrun = 0;
  const flaky: string[] = [];
  const cases = units.filter((u) => runsOn(u.file, target as 'swift' | 'kotlin') && !knownDiff[target]?.[u.caseName]).sort((a, b) => a.name.localeCompare(b.name));
  const record = (x: Variant, o: Outcome) => {
    ran.add(x.key);
    counted++;
    if (o.pass) { passed++; if (knownHere[x.key]) nowPassing.push(`${x.key} (${target})`); return; }
    const known = !!knownHere[x.key];
    if (!known) regressions++;
    failures.push({ key: x.key, target, case: x.p.name, site: x.site.key, kind: x.site.kind, value: BAD_VALUES[x.value], cause: o.cause!, detail: o.detail ?? '', node: o.node, native: o.native, repro: snippet(x.p, x.site, x.value), known });
  };
  const caseBaselines: Record<string, string> = {};
  const runCase = async (p: Unit, built: { native: Native | null; failed: Map<number, string>; error?: string }) => {
    const list = variants.get(p.caseName)!.filter((x) => p.group.includes(x.site));
    if (!built.native) {
      for (const x of list) if (x.p.dropped.has(x.site.id)) untyped++; else record(x, { pass: false, cause: 'compile', detail: compileCause(built.failed.get(x.site.id) ?? built.error ?? '') });
      caseBaselines[p.name] = built.error ?? 'did not build';
      return;
    }
    const base = await built.native.run('');
    const want = nodeBaseline.get(p.caseName)!;
    const b = compare(target, want, base);
    if (!b.pass) {
      // The instrumented case without a wrong value already differs: its variants say nothing.
      caseBaselines[p.name] = `${b.cause}: ${b.detail} (node ${JSON.stringify(b.node)}, native ${JSON.stringify(b.native)})`;
      unrun += list.length;
      if (!keep) built.native.cleanup();
      return;
    }
    await pool(list, target === 'swift' ? jobs : Math.max(2, jobs >> 1), async (x) => {
      if (x.p.dropped.has(x.site.id)) { untyped++; return; }
      const failed = built.failed.get(x.site.id);
      if (failed) { record(x, failed.startsWith('guard alone: ') ? { pass: false, cause: 'guard alone changes the result', detail: failed.slice(13) } : { pass: false, cause: 'compile', detail: compileCause(failed) }); return; }
      const arg = `${x.site.id}:${x.value}`;
      const o = compare(target, x.want!, await built.native!.run(arg));
      if (!o.pass && !knownHere[x.key]) {
        // A new failure counts only if both sides repeat it: timing-dependent output is flaky, not a finding.
        const again = compare(target, await runNode(nodeEntry.get(x.p.name)!, { NS_FUZZ: arg }), await built.native!.run(arg));
        if (again.pass || again.cause !== o.cause || again.detail !== o.detail) { flaky.push(`${x.key} (${target})`); return; }
      }
      record(x, o);
    });
    if (!keep) built.native.cleanup();
  };
  const sitesOf = (u: Unit) => u.group.filter((s) => !u.dropped.has(s.id));
  if (target === 'swift') {
    buildSwiftRuntime(build, '-Onone');
    // Each case's sources are its own: one instrumented copy per case, written before each translation.
    await pool(cases, jobs, async (u) => {
      let built = await buildSwift(u, sitesOf(u));
      const want = nodeBaseline.get(u.caseName)!;
      const base = built.native && compare(target, want, await built.native.run(''));
      if (base && !base.pass) {
        // Guards that change the result while no wrong value is chosen: found by halves, failed with all their variants.
        const kept = sitesOf(u).filter((s) => !built.failed.has(s.id));
        const culprits = await bisect(kept, async (subset) => { const t = await buildSwift(u, subset); return !!t.native && compare(target, want, await t.native.run('')).pass; });
        if (culprits?.length) {
          const failed = built.failed;
          for (const s of culprits) failed.set(s.id, `guard alone: ${base.cause}: ${base.detail}`);
          built = await buildSwift(u, kept.filter((s) => !culprits.includes(s)));
          for (const [id, why] of failed) built.failed.set(id, why);
        }
      }
      await runCase(u, built);
    });
  } else {
    const built = await buildKotlin(cases.map((p) => ({ p, sites: sitesOf(p) })));
    await pool(cases, 2, async (p) => runCase(p, built.get(p.name)!));
    if (!keep) for (const d of readdirSync(build)) if (d.startsWith('kotlin-classes') || d === 'kotlin') rmSync(join(build, d), { recursive: true, force: true });
  }
  const unstable = Object.keys(caseBaselines).length;
  const clusters = new Map<string, Failure[]>();
  for (const f of failures) {
    const k = `${f.cause}: ${f.detail}`;
    clusters.set(k, [...(clusters.get(k) ?? []), f]);
  }
  const ranked = [...clusters].sort((a, b) => b[1].length - a[1].length);
  console.log(`\n${target}: ${passed} of ${counted} variants match Node (${counted ? ((100 * passed) / counted).toFixed(1) : '0'}%), ${failures.filter((f) => !f.known).length} new failures, ${unstable} builds whose instrumented baseline differs (${unrun} variants not run), ${untyped} variants whose replacement doesn't type-check, ${flaky.length} flaky (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  for (const [k, list] of ranked.slice(0, 25)) {
    const byKind = [...new Set(list.map((f) => f.kind))].join(',');
    console.log(`  ${String(list.length).padStart(5)}  ${k}  [${byKind}; ${new Set(list.map((f) => f.case)).size} cases]`);
  }
  const fresh = failures.filter((f) => !f.known);
  for (const f of fresh.slice(0, 40)) {
    console.log(`✗ ${f.case} ${f.site} ← ${f.value} (${target}): ${f.cause}${f.detail ? ': ' + f.detail : ''}`);
    console.log(`    repro:  ${f.repro}`);
    if (f.node !== undefined || f.native !== undefined) console.log(`    node:   ${JSON.stringify(f.node)}\n    native: ${JSON.stringify(f.native)}`);
  }
  if (fresh.length > 40) console.log(`… ${fresh.length - 40} more new failures (--json writes them all)`);
  for (const [n, why] of Object.entries(caseBaselines)) console.log(`  ! ${n} (${target}): ${why.slice(0, 200)}`);
  report[target] = { passed, counted, unrun, untyped, flaky, rate: counted ? passed / counted : 0, unstable: caseBaselines, clusters: ranked.map(([k, l]) => ({ cluster: k, count: l.length, cases: [...new Set(l.map((f) => f.case))].length, kinds: [...new Set(l.map((f) => f.kind))], values: [...new Set(l.map((f) => valueKind(BAD_VALUES.indexOf(f.value))))], example: l[0] })), seconds: Math.round((Date.now() - t0) / 1000) };
  allFailures.push(...failures);
}

report.skipped = skipped;
report.failures = allFailures;
if (flag('--json')) writeFileSync(flag('--json')!, JSON.stringify(report, null, 1));
for (const n of nowPassing.slice(0, 20)) console.log(`✓ ${n} now matches Node: --update-baseline removes it`);
if (nowPassing.length > 20) console.log(`… ${nowPassing.length - 20} more now match Node`);

if (argv.includes('--update-baseline')) {
  const next: Record<string, unknown> = { $comment: baseline.$comment ?? 'Fuzz variants known not to match Node, by backend: `<case>|<line:col:site kind>|<wrong value>` and the failure cluster. tests/fuzz/run.ts fails on a failure not listed here.', seed };
  for (const t of ['swift', 'kotlin']) {
    const entries: Record<string, string> = { ...(baseline[t] ?? {}) };
    for (const k of ranKeys[t] ?? []) delete entries[k];
    for (const f of allFailures.filter((x) => x.target === t)) entries[f.key] = `${f.cause}${f.detail ? ': ' + f.detail : ''}`;
    next[t] = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
  }
  writeFileSync(baselineFile, JSON.stringify(next, null, '\t') + '\n');
  console.log(`fuzz: wrote ${baselineFile}`);
}
if (!keep) rmSync(join(build, 'src'), { recursive: true, force: true });
console.log(`fuzz: ${((Date.now() - started) / 1000).toFixed(0)} s, ${regressions} failures not in known-fuzz-failures.json`);
process.exit(regressions && !argv.includes('--update-baseline') ? 1 : 0);
