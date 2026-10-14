// What the host-run tests share: TypeScript translated to Swift or Kotlin as an app's
// modules are, the kit's JavaScript runtimes built for the host (Swift as a static
// library linking Foundation only, Kotlin as classes on the plain JVM), and the compilers.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type ts from 'typescript';
import { createProgram } from '../src/program.ts';
import { Translator } from '../src/swift.ts';
import { Translator as KotlinTranslator } from '../src/kotlin.ts';
import { SourceLines } from '../src/source-lines.ts';
import { collectProperties } from '../src/properties.ts';
import { addInterfaces, evaluationOrder, translateModules, type TranslatedModule } from '../src/modules.ts';
import { addKotlinInterfaces, translateKotlinModules, type KotlinModule } from '../src/kotlin-modules.ts';
import { kotlinToolchain } from './kotlin-toolchain.ts';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const kit = join(root, 'kit-apple/Sources/NativeScriptKit');
export const kitAndroid = join(root, 'kit-android/src/main/kotlin/org/nativescript/kit');
/** What test programs are typed against: core and the ES library, as an app's node_modules hold them (tests/package.json). */
export const modulesDir = process.env.NS_DIFF_MODULES ?? join(root, 'tests/node_modules');

export const runtimeSources = [...readdirSync(join(kit, 'Runtime')).filter((f) => f.endsWith('.swift')).map((f) => join(kit, 'Runtime', f)), join(kit, 'JS.swift'), join(kit, 'Signals.swift')];
export const kotlinRuntimeSources = [...readdirSync(join(kitAndroid, 'runtime')).filter((f) => f.endsWith('.kt')).map((f) => join(kitAndroid, 'runtime', f)), join(kitAndroid, 'Signals.kt')];

export type Optimize = '-Onone' | '-O' | '-Osize';

/** The language mode and isolation the kit and an app's code compile with (the CLI's project settings). */
export const SWIFT_MODE = ['-swift-version', '6', '-default-isolation', 'MainActor'];

/**
 * The Swift runtime as a static library and module in `build`, rebuilt when a source is newer or it was built with
 * other flags. `extraFlags` go to swiftc as given (`-wmo`, as release builds compile the kit whole-module).
 */
export function buildSwiftRuntime(build: string, optimize: Optimize, extraFlags: string[] = []) {
  mkdirSync(build, { recursive: true });
  const lib = join(build, 'libNativeScriptKit.a');
  const flags = [optimize, ...SWIFT_MODE, ...extraFlags].join(' ');
  const stamp = join(build, 'libNativeScriptKit.flags');
  const newest = Math.max(...runtimeSources.map((f) => statSync(f).mtimeMs));
  if (existsSync(lib) && statSync(lib).mtimeMs > newest && existsSync(stamp) && readFileSync(stamp, 'utf8') === flags) return;
  execFileSync('xcrun', ['swiftc', '-parse-as-library', '-emit-library', '-static', '-module-name', 'NativeScriptKit', '-emit-module', '-emit-module-path', join(build, 'NativeScriptKit.swiftmodule'),
    optimize, ...SWIFT_MODE, ...extraFlags, '-o', lib, ...runtimeSources], { stdio: 'inherit', cwd: build });
  writeFileSync(stamp, flags);
}

export interface SwiftOptions {
  /** Checked as core is (no strictNullChecks) and translated as the kit generated from core is: lenient, in library mode. */
  lenient?: boolean;
  /** What the kit's configuration holds weakly (tools/native-kit/modules.mts). */
  weak?: { fields: string[]; captures: string[] };
  /** Classes' accessors and methods readable by name, as an XML app's are. */
  membersByName?: boolean;
  /** Translated as the CLI translates an app, with the strictness its own tsconfig.json gives (lenient where that is not strict). */
  appStrictness?: boolean;
  /**
   * Each module translated on its own, what one cannot translate given here rather than thrown: the others still translate.
   * Without it, the first module that cannot translate throws.
   */
  refused?: (file: string, error: Error) => void;
}

/**
 * `roots` and the app modules they import as Swift in `out`: one file per module and the shapes' file.
 * The modules come back in evaluation order, for the entry point to run their inits.
 */
