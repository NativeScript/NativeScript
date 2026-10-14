#!/usr/bin/env node
// Differential tests: each case under cases/ runs under Node and, translated,
// as a native program: Swift as a macOS command-line program linking the
// kit's JavaScript runtime (Foundation only), and Kotlin on the host JVM
// with kit-android's runtime (plain JVM). Output and exit status must match.
//   node tests/diff/run.ts [case-name…] [--swift | --kotlin] [--keep] [--osize]
// --osize builds the Swift runtime and cases with -Osize, the optimizer release builds use (into <build>-osize).
// Build products go to $NS_DIFF_BUILD (default: <tmp>/ns-native-diff).
// Node runs with --expose-gc: a case checking object lifetimes calls `globalThis.gc?.()`, which ARC needs no call for.
// Kotlin compiles with $KOTLINC, `kotlinc` on PATH, or the compiler Gradle cached for kit-android.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { buildKotlinRuntime, buildSwiftRuntime, kotlinc, kotlinMain, kotlinStdlib, swiftc, swiftMain, translateKotlin as translateKotlinProgram, translateSwift } from '../native-build.ts';

const here = dirname(fileURLToPath(import.meta.url));
const optimize = process.argv.includes('--osize') ? '-Osize' : '-Onone';
const build = (process.env.NS_DIFF_BUILD ?? join(tmpdir(), 'ns-native-diff')) + (optimize === '-Osize' ? '-osize' : '');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const keep = process.argv.includes('--keep');
const targets = process.argv.includes('--swift') ? ['swift'] : process.argv.includes('--kotlin') ? ['kotlin'] : ['swift', 'kotlin'];
mkdirSync(build, { recursive: true });

/**
 * A case starting `// @lenient` is checked as core is, without strictNullChecks, and translated
 * as the kit generated from core is, lenient and in library mode (Swift only, as the kit is
 * generated for iOS first). One starting `// @lenient-kotlin` is translated so as Kotlin only,
 * as kit-gen-kotlin.ts generates kit-android; one starting `// @lenient-both` so as both.
 */
const lenient = (file: string) => readFileSync(file, 'utf8').startsWith('// @lenient');
const lenientBoth = (file: string) => readFileSync(file, 'utf8').startsWith('// @lenient-both');
const kotlinOnly = (file: string) => readFileSync(file, 'utf8').startsWith('// @lenient-kotlin');
/** A case starting `// @kotlin` covers what only the Kotlin translator does yet: it is not run as Swift. */
const kotlinApp = (file: string) => readFileSync(file, 'utf8').startsWith('// @kotlin');
/** A case starting `// @swift` covers what only the Swift runtime has yet (typed arrays): it is not run as Kotlin. */
const swiftOnly = (file: string) => (lenient(file) && !kotlinOnly(file) && !lenientBoth(file)) || readFileSync(file, 'utf8').startsWith('// @swift');

/** `// @weak-fields A.b C.d` and `// @weak-captures A.e` lines: what the kit's configuration holds weakly (tools/native-kit/modules.mts). */
function weakOf(file: string) {
  const text = readFileSync(file, 'utf8');
  const list = (tag: string) => [...text.matchAll(new RegExp(`^// @${tag} (.+)$`, 'gm'))].flatMap((m) => m[1].trim().split(/\s+/));
  return { fields: list('weak-fields'), captures: list('weak-captures') };
}

/** A `// @members-by-name` line: the case is translated as an XML app's code is, its classes' accessors and methods readable by name (core's Builder binds to them). */
const membersByName = (file: string) => /^\/\/ @members-by-name$/m.test(readFileSync(file, 'utf8'));

function translate(file: string, out: string): void {
  const modules = translateSwift([file], out, { lenient: lenient(file), weak: weakOf(file), membersByName: membersByName(file) });
  writeFileSync(join(out, 'main.swift'), swiftMain(modules));
}

/** The case as Kotlin in package `pkg`, with a `main` running its modules' top level and then the event loop. */
function translateKotlin(file: string, out: string, pkg: string): void {
  const modules = translateKotlinProgram([file], out, pkg, { lenient: lenient(file), membersByName: membersByName(file) });
  writeFileSync(join(out, '__Main.kt'), kotlinMain(modules, pkg));
}

