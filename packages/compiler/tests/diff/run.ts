#!/usr/bin/env node
// Differential tests: each case under cases/ runs under Node and, translated,
// as a native program: Swift as a macOS command-line program linking the
// kit's JavaScript runtime (Foundation only), and Kotlin on the host JVM
// with kit-android's runtime (plain JVM). Output and exit status must match.
//   node tests/diff/run.ts [case-name…] [--swift | --kotlin] [--keep] [--osize] [--no-cache]
// A case whose build inputs (its emitted program, the runtime, flags, toolchain and host) are a stored run's reuses that
// run's outcome from tests/build-cache.ts's cache, and Node's output is reused for unchanged JavaScript. --no-cache builds
// and runs every case and stores the outcomes; --keep does too, leaving every case's build products.
// --osize builds the Swift runtime and cases with -Osize, the optimizer release builds use (into <build>-osize).
// Build products go to $NS_DIFF_BUILD (default: <tmp>/ns-native-diff).
// Node runs with --expose-gc: a case checking object lifetimes calls `globalThis.gc?.()`, which ARC needs no call for.
// Kotlin compiles with $KOTLINC, `kotlinc` on PATH, or the compiler Gradle cached for kit-android.
import { spawnSync } from 'node:child_process';
import { BuildCache, cacheRoot, failedBuild, hash, hashDir, hashFiles, host, kotlinCompiler, javaRuntime, nodeRuntime, outcomeOf, swiftToolchain, type Outcome } from '../build-cache.ts';
import { kotlinRuntimeSources, modulesDir, root, runtimeSources, SWIFT_MODE } from '../native-build.ts';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { kotlinApp, kotlinOnly, kotlinOptions, swiftOnly, swiftOptions } from './case-options.ts';
import { buildKotlinRuntime, buildSwiftRuntime, kotlinc, kotlinMain, kotlinStdlib, swiftc, swiftMain, translateKotlin as translateKotlinProgram, translateSwift } from '../native-build.ts';

const here = dirname(fileURLToPath(import.meta.url));
const optimize = process.argv.includes('--osize') ? '-Osize' : '-Onone';
const build = (process.env.NS_DIFF_BUILD ?? join(tmpdir(), 'ns-native-diff')) + (optimize === '-Osize' ? '-osize' : '');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const keep = process.argv.includes('--keep');
const caches: BuildCache[] = [];
const cacheFor = (backend: string) => { const c = new BuildCache(backend, { read: !keep && !process.argv.includes('--no-cache'), paths: { BUILD: build, ROOT: root } }); caches.push(c); return c; };
/** How the cases are built and run, checked, and their outcomes stored. */
const harness = hashFiles([fileURLToPath(import.meta.url), join(here, 'case-options.ts'), join(root, 'tests/native-build.ts'), join(root, 'tests/kotlin-toolchain.ts'), join(root, 'tests/build-cache.ts')]);
const targets = process.argv.includes('--swift') ? ['swift'] : process.argv.includes('--kotlin') ? ['kotlin'] : ['swift', 'kotlin'];
mkdirSync(build, { recursive: true });

function translate(file: string, out: string): void {
  const modules = translateSwift([file], out, swiftOptions(file));
  writeFileSync(join(out, 'main.swift'), swiftMain(modules));
}

/** The case as Kotlin in package `pkg`, with a `main` running its modules' top level and then the event loop. */
function translateKotlin(file: string, out: string, pkg: string): void {
  const modules = translateKotlinProgram([file], out, pkg, kotlinOptions(file));
  writeFileSync(join(out, '__Main.kt'), kotlinMain(modules, pkg));
}

/** The case as JavaScript for Node, the way an app's bundler compiles TypeScript (Node strips types but cannot transform parameter properties or enums). */
function toJavaScript(dir: string, out: string) {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'package.json'), '{ "type": "module" }');
  // A case importing a package (rxjs) loads the one the translator compiles from source.
  symlinkSync(modulesDir, join(out, 'node_modules'), 'dir');
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
const js = join(build, 'js');
rmSync(js, { recursive: true, force: true });
toJavaScript(join(here, 'cases'), js);

