#!/usr/bin/env node
// test262 conformance of the JavaScript the compiler emits: a curated subset of tc39/test262
// (tests.txt) translated as an app's modules are and run on the host, Swift as macOS executables
// linking the kit's runtime and Kotlin on the JVM with kit-android's runtime (tests/native-build.ts).
//   node tests/test262/run.ts [--swift | --kotlin] [--only <text>…] [--area <name>…] [--batch <n>] [--jobs <n>] [--update-baseline] [--keep] [--list | --report]
// test262 is fetched at COMMIT into $NS_TEST262_CACHE (default ~/.cache/ns-test262); build products go to
// $NS_TEST262_BUILD (default <tmp>/ns-test262), with results-<backend>.json and summary.md.
// The run fails only on a regression against baseline.json: a test not listed there that does not pass.
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statfsSync, statSync, writeFileSync } from 'node:fs';
import { homedir, availableParallelism, tmpdir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { buildKotlinRuntime, buildSwiftRuntime, kotlinc, kotlinStdlib, swiftc, translateKotlin, translateSwift, SWIFT_HEADER } from '../native-build.ts';

/** tc39/test262 main as of 2026-10-14. */
const COMMIT = 'd53ebc8b1931d9f1541e43d59650776e4b766248';

const here = dirname(fileURLToPath(import.meta.url));
const cache = process.env.NS_TEST262_CACHE ?? join(homedir(), '.cache/ns-test262');
const build = process.env.NS_TEST262_BUILD ?? join(tmpdir(), 'ns-test262');
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const values = (name: string) => argv.flatMap((a, i) => (a === name && argv[i + 1] ? [argv[i + 1]] : []));
const backends = (flag('--swift') ? ['swift'] : flag('--kotlin') ? ['kotlin'] : ['swift', 'kotlin']) as Backend[];
const only = values('--only');
const areas = values('--area');
const batchSize = Number(values('--batch')[0] ?? 250);
const jobs = Number(values('--jobs')[0] ?? Math.max(2, availableParallelism() - 2));
const keep = flag('--keep');
const optimize = '-Onone';
/** The free disk space each batch needs to start, in GB. */
const minFree = Number(process.env.NS_TEST262_MIN_FREE_GB ?? 8);
// Every diagnostic, so that each test the type check refuses is told apart from the rest of its batch.
process.env.NS_NATIVE_DIAGNOSTICS = '1000000';

type Backend = 'swift' | 'kotlin';
type Status = 'pass' | 'fail' | 'refused' | 'out-of-scope' | 'unported' | 'invalid';

interface Test {
  /** The path under test262's test/, as tests.txt names it. */
  id: string;
  area: string;
  /** The module the adapted test is, in its batch. */
  module: string;
  source: string;
  meta: Meta;
  /** Why the test is not run, when it is not. */
  skip?: { status: Status; detail: string };
  adapted?: string;
}

interface Meta { includes: string[]; flags: string[]; features: string[]; negative: { phase: string; type: string } | null }
interface Result { status: Status; detail?: string }

// ---- test262 ------------------------------------------------------------------------------------

/**
 * The tests tests.txt selects, by area: `[Area]` starts one, a path under test/ (a directory or a file) adds its tests,
 * `!path` takes them out. `self/` is the harness's own checks (self/), which must pass for a backend's results to hold.
 */
function selection(): { included: { path: string; area: string }[]; excluded: string[] } {
  const lines = readFileSync(join(here, 'tests.txt'), 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean);
  const included: { path: string; area: string }[] = [];
  const excluded: string[] = [];
  let area = '';
  for (const l of lines) {
    const section = /^\[(.+)\]$/.exec(l);
    if (section) area = section[1];
    else if (l.startsWith('!')) excluded.push(l.slice(1).trim());
    else included.push({ path: l, area });
  }
  return { included, excluded };
}

function test262(entries: string[]): string {
  const dir = join(cache, `test262-${COMMIT}`);
  const tarball = join(cache, `test262-${COMMIT}.tar.gz`);
  mkdirSync(cache, { recursive: true });
  if (!existsSync(tarball)) {
    console.log(`fetching test262 ${COMMIT.slice(0, 10)} into ${cache}`);
    const r = spawnSync('curl', ['-fsSL', `https://codeload.github.com/tc39/test262/tar.gz/${COMMIT}`, '-o', tarball + '.part'], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('could not fetch test262');
    renameSync(tarball + '.part', tarball);
  }
  // Only what tests.txt names is extracted; the stamp says what has been.
  const stamp = join(dir, '.extracted');
  const extracted = new Set<string>(existsSync(stamp) ? JSON.parse(readFileSync(stamp, 'utf8')) : []);
  const missing = entries.filter((e) => !extracted.has(e));
  if (missing.length) {
    const r = spawnSync('tar', ['-xzf', tarball, '-C', cache, ...missing.map((e) => `test262-${COMMIT}/test/${e}`)], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`tests.txt names what test262 ${COMMIT.slice(0, 10)} does not have:\n${r.stderr}`);
    writeFileSync(stamp, JSON.stringify([...extracted, ...missing].sort()));
  }
  return join(dir, 'test');
}

/** Where a tests.txt path is: test262's test/, or for `self/…` the harness's own checks beside this file. */
const baseOf = (dir: string, path: string) => (path.startsWith('self/') ? here : dir);

/** The directory a path or pattern names files under: up to its first wildcard. */
const fixedPart = (path: string) => path.split('/').filter((_, i, parts) => !parts.slice(0, i + 1).some((p) => p.includes('*'))).join('/');

/**
 * `*` matches within a path segment, `**` across segments; a pattern without one names a directory (all under it) or a
 * file. A pattern matching a directory matches what is under it.
 */
function matcher(pattern: string): (id: string) => boolean {
  if (!pattern.includes('*')) return (id) => id === pattern || id.startsWith(pattern.replace(/\/?$/, '/'));
  const re = new RegExp('^' + pattern.split(/(\*\*\/?|\*)/).map((p) => (p === '**' ? '.*' : p.startsWith('**') ? '(?:.*/)?' : p === '*' ? '[^/]*' : p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))).join('') + '$');
  return (id) => id.split('/').some((_, i, parts) => re.test(parts.slice(0, i + 1).join('/')));
}

function testFiles(dir: string, path: string): string[] {
  const base = fixedPart(path);
  const full = join(baseOf(dir, path), base);
  if (statSync(full).isFile()) return [path];
  const matches = matcher(path);
  return (readdirSync(full, { recursive: true }) as string[]).filter((f) => f.endsWith('.js') && !f.includes('_FIXTURE')).map((f) => join(base, f)).filter(matches).sort();
}

function metaOf(source: string): Meta {
  const yaml = /\/\*---([\s\S]*?)---\*\//.exec(source)?.[1] ?? '';
  const list = (key: string): string[] => {
    const inline = new RegExp(`^${key}:\\s*\\[(.*)\\]`, 'm').exec(yaml);
    if (inline) return inline[1].split(',').map((s) => s.trim()).filter(Boolean);
    const block = new RegExp(`^${key}:\\s*\\n((?:[ \\t]+- .*\\n?)+)`, 'm').exec(yaml);
    return block ? block[1].split('\n').map((s) => s.replace(/^\s*- /, '').trim()).filter(Boolean) : [];
  };
  const negative = /^negative:\s*\n((?:[ \t]+\w+:.*\n?)+)/m.exec(yaml);
  const field = (k: string) => new RegExp(`${k}:\\s*(\\S+)`).exec(negative?.[1] ?? '')?.[1] ?? '';
  return { includes: list('includes'), flags: list('flags'), features: list('features'), negative: negative ? { phase: field('phase'), type: field('type') } : null };
}

// ---- What is not run ----------------------------------------------------------------------------

/** What the compiler refuses by design, by test262 feature and by what the code calls. */
const OUT_OF_SCOPE: { reason: string; features?: string[]; code?: RegExp }[] = [
  { reason: 'eval', code: /\beval\b/ },
  { reason: 'Function constructor', code: /\bnew\s+Function\s*\(|(?<![.\w$])Function\s*\(|\.constructor\s*\(\s*['"`]/ },
  { reason: 'Proxy', features: ['Proxy'], code: /\bProxy\b/ },
  { reason: 'Reflect', features: ['Reflect', 'Reflect.construct', 'Reflect.set', 'Reflect.setPrototypeOf'], code: /\bReflect\b/ },
  { reason: 'with', code: /(?<![.\w$])with\s*\(/ },
  { reason: 'SharedArrayBuffer', features: ['SharedArrayBuffer', 'Atomics'], code: /\bSharedArrayBuffer\b|\bAtomics\b/ },
  { reason: 'FinalizationRegistry', features: ['FinalizationRegistry'], code: /\bFinalizationRegistry\b/ },
  { reason: 'computed import/require', features: ['dynamic-import', 'import-defer', 'source-phase-imports'], code: /\bimport\s*\(|\brequire\s*\(/ },
];

/**
 * What does not apply to compiled code, whatever the compiler did: sloppy-mode-only tests (an app's modules are
 * strict), early errors (TypeScript's parser rejects the source before the compiler sees it), the host hooks of $262
 * (realms, agents, detaching), and module tests' fixtures.
 */
const NOT_APPLICABLE: { reason: string; test: (meta: Meta, code: string) => boolean }[] = [
  { reason: 'sloppy mode only', test: (m) => m.flags.includes('noStrict') || m.flags.includes('raw') },
  { reason: 'early error', test: (m) => !!m.negative && m.negative.phase !== 'runtime' },
  { reason: 'host hooks ($262)', test: (m, code) => /\$262\b/.test(code) || m.features.includes('cross-realm') },
  { reason: 'module fixtures', test: (m) => m.flags.includes('module') || m.flags.includes('CanBlockIsTrue') || m.flags.includes('CanBlockIsFalse') },
];

/** test262's code without its comments, for what it calls; the source as it is where TypeScript's emit fails on it. */
function codeOf(source: string): string {
  try {
    return ts.transpileModule(source, { compilerOptions: { removeComments: true, target: ts.ScriptTarget.ESNext } }).outputText;
  } catch {
    return source;
  }
}

// ---- Harness ------------------------------------------------------------------------------------

/**
 * test262's harness includes as typed modules (harness/), with the names each defines.
 * assert.js and sta.js are every test's; doneprintHandle.js every async test's.
 */
const INCLUDES: Record<string, { module: string; names: string[] }[]> = {
  'assert.js': [{ module: 'assert', names: ['assert', 'compareArray', 'formatIdentityFreeValue', 'formatSimpleValue', 'isNegativeZero', 'isPrimitive'] }],
  'sta.js': [{ module: 'sta', names: ['Test262Error', '$DONOTEVALUATE'] }],
  'doneprintHandle.js': [{ module: 'doneprintHandle', names: ['$DONE'] }],
  'compareArray.js': [],
  'compareIterator.js': [],
  'asyncHelpers.js': [{ module: 'asyncHelpers', names: ['asyncTest'] }],
  'promiseHelper.js': [{ module: 'promiseHelper', names: ['checkSequence', 'checkSettledPromises'] }],
  'propertyHelper.js': [{ module: 'propertyHelper', names: ['verifyProperty', 'verifyPrimordialProperty', 'verifyEqualTo', 'verifyWritable', 'verifyNotWritable', 'verifyEnumerable', 'verifyNotEnumerable', 'verifyConfigurable', 'verifyNotConfigurable'] }],
  'tcoHelper.js': [{ module: 'misc', names: ['$MAX_ITERATIONS'] }],
  'dateConstants.js': [{ module: 'misc', names: ['date_1899_end', 'date_1900_start', 'date_1969_end', 'date_1970_start', 'date_1999_end', 'date_2000_start', 'date_2099_end', 'date_2100_start', 'start_of_time', 'end_of_time'] }],
  'assertRelativeDateMs.js': [{ module: 'misc', names: ['assertRelativeDateMs'] }],
  'decimalToHexString.js': [{ module: 'misc', names: ['decimalToHexString', 'decimalToPercentHexString'] }],
};
/** What propertyHelper.js defines that harness/propertyHelper.ts does not port. */
const UNPORTED_NAMES = ['verifyCallableProperty', 'verifyAccessorProperty', 'verifyPrimordialCallableProperty', 'verifyPrimordialAccessorProperty'];

/**
 * The test as a module of the app: test262's source after an import of each harness name it uses from the include
 * that defines it, with `assert(…)` calls made `assert.ok(…)` and `assert.throws(TypeError, …)` given the constructor's name. A test is a script to test262; as a module it is
 * strict, which the tests not marked noStrict are written for.
 */
function adapt(t: Test, code: string): string | { unported: string } {
  const includes = ['assert.js', 'sta.js', ...(t.meta.flags.includes('async') ? ['doneprintHandle.js'] : []), ...t.meta.includes];
  const unported = includes.find((i) => !INCLUDES[i]);
  if (unported) return { unported };
  const unportedName = t.meta.includes.includes('propertyHelper.js') && UNPORTED_NAMES.find((n) => new RegExp(`\\b${n.replace(/\$/g, '\\$')}\\b`).test(code));
  if (unportedName) return { unported: `propertyHelper.js ${unportedName}` };
  const byModule = new Map<string, string[]>();
  for (const i of new Set(includes)) for (const { module, names } of INCLUDES[i]) {
    for (const n of names) {
      const word = n.replace(/\$/g, '\\$');
      const used = new RegExp(`(?<![\\w$.])${word}(?![\\w$])`).test(code);
      const declared = new RegExp(`\\b(function\\*?|var|let|const|class)\\s+${word}(?![\\w$])`).test(code);
      if (used && !declared) byModule.set(module, [...(byModule.get(module) ?? []), n]);
    }
  }
  const imports = [...byModule].map(([m, names]) => `import { ${[...new Set(names)].join(', ')} } from './harness/${m}.ts';`).join(' ');
  // On the test's first line, so its line numbers stay test262's.
  return `${imports} export {};${assertCalls(t)}`;
}

const ERROR_CONSTRUCTORS = new Set(['Error', 'TypeError', 'RangeError', 'SyntaxError', 'ReferenceError', 'Test262Error']);

/**
 * The test's source with each call of `assert` itself a call of `assert.ok`, and a built-in error constructor given to
 * `assert.throws` or `assert.throwsAsync` given by its name (harness/assert.ts).
 */
function assertCalls(t: Test): string {
  const sf = ts.createSourceFile(t.id, t.source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
  const edits: { at: number; end: number; text: string }[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'assert') edits.push({ at: n.expression.end, end: n.expression.end, text: '.ok' });
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ts.isIdentifier(n.expression.expression) && n.expression.expression.text === 'assert'
      && ['throws', 'throwsAsync'].includes(n.expression.name.text) && n.arguments[0] && ts.isIdentifier(n.arguments[0]) && ERROR_CONSTRUCTORS.has(n.arguments[0].text)) {
      const a = n.arguments[0];
      edits.push({ at: a.getStart(sf), end: a.end, text: `'${a.text}'` });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  let out = t.source;
  for (const e of edits.sort((a, b) => b.at - a.at)) out = out.slice(0, e.at) + e.text + out.slice(e.end);
  return out;
}

// ---- Node: the adapted tests are valid ---------------------------------------------------------

/** Each adapted test run under Node as the bundler would build it: one that fails there is the adaptation's fault, not the compiler's. */
async function underNode(tests: Test[]): Promise<Map<string, Result>> {
  const dir = join(build, 'node');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'harness'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), '{ "type": "module" }');
  const js = (text: string) => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, rewriteRelativeImportExtensions: true } }).outputText;
  for (const f of readdirSync(join(here, 'harness'))) writeFileSync(join(dir, 'harness', f.replace(/\.ts$/, '.js')), js(readFileSync(join(here, 'harness', f), 'utf8')));
  writeFileSync(join(dir, 'main.js'), `let uncaught = null;
const describe = (e) => { try { return e !== null && typeof e === 'object' ? (e.name ?? e.constructor?.name) + ': ' + e.message : String(e); } catch { return '?'; } };
process.on('uncaughtException', (e) => { uncaught ??= describe(e); });
process.on('unhandledRejection', () => {});
process.on('exit', () => console.log(uncaught === null ? 'Test262:Completed' : 'Test262:Uncaught:' + uncaught));
await import('./' + process.argv[2] + '.js').catch((e) => { uncaught ??= describe(e); });
`);
  const out = new Map<string, Result>();
  const emitted = tests.filter((t) => {
    try {
      writeFileSync(join(dir, t.module + '.js'), js(t.adapted!));
      return true;
    } catch (e) {
      out.set(t.id, { status: 'fail', detail: `TypeScript's emit fails: ${firstLine((e as Error).message)}` });
      return false;
    }
  });
  await pool(emitted, async (t) => out.set(t.id, verdict(t, await run('node', [join(dir, 'main.js'), t.module], 20000))));
  if (!keep) rmSync(dir, { recursive: true, force: true });
  return out;
}

// ---- Native -------------------------------------------------------------------------------------

/** One test's outcome from what its program printed. */
function verdict(t: Test, r: { stdout: string; stderr: string; status: number | null; signal: string | null; timedOut: boolean }): Result {
  const line = (prefix: string) => r.stdout.split('\n').find((l) => l.startsWith(prefix))?.slice(prefix.length);
  const uncaught = line('Test262:Uncaught:');
  if (r.timedOut) return { status: 'fail', detail: 'timeout' };
  if (t.meta.negative) {
    if (uncaught === undefined) return { status: 'fail', detail: r.signal || r.status ? crash(r) : `expected ${t.meta.negative.type}, nothing thrown` };
    return uncaught.startsWith(t.meta.negative.type + ':') ? { status: 'pass' } : { status: 'fail', detail: `expected ${t.meta.negative.type}, threw ${uncaught}` };
  }
  if (uncaught !== undefined) return { status: 'fail', detail: `threw ${uncaught}` };
  if (line('Test262:Completed') === undefined) return { status: 'fail', detail: crash(r) };
  if (t.meta.flags.includes('async')) {
    const failure = line('Test262:AsyncTestFailure:');
    if (failure !== undefined) return { status: 'fail', detail: `async: ${failure}` };
    if (line('Test262:AsyncTestComplete') === undefined) return { status: 'fail', detail: 'async: $DONE not called' };
  }
  return { status: 'pass' };
}

function crash(r: { stderr: string; status: number | null; signal: string | null }): string {
  const why = r.stderr.split('\n').find((l) => /Fatal error|fatal error|Exception in thread|Error:/.test(l))?.trim().slice(0, 200);
  return `crashed (${r.signal ?? `exit ${r.status}`})${why ? ': ' + why : ''}`;
}

/** The Swift entry point: the harness modules' top level, then the one test its argument names, then the event loop. */
function swiftEntry(modules: { file: string; init: string | null }[], tests: Test[]): string {
  const byFile = new Map(tests.map((t) => [t.module, t]));
  const harness = modules.filter((m) => !byFile.has(basename(m.file, '.ts')) && m.init).map((m) => `${m.init}()`);
  const cases = modules.filter((m) => byFile.has(basename(m.file, '.ts'))).map((m) => `case "${basename(m.file, '.ts')}": ${m.init ? `${m.init}()` : 'break'}`);
  return `${SWIFT_HEADER}nonisolated(unsafe) var __uncaught: String? = nil
func __describe(_ value: Any?) -> String {
    if jsIsNullish(value) { return jsToString(value) }
    let message = (try? jsGet(value, "message")) ?? nil
    var name = (try? jsGet(value, "name")) ?? nil
    if jsIsNullish(name) { name = (try? jsGet((try? jsGet(value, "constructor")) ?? nil, "name")) ?? nil }
    if jsIsNullish(name) && jsIsNullish(message) { return jsToString(value) }
    return jsToString(name) + ": " + jsToString(message)
}
jsUncaughtHandler = { value in if __uncaught == nil { __uncaught = __describe(value) } }
${harness.join('\n')}
switch CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "" {
${cases.join('\n')}
default: print("Test262:NoSuchTest"); exit(2)
}
JSEventLoop.runUntilIdle()
print(__uncaught.map { "Test262:Uncaught:" + $0 } ?? "Test262:Completed")
`;
}

const PKG = 't262';
function kotlinEntry(modules: { file: string; init: string | null }[], tests: Test[]): string {
  const byFile = new Map(tests.map((t) => [t.module, t]));
  const harness = modules.filter((m) => !byFile.has(basename(m.file, '.ts')) && m.init).map((m) => `    ${m.init}()`);
  const cases = modules.filter((m) => byFile.has(basename(m.file, '.ts'))).map((m) => `            "${basename(m.file, '.ts')}" -> ${m.init ? `${m.init}()` : '{}'}`);
  return `package ${PKG}.entry

import org.nativescript.kit.*
import ${PKG}.*
import kotlin.system.exitProcess

private var uncaught: String? = null
private fun describe(value: Any?): String {
    if (jsIsNullish(value)) return jsToString(value)
    val message = runCatching { jsGet(value, "message") }.getOrNull()
    var name = runCatching { jsGet(value, "name") }.getOrNull()
    if (jsIsNullish(name)) name = runCatching { jsGet(jsGet(value, "constructor"), "name") }.getOrNull()
    if (jsIsNullish(name) && jsIsNullish(message)) return jsToString(value)
    return jsToString(name) + ": " + jsToString(message)
}

fun main(args: Array<String>) {
    jsUncaughtHandler = { value -> if (uncaught == null) uncaught = describe(value) }
${harness.join('\n')}
    try {
        when (args.firstOrNull() ?: "") {
${cases.join('\n')}
            else -> { println("Test262:NoSuchTest"); exitProcess(2) }
        }
    } catch (e: Throwable) { jsReportUncaught(jsCaught(e)) }
    try { JSEventLoop.runUntilIdle() } catch (e: Throwable) { jsReportUncaught(jsCaught(e)) }
    println(uncaught?.let { "Test262:Uncaught:" + it } ?: "Test262:Completed")
    System.out.flush()
}
`;
}

/** A batch of tests as one program: translated, compiled, and each test run in a process of its own. */
async function runBatch(backend: Backend, tests: Test[], dir: string, results: Map<string, Result>): Promise<void> {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'harness'), { recursive: true });
  // Not strict, as an app of untyped code is configured: the build then checks it as its own build would.
  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: false, target: 'ES2022' } }));
  for (const f of readdirSync(join(here, 'harness'))) copyFileSync(join(here, 'harness', f), join(dir, 'harness', f));
  for (const t of tests) writeFileSync(join(dir, t.module + '.ts'), t.adapted!);
  let pending = [...tests];
  const byModule = new Map(tests.map((t) => [t.module, t]));
  const settle = (t: Test, r: Result) => { results.set(t.id, r); pending = pending.filter((p) => p !== t); };
  const solo: Test[] = [];

  // The type check, then translation: what either refuses is the test's alone.
  const started = Date.now();
  const out = join(dir, 'out');
  let modules: { file: string; name: string; init: string | null }[] = [];
  for (;;) {
    const refusedNow: string[] = [];
    try {
      const refused = (file: string, error: Error) => {
        const t = byModule.get(basename(file, '.ts'));
        if (!t) throw new Error(`harness/${basename(file)} does not translate for ${backend}: ${error.message}`);
        // A refusal names where in the test it is; an error that does not is the translator failing.
        const message = firstLine(error.message);
        settle(t, /^\S*\/t\d+\.ts:\d+:\d+: /.test(message) ? { status: 'refused', detail: 'translate: ' + message.replace(/^\S*\/t\d+\.ts:/, 'line ') } : { status: 'fail', detail: 'translator threw: ' + message });
      };
      const roots = pending.map((t) => join(dir, t.module + '.ts'));
      modules = backend === 'swift' ? translateSwift(roots, out, { appStrictness: true, refused }) : translateKotlin(roots, out, PKG, { appStrictness: true, refused });
      break;
    } catch (e) {
      const text = (e as Error).message;
      if (!/does not type-check/.test(text)) throw e;
      for (const m of text.matchAll(/^(\S+?)\.ts\(\d+,\d+\): error (TS\d+: .*)$/gm)) {
        const t = byModule.get(basename(m[1]));
        if (!t) throw new Error(`the harness does not type-check:\n${text}`);
        if (pending.includes(t)) { settle(t, { status: 'refused', detail: 'type check: ' + m[2].slice(0, 200) }); refusedNow.push(t.id); }
      }
      if (!refusedNow.length) throw e;
    }
  }
  const translatedAt = Date.now();
  const translated = () => modules.filter((m) => !byModule.has(m.name) || pending.includes(byModule.get(m.name)!));

  // The compile: errors in a test's own file are the test's; others are found by halving the batch.
  const exe = join(dir, 'batch');
  let compiles = 0;
  const classes = join(dir, 'classes');
  const runtime = backend === 'kotlin' ? buildKotlinRuntime(build) : '';
  for (;;) {
    if (!pending.length) break;
    const live = translated();
    for (const f of readdirSync(out)) if (byModule.has(f.replace(/\.(swift|kt)$/, '')) && !pending.includes(byModule.get(f.replace(/\.(swift|kt)$/, ''))!)) rmSync(join(out, f));
    let errors: string[] | null;
    if (backend === 'swift') {
      writeFileSync(join(out, 'main.swift'), swiftEntry(live, pending));
      // Every file's errors in one compile, not only the first failing batch of files'.
      errors = swiftc(readdirSync(out).map((f) => join(out, f)), exe, build, optimize, ['-continue-building-after-errors']);
    } else {
      writeFileSync(join(out, '__Main.kt'), kotlinEntry(live, pending));
      errors = kotlinc(readdirSync(out).map((f) => join(out, f)), classes, [runtime]);
    }
    compiles++;
    if (!errors) break;
    const own = new Map<Test, string>();
    for (const e of errors) {
      // Swift reports a line of a test at the test's own source (#sourceLocation).
      const file = /([\w.-]+)\.(?:swift|kt|ts):\d+:\d+/.exec(e)?.[1];
      const t = file ? byModule.get(file) : undefined;
      if (t && pending.includes(t) && !own.has(t)) own.set(t, e.replace(/^.*?error:\s*/, ''));
    }
    const compiler = backend === 'swift' ? 'swiftc' : 'kotlinc';
    if (own.size) {
      for (const [t, e] of own) {
        // Top-level names the batch's other modules share: the test is compiled again alone, as its own app would be.
        if (tests.length > 1 && /conflicting declarations|overload resolution ambiguity|invalid redeclaration|ambiguous use of/.test(e)) { solo.push(t); pending = pending.filter((p) => p !== t); continue; }
        settle(t, { status: 'fail', detail: `${compiler}: ${e.slice(0, 200)}` });
      }
      continue;
    }
    // The harness's own errors fail every test of the batch: halving would only find them again.
    const inHarness = errors.find((e) => /\/harness\/\w+\.(?:swift|kt|ts):\d+/.test(e) || /^(?:.*\/out\/)?(?:assert|sta|doneprintHandle|asyncHelpers|promiseHelper|propertyHelper|misc)\.(?:swift|kt):\d+/.test(e));
    if (inHarness) { for (const t of [...pending]) settle(t, { status: 'fail', detail: `${compiler}: harness: ${inHarness.replace(/^.*\/(harness\/|out\/)/, '$1').slice(0, 200)}` }); break; }
    if (pending.length === 1) { settle(pending[0], { status: 'fail', detail: `${compiler}: ${errors[0].replace(/^.*?error:\s*/, '').slice(0, 200)}` }); break; }
    const half = Math.ceil(pending.length / 2);
    const [a, b] = [pending.slice(0, half), pending.slice(half)];
    await runBatch(backend, [...a, ...solo.splice(0)], dir + 'a', results);
    await runBatch(backend, b, dir + 'b', results);
    if (!keep) rmSync(dir, { recursive: true, force: true });
    return;
  }

  const compiled = Date.now();
  const command = (t: Test): [string, string[]] => backend === 'swift' ? [exe, [t.module]] : ['java', ['-Xss16m', '-XX:+UseSerialGC', '-XX:TieredStopAtLevel=1', '-cp', [classes, runtime, kotlinStdlib()].join(':'), `${PKG}.entry.__MainKt`, t.module]];
  await pool(pending, async (t) => { const [cmd, args] = command(t); results.set(t.id, verdict(t, await run(cmd, args, 15000))); });
  for (const t of solo) {
    await runBatch(backend, [t], `${dir}-${t.module}`, results);
    soloRuns.push(`${t.id} (${backend})`);
  }
  if (process.env.NS_TEST262_TIMES) console.log(`  ${basename(dir)}: ${tests.length} tests, translate ${Math.round((translatedAt - started) / 1000)}s, compile ${Math.round((compiled - translatedAt) / 1000)}s (${compiles}), run ${pending.length} ${Math.round((Date.now() - compiled) / 1000)}s`);
  if (!keep) rmSync(dir, { recursive: true, force: true });
}