export function translateSwift(roots: string[], out: string, o: SwiftOptions = {}): TranslatedModule[] {
  const loose = !!o.lenient;
  const { checker, program, files: rootFiles, lenient: lenientApp } = createProgram(roots, new Map(), 'ios', modulesDir, undefined, [], {}, loose ? { strict: false, useDefineForClassFields: false } : {});
  const imported = roots.flatMap((r) => importsOf(program, r, 'ios'));
  // The helper modules the roots import are the program's too, as an app's every module is.
  const all = [...rootFiles, ...imported.map((f) => program.getSourceFile(f)!).filter((sf) => sf && !rootFiles.includes(sf))];
  // In library mode, as the kit generated from core is: each module's functions and variables in an enum.
  const library = loose ? { moduleName: (f: string) => (f.endsWith('.d.ts') ? null : 'Module_' + basename(f).replace(/\W/g, '_')) } : null;
  // Every module, as an app's are: names its modules share are told apart across them.
  const translator = new Translator(checker, new Map(), all, { lenient: loose, library, weak: o.weak, ...(loose ? { pluginFiles: all.map((f) => f.fileName), properties: collectProperties(checker, all) } : {}) });
  translator.appModule = 'Main';
  translator.appMembersByName = !!o.membersByName;
  if (o.appStrictness) translator.lenientApp = lenientApp;
  // With source lines, as an app is built: the directives must compile wherever a statement can be.
  const lines = translator.lines = new SourceLines(new Map());
  const files = [...new Set([...roots, ...imported])];
  const modules = o.refused ? eachModule(program, files, (f) => translateModules(translator, program, [f]), o.refused) : translateModules(translator, program, files);
  addInterfaces(translator, modules);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const m of modules) writeFileSync(join(out, m.name + '.swift'), SWIFT_HEADER + lines.swift(m.code));
  writeFileSync(join(out, '__Objects.swift'), SWIFT_HEADER + translator.shapesCode() + '\n');
  return modules;
}

export const SWIFT_HEADER = 'import Foundation\nimport NativeScriptKit\n\n';

/** The entry point an app's modules run from: each module's top level in order, then the event loop. */
export function swiftMain(modules: TranslatedModule[]): string {
  const inits = modules.filter((m) => m.init).map((m) => `${m.init}()\n`).join('');
  return `${SWIFT_HEADER}${inits}JSEventLoop.runUntilIdle()\n`;
}

/**
 * An executable from Swift sources linking the runtime in `build`; the compiler's error lines when it does not compile.
 * Its warning lines go into `warnings` when given.
 */
export function swiftc(sources: string[], exe: string, build: string, optimize: Optimize, extraFlags: string[] = [], warnings?: string[]): string[] | null {
  const r = spawnSync('xcrun', ['swiftc', optimize, ...SWIFT_MODE, ...extraFlags, '-module-name', 'Main', '-I', build, '-L', build, '-lNativeScriptKit', '-o', exe, ...sources], { encoding: 'utf8', maxBuffer: 256 << 20 });
  warnings?.push(...new Set(r.stderr.split('\n').filter((l) => /^\S.*: warning:/.test(l))));
  if (r.status === 0) return null;
  const errors = r.stderr.split('\n').filter((l) => /error:/.test(l));
  return errors.length ? errors : [r.stderr.slice(0, 2000) || `swiftc exited ${r.status ?? r.signal}`];
}

export interface KotlinOptions {
  /** Translated as kit-gen-kotlin.ts generates kit-android: lenient, in library mode. */
  lenient?: boolean;
  membersByName?: boolean;
  appStrictness?: boolean;
  refused?: (file: string, error: Error) => void;
}

/** `roots` and the app modules they import as Kotlin in package `pkg`, in `out`. */
export function translateKotlin(roots: string[], out: string, pkg: string, o: KotlinOptions = {}): KotlinModule[] {
  const loose = !!o.lenient;
  const { checker, program, files: rootFiles, lenient: lenientApp } = createProgram(roots, new Map(), 'android', modulesDir, undefined, [], {}, loose ? { strict: false, useDefineForClassFields: false } : {});
  const imported = roots.flatMap((r) => importsOf(program, r, 'android'));
  // Every module, as an app's are: a class another module extends stays open.
  const files = [...rootFiles, ...imported.map((f) => program.getSourceFile(f)!).filter((sf) => sf && !rootFiles.includes(sf))];
  const library = { identities: new Set<string>(), counterpart: () => null, moduleName: (f: string) => (f.endsWith('.d.ts') ? null : 'Module_' + basename(f).replace(/\W/g, '_')) };
  const translator = new KotlinTranslator(checker, new Map(), files, loose ? { lenient: true, library, pluginFiles: files.map((f) => f.fileName), properties: collectProperties(checker, files) } : {});
  translator.appModule = pkg;
  translator.appMembersByName = !!o.membersByName;
  // As android.ts sets it: the Kotlin translator reads the field without declaring it.
  if (o.appStrictness) (translator as { lenientApp?: boolean }).lenientApp = lenientApp;
  const lines = translator.lines = new SourceLines(new Map());
  const all = [...new Set([...roots, ...imported])];
  const modules = o.refused ? eachModule(program, all, (f) => translateKotlinModules(translator, program, [f]), o.refused) : translateKotlinModules(translator, program, all);
  addKotlinInterfaces(translator, modules);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const header = kotlinHeader(pkg);
  for (const m of modules) writeFileSync(join(out, m.name + '.kt'), header + lines.kotlin(m.code).code);
  writeFileSync(join(out, '__Objects.kt'), header + translator.shapesCode() + '\n');
  return modules;
}

