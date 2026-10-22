// What the host-run tests share: TypeScript translated to Swift or Kotlin as an app's
// modules are, the kit's JavaScript runtimes built for the host (Swift as a static
// library linking Foundation only, Kotlin as classes on the plain JVM), and the compilers.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { PluginSources, writtenStrict } from '../src/plugins/source.ts';
import { reachability } from '../src/reach.ts';
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
   * A non-strict app whose modules under a `plugin` folder are a plugin's: translated as the CLI translates a plugin
   * compiled from its source (lenient, not in library mode), the rest as the app's code.
   */
  plugin?: boolean;
  /** Translated as a non-strict app's own code is (`strict: false` in its tsconfig.json). */
  lenientApp?: boolean;
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
  const packages = new PluginSources({ app: join(root, 'tests'), platform: 'ios' });
  const { checker, program, files: programFiles, pluginFiles: packageFiles, resolved, lenient: lenientApp } = createProgram(roots, new Map(), 'ios', modulesDir, packages, [], {}, loose ? { strict: false, useDefineForClassFields: false } : o.plugin || o.lenientApp ? { strict: false, useUnknownInCatchVariables: false } : {});
  const rootFiles = programFiles.filter((sf) => !packageFiles.includes(sf.fileName));
  const imported = roots.flatMap((r) => importsOf(program, r, 'ios'));
  const appFiles = [...new Set([...roots, ...imported])];
  // The packages' sources the case reaches, compiled as an app's plugins are: only what it reaches, checked against npm's files.
  const reach = packageFiles.length ? reachability(program, resolved, appFiles, new Set(packageFiles), 'ios') : undefined;
  const compiled = reach ? packageFiles.filter((f) => reach.modules.has(f) && program.getSourceFile(f)!.statements.some((st) => reach.keeps(st) && !ts.isImportDeclaration(st) && !ts.isExportDeclaration(st))) : [];
  packages.verify(compiled);
  // The helper modules the roots import are the program's too, as an app's every module is.
  const all = [...rootFiles, ...imported.map((f) => program.getSourceFile(f)!).filter((sf) => sf && !rootFiles.includes(sf)), ...packageFiles.map((f) => program.getSourceFile(f)!)];
  // In library mode, as the kit generated from core is: each module's functions and variables in an enum.
  const library = loose ? { moduleName: (f: string) => (f.endsWith('.d.ts') ? null : 'Module_' + basename(f).replace(/\W/g, '_')) } : null;
  const plugin = [...(o.plugin ? all.map((f) => f.fileName).filter((f) => /[\\/]plugin[\\/]/.test(f)) : []), ...packageFiles];
  const lenientPlugins = [...(o.plugin ? plugin.filter((f) => !packageFiles.includes(f)) : []), ...packageFiles.filter((f) => !writtenStrict(f))];
  // Every module, as an app's are: names its modules share are told apart across them.
  const translator = new Translator(checker, new Map(), all, { lenient: loose, library, weak: o.weak, lenientApp: !!(o.plugin || o.lenientApp || (o.appStrictness && lenientApp)), ...(loose ? { pluginFiles: all.map((f) => f.fileName), properties: collectProperties(checker, all) } : plugin.length ? { pluginFiles: plugin, lenientFiles: lenientPlugins, properties: collectProperties(checker, all), reach } : {}) });
  if (reach) translator.compiledFiles = new Set(compiled);
  if (process.env.NS_DIFF_ALL_ERRORS) translator.errors = [];
  translator.appModule = 'Main';
  translator.appMembersByName = !!o.membersByName;
  // With source lines, as an app is built: the directives must compile wherever a statement can be.
  const lines = translator.lines = new SourceLines(new Map());
  const files = [...appFiles, ...compiled];
  const modules = o.refused ? eachModule(program, files, (f) => translateModules(translator, program, [f], resolved), o.refused) : translateModules(translator, program, files, resolved);
  if (translator.errors?.length) throw new Error([...new Set(translator.errors)].join('\n'));
  addInterfaces(translator, modules);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  // Module names that differ only in case (rxjs's `observable` and `Observable`) are separate files on a case-insensitive disk.
  const taken = new Set<string>();
  for (const m of modules) {
    let file = m.name;
    while (taken.has(file.toLowerCase())) file += '_module';
    taken.add(file.toLowerCase());
    writeFileSync(join(out, file + '.swift'), SWIFT_HEADER + lines.swift(m.code));
  }
  writeFileSync(join(out, '__Objects.swift'), SWIFT_HEADER + translator.shapesCode() + '\n');
  return modules;
}

export const SWIFT_HEADER = 'import Foundation\nimport NativeScriptKit\n\n';

/**
 * Node's handling of an error nothing catches, where script sets no handler (`globalThis.__onUncaughtError`): the
 * error on standard error and exit status 1. The kit's own default reports it and goes on, as an app's runtime does.
 */