/** Tests that compiled only alone, their batch's other modules declaring names they declare. */
const soloRuns: string[] = [];

const firstLine = (s: string) => s.split('\n').find((l) => l.trim())?.slice(0, 200) ?? s;

function run(cmd: string, args: string[], timeout: number): Promise<{ stdout: string; stderr: string; status: number | null; signal: string | null; timedOut: boolean }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false;
    child.stdout.on('data', (d) => { if (stdout.length < 1 << 20) stdout += d; });
    child.stderr.on('data', (d) => { if (stderr.length < 1 << 16) stderr += d; });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeout);
    child.on('close', (status, signal) => { clearTimeout(timer); resolve({ stdout, stderr, status, signal, timedOut }); });
    child.on('error', (e) => { clearTimeout(timer); resolve({ stdout, stderr: String(e), status: -1, signal: null, timedOut }); });
  });
}

async function pool<T>(items: T[], each: (item: T) => Promise<unknown>): Promise<void> {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(jobs, items.length) }, async () => { while (next < items.length) await each(items[next++]); }));
}

// ---- Report -------------------------------------------------------------------------------------

/** The summary's columns: a refusal by the type check apart from one by the translator. */
const COLUMNS = ['pass', 'fail', 'refused: type check', 'refused: translator', 'out-of-scope', 'unported', 'invalid'] as const;
const columnOf = (r: Result): (typeof COLUMNS)[number] => (r.status === 'refused' ? (r.detail?.startsWith('type check') ? 'refused: type check' : 'refused: translator') : r.status);

