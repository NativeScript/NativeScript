import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, sep } from 'node:path';
import { iosTarget, moduleOfDeclaration, nativeTable, registerDeclarationModule, type ScopedKind } from '../natives/symbols.ts';
import { boundToEngine, definedObjCClasses, packageIdentity, packageRequirement, productLines, type Dependencies, type SwiftPackage } from '../ios-dependencies.ts';
import type { PluginSource } from './source.ts';
import { mirror } from '../mirror.ts';

/**
 * The iOS code plugins ship in `platforms/ios`, linked as it is, its files
 * copied unchanged into `Plugins/` in the generated project: Swift as a static
 * library target of the project (built with its settings, as the link's
 * dead code elimination needs every Swift module to be), the rest as targets of a
 * local Swift package. One target per plugin source set:
 * - Objective-C and C: the module its `module.modulemap` declares, else `NSPlugin_<package>`
 *   (`NSPlugin_<package>_ObjC` beside Swift);
 * - Swift: `NSPlugin_<package>`, the package's name without `@` and with every
 *   other character that is not a letter or digit as `_`
 *   (`@nativescript/input-accessory` → `NSPlugin_nativescript_input_accessory`),
 *   depending on the plugins' Objective-C and binary modules it imports;
 * - an `.xcframework`: a binary target, imported as the module its framework declares.
 * The app's own `App_Resources/iOS/src` is read the same way, except that its
 * Swift is compiled into the app target, as the NativeScript CLI compiles it.
 * Each module gets a symbol table as the SDK's modules do, cached by a hash of
 * its files, and each typings file of the package is registered as declaring
 * the module whose table has the classes and protocols it declares.
 */
export interface PluginNative {
  /** The modules the app's Swift imports. */
  modules: string[];
  /** The local package (absolute), its name and its library products; null when no plugin ships code for it. */
  package: { dir: string; name: string; products: string[] } | null;
  /**
   * Swift modules built as the project's own static library targets: their names, source directories (absolute), the
   * Swift packages their plugin declares, the products of the local package they import, and the directories (absolute)
   * of the module maps of the Objective-C modules they import.
   */
  swift: { name: string; dir: string; packages: SwiftPackage[]; products: string[]; includes: string[] }[];
  /** The app's own Swift (absolute), compiled into the app target; null when it has none. */
  appSwift: string | null;
  /** Plugins' Objective-C and C that import a pod (absolute directories, each with its module map), compiled into the app target as the CLI compiles them, where the pods' headers are. */
  appClang: string[];
  /** The prefix header Objective-C plugin code is compiled with, where there is any (absolute). */
  prefixHeader: string | null;
  /** The Objective-C classes each module's binary defines, for the modules whose binary is known. */
  classes: Record<string, string[]>;
  /** The kit's Swift bindings of plugins' engine-bound code (absolute), compiled into the app target, each with the type whose `install()` the app calls first. */
  bindings: { dir: string; installer: string; conditions: string[] }[];
}

interface Target {
  kind: 'clang' | 'swift' | 'binary';
  /** The target and product name. */
  name: string;
  module: string;
  /** Where the files are copied from, and to (relative to the package). */
  from: string;
  path: string;
  files: string[];
  publicHeaders?: string;
  /** A binary target's simulator binary. */
  binary?: string;
  /** Compiled into the app target: Swift, its internal declarations in its table; or Objective-C that imports a pod. */
  inApp?: boolean;
  /** Swift: the modules its files import or test with `canImport`. */
  imports?: string[];
  /** Swift: the modules its files test with `canImport`. */
  conditional?: string[];
  /** Swift built in the local package, on these Swift packages its plugin declares and these of the package's targets. */
  packages?: SwiftPackage[];
  localDeps?: string[];
  /** Arguments that let the extractor see the module, given a scratch directory and the arguments that let it see the modules the target imports. */
  extract: (scratch: string, imported: string[]) => string[];
}

const PACKAGE = 'NSPlugins';

/**
 * What a NativeScript app's own prefix header gives every plugin's Objective-C it compiles: UIKit and Foundation, before
 * the plugin's first line (ui-canvas's headers test `TARGET_OS_IPHONE` before importing anything).
 */