/** The case as JavaScript for Node, the way an app's bundler compiles TypeScript (Node strips types but cannot transform parameter properties or enums). */
function toJavaScript(dir: string, out: string) {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'package.json'), '{ "type": "module" }');
  for (const f of readdirSync(dir, { recursive: true }) as string[]) {
    if (!f.endsWith('.ts')) continue;
    const text = readFileSync(join(dir, f), 'utf8');
    // A lenient case runs as core is built: class fields assigned, not defined (a declared field leaves the prototype's accessor visible).
    const { outputText } = ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, rewriteRelativeImportExtensions: true, ...(text.startsWith('// @lenient') ? { useDefineForClassFields: false } : {}) } });
    mkdirSync(dirname(join(out, f)), { recursive: true });
    writeFileSync(join(out, f.replace(/\.ts$/, '.js')), outputText);
  }
}

// ---- Run ---------------------------------------------------------------------------------------

const cases = readdirSync(join(here, 'cases')).filter((f) => f.endsWith('.ts') && (!args.length || args.some((a) => f.startsWith(a)))).sort();
if (targets.includes('swift')) buildSwiftRuntime(build, optimize);
const js = join(build, 'js');
rmSync(js, { recursive: true, force: true });
toJavaScript(join(here, 'cases'), js);
const expected = new Map(cases.map((c) => [c, spawnSync('node', ['--expose-gc', join(js, basename(c, '.ts') + '.js')], { encoding: 'utf8' })]));
let failed = 0;
/**
 * Cases known to fail on a target, each with its cause (tests/diff/known-failures.json). A known failure is reported
 * and not counted; a known failure that matches Node fails the run, so the list only shrinks.
 */
const knownFile = JSON.parse(readFileSync(join(here, 'known-failures.json'), 'utf8'));
const known: Record<string, Record<string, string>> = { swift: knownFile.swift ?? {}, kotlin: knownFile.kotlin ?? {} };
const knownFailed: string[] = [];
const ran = new Set<string>();
function fail(name: string, target: string) {
  if (known[target]?.[name]) knownFailed.push(`${name} (${target})`);
  else failed++;
}

function report(name: string, target: string, want: { stdout: string; status: number | null }, actual: { stdout: string; stderr: string; status: number | null }) {
  const same = actual.stdout === want.stdout && (actual.status === 0) === (want.status === 0);
  ran.add(`${target}:${name}`);
  if (same) { console.log(`✓ ${name} (${target})`); return; }
  fail(name, target);
  console.log(`✗ ${name} (${target})${known[target]?.[name] ? ' [known]' : ''}: output differs (exit ${want.status} in Node, ${actual.status} native)`);
  const e = want.stdout.split('\n'), a = actual.stdout.split('\n');
  for (let k = 0, shown = 0; k < Math.max(e.length, a.length) && shown < 8; k++) {
    if (e[k] !== a[k]) { console.log(`    line ${k + 1}\n      node:   ${JSON.stringify(e[k])}\n      native: ${JSON.stringify(a[k])}`); shown++; }
  }
  if (actual.stderr) console.log('    native stderr: ' + actual.stderr.split('\n').slice(0, 4).join('\n    '));
}