function summary(tests: { id: string; area: string }[], all: Record<string, Map<string, Result>>): string {
  const areas = [...new Set(tests.map((t) => t.area))];
  const rows: string[] = [];
  const count = (backend: string, of: { id: string }[]) => {
    const c = Object.fromEntries(COLUMNS.map((s) => [s, 0])) as Record<(typeof COLUMNS)[number], number>;
    for (const t of of) c[columnOf(all[backend].get(t.id)!)]++;
    return c;
  };
  const percent = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : '-');
  rows.push(`| Area | Backend | Tests | ${COLUMNS.join(' | ')} | Pass rate | Compiled pass rate |`, `|---|---|---:|${COLUMNS.map(() => '---:').join('|')}|---:|---:|`);
  for (const area of [...areas, 'Total']) for (const backend of Object.keys(all)) {
    const of = tests.filter((t) => area === 'Total' || t.area === area);
    const c = count(backend, of);
    const ran = c.pass + c.fail;
    rows.push(`| ${area === 'Total' ? `**${area}**` : area} | ${backend} | ${of.length} | ${COLUMNS.map((s) => c[s]).join(' | ')} | ${percent(c.pass, ran + c['refused: type check'] + c['refused: translator'])} | ${percent(c.pass, ran)} |`);
  }
  return rows.join('\n') + `

Pass rate is pass / (pass + fail + refused). Compiled pass rate is pass / (pass + fail): of the tests the compiler
accepted, how many ran as JavaScript does. Out-of-scope, unported and invalid tests are in neither.
`;
}

