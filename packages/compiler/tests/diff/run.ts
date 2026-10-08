#!/usr/bin/env node
// Differential tests: each case under cases/ runs under Node and, translated,
// as a native program: Swift as a macOS command-line program linking the
// kit's JavaScript runtime (Foundation only), and Kotlin on the host JVM
// with kit-android's runtime (plain JVM). Output and exit status must match.
//   node tests/diff/run.ts [case-name…] [--swift | --kotlin] [--keep]
// Build products go to $NS_DIFF_BUILD (default: <tmp>/ns-native-diff).
// Kotlin compiles with $KOTLINC, `kotlinc` on PATH, or the compiler Gradle cached for kit-android.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createProgram } from '../../src/program.ts';
import { Translator } from '../../src/swift.ts';
import { Translator as KotlinTranslator } from '../../src/kotlin.ts';
import { SourceLines } from '../../src/source-lines.ts';
import { collectProperties } from '../../src/properties.ts';
import { addInterfaces, translateModules } from '../../src/modules.ts';
import { addKotlinInterfaces, translateKotlinModules } from '../../src/kotlin-modules.ts';
import ts from 'typescript';
import { kotlinToolchain } from '../kotlin-toolchain.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const kit = join(root, 'kit-apple/Sources/NativeScriptKit');
const kitAndroid = join(root, 'kit-android/src/main/kotlin/org/nativescript/kit');
const build = process.env.NS_DIFF_BUILD ?? join(tmpdir(), 'ns-native-diff');
// The cases are typed by core and the ES library as an app's are (tests/package.json).
const modulesDir = process.env.NS_DIFF_MODULES ?? join(root, 'tests/node_modules');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const keep = process.argv.includes('--keep');
const targets = process.argv.includes('--swift') ? ['swift'] : process.argv.includes('--kotlin') ? ['kotlin'] : ['swift', 'kotlin'];

const runtimeSources = [...readdirSync(join(kit, 'Runtime')).filter((f) => f.endsWith('.swift')).map((f) => join(kit, 'Runtime', f)), join(kit, 'JS.swift'), join(kit, 'Signals.swift')];
const kotlinRuntimeSources = [...readdirSync(join(kitAndroid, 'runtime')).filter((f) => f.endsWith('.kt')).map((f) => join(kitAndroid, 'runtime', f)), join(kitAndroid, 'Signals.kt')];
mkdirSync(build, { recursive: true });

/** The runtime as a static library, rebuilt when a source is newer. */
function buildRuntime() {
  const lib = join(build, 'libNativeScriptKit.a');
  const newest = Math.max(...runtimeSources.map((f) => statSync(f).mtimeMs));
  if (existsSync(lib) && statSync(lib).mtimeMs > newest) return;
  execFileSync('xcrun', ['swiftc', '-parse-as-library', '-emit-library', '-static', '-module-name', 'NativeScriptKit', '-emit-module', '-emit-module-path', join(build, 'NativeScriptKit.swiftmodule'),
    '-Onone', '-o', lib, ...runtimeSources], { stdio: 'inherit', cwd: build });
}

/**
 * A case starting `// @lenient` is checked as core is, without strictNullChecks, and translated
 * as the kit generated from core is, lenient and in library mode (Swift only, as the kit is
 * generated for iOS first).
 */
const lenient = (file: string) => readFileSync(file, 'utf8').startsWith('// @lenient');
/** A case starting `// @swift` covers what only the Swift runtime has yet (typed arrays): it is not run as Kotlin. */
const swiftOnly = (file: string) => lenient(file) || readFileSync(file, 'utf8').startsWith('// @swift');