const NODE_UNCAUGHT_SWIFT = `let __reported = jsUncaughtHandler
jsUncaughtHandler = { value in
    if jsIsNullish(jsField(jsGlobalThis, "__onUncaughtError")) { jsError("Uncaught", value); exit(1) }
    __reported(value)
}
let __rejected = Microtasks.onUnhandledRejection
Microtasks.onUnhandledRejection = { reason in
    if jsIsNullish(jsField(jsGlobalThis, "__onUncaughtError")) { jsError("Uncaught (in promise)", reason); exit(1) }
    __rejected(reason)
}
`;
const NODE_UNCAUGHT_KOTLIN = `    val reported = jsUncaughtHandler
    jsUncaughtHandler = { value ->
        if (jsIsNullish(jsField(jsGlobalThis, "__onUncaughtError"))) { jsError("Uncaught", value); System.out.flush(); kotlin.system.exitProcess(1) }
        reported(value)
    }
    val rejected = Microtasks.onUnhandledRejection
    Microtasks.onUnhandledRejection = { reason ->
        if (jsIsNullish(jsField(jsGlobalThis, "__onUncaughtError"))) { jsError("Uncaught (in promise)", reason); System.out.flush(); kotlin.system.exitProcess(1) }
        rejected(reason)
    }
`;

/** The entry point an app's modules run from: each module's top level in order, then the event loop. */
export function swiftMain(modules: TranslatedModule[]): string {
  const inits = modules.filter((m) => m.init).map((m) => `${m.init}()\n`).join('');
  return `${SWIFT_HEADER}${NODE_UNCAUGHT_SWIFT}${inits}JSEventLoop.runUntilIdle()\n`;
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
  lenientApp?: boolean;
  refused?: (file: string, error: Error) => void;
}

/** `roots` and the app modules they import as Kotlin in package `pkg`, in `out`. */
export function translateKotlin(roots: string[], out: string, pkg: string, o: KotlinOptions = {}): KotlinModule[] {
  const loose = !!o.lenient;
  const packages = new PluginSources({ app: join(root, 'tests'), platform: 'android' });
  const { checker, program, files: programFiles, pluginFiles: packageFiles, resolved, lenient: lenientApp } = createProgram(roots, new Map(), 'android', modulesDir, packages, [], {}, loose ? { strict: false, useDefineForClassFields: false } : o.lenientApp ? { strict: false, useUnknownInCatchVariables: false } : {});
  const rootFiles = programFiles.filter((sf) => !packageFiles.includes(sf.fileName));
  const imported = roots.flatMap((r) => importsOf(program, r, 'android'));
  const appFiles = [...new Set([...roots, ...imported])];
  const reach = packageFiles.length ? reachability(program, resolved, appFiles, new Set(packageFiles), 'android') : undefined;
  const compiled = reach ? packageFiles.filter((f) => reach.modules.has(f) && program.getSourceFile(f)!.statements.some((st) => reach.keeps(st) && !ts.isImportDeclaration(st) && !ts.isExportDeclaration(st))) : [];
  packages.verify(compiled);
  // Every module, as an app's are: a class another module extends stays open.
  const all = [...rootFiles, ...imported.map((f) => program.getSourceFile(f)!).filter((sf) => sf && !rootFiles.includes(sf)), ...packageFiles.map((f) => program.getSourceFile(f)!)];
  const library = { identities: new Set<string>(), counterpart: () => null, moduleName: (f: string) => (f.endsWith('.d.ts') ? null : 'Module_' + basename(f).replace(/\W/g, '_')) };
  const lenientPlugins = packageFiles.filter((f) => !writtenStrict(f));
  const translator = new KotlinTranslator(checker, new Map(), all, { lenientApp: !!(o.lenientApp || (o.appStrictness && lenientApp)), ...(loose ? { lenient: true, library, pluginFiles: all.map((f) => f.fileName), properties: collectProperties(checker, all) } : packageFiles.length ? { pluginFiles: packageFiles, lenientFiles: lenientPlugins, properties: collectProperties(checker, all), reach } : {}) });
  translator.appModule = pkg;
  translator.appMembersByName = !!o.membersByName;
  const lines = translator.lines = new SourceLines(new Map());
  const files = [...appFiles, ...compiled];
  const modules = o.refused ? eachModule(program, files, (f) => translateKotlinModules(translator, program, [f], resolved), o.refused) : translateKotlinModules(translator, program, files, resolved);
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
  return `package ${pkg}.entry\n\nimport org.nativescript.kit.*\nimport ${pkg}.*\n\nfun main() {\n${NODE_UNCAUGHT_KOTLIN}${inits}    JSEventLoop.runUntilIdle()\n    System.out.flush()\n}\n`;
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