/** Causes already tracked elsewhere, noted on the baseline's entries. */
const KNOWN_CAUSES: Record<string, string> = {};

/** A result's detail as the baseline keeps it: enough to tell its cause, without paths. */
const brief = (detail: string) => detail.replace(/\/\S*\/(?=[\w.-]+\.(?:ts|swift|kt)\b)/g, '').replace(/ is not supported in a release build yet: .*/, ' is not supported').slice(0, 120);

/**
 * The results against baseline.json, each backend's tests that do not pass (fail or refused) with why, and the
 * regressions: tests not listed there that do not pass. With --update-baseline, the baseline is rewritten from the
 * results; `partial` (a run of some tests) keeps the other tests' entries.
 */
function checkBaseline(tests: { id: string }[], all: Record<string, Map<string, Result>>, partial: boolean): number {
  const baselineFile = join(here, 'baseline.json');
  const baseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')) : {};
  let regressions = 0;
  for (const backend of Object.keys(all)) {
    const known: Record<string, string> = baseline[backend] ?? {};
    const results = all[backend];
    const counted = tests.filter((t) => ['pass', 'fail', 'refused'].includes(results.get(t.id)!.status));
    const regressed = counted.filter((t) => results.get(t.id)!.status !== 'pass' && !(t.id in known));
    const improved = counted.filter((t) => results.get(t.id)!.status === 'pass' && t.id in known);
    if (!flag('--update-baseline')) for (const t of regressed) console.log(`✗ ${t.id} (${backend}): ${results.get(t.id)!.status}: ${results.get(t.id)!.detail}`);
    if (improved.length) console.log(`${improved.length} tests in baseline.json now pass on ${backend}${flag('--update-baseline') ? '' : ': run with --update-baseline to remove them'}`);
    regressions += regressed.length;
    if (flag('--update-baseline')) {
      const ran = new Set(counted.map((t) => t.id));
      const next = partial ? Object.fromEntries(Object.entries(known).filter(([id]) => !ran.has(id))) : {};
      for (const t of counted) {
        const r = results.get(t.id)!;
        const cause = KNOWN_CAUSES[`${backend}:${t.id}`];
        if (r.status !== 'pass') next[t.id] = `${r.status}: ${brief(r.detail ?? '')}${cause ? ` (${cause})` : ''}`;
      }
      baseline[backend] = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
    }
  }
  if (flag('--update-baseline')) {
    const { $comment, commit, ...rest } = baseline;
    const comment = 'test262 tests that do not pass yet, by backend, with why: generated by run.ts --update-baseline. A test not listed that does not pass fails the run.';
    writeFileSync(baselineFile, JSON.stringify({ $comment: comment, commit: COMMIT, ...rest }, null, '\t') + '\n');
    console.log(`baseline.json updated (${relative(process.cwd(), baselineFile)})`);
    return 0;
  }
  if (regressions) console.log(`${regressions} regressions against baseline.json`);
  return regressions;
}