const PREFIX_HEADER = `#ifdef __OBJC__
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#endif
`;
const PREFIX_FILE = 'NSPluginsPrefix.h';

/** A set of native sources: a plugin's `platforms/ios`, or the app's `App_Resources/iOS/src` (whose Swift module is the app's). */
interface NativeSources { name: string; version: string; dir: string; ios: string; typings: string[]; appModule?: string }

/**
 * A plugin whose iOS code installs objects into the JavaScript engine (`global.CanvasModule`)
 * has their Swift counterpart in the kit, at `Bindings/<package>/ios`: the same objects over the
 * same native API, which `NSBinding_<package>.install()` puts in `globalThis`.
 */
export function pluginNative(sources: PluginSource[], outDir: string, o: { deps: Dependencies; packages: SwiftPackage[]; app?: { module: string; src: string; declarations: string[] }; declarations: string[]; bindings: string; say: (m: string) => void }): PluginNative {
  // Assembled in a scratch folder and mirrored into the project, so a rebuild leaves unchanged files as they were.
  const root = join(outDir, 'Plugins');
  const stage = mkdtempSync(join(tmpdir(), 'ns-plugins-'));
  try {
    const native = assemble(sources, root, stage, o);
    if (readdirSync(stage).length) mirror(stage, root);
    else rmSync(root, { recursive: true, force: true });
    return native;
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

/** Writes the plugins' files to `stage`, returning paths under `root`, where they are mirrored. */
function assemble(sources: PluginSource[], root: string, stage: string, o: Parameters<typeof pluginNative>[2]): PluginNative {
  const errors: string[] = [];
  const sets: NativeSources[] = [...sources].sort((a, b) => a.name.localeCompare(b.name)).map((s) => ({ name: s.name, version: s.version, dir: s.dir, ios: join(s.dir, 'platforms', 'ios'), typings: [...new Set([...s.typings, ...ownTypings(s, o.declarations)])] }));
  if (o.app) sets.push({ name: 'App_Resources', version: 'app', dir: dirname(dirname(o.app.src)), ios: o.app.src, typings: o.app.declarations, appModule: o.app.module });
  const perPackage = sets.map((source) => ({ source, targets: targetsOf(source, errors, o.deps) }));
  if (errors.length) throw new Error(`plugins' iOS code that cannot be built yet:\n  ${errors.join('\n  ')}`);
  const all = perPackage.flatMap((p) => p.targets);

  const seen = new Map<string, string>();
  for (const { source, targets } of perPackage) for (const t of targets) {
    const other = seen.get(t.name) ?? seen.get(t.module);
    if (other) throw new Error(`${source.name}: its iOS module ${t.module} has the name of ${other}'s`);
    seen.set(t.name, source.name).set(t.module, source.name);
  }

  for (const t of all) {
    const to = join(stage, t.path);
    if (t.kind === 'binary') cpSync(t.from, to, { recursive: true, verbatimSymlinks: true });
    else for (const f of t.files) {
      mkdirSync(dirname(join(to, relative(t.from, f))), { recursive: true });
      cpSync(f, join(to, relative(t.from, f)));
    }
  }
  // The tables are extracted with every package and pod visible: Swift whose declarations depend on `canImport` of one
  // must see it in its target too, or its module builds without them and the code calling them fails far from the cause.
  for (const { source, targets } of perPackage) for (const t of targets) {
    const required = (t.conditional ?? []).filter((m) => o.deps.modules.includes(m));
    if (t.kind !== 'swift' || t.inApp || !required.length) continue;
    writeFileSync(join(stage, t.path, 'NSPluginRequiredModules.swift'), required.map((m) =>
      `#if !canImport(${m})\n#error(${JSON.stringify(`${source.name}: its Swift tests canImport(${m}), which the build translated against, and its target cannot import ${m}`)})\n#endif\n`).join(''));
  }
  const byModule = new Map(all.map((t) => [t.module, t]));
  // Swift sees the Objective-C and binary modules of every plugin, as in the app target the NativeScript CLI compiles it into.
  const importedTargets = (t: Target) => (t.imports ?? []).map((m) => byModule.get(m)).filter((d): d is Target => !!d && d.kind !== 'swift');
  // A static library target sees a Swift package's Swift modules but not its Clang ones: Xcode imparts those only to a
  // target linking the product, and a static library linking it carries the package's objects, which the app links too.
  // Swift importing one is built in the local package, on its plugin's packages, unless it needs what only the project has.
  for (const { source, targets } of perPackage) for (const t of targets) {
    const own = o.packages.filter((p) => p.plugin === source.name);
    const imports = t.imports ?? [];
    if (t.kind !== 'swift' || t.inApp || !own.length || !imports.some((m) => o.deps.clangModules.includes(m))) continue;
    if (imports.some((m) => byModule.get(m)?.kind === 'swift' && m !== t.module) || importedTargets(t).some((d) => d.inApp)) continue;
    t.packages = own;
    t.localDeps = importedTargets(t).map((d) => d.name);
  }
  const packaged = all.filter((t) => (t.kind !== 'swift' && !t.inApp) || t.packages);
  const clangTargets = all.some((t) => t.kind === 'clang');
  if (clangTargets) writeFileSync(join(stage, PREFIX_FILE), PREFIX_HEADER);
  if (packaged.length) writeFileSync(join(stage, 'Package.swift'), manifest(packaged, join(root, PREFIX_FILE), root));
  const left = new Set<Target>();
  for (const { source, targets } of perPackage) {
    const tables = targets.map((t) => {
      const scratch = mkdtempSync(join(tmpdir(), `ns-plugin-${t.module}-`));
      const imported = () => importedTargets(t).flatMap((d) => {
        const dir = join(scratch, 'imports', d.name);
        mkdirSync(dir, { recursive: true });
        return d.extract(dir, []);
      });
      try {
        return nativeTable(t.module, { key: hash(t, importedTargets(t)), internal: t.inApp && t.kind === 'swift', extraArgs: () => [...t.extract(scratch, imported()), ...o.deps.searchArgs()] });
      } catch (e) {
        // Swift the app's NativeScript build compiles against the JavaScript runtime's code; what TypeScript calls in it stops the translation.
        if (t.inApp && t.kind === 'swift') {
          o.say(`App_Resources/iOS/src is left out: ${(e as Error).message}`);
          left.add(t);
          rmSync(join(stage, t.path), { recursive: true, force: true });
          return { classes: {} } as ReturnType<typeof nativeTable>;
        }
        throw new Error(`${source.name}: ${(e as Error).message}`);
      } finally {
        rmSync(scratch, { recursive: true, force: true });
      }
    });
    // Typings may also declare what the Swift packages and pods build (ui-material's `MaterialComponents.ios.d.ts`).
    const candidates = [...targets.map((t, i) => ({ module: t.module, table: tables[i] })), ...o.deps.modules.map((m) => ({ module: m, table: nativeTable(m) }))];
    for (const dts of source.typings) {
      const names = declaredNames(dts);
      const score = (i: number) => names.filter((n) => candidates[i].table.classes[n] && !candidates[i].table.classes[n].extension).length;
      const best = candidates.map((_, i) => i).sort((a, b) => score(b) - score(a))[0];
      if (best !== undefined && score(best) > 0) registerDeclarationModule(dts, candidates[best].module);
    }
  }
  const bindings = sets.filter((x) => !x.appModule && existsSync(join(o.bindings, x.name, 'ios'))).map((x) => {
    const dir = join(root, 'Bindings', derivedModule(x.name).replace(/^NSPlugin_/, ''));
    cpSync(join(o.bindings, x.name, 'ios'), join(stage, relative(root, dir)), { recursive: true });
    return { dir, installer: derivedModule(x.name).replace(/^NSPlugin_/, 'NSBinding_'), conditions: bindingConditions(join(o.bindings, x.name, 'ios.conditions.json'), x.ios) };
  });
  // A package's or pod's module is imported where the program declares something of it.
  const declared = new Set(o.declarations.map(moduleOfDeclaration));
  const app = all.find((t) => t.inApp && !left.has(t));
  return {
    modules: [...all.filter((t) => !(t.inApp && t.kind === 'swift')).map((t) => t.module), ...o.deps.modules.filter((m) => declared.has(m))],
    package: packaged.length ? { dir: root, name: PACKAGE, products: packaged.map((t) => t.name) } : null,
    swift: all.filter((t) => t.kind === 'swift' && !t.inApp && !t.packages).map((t) => ({
      name: t.name, dir: join(root, t.path), packages: o.packages.filter((p) => p.plugin === perPackage.find((x) => x.targets.includes(t))!.source.name),
      products: importedTargets(t).filter((d) => !d.inApp).map((d) => d.name),
      // A package product's headers reach the app target only: a static library finds the module by its map.
      includes: importedTargets(t).filter((d) => d.kind === 'clang').map((d) => join(root, d.path, d.publicHeaders!)),
    })),
    appSwift: app ? join(root, app.path) : null,
    appClang: all.filter((t) => t.kind === 'clang' && t.inApp).map((t) => join(root, t.path)),
    prefixHeader: clangTargets ? join(root, PREFIX_FILE) : null,
    bindings,
    classes: { ...o.deps.classes, ...Object.fromEntries(all.filter((t) => t.binary).map((t) => [t.module, definedObjCClasses([t.binary!])])) },
  };
}

/** The plugins in xcodegen's project.yml: the package under `packages:`, the Swift modules' targets, and the app target's `dependencies:` on both. */
export function xcodegenLines(native: PluginNative, projectDir: string): { packages: string; targets: string; dependencies: string; sources: string; settings: Record<string, string> } {
  const p = native.package;
  const conditions = [...new Set(native.bindings.flatMap((b) => b.conditions))];
  return {
    packages: p ? `  ${p.name}:\n    path: ${relative(projectDir, p.dir)}\n` : '',
    targets: native.swift.map((t) => {
      const dependencies = productLines(t.packages, false) + t.products.map((product) => `      - package: ${p!.name}\n        product: ${product}\n        link: false\n`).join('');
      const includes = t.includes.length ? Object.entries(searchPaths(t.includes, projectDir)).map(([k, v]) => `        ${k}: ${v}\n`).join('') : '';
      return `  ${t.name}:\n    type: library.static\n    platform: iOS\n    sources: [${relative(projectDir, t.dir)}]\n${dependencies ? `    dependencies:\n${dependencies}` : ''}    settings:\n      base:\n        SWIFT_VERSION: "5"\n${includes}`;
    }).join(''),
    dependencies: [
      ...(p?.products ?? []).map((product) => `      - package: ${p!.name}\n        product: ${product}\n`),
      ...native.swift.map((t) => `      - target: ${t.name}\n`),
    ].join(''),
    sources: [native.appSwift, ...native.bindings.map((b) => b.dir)].filter(Boolean).map((d) => `      - path: ${relative(projectDir, d!)}\n`).join('')
      + native.appClang.map((d) => `      - path: ${relative(projectDir, d)}\n        excludes: ["**/*.modulemap"]\n`).join(''),
    settings: {
      // The app's Swift imports their modules by the module maps beside them.
      ...(native.appClang.length ? searchPaths(native.appClang, projectDir) : {}),
      ...(native.appClang.length && native.prefixHeader ? { GCC_PREFIX_HEADER: JSON.stringify(`$(SRCROOT)/${relative(projectDir, native.prefixHeader)}`) } : {}),
      ...(conditions.length ? { SWIFT_ACTIVE_COMPILATION_CONDITIONS: JSON.stringify(['$(inherited)', ...conditions].join(' ')) } : {}),
    },
  };
}

/** Settings that let Swift import the modules whose maps are in `dirs`. */
function searchPaths(dirs: string[], projectDir: string): Record<string, string> {
  return Object.fromEntries(['SWIFT_INCLUDE_PATHS', 'HEADER_SEARCH_PATHS'].map((k) => [k, JSON.stringify(['$(inherited)', ...dirs.map((d) => `$(SRCROOT)/${relative(projectDir, d)}`)].join(' '))]));
}

/**
 * A binding's compilation conditions (`ios.conditions.json` beside its sources: condition → C symbol): each one whose
 * symbol the plugin's headers declare, so one binding builds over the versions of the native library that differ in API.
 */
function bindingConditions(file: string, ios: string): string[] {
  if (!existsSync(file)) return [];
  const wanted = JSON.parse(readFileSync(file, 'utf8')) as Record<string, string>;
  const headers = existsSync(ios) ? (readdirSync(ios, { recursive: true }) as string[]).filter((f) => f.endsWith('.h')).map((f) => readFileSync(join(ios, f), 'utf8')) : [];
  return Object.entries(wanted).filter(([, symbol]) => headers.some((h) => new RegExp(`\\b${symbol}\\b`).test(h))).map(([condition]) => condition);
}

const derivedModule =(pkg: string) => 'NSPlugin_' + pkg.replace(/^@/, '').replace(/[^A-Za-z0-9]/g, '_');

/** Files at the top of `platforms/ios` that the project takes from every production plugin (app-resources.ts, ios-dependencies.ts). */
const PROJECT_FILES = new Set(['Info.plist', 'build.xcconfig', 'app.entitlements', 'Podfile']);

function targetsOf(source: NativeSources, errors: string[], deps: Dependencies): Target[] {
  const ios = source.ios;
  if (!existsSync(ios)) return [];
  const clang: string[] = [], swift: string[] = [], maps: string[] = [], xcframeworks: string[] = [], shaders: string[] = [];
  const fail = (file: string, why: string) => errors.push(`${source.name}@${source.version}: ${relative(source.dir, file)}: ${why}`);
  const walk = (dir: string) => {
    for (const f of readdirSync(dir).sort()) {
      if (dir === ios && PROJECT_FILES.has(f)) continue;
      const p = join(dir, f);
      if (f === '.DS_Store' || /\.md$/i.test(f)) continue;
      // Typings beside the sources are the program's, not the build's.
      else if (f === 'native-api-usage.json' || f.endsWith('.d.ts')) continue;
      if (statSync(p).isDirectory()) {
        // Code bound to the V8 engine (`v8::` objects installed into the JavaScript runtime, as @nativescript/canvas's
        // CanvasModule): no engine runs a compiled app, whose Swift binding of the same API the kit provides.
        if (boundToEngine(p)) continue;
        if (f.endsWith('.xcframework')) xcframeworks.push(p);
        else if (f.endsWith('.framework')) fail(p, 'a .framework is not supported yet (an .xcframework is)');
        else if (f.endsWith('.bundle')) fail(p, 'resource bundles are not supported yet');
        else walk(p);
      } else if (f.endsWith('.swift')) swift.push(p);
      else if (/\.(h|hh|hpp|m|mm|c|cc|cpp)$/.test(f)) clang.push(p);
      else if (f === 'module.modulemap') maps.push(p);
      // The app target compiles Metal shaders into the app's default library.
      else if (source.appModule && f.endsWith('.metal')) shaders.push(p);
      else if (f.endsWith('.podspec')) fail(p, 'a podspec is not supported (a Podfile is)');
      // A bundle's own Info.plist among the sources (ui-image's `src/Info.plist`, left from a framework target): the CLI's project
      // references it in the sources' group, in no build phase, so it reaches neither the app's Info.plist nor its bundle.
      else if (f === 'Info.plist') continue;
      else if (/\.(xcconfig|entitlements)$/.test(f)) fail(p, `build settings and entitlements are read only from ${relative(source.dir, ios)}/build.xcconfig and app.entitlements`);
      else if (f.endsWith('.a')) fail(p, 'static libraries are not supported yet (an .xcframework is)');
      else fail(p, 'not a source file the build knows what to do with');
    }
  };
  walk(ios);
  // Empty headers beside Swift (an umbrella header with nothing to declare) are no module: SwiftPM builds no target without sources.
  if (swift.length && clang.every((f) => /\.(h|hh|hpp)$/.test(f) && !readFileSync(f, 'utf8').trim())) clang.length = 0;
  if (shaders.length && !swift.length) fail(shaders[0], 'Metal shaders need Swift beside them in App_Resources/iOS/src');
  if (maps.length > 1) fail(ios, `more than one module.modulemap (${maps.map((m) => relative(ios, m)).join(', ')})`);
  // Beside Swift alone, a module map names headers the plugin doesn't ship (the CLI's own framework's): there is no module to build.
  if (maps.length && !clang.length && !swift.length) fail(maps[0], 'a module map without sources');
  const swiftModule = source.appModule ?? derivedModule(source.name);

  const { target, sdk } = iosTarget();
  const targets: Target[] = [];
  if (clang.length && maps.length <= 1) {
    const map = maps[0];
    const module = map ? /^\s*(?:explicit\s+)?module\s+(\w+)/m.exec(readFileSync(map, 'utf8'))?.[1] : swift.length ? `${derivedModule(source.name)}_ObjC` : derivedModule(source.name);
    if (!module) fail(map, 'declares no module (a `framework module` is not supported yet)');
    else if (swift.length && module === swiftModule) fail(map, `declares module ${module}, the name of the plugin's Swift module`);
    else {
      const from = commonDir([...clang, ...maps]);
      const path = `Sources/${module}`;
      const publicHeaders = map ? relative(from, dirname(map)) || '.' : '.';
      // Code importing a pod (`#import <SDWebImage/SDImageTransformer.h>`) compiles where the pods are built and visible: in the app target.
      const pods = new Set(deps.modules);
      const importsPod = clang.some((f) => [...readFileSync(f, 'utf8').matchAll(/^\s*(?:#\s*(?:import|include)\s*<(\w+)\/|@import\s+(\w+))/gm)].some((m) => pods.has(m[1] ?? m[2])));
      if (importsPod && !map) fail(clang[0], 'Objective-C that imports a pod needs a module.modulemap beside it');
      targets.push({
        kind: 'clang', name: module, module, from, path, files: [...clang, ...maps], publicHeaders, inApp: importsPod,
        extract: (scratch) => {
          writeFileSync(join(scratch, PREFIX_FILE), PREFIX_HEADER);
          const prefix = ['-Xcc', '-include', '-Xcc', join(scratch, PREFIX_FILE)];
          if (map) return ['-I', dirname(map), ...prefix];
          // What SwiftPM generates for a target without a module map: every header under its public headers directory.
          writeFileSync(join(scratch, 'module.modulemap'), `module ${module} {\n  umbrella ${JSON.stringify(from)}\n  export *\n  module * { export * }\n}\n`);
          return ['-I', scratch, ...prefix];
        },
      });
    }
  }
  if (swift.length) {
    const module = swiftModule;
    const from = commonDir([...swift, ...shaders]);
    const texts = swift.map((f) => readFileSync(f, 'utf8'));
    const conditional = [...new Set(texts.flatMap((t) => [...t.matchAll(/\bcanImport\(\s*(\w+)/g)].map((m) => m[1])))].sort();
    const imports = [...new Set([...conditional, ...texts.flatMap((t) => [...t.matchAll(/^\s*(?:@\w+\s+)*import\s+(?:(?:typealias|struct|class|enum|protocol|let|var|func)\s+)?(\w+)/gm)].map((m) => m[1]))])].sort();
    targets.push({
      kind: 'swift', name: module, module, from, path: source.appModule ? 'App' : `Sources/${module}`, files: [...swift, ...shaders], inApp: !!source.appModule, imports, conditional,
      extract: (scratch, imported) => {
        try {
          execFileSync('xcrun', ['swiftc', '-emit-module', '-module-name', module, '-target', target, '-sdk', sdk, '-swift-version', '5', '-parse-as-library',
            '-emit-module-path', join(scratch, `${module}.swiftmodule`), ...imported, ...deps.searchArgs(), ...swift], { stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 28 });
        } catch (e: any) {
          const out = String(e.stderr ?? e.message).split('\n').filter((l) => /^\S.*\berror:/.test(l));
          throw new Error(`its Swift sources do not compile as module ${module}:\n${out.join('\n')}`);
        }
        return [...imported, '-I', scratch];
      },
    });
  }
  for (const xc of xcframeworks) {
    const name = basename(xc, '.xcframework');
    const slice = readdirSync(xc).find((d) => /^ios-.*-simulator$/.test(d));
    const framework = slice && readdirSync(join(xc, slice)).find((f) => f.endsWith('.framework'));
    if (!slice || !framework) {
      fail(xc, slice ? 'only xcframeworks of frameworks are supported yet' : 'has no iOS simulator slice');
      continue;
    }
    const mapFile = join(xc, slice, framework, 'Modules', 'module.modulemap');
    const module = (existsSync(mapFile) && /framework\s+module\s+(\w+)/.exec(readFileSync(mapFile, 'utf8'))?.[1]) || basename(framework, '.framework');
    const binary = join(xc, slice, framework, basename(framework, '.framework'));
    targets.push({ kind: 'binary', name, module, from: xc, path: `Binaries/${name}.xcframework`, files: filesUnder(xc), binary: existsSync(binary) ? binary : undefined, extract: () => ['-F', join(xc, slice)] });
  }
  return targets;
}

export function manifest(targets: Target[], prefix: string, root = ''): string {
  const q = JSON.stringify;
  const external = [...new Map(targets.flatMap((t) => t.packages ?? []).map((p) => [p.name, p])).values()];
  const dependencies = (t: Target) => [...(t.packages ?? []).flatMap((p) => p.libs.map((lib) => `.product(name: ${q(lib)}, package: ${q(packageIdentity(p))})`)), ...(t.localDeps ?? []).map((d) => q(d))];
  // A local package may pass flags of its own: the app's project depends on it by path.
  const decl = (t: Target) =>
    t.kind === 'binary' ? `.binaryTarget(name: ${q(t.name)}, path: ${q(t.path)})`
    : t.kind === 'clang' ? `.target(name: ${q(t.name)}, path: ${q(t.path)}, publicHeadersPath: ${q(t.publicHeaders)}, cSettings: [.unsafeFlags(["-include", ${q(prefix)}])])`
    : `.target(name: ${q(t.name)}, dependencies: [${dependencies(t).join(', ')}], path: ${q(t.path)})`;
  return `// swift-tools-version:5.9
// Generated by ns-native: the iOS code the app's NativeScript plugins ship, unchanged.
import PackageDescription

let package = Package(
    name: ${q(PACKAGE)},
    platforms: [.iOS(.v17)],
    products: [
${targets.map((t) => `        .library(name: ${q(t.name)}, targets: [${q(t.name)}]),`).join('\n')}
    ],
${external.length ? `    dependencies: [\n${external.map((p) => `        .package(${p.path ? `path: ${q(relative(root, p.path))}` : `url: ${q(p.url)}, ${packageRequirement(p.version!)}`}),`).join('\n')}\n    ],\n` : ''}    targets: [
${targets.map((t) => `        ${decl(t)},`).join('\n')}
    ]
)
`;
}

/** A module's table depends on its files and on the modules it imports, whose types its declarations name. */
function hash(t: Target, imported: Target[] = []): string {
  const h = createHash('sha256').update(`tables-3\0${t.kind}\0${t.module}\0${t.inApp ? 'app' : ''}\0${t.kind === 'clang' ? PREFIX_HEADER : ''}`);
  for (const f of [...t.files].sort()) h.update(relative(t.from, f)).update('\0').update(readFileSync(f)).update('\0');
  for (const d of imported) h.update(hash(d)).update('\0');
  return h.digest('hex').slice(0, 16);
}

/**
 * The typings the program reads from beside a plugin's source (`types/objc!NSCAppStore.d.ts`, named after a class of
 * the plugin's own Swift rather than a module), wherever the source keeps them.
 */
export function ownTypings(source: PluginSource, declarations: string[]): string[] {
  const top = [...source.files.values()].filter((f): f is string => !!f).map(dirname).sort((a, b) => a.length - b.length)[0];
  return top ? declarations.filter((d) => d.startsWith(top + sep)) : [];
}

/** The classes and interfaces (protocols) a typings file declares at its top level. */
function declaredNames(dts: string): string[] {
  const sf = ts.createSourceFile(dts, readFileSync(dts, 'utf8'), ts.ScriptTarget.Latest, false);
  return sf.statements.flatMap((s) => ((ts.isClassDeclaration(s) || ts.isInterfaceDeclaration(s)) && s.name ? [s.name.text] : []));
}

function commonDir(files: string[]): string {
  let dir = dirname(files[0]);
  while (!files.every((f) => f.startsWith(dir + sep))) dir = dirname(dir);
  return dir;
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).map((e) => join(e.parentPath, e.name));
}

/**
 * The names a plugin's or pod's module gives generated code to spell: the module's own, its types', functions', constants'
 * and global enum cases', and the members its categories add to other modules' classes.
 */
export function moduleNames(module: string): Set<string> | null {
  let t: ReturnType<typeof nativeTable>;
  // A module without a table is imported wherever it was: nothing tells which files use it.
  try { t = nativeTable(module); } catch { return null; }
  const names = new Set([module]);
  const add = (swift: string) => { const n = /^[A-Za-z_]\w*/.exec(swift)?.[0]; if (n) names.add(n); };
  for (const c of Object.values(t.classes)) {
    if (!c.extension) add(c.swift);
    else for (const m of [...Object.values(c.instance), ...Object.values(c.static)]) add(m.swift);
  }
  for (const e of Object.values(t.enums)) if (e.swift) add(e.swift); else for (const c of Object.values(e.cases)) add(c.swift);
  for (const f of Object.values(t.functions)) add(f.owner ?? f.swift);
  for (const c of [...Object.values(t.constants), ...Object.values(t.structs)]) add(c.swift);
  for (const a of Object.keys(t.typealiases ?? {})) add(a);
  return names;
}

/** The types a module declares to Swift (each one's kind), and those of them TypeScript's typings name. */
export interface ModuleTypes { types: Record<string, ScopedKind>; named: Set<string> }

/**
 * A Swift file with a scoped import (`import class NativeScriptKit.ImageAsset`) for each type name it uses that more than
 * one module declares, naming the one its code means: the kit's, else the one module it imports whose name TypeScript's
 * typings have (RevenueCat's `SubscriptionInfo`, not StoreKit's Swift-only one). A scoped import wins over plain ones,
 * also over a module another re-exports (RevenueCat's StoreKit), which is why every module of `modules` counts.
 */
export function scopedImports(text: string, modules: Map<string, ModuleTypes>, kit: string, programDeclares: (name: string) => boolean): string {
  const imported = [...text.matchAll(/^import (\w+)$/gm)].map((m) => m[1]).filter((m) => modules.has(m));
  if (!imported.length) return text;
  const words = new Set(text.replace(/^import .*$/gm, '').replace(/^\s*\/\/.*$/gm, '').match(/\b[A-Za-z_]\w*\b/g) ?? []);
  const scoped: string[] = [];
  for (const w of words) {
    if ([...modules.values()].filter((m) => Object.hasOwn(m.types, w)).length < 2 || programDeclares(w)) continue;
    const owners = imported.filter((m) => Object.hasOwn(modules.get(m)!.types, w));
    const named = owners.includes(kit) ? [kit] : owners.filter((m) => modules.get(m)!.named.has(w));
    if (named.length === 1) scoped.push(`import ${modules.get(named[0])!.types[w]} ${named[0]}.${w}`);
  }
  if (!scoped.length) return text;
  const last = [...text.matchAll(/^import .*\n/gm)].pop()!;
  const at = last.index! + last[0].length;
  return text.slice(0, at) + scoped.sort().map((l) => l + '\n').join('') + text.slice(at);
}

/** A Swift file without its imports of the modules in `modules` whose names nothing else in it uses. */
export function usedImports(text: string, modules: Map<string, Set<string> | null>): string {
  const body = text.replace(/^import \w+$/gm, '');
  const words = new Set(body.match(/\b[A-Za-z_]\w*\b/g) ?? []);
  return text.replace(/^import (\w+)\n/gm, (line, m: string) => {
    if (!modules.has(m)) return line;
    const names = modules.get(m);
    return !names || [...names].some((n) => words.has(n)) ? line : '';
  });
}