/** The JavaScript files Node loads for `entry`: it and its relative imports, transitively. Null when it imports a package, which the key would not cover. */
function jsProgram(entry: string): string[] | null {
  const files = new Set([entry]);
  for (const f of files) {
    if (!existsSync(f)) continue;
    for (const { fileName } of ts.preProcessFile(readFileSync(f, 'utf8'), true, true).importedFiles) {
      if (fileName.startsWith('.')) files.add(resolve(dirname(f), fileName));
      else if (!fileName.startsWith('node:')) return null;
    }
  }
  return [...files].sort();
}

const nodeCache = cacheFor('node');
const shim = join(here, 'native-shim.js');
const nodeBase = hash('node', nodeRuntime(), host(), readFileSync(shim), harness);
const expected = new Map(cases.map((c): [string, Outcome] => {
  const entry = join(js, basename(c, '.ts') + '.js');
  const program = jsProgram(entry);
  const key = program && hash(nodeBase, ...program.flatMap((f) => [relative(js, f), existsSync(f) ? readFileSync(f) : '']));
  const hit = key ? nodeCache.get(key) : null;
  if (hit) return [c, hit];
  const outcome = outcomeOf(spawnSync('node', ['--expose-gc', '--import', shim, entry], { encoding: 'utf8' }));
  if (key) nodeCache.put(key, outcome);
  return [c, outcome];
}));
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
  if (same) { console.log(`✓ ${name} (${target})`); return true; }
  fail(name, target);
  console.log(`✗ ${name} (${target})${known[target]?.[name] ? ' [known]' : ''}: output differs (exit ${want.status} in Node, ${actual.status} native)`);
  const e = want.stdout.split('\n'), a = actual.stdout.split('\n');
  for (let k = 0, shown = 0; k < Math.max(e.length, a.length) && shown < 8; k++) {
    if (e[k] !== a[k]) { console.log(`    line ${k + 1}\n      node:   ${JSON.stringify(e[k])}\n      native: ${JSON.stringify(a[k])}`); shown++; }
  }
  if (actual.stderr) console.log('    native stderr: ' + actual.stderr.split('\n').slice(0, 4).join('\n    '));
  return false;
}

/**
 * Reports a case's native outcome: `hit`, the stored one, or else what `make` builds and runs. A new outcome is stored
 * when it matches Node or the case is a known failure. One that newly differs is not, so it is built and run again
 * next time: a flaky failure never sticks.
 */
function settle(cache: BuildCache, key: string, hit: Outcome | null, name: string, target: string, want: Outcome, make: () => Outcome) {
  const outcome = hit ?? make();
  let matches = false;
  if (outcome.error === undefined) matches = report(name, target, want, outcome);
  else {
    ran.add(`${target}:${name}`);
    fail(name, target);
    console.log(`✗ ${name} (${target})${known[target]?.[name] ? ' [known]' : ''}: ${outcome.error}`);
  }
  if (!hit && (matches || known[target]?.[name])) cache.put(key, outcome);
}