/** The summary of the last run's results (results-<backend>.json in the build directory), checked against the baseline, without running anything. */
function report(): never {
  const all: Record<string, Map<string, Result>> = {};
  let tests: { id: string; area: string }[] = [];
  for (const backend of backends) {
    const file = join(build, `results-${backend}.json`);
    if (!existsSync(file)) continue;
    const { results } = JSON.parse(readFileSync(file, 'utf8')) as { results: Record<string, Result & { area: string }> };
    all[backend] = new Map(Object.entries(results));
    if (!tests.length) tests = Object.entries(results).map(([id, r]) => ({ id, area: r.area }));
  }
  console.log(summary(tests, all));
  process.exit(checkBaseline(tests, all, false) ? 1 : 0);
}

// ---- Run ----------------------------------------------------------------------------------------

if (flag('--report')) report();
const { included, excluded } = selection();
const dir = test262([...new Set(included.map((i) => fixedPart(i.path)).filter((p) => !p.startsWith('self/')))]);
const exclusions = excluded.map(matcher);
const seen = new Set<string>();
const tests: Test[] = [];
for (const { path, area } of included) {
  for (const id of testFiles(dir, path)) {
    if (seen.has(id) || exclusions.some((x) => x(id))) continue;
    if (only.length && !only.some((o) => id.includes(o))) continue;
    if (areas.length && !areas.includes(area)) continue;
    seen.add(id);
    const source = readFileSync(join(baseOf(dir, id), id), 'utf8');
    tests.push({ id, area, module: 't' + String(tests.length).padStart(5, '0'), source, meta: metaOf(source) });
  }
}