let swiftSkipped = 0;
if (targets.includes('swift')) {
  for (const c of cases) {
    const name = basename(c, '.ts');
    const file = join(here, 'cases', c);
    if (kotlinOnly(file) || kotlinApp(file)) { swiftSkipped++; continue; }
    const dir = join(build, name);
    try {
      translate(file, join(dir, 'Sources'));
      const swiftFiles = readdirSync(join(dir, 'Sources')).map((f) => join(dir, 'Sources', f));
      const warnings: string[] = [];
      const errors = swiftc(swiftFiles, join(dir, name), build, optimize, [], warnings);
      if (errors) throw new Error(`swiftc:\n${errors.slice(0, 15).join('\n')}`);
      // Isolation and sendability are checked as an app's code is: a warning there fails the case.
      const concurrency = warnings.filter((w) => /Sendable|actor|isolat|data race|concurrently/i.test(w));
      if (concurrency.length) throw new Error(`swiftc concurrency warnings:\n${concurrency.slice(0, 15).join('\n')}`);
      report(name, 'swift', expected.get(c)!, spawnSync(join(dir, name), { encoding: 'utf8', timeout: 20000 }));
    } catch (err) {
      ran.add(`swift:${name}`);
      fail(name, 'swift');
      console.log(`✗ ${name} (swift)${known.swift?.[name] ? ' [known]' : ''}: ${(err as Error).message}${process.env.NS_NATIVE_STACKS ? (err as Error).stack : ""}`);
    }
    if (!keep) rmSync(dir, { recursive: true, force: true });
  }
}

let kotlinSkipped = 0;
if (targets.includes('kotlin')) {
  const pkg = (name: string) => 'case_' + name.replace(/\W/g, '_');
  const translated: string[] = [];
  for (const c of cases) {
    const name = basename(c, '.ts');
    if (swiftOnly(join(here, 'cases', c))) { kotlinSkipped++; continue; }
    try {
      translateKotlin(join(here, 'cases', c), join(build, 'kotlin', name), pkg(name));
      translated.push(name);
    } catch (err) {
      ran.add(`kotlin:${name}`);
      fail(name, 'kotlin');
      console.log(`✗ ${name} (kotlin)${known.kotlin?.[name] ? ' [known]' : ''}: ${(err as Error).message}`);
    }
  }
  const runtime = buildKotlinRuntime(build);
  const sourcesOf = (name: string) => readdirSync(join(build, 'kotlin', name)).map((f) => join(build, 'kotlin', name, f));
  const classes = join(build, 'kotlin-classes');
  // One compile for every case; a case that breaks it is then compiled alone to say which.
  const together = translated.length ? kotlinc(translated.flatMap(sourcesOf), classes, [runtime]) : null;
  const runnable = new Map<string, string>();
  if (!together) for (const name of translated) runnable.set(name, classes);
  else {
    for (const name of translated) {
      const out = join(build, 'kotlin-classes-' + name);
      const errors = kotlinc(sourcesOf(name), out, [runtime]);
      if (errors) { ran.add(`kotlin:${name}`); fail(name, 'kotlin'); console.log(`✗ ${name} (kotlin)${known.kotlin?.[name] ? ' [known]' : ''}: kotlinc:\n${errors.slice(0, 15).join('\n')}`); } else runnable.set(name, out);
    }
  }
  for (const c of cases) {
    const name = basename(c, '.ts');
    const out = runnable.get(name);
    if (!out) continue;
    const run = spawnSync('java', ['-Xss16m', '-cp', [out, runtime, kotlinStdlib()].join(':'), `${pkg(name)}.entry.__MainKt`], { encoding: 'utf8', timeout: 30000 });
    report(name, 'kotlin', expected.get(c)!, run);
  }
  if (!keep) for (const d of readdirSync(build)) if (d.startsWith('kotlin-classes') || d === 'kotlin') rmSync(join(build, d), { recursive: true, force: true });
}

const total = cases.length * targets.length - kotlinSkipped - swiftSkipped;
const caseNames = new Set(cases.map((c) => basename(c, '.ts')));
const nowPassing = targets.flatMap((t) => Object.keys(known[t] ?? {}).filter((n) => caseNames.has(n) && ran.has(`${t}:${n}`) && !knownFailed.includes(`${n} (${t})`)).map((n) => `${n} (${t})`));
for (const n of nowPassing) console.log(`✗ ${n} matches Node: remove it from tests/diff/known-failures.json`);
failed += nowPassing.length;
if (knownFailed.length) console.log(`${knownFailed.length} known failures (tests/diff/known-failures.json): ${knownFailed.join(', ')}`);
console.log(`${total - failed - knownFailed.length + nowPassing.length} of ${total} runs match Node (${targets.join(', ')})`);
process.exit(failed ? 1 : 0);