let swiftSkipped = 0;
if (targets.includes('swift')) {
  const cache = cacheFor('swift');
  const base = hash('swift', swiftToolchain(), host(), hashFiles(runtimeSources), optimize, ...SWIFT_MODE, harness);
  let runtimeBuilt = false;
  for (const c of cases) {
    const name = basename(c, '.ts');
    const file = join(here, 'cases', c);
    if (kotlinOnly(file) || kotlinApp(file)) { swiftSkipped++; continue; }
    const dir = join(build, name);
    try {
      translate(file, join(dir, 'Sources'));
    } catch (err) {
      ran.add(`swift:${name}`);
      fail(name, 'swift');
      console.log(`✗ ${name} (swift)${known.swift?.[name] ? ' [known]' : ''}: ${(err as Error).message}${process.env.NS_NATIVE_STACKS ? (err as Error).stack : ""}`);
      if (!keep) rmSync(dir, { recursive: true, force: true });
      continue;
    }
    const key = hash(base, JSON.stringify(swiftOptions(file)), hashDir(join(dir, 'Sources')));
    settle(cache, key, cache.get(key), name, 'swift', expected.get(c)!, () => {
      if (!runtimeBuilt) { buildSwiftRuntime(build, optimize); runtimeBuilt = true; }
      const swiftFiles = readdirSync(join(dir, 'Sources')).map((f) => join(dir, 'Sources', f));
      const warnings: string[] = [];
      const errors = swiftc(swiftFiles, join(dir, name), build, optimize, [], warnings);
      if (errors) return failedBuild(`swiftc:\n${errors.slice(0, 15).join('\n')}`);
      // Isolation and sendability are checked as an app's code is: a warning there fails the case.
      const concurrency = warnings.filter((w) => /Sendable|actor|isolat|data race|concurrently/i.test(w));
      if (concurrency.length) return failedBuild(`swiftc concurrency warnings:\n${concurrency.slice(0, 15).join('\n')}`);
      return outcomeOf(spawnSync(join(dir, name), { encoding: 'utf8', timeout: 20000 }));
    });
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
  const cache = cacheFor('kotlin');
  const base = hash('kotlin', kotlinCompiler(), javaRuntime(), host(), hashFiles(kotlinRuntimeSources), harness);
  const keys = new Map(translated.map((name) => [name, hash(base, JSON.stringify(kotlinOptions(join(here, 'cases', name + '.ts'))), hashDir(join(build, 'kotlin', name)))]));
  const hits = new Map<string, Outcome>();
  for (const name of translated) { const hit = cache.get(keys.get(name)!); if (hit) hits.set(name, hit); }
  const misses = translated.filter((name) => !hits.has(name));
  const runtime = misses.length ? buildKotlinRuntime(build) : '';
  const sourcesOf = (name: string) => readdirSync(join(build, 'kotlin', name)).map((f) => join(build, 'kotlin', name, f));
  const classes = join(build, 'kotlin-classes');
  // One compile for every case; a case that breaks it is then compiled alone to say which.
  const together = misses.length ? kotlinc(misses.flatMap(sourcesOf), classes, [runtime]) : null;
  const runnable = new Map<string, string>();
  const errors = new Map<string, string>();
  if (!together) for (const name of misses) runnable.set(name, classes);
  else {
    for (const name of misses) {
      const out = join(build, 'kotlin-classes-' + name);
      const e = kotlinc(sourcesOf(name), out, [runtime]);
      if (e) errors.set(name, `kotlinc:\n${e.slice(0, 15).join('\n')}`); else runnable.set(name, out);
    }
  }
  const settleKotlin = (name: string, make: () => Outcome) => settle(cache, keys.get(name)!, hits.get(name) ?? null, name, 'kotlin', expected.get(name + '.ts')!, make);
  // Build errors before runs, as each case's own build and run would report them.
  for (const name of translated) if (hits.get(name)?.error !== undefined || errors.has(name)) settleKotlin(name, () => failedBuild(errors.get(name)!));
  for (const name of translated) {
    const out = runnable.get(name);
    if (!out && (!hits.has(name) || hits.get(name)!.error !== undefined)) continue;
    settleKotlin(name, () => outcomeOf(spawnSync('java', ['-Xss16m', '-cp', [out!, runtime, kotlinStdlib()].join(':'), `${pkg(name)}.entry.__MainKt`], { encoding: 'utf8', timeout: 30000 })));
  }
  if (!keep) for (const d of readdirSync(build)) if (d.startsWith('kotlin-classes') || d === 'kotlin') rmSync(join(build, d), { recursive: true, force: true });
}

const total = cases.length * targets.length - kotlinSkipped - swiftSkipped;
const caseNames = new Set(cases.map((c) => basename(c, '.ts')));
const nowPassing = targets.flatMap((t) => Object.keys(known[t] ?? {}).filter((n) => caseNames.has(n) && ran.has(`${t}:${n}`) && !knownFailed.includes(`${n} (${t})`)).map((n) => `${n} (${t})`));
for (const n of nowPassing) console.log(`✗ ${n} matches Node: remove it from tests/diff/known-failures.json`);
failed += nowPassing.length;
if (knownFailed.length) console.log(`${knownFailed.length} known failures (tests/diff/known-failures.json): ${knownFailed.join(', ')}`);
console.log(`cache (${cacheRoot}): ${caches.map((c) => c.summary()).join(', ')}`);
console.log(`${total - failed - knownFailed.length + nowPassing.length} of ${total} runs match Node (${targets.join(', ')})`);
process.exit(failed ? 1 : 0);