for (const t of tests) {
  const code = codeOf(t.source);
  const scope = OUT_OF_SCOPE.find((o) => o.features?.some((f) => t.meta.features.includes(f)) || o.code?.test(code));
  const na = NOT_APPLICABLE.find((n) => n.test(t.meta, code));
  if (scope || na) { t.skip = { status: 'out-of-scope', detail: (scope ?? na)!.reason }; continue; }
  const adapted = adapt(t, code);
  if (typeof adapted !== 'string') { t.skip = { status: 'unported', detail: adapted.unported }; continue; }
  t.adapted = adapted;
}

if (flag('--list')) {
  const areas = [...new Set(tests.map((t) => t.area))];
  for (const a of areas) {
    const of = tests.filter((t) => t.area === a);
    console.log(`${a}: ${of.length} selected, ${of.filter((t) => !t.skip).length} to run; ${['out-of-scope', 'unported'].map((s) => `${s} ${of.filter((t) => t.skip?.status === s).length}`).join(', ')}`);
  }
  const reasons = new Map<string, number>();
  for (const t of tests) if (t.skip) reasons.set(`${t.skip.status}: ${t.skip.detail}`, (reasons.get(`${t.skip.status}: ${t.skip.detail}`) ?? 0) + 1);
  for (const [r, n] of [...reasons].sort((a, b) => b[1] - a[1])) console.log(`  ${n} ${r}`);
  console.log(`${tests.length} selected, ${tests.filter((t) => !t.skip).length} to run`);
  process.exit(0);
}