function translate(file: string, out: string): void {
  const loose = lenient(file);
  const { checker, program, files } = createProgram([file], new Map(), 'ios', modulesDir, undefined, [], {}, loose ? { strict: false, useDefineForClassFields: false } : {});
  // In library mode, as the kit generated from core is: each module's functions and variables in an enum.
  const library = loose ? { moduleName: (f: string) => (f.endsWith('.d.ts') ? null : 'Module_' + basename(f).replace(/\W/g, '_')) } : null;
  const translator = new Translator(checker, new Map(), files, { lenient: loose, library, ...(loose ? { pluginFiles: files.map((f) => f.fileName), properties: collectProperties(checker, files) } : {}) });
  translator.appModule = 'Main';
  // With source lines, as an app is built: the directives must compile wherever a statement can be.
  const lines = translator.lines = new SourceLines(new Map());
  const modules = translateModules(translator, program, [file, ...importsOf(program, file)]);
  addInterfaces(translator, modules);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const header = 'import Foundation\nimport NativeScriptKit\n\n';
  for (const m of modules) writeFileSync(join(out, m.name + '.swift'), header + lines.swift(m.code));
  writeFileSync(join(out, '__Objects.swift'), header + translator.shapesCode() + '\n');
  const inits = modules.filter((m) => m.init).map((m) => `${m.init}()\n`).join('');
  writeFileSync(join(out, 'main.swift'), `${header}${inits}JSEventLoop.runUntilIdle()\n`);
}

/** The case as Kotlin in package `pkg`, with a `main` running its modules' top level and then the event loop. */
function translateKotlin(file: string, out: string, pkg: string): void {
  const { checker, program, files } = createProgram([file], new Map(), 'android', modulesDir);
  const translator = new KotlinTranslator(checker, new Map(), files);
  translator.appModule = pkg;
  const lines = translator.lines = new SourceLines(new Map());
  const modules = translateKotlinModules(translator, program, [file, ...importsOf(program, file)]);
  addKotlinInterfaces(translator, modules);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const header = `@file:Suppress("UNCHECKED_CAST", "UNUSED_VARIABLE", "NAME_SHADOWING", "UNREACHABLE_CODE", "UNUSED_PARAMETER", "REDUNDANT_CALL_OF_CONVERSION_METHOD")\npackage ${pkg}\n\nimport org.nativescript.kit.*\n\n`;
  for (const m of modules) writeFileSync(join(out, m.name + '.kt'), header + lines.kotlin(m.code).code);
  writeFileSync(join(out, '__Objects.kt'), header + translator.shapesCode() + '\n');
  const inits = modules.filter((m) => m.init).map((m) => `    ${m.init}()\n`).join('');
  // In a package of its own: a case may declare a `main` of its own.
  writeFileSync(join(out, '__Main.kt'), `package ${pkg}.entry\n\nimport org.nativescript.kit.*\nimport ${pkg}.*\n\nfun main() {\n${inits}    JSEventLoop.runUntilIdle()\n    System.out.flush()\n}\n`);
}

