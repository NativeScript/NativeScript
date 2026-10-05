import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { iosTarget, nativeTable } from './symbols.ts';

/**
 * @nativescript/core's own iOS code, in `platforms/ios` of core as installed,
 * which core's TypeScript calls as it calls the SDK:
 * - each `.xcframework`, a dynamic framework (TNSWidgets: `TNSLabel`,
 *   `UIImage+TNSBlocks`, `UIView+PassThroughParent`);
 * - the Objective-C in `src`, as the modules its `module.modulemap` declares
 *   (NativeScriptUtils, NativeScriptEmbedder, UIViewNativeScript);
 * - the Swift in `src` (`NativeScriptViewFactory`), module `nsswiftsupport`,
 *   the name core's typings give it.
 * Each module gets a symbol table as a plugin's does, cached by a hash of its files.
 */
export interface CoreNativeModule {
  module: string;
  kind: 'framework' | 'clang' | 'swift';
  /** The `.xcframework`, or the `src` folder. */
  path: string;
}

export const CORE_SWIFT_MODULE = 'nsswiftsupport';

/** `platforms/ios` of core as installed (`node_modules/@nativescript/core`). */
export function coreNativeModules(core: string): CoreNativeModule[] {
  const ios = join(core, 'platforms', 'ios');
  if (!existsSync(ios)) return [];
  const out: CoreNativeModule[] = [];
  for (const f of readdirSync(ios).sort()) {
    if (!f.endsWith('.xcframework')) continue;
    const slice = simulatorSlice(join(ios, f));
    if (slice) out.push({ module: frameworkModule(slice), kind: 'framework', path: join(ios, f) });
  }
  const src = join(ios, 'src');
  const map = join(src, 'module.modulemap');
  if (existsSync(map)) for (const m of readFileSync(map, 'utf8').matchAll(/^\s*module\s+(\w+)\s*\{/gm)) out.push({ module: m[1], kind: 'clang', path: src });
  if (existsSync(src) && readdirSync(src).some((f) => f.endsWith('.swift'))) out.push({ module: CORE_SWIFT_MODULE, kind: 'swift', path: src });
  return out;
}

/** Generates (or reads from the cache) the table of each of core's native modules; their names. */
export function loadCoreNativeTables(core: string): string[] {
  const modules = coreNativeModules(core);
  for (const m of modules) {
    const scratch = mkdtempSync(join(tmpdir(), `ns-core-${m.module}-`));
    try {
      nativeTable(m.module, { key: key(m), extraArgs: () => extractArgs(m, scratch) });
    } catch (e) {
      throw new Error(`@nativescript/core's ${m.module} (${m.path}): ${(e as Error).message}`);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }
  return modules.map((m) => m.module);
}

/** `@nativescript/core` as the app installed it (or a parent folder did). */
export function installedCore(app: string): string | null {
  for (let dir = app; ; dir = dirname(dir)) {
    const core = join(dir, 'node_modules', '@nativescript', 'core');
    if (existsSync(join(core, 'package.json'))) return core;
    if (dirname(dir) === dir) return null;
  }
}

export interface CoreNativeProject {
  /** Targets of their own in project.yml's `targets:`. */
  targets: string;
  /** Entries of the kit target's `dependencies:`. */
  kitDependencies: string;
  /** Build settings of the kit and the app target: what imports the kit finds the modules the kit imports. */
  settings: Record<string, string>;
  /** Entries of the app target's `dependencies:` and `sources:`. */
  appDependencies: string;
  appSources: string;
}

/**
 * The part of core's native code the kit's files import, in the app's Xcode
 * project, from core as the app installed it (as Android links core's widgets
 * AAR), copied to `Core/` in the project:
 * - a framework is linked by the kit and embedded in the app;
 * - the Objective-C is compiled into the app target, the kit seeing it through
 *   its module map: a static library would lose its category-only objects at the link;
 * - the Swift is a static library target of its module's name, compiled with the project's settings.
 */
export function coreNativeProject(core: string, imported: Set<string>, out: string): CoreNativeProject {
  const dir = join(out, 'Core');
  rmSync(dir, { recursive: true, force: true });
  const project: CoreNativeProject = { targets: '', kitDependencies: '', settings: {}, appDependencies: '', appSources: '' };
  const used = coreNativeModules(core).filter((m) => imported.has(m.module));
  if (!used.length) return project;
  mkdirSync(dir, { recursive: true });
  for (const m of used.filter((m) => m.kind === 'framework')) {
    const name = basename(m.path);
    cpSync(m.path, join(dir, name), { recursive: true, verbatimSymlinks: true });
    project.kitDependencies += `      - framework: Core/${name}\n        embed: false\n`;
    project.appDependencies += `      - framework: Core/${name}\n        embed: true\n`;
  }
  const swift = used.find((m) => m.kind === 'swift');
  const src = used.find((m) => m.kind !== 'framework')?.path;
  if (src) {
    // The Swift module imports the Objective-C ones (`import NativeScriptEmbedder`).
    for (const f of readdirSync(src)) if (/\.(h|m|modulemap)$/.test(f)) cpSync(join(src, f), join(dir, 'src', f));
    project.appSources += '      - path: Core/src\n        excludes: [module.modulemap]\n';
    project.settings.SWIFT_INCLUDE_PATHS = '"$(inherited) $(SRCROOT)/Core/src"';
  }
  if (swift) {
    for (const f of readdirSync(swift.path)) if (f.endsWith('.swift')) cpSync(join(swift.path, f), join(dir, swift.module, f));
    project.targets += `  ${swift.module}:\n    type: library.static\n    platform: iOS\n    sources: [Core/${swift.module}]\n    settings:\n      base:\n        SWIFT_VERSION: "5"\n        SWIFT_INCLUDE_PATHS: $(SRCROOT)/Core/src\n`;
    project.kitDependencies += `      - target: ${swift.module}\n`;
    project.appDependencies += `      - target: ${swift.module}\n`;
  }
  return project;
}

/** The `ios-…-simulator` framework of an xcframework, which the tables are generated from. */
export function simulatorSlice(xcframework: string): string | null {
  const slice = readdirSync(xcframework).find((d) => /^ios-.*-simulator$/.test(d));
  const framework = slice && readdirSync(join(xcframework, slice)).find((f) => f.endsWith('.framework'));
  return framework ? join(xcframework, slice, framework) : null;
}

function frameworkModule(framework: string): string {
  const map = join(framework, 'Modules', 'module.modulemap');
  return (existsSync(map) && /framework\s+module\s+(\w+)/.exec(readFileSync(map, 'utf8'))?.[1]) || basename(framework, '.framework');
}

function files(m: CoreNativeModule): string[] {
  const under = (dir: string) => readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).map((e) => join(e.parentPath, e.name));
  if (m.kind === 'framework') {
    const fw = simulatorSlice(m.path)!;
    return ['Headers', 'Modules'].flatMap((d) => (existsSync(join(fw, d)) ? under(join(fw, d)) : []));
  }
  return under(m.path).filter((f) => /\.(h|swift|modulemap)$/.test(f));
}

function key(m: CoreNativeModule): string {
  const h = createHash('sha256').update(`core-tables-1\0${m.kind}\0${m.module}\0`);
  for (const f of files(m).sort()) h.update(basename(f)).update('\0').update(readFileSync(f)).update('\0');
  return h.digest('hex').slice(0, 16);
}

function extractArgs(m: CoreNativeModule, scratch: string): string[] {
  if (m.kind === 'framework') return ['-F', join(simulatorSlice(m.path)!, '..')];
  if (m.kind === 'clang') return ['-I', m.path];
  const { target, sdk } = iosTarget();
  const swift = readdirSync(m.path).filter((f) => f.endsWith('.swift')).map((f) => join(m.path, f));
  try {
    execFileSync('xcrun', ['swiftc', '-emit-module', '-module-name', m.module, '-target', target, '-sdk', sdk, '-swift-version', '5', '-parse-as-library',
      '-I', m.path, '-emit-module-path', join(scratch, `${m.module}.swiftmodule`), ...swift], { stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 28 });
  } catch (e: any) {
    throw new Error(`its Swift does not compile as module ${m.module}:\n${String(e.stderr ?? e.message).split('\n').filter((l) => /\berror:/.test(l)).join('\n')}`);
  }
  return ['-I', scratch, '-I', m.path];
}