mkdirSync(build, { recursive: true });
const runnable = tests.filter((t) => !t.skip);
console.log(`${tests.length} tests selected, ${runnable.length} to run (${tests.length - runnable.length} out of scope or unported)`);
const node = await underNode(runnable);
for (const t of runnable) {
  const r = node.get(t.id)!;
  if (r.status !== 'pass') t.skip = { status: 'invalid', detail: 'fails under Node: ' + r.detail };
}
const native = tests.filter((t) => !t.skip);
console.log(`${native.length} pass under Node; ${runnable.length - native.length} do not, and are not counted`);

const all: Record<string, Map<string, Result>> = {};
for (const backend of backends) {
  const started = Date.now();
  const results = new Map<string, Result>();
  for (const t of tests) if (t.skip) results.set(t.id, { status: t.skip.status, detail: t.skip.detail });
  if (backend === 'swift') buildSwiftRuntime(build, optimize);
  for (let i = 0; i < native.length; i += batchSize) {
    const batch = native.slice(i, i + batchSize);
    const free = statfsSync(build).bavail * statfsSync(build).bsize / 2 ** 30;
    if (free < minFree) throw new Error(`${free.toFixed(1)} GB free, under $NS_TEST262_MIN_FREE_GB (${minFree} GB): stopped before batch ${i / batchSize}`);
    await runBatch(backend, batch, join(build, backend, `batch-${i / batchSize}`), results);
    const done = native.slice(0, i + batch.length);
    console.log(`${backend}: ${done.length} of ${native.length} run, ${done.filter((t) => results.get(t.id)?.status === 'pass').length} pass (${Math.round((Date.now() - started) / 1000)}s)`);
  }
  all[backend] = results;
  writeFileSync(join(build, `results-${backend}.json`), JSON.stringify({ commit: COMMIT, results: Object.fromEntries(tests.map((t) => [t.id, { area: t.area, ...results.get(t.id) }])) }, null, 1));
  if (!keep) rmSync(join(build, backend), { recursive: true, force: true });
}

if (soloRuns.length) writeFileSync(join(build, 'solo.txt'), soloRuns.join('\n') + '\n');
if (soloRuns.length) console.log(`${soloRuns.length} tests did not compile beside their batch's other modules (names they share), and were compiled alone: ${join(build, 'solo.txt')}`);
const table = summary(tests, all);
writeFileSync(join(build, 'summary.md'), `test262 ${COMMIT}\n\n${table}`);
console.log('\n' + table);

process.exit(checkBaseline(tests, all, only.length > 0 || areas.length > 0) ? 1 : 0);