/** The app modules a case imports (relative imports, transitively). */
function importsOf(program: import('typescript').Program, file: string): string[] {
  const out = new Set<string>();
  const visit = (f: string) => {
    const sf = program.getSourceFile(f);
    if (!sf) return;
    for (const st of sf.statements) {
      const spec = (st as any).moduleSpecifier?.text as string | undefined;
      if (!spec?.startsWith('.')) continue;
      const target = resolve(dirname(f), spec.replace(/\.ts$/, '') + '.ts');
      if (!out.has(target)) { out.add(target); visit(target); }
    }
  };
  visit(file);
  return [...out];
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

// ---- Kotlin toolchain -------------------------------------------------------------------------

let toolchain: ReturnType<typeof kotlinToolchain> | null = null;

function kotlinc(sources: string[], out: string, classpath: string[]): string | null {
  toolchain ??= kotlinToolchain();
  rmSync(out, { recursive: true, force: true });
  const r = toolchain.compile([...sources, '-d', out, '-no-stdlib', '-nowarn', '-jvm-target', '17', '-cp', [toolchain.stdlib, ...classpath].join(':')]);
  if (r.status === 0) return null;
  return (r.stderr + r.stdout).split('\n').filter((l) => /error:/.test(l)).slice(0, 15).join('\n') || r.stderr.slice(0, 2000);
}

/** kit-android's runtime as classes, rebuilt when a source is newer. */
function buildKotlinRuntime(): string {
  const out = join(build, 'kotlin-runtime');
  const stamp = join(out, '.built');
  const newest = Math.max(...kotlinRuntimeSources.map((f) => statSync(f).mtimeMs));
  if (existsSync(stamp) && statSync(stamp).mtimeMs > newest) return out;
  const error = kotlinc(kotlinRuntimeSources, out, []);
  if (error) throw new Error(`the Kotlin runtime does not compile:\n${error}`);
  writeFileSync(stamp, '');
  return out;
}

// ---- Run ---------------------------------------------------------------------------------------

const cases = readdirSync(join(here, 'cases')).filter((f) => f.endsWith('.ts') && (!args.length || args.some((a) => f.startsWith(a)))).sort();
if (targets.includes('swift')) buildRuntime();
const js = join(build, 'js');
rmSync(js, { recursive: true, force: true });
toJavaScript(join(here, 'cases'), js);
const expected = new Map(cases.map((c) => [c, spawnSync('node', [join(js, basename(c, '.ts') + '.js')], { encoding: 'utf8' })]));
let failed = 0;

function report(name: string, target: string, want: { stdout: string; status: number | null }, actual: { stdout: string; stderr: string; status: number | null }) {
  const same = actual.stdout === want.stdout && (actual.status === 0) === (want.status === 0);
  if (same) { console.log(`✓ ${name} (${target})`); return; }
  failed++;
  console.log(`✗ ${name} (${target}): output differs (exit ${want.status} in Node, ${actual.status} native)`);
  const e = want.stdout.split('\n'), a = actual.stdout.split('\n');
  for (let k = 0, shown = 0; k < Math.max(e.length, a.length) && shown < 8; k++) {
    if (e[k] !== a[k]) { console.log(`    line ${k + 1}\n      node:   ${JSON.stringify(e[k])}\n      native: ${JSON.stringify(a[k])}`); shown++; }
  }
  if (actual.stderr) console.log('    native stderr: ' + actual.stderr.split('\n').slice(0, 4).join('\n    '));
}

if (targets.includes('swift')) {
  for (const c of cases) {
    const name = basename(c, '.ts');
    const file = join(here, 'cases', c);
    const dir = join(build, name);
    try {
      translate(file, join(dir, 'Sources'));
      const swiftFiles = readdirSync(join(dir, 'Sources')).map((f) => join(dir, 'Sources', f));
      const compiled = spawnSync('xcrun', ['swiftc', '-Onone', '-module-name', 'Main', '-I', build, '-L', build, '-lNativeScriptKit', '-o', join(dir, name), ...swiftFiles], { encoding: 'utf8' });
      if (compiled.status !== 0) throw new Error(`swiftc:\n${compiled.stderr.split('\n').filter((l) => /error:/.test(l)).slice(0, 15).join('\n')}`);
      report(name, 'swift', expected.get(c)!, spawnSync(join(dir, name), { encoding: 'utf8', timeout: 20000 }));
    } catch (err) {
      failed++;
      console.log(`✗ ${name} (swift): ${(err as Error).message}${process.env.NS_NATIVE_STACKS ? (err as Error).stack : ""}`);
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
      failed++;
      console.log(`✗ ${name} (kotlin): ${(err as Error).message}`);
    }
  }
  const runtime = buildKotlinRuntime();
  const sourcesOf = (name: string) => readdirSync(join(build, 'kotlin', name)).map((f) => join(build, 'kotlin', name, f));
  const classes = join(build, 'kotlin-classes');
  // One compile for every case; a case that breaks it is then compiled alone to say which.
  const together = translated.length ? kotlinc(translated.flatMap(sourcesOf), classes, [runtime]) : null;
  const runnable = new Map<string, string>();
  if (!together) for (const name of translated) runnable.set(name, classes);
  else {
    for (const name of translated) {
      const out = join(build, 'kotlin-classes-' + name);
      const error = kotlinc(sourcesOf(name), out, [runtime]);
      if (error) { failed++; console.log(`✗ ${name} (kotlin): kotlinc:\n${error}`); } else runnable.set(name, out);
    }
  }
  for (const c of cases) {
    const name = basename(c, '.ts');
    const out = runnable.get(name);
    if (!out) continue;
    const run = spawnSync('java', ['-Xss16m', '-cp', [out, runtime, toolchain!.stdlib].join(':'), `${pkg(name)}.entry.__MainKt`], { encoding: 'utf8', timeout: 30000 });
    report(name, 'kotlin', expected.get(c)!, run);
  }
  if (!keep) for (const d of readdirSync(build)) if (d.startsWith('kotlin-classes') || d === 'kotlin') rmSync(join(build, d), { recursive: true, force: true });
}

const total = cases.length * targets.length - (targets.includes('kotlin') ? kotlinSkipped : 0);
console.log(`${total - failed} of ${total} runs match Node (${targets.join(', ')})`);
process.exit(failed ? 1 : 0);