export const kotlinHeader = (pkg: string) => `package ${pkg}\n\nimport org.nativescript.kit.*\n\n`;

/** The entry point, in a package of its own (a program may declare a `main` of its own): each module's top level in order, then the event loop. */
export function kotlinMain(modules: KotlinModule[], pkg: string): string {
  const inits = modules.filter((m) => m.init).map((m) => `    ${m.init}()\n`).join('');
  return `package ${pkg}.entry\n\nimport org.nativescript.kit.*\nimport ${pkg}.*\n\nfun main() {\n${inits}    JSEventLoop.runUntilIdle()\n    System.out.flush()\n}\n`;
}

/** Modules in evaluation order, each translated alone so that one that cannot be does not stop the rest. */
function eachModule<M>(program: ts.Program, files: string[], one: (file: string) => M[], refused: (file: string, error: Error) => void): M[] {
  const out: M[] = [];
  for (const f of evaluationOrder(program, files)) {
    try { out.push(...one(f)); } catch (e) { refused(f, e as Error); }
  }
  return out;
}

/**
 * The app modules a file imports (relative imports, transitively), each as the program loaded it: for `platform`,
 * `./x` is `x.<platform>.ts` where there is one, as the bundler resolves it.
 */
export function importsOf(program: ts.Program, file: string, platform?: 'ios' | 'android'): string[] {
  const out = new Set<string>();
  const visit = (f: string) => {
    const sf = program.getSourceFile(f);
    if (!sf) return;
    for (const st of sf.statements) {
      const spec = (st as any).moduleSpecifier?.text as string | undefined;
      if (!spec?.startsWith('.')) continue;
      const base = resolve(dirname(f), spec);
      // A specifier naming its file (`./x.ts`) is that file.
      const candidates = spec.endsWith('.ts') ? [base] : [...(platform ? [`${base}.${platform}.ts`] : []), `${base}.ts`, ...(platform ? [`${base}/index.${platform}.ts`] : []), `${base}/index.ts`];
      const target = candidates.find((c) => program.getSourceFile(c));
      if (target && !out.has(target)) { out.add(target); visit(target); }
    }
  };
  visit(file);
  return [...out];
}

// ---- Kotlin toolchain -------------------------------------------------------------------------

let toolchain: ReturnType<typeof kotlinToolchain> | null = null;

/** The Kotlin standard library classes run against. */
export function kotlinStdlib(): string {
  toolchain ??= kotlinToolchain();
  return toolchain.stdlib;
}

/** Kotlin sources compiled to classes in `out`; the compiler's error lines when they do not compile. `extraFlags` go to kotlinc as given. */
export function kotlinc(sources: string[], out: string, classpath: string[], extraFlags: string[] = []): string[] | null {
  toolchain ??= kotlinToolchain();
  rmSync(out, { recursive: true, force: true });
  const r = toolchain.compile([...sources, '-d', out, '-no-stdlib', '-nowarn', '-jvm-target', '17', ...extraFlags, '-cp', [toolchain.stdlib, ...classpath].join(':')]);
  if (r.status === 0) return null;
  // An error's own lines after its first (`conflicting declarations:` and what conflicts) belong to it.
  const errors: string[] = [];
  let open = false;
  for (const l of (r.stderr + r.stdout).split('\n')) {
    if (/error:/.test(l)) { errors.push(l); open = true; } else if (open && l.trim() && !/^\S+:\d+:\d+: \w+:/.test(l) && !/^(warning|info):/.test(l)) errors[errors.length - 1] += ' ' + l.trim();
    else open = false;
  }
  return errors.length ? errors : [r.stderr.slice(0, 2000) || `kotlinc exited ${r.status}`];
}

/** kit-android's runtime as classes in `build`, rebuilt when a source is newer or it was built with other flags. */
export function buildKotlinRuntime(build: string, extraFlags: string[] = []): string {
  const out = join(build, 'kotlin-runtime');
  const stamp = join(out, '.built');
  const flags = extraFlags.join(' ');
  const newest = Math.max(...kotlinRuntimeSources.map((f) => statSync(f).mtimeMs));
  if (existsSync(stamp) && statSync(stamp).mtimeMs > newest && readFileSync(stamp, 'utf8') === flags) return out;
  const errors = kotlinc(kotlinRuntimeSources, out, [], extraFlags);
  if (errors) throw new Error(`the Kotlin runtime does not compile:\n${errors.slice(0, 15).join('\n')}`);
  writeFileSync(stamp, flags);
  return out;
}
