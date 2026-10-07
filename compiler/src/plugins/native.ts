import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, sep } from 'node:path';
import { iosTarget, moduleOfDeclaration, nativeTable, registerDeclarationModule } from '../natives/symbols.ts';
import { boundToEngine, productLines, type Dependencies, type SwiftPackage } from '../ios-dependencies.ts';
import type { PluginSource } from './source.ts';

/**
 * The iOS code plugins ship in `platforms/ios`, linked as it is, its files
 * copied unchanged into `Plugins/` in the generated project: Swift as a static
 * library target of the project (built with its settings, as the link's
 * dead code elimination needs every Swift module to be), the rest as targets of a
 * local Swift package. One target per plugin source set:
 * - Objective-C and C: the module its `module.modulemap` declares, else `NSPlugin_<package>`;
 * - Swift: `NSPlugin_<package>`, the package's name without `@` and with every
 *   other character that is not a letter or digit as `_`
 *   (`@nativescript/input-accessory` → `NSPlugin_nativescript_input_accessory`);
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
  /** Swift modules built as the project's own static library targets: their names, source directories (absolute) and the Swift packages their plugin declares. */
  swift: { name: string; dir: string; packages: SwiftPackage[] }[];
  /** The app's own Swift (absolute), compiled into the app target; null when it has none. */
  appSwift: string | null;
  /** The kit's Swift bindings of plugins' engine-bound code (absolute), compiled into the app target, each with the type whose `install()` the app calls first. */
  bindings: { dir: string; installer: string }[];
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
  /** Swift compiled into the app target, its internal declarations in its table. */
  inApp?: boolean;
  /** Arguments that let the extractor see the module, given the copied files and a scratch directory. */
  extract: (scratch: string) => string[];
}

const PACKAGE = 'NSPlugins';

/** A set of native sources: a plugin's `platforms/ios`, or the app's `App_Resources/iOS/src` (whose Swift module is the app's). */
interface NativeSources { name: string; version: string; dir: string; ios: string; typings: string[]; appModule?: string }

/**
 * A plugin whose iOS code installs objects into the JavaScript engine (`global.CanvasModule`)
 * has their Swift counterpart in the kit, at `Bindings/<package>/ios`: the same objects over the
 * same native API, which `NSBinding_<package>.install()` puts in `globalThis`.
 */
export function pluginNative(sources: PluginSource[], outDir: string, o: { deps: Dependencies; packages: SwiftPackage[]; app?: { module: string; src: string; declarations: string[] }; declarations: string[]; bindings: string; say: (m: string) => void }): PluginNative {
  const root = join(outDir, 'Plugins');
  rmSync(root, { recursive: true, force: true });
  const errors: string[] = [];
  const sets: NativeSources[] = [...sources].sort((a, b) => a.name.localeCompare(b.name)).map((s) => ({ name: s.name, version: s.version, dir: s.dir, ios: join(s.dir, 'platforms', 'ios'), typings: s.typings }));
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
    const to = join(root, t.path);
    if (t.kind === 'binary') cpSync(t.from, to, { recursive: true, verbatimSymlinks: true });
    else for (const f of t.files) {
      mkdirSync(dirname(join(to, relative(t.from, f))), { recursive: true });
      cpSync(f, join(to, relative(t.from, f)));
    }
  }
  const packaged = all.filter((t) => t.kind !== 'swift');
  if (packaged.length) writeFileSync(join(root, 'Package.swift'), manifest(packaged));

  const left = new Set<Target>();
  for (const { source, targets } of perPackage) {
    const tables = targets.map((t) => {
      const scratch = mkdtempSync(join(tmpdir(), `ns-plugin-${t.module}-`));
      try {
        return nativeTable(t.module, { key: hash(t), internal: t.inApp, extraArgs: () => [...t.extract(scratch), ...o.deps.searchArgs()] });
      } catch (e) {
        // Swift the app's NativeScript build compiles against the JavaScript runtime's code; what TypeScript calls in it stops the translation.
        if (t.inApp) {
          o.say(`App_Resources/iOS/src is left out: ${(e as Error).message}`);
          left.add(t);
          rmSync(join(root, t.path), { recursive: true, force: true });
          return { classes: {} } as ReturnType<typeof nativeTable>;
        }
        throw new Error(`${source.name}: ${(e as Error).message}`);
      } finally {
        rmSync(scratch, { recursive: true, force: true });
      }
    });
    // The app's declarations may also declare what the Swift packages and pods build.
    const candidates = [...targets.map((t, i) => ({ module: t.module, table: tables[i] })), ...(source.appModule ? o.deps.modules.map((m) => ({ module: m, table: nativeTable(m) })) : [])];
    for (const dts of source.typings) {
      const names = declaredNames(dts);
      const score = (i: number) => names.filter((n) => candidates[i].table.classes[n] && !candidates[i].table.classes[n].extension).length;
      const best = candidates.map((_, i) => i).sort((a, b) => score(b) - score(a))[0];
      if (best !== undefined && score(best) > 0) registerDeclarationModule(dts, candidates[best].module);
    }
  }
  const bindings = sets.filter((x) => !x.appModule && existsSync(join(o.bindings, x.name, 'ios'))).map((x) => {
    const dir = join(root, 'Bindings', derivedModule(x.name).replace(/^NSPlugin_/, ''));
    cpSync(join(o.bindings, x.name, 'ios'), dir, { recursive: true });
    return { dir, installer: derivedModule(x.name).replace(/^NSPlugin_/, 'NSBinding_') };
  });
  // A package's or pod's module is imported where the program declares something of it.
  const declared = new Set(o.declarations.map(moduleOfDeclaration));
  const app = all.find((t) => t.inApp && !left.has(t));
  return {
    modules: [...all.filter((t) => !t.inApp).map((t) => t.module), ...o.deps.modules.filter((m) => declared.has(m))],
    package: packaged.length ? { dir: root, name: PACKAGE, products: packaged.map((t) => t.name) } : null,
    swift: all.filter((t) => t.kind === 'swift' && !t.inApp).map((t) => ({ name: t.name, dir: join(root, t.path), packages: o.packages.filter((p) => p.plugin === perPackage.find((x) => x.targets.includes(t))!.source.name) })),
    appSwift: app ? join(root, app.path) : null,
    bindings,
  };
}

/** The plugins in xcodegen's project.yml: the package under `packages:`, the Swift modules' targets, and the app target's `dependencies:` on both. */
export function xcodegenLines(native: PluginNative, projectDir: string): { packages: string; targets: string; dependencies: string; sources: string } {
  const p = native.package;
  return {
    packages: p ? `  ${p.name}:\n    path: ${relative(projectDir, p.dir)}\n` : '',
    targets: native.swift.map((t) => `  ${t.name}:\n    type: library.static\n    platform: iOS\n    sources: [${relative(projectDir, t.dir)}]\n${t.packages.length ? `    dependencies:\n${productLines(t.packages, false)}` : ''}    settings:\n      base:\n        SWIFT_VERSION: "5"\n`).join(''),
    dependencies: [
      ...(p?.products ?? []).map((product) => `      - package: ${p!.name}\n        product: ${product}\n`),
      ...native.swift.map((t) => `      - target: ${t.name}\n`),
    ].join(''),
    sources: [native.appSwift, ...native.bindings.map((b) => b.dir)].filter(Boolean).map((d) => `      - path: ${relative(projectDir, d!)}\n`).join(''),
  };
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
      else if (f === 'native-api-usage.json') continue;
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
      else if (f === 'Info.plist') fail(p, `an Info.plist is merged into the app's only from ${relative(source.dir, ios)}/Info.plist`);
      else if (/\.(xcconfig|entitlements)$/.test(f)) fail(p, `build settings and entitlements are read only from ${relative(source.dir, ios)}/build.xcconfig and app.entitlements`);
      else if (f.endsWith('.a')) fail(p, 'static libraries are not supported yet (an .xcframework is)');
      else fail(p, 'not a source file the build knows what to do with');
    }
  };
  walk(ios);
  if (swift.length && clang.length) fail(ios, 'Swift and Objective-C sources in one plugin are not supported yet');
  if (shaders.length && !swift.length) fail(shaders[0], 'Metal shaders need Swift beside them in App_Resources/iOS/src');
  if (maps.length > 1) fail(ios, `more than one module.modulemap (${maps.map((m) => relative(ios, m)).join(', ')})`);
  if (maps.length && !clang.length) fail(maps[0], 'a module map without sources');

  const { target, sdk } = iosTarget();
  const targets: Target[] = [];
  if (clang.length && maps.length <= 1) {
    const map = maps[0];
    const module = map ? /^\s*(?:explicit\s+)?module\s+(\w+)/m.exec(readFileSync(map, 'utf8'))?.[1] : derivedModule(source.name);
    if (!module) fail(map, 'declares no module (a `framework module` is not supported yet)');
    else {
      const from = commonDir([...clang, ...maps]);
      const path = `Sources/${module}`;
      const publicHeaders = map ? relative(from, dirname(map)) || '.' : '.';
      targets.push({
        kind: 'clang', name: module, module, from, path, files: [...clang, ...maps], publicHeaders,
        extract: (scratch) => {
          if (map) return ['-I', dirname(map)];
          // What SwiftPM generates for a target without a module map: every header under its public headers directory.
          writeFileSync(join(scratch, 'module.modulemap'), `module ${module} {\n  umbrella ${JSON.stringify(from)}\n  export *\n  module * { export * }\n}\n`);
          return ['-I', scratch];
        },
      });
    }
  }
  if (swift.length && !clang.length) {
    const module = source.appModule ?? derivedModule(source.name);
    const from = commonDir([...swift, ...shaders]);
    targets.push({
      kind: 'swift', name: module, module, from, path: source.appModule ? 'App' : `Sources/${module}`, files: [...swift, ...shaders], inApp: !!source.appModule,
      extract: (scratch) => {
        try {
          execFileSync('xcrun', ['swiftc', '-emit-module', '-module-name', module, '-target', target, '-sdk', sdk, '-swift-version', '5', '-parse-as-library',
            '-emit-module-path', join(scratch, `${module}.swiftmodule`), ...deps.searchArgs(), ...swift], { stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 28 });
        } catch (e: any) {
          const out = String(e.stderr ?? e.message).split('\n').filter((l) => /^\S.*\berror:/.test(l));
          throw new Error(`its Swift sources do not compile as module ${module}:\n${out.join('\n')}`);
        }
        return ['-I', scratch];
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
    targets.push({ kind: 'binary', name, module, from: xc, path: `Binaries/${name}.xcframework`, files: filesUnder(xc), extract: () => ['-F', join(xc, slice)] });
  }
  return targets;
}

function manifest(targets: Target[]): string {
  const q = JSON.stringify;
  const decl = (t: Target) =>
    t.kind === 'binary' ? `.binaryTarget(name: ${q(t.name)}, path: ${q(t.path)})`
    : t.kind === 'clang' ? `.target(name: ${q(t.name)}, path: ${q(t.path)}, publicHeadersPath: ${q(t.publicHeaders)})`
    : `.target(name: ${q(t.name)}, path: ${q(t.path)})`;
  return `// swift-tools-version:5.9
// Generated by ns-native: the iOS code the app's NativeScript plugins ship, unchanged.
import PackageDescription

let package = Package(
    name: ${q(PACKAGE)},
    platforms: [.iOS(.v17)],
    products: [
${targets.map((t) => `        .library(name: ${q(t.name)}, targets: [${q(t.name)}]),`).join('\n')}
    ],
    targets: [
${targets.map((t) => `        ${decl(t)},`).join('\n')}
    ]
)
`;
}

function hash(t: Target): string {
  const h = createHash('sha256').update(`tables-2\0${t.kind}\0${t.module}\0${t.inApp ? 'app' : ''}\0`);
  for (const f of [...t.files].sort()) h.update(relative(t.from, f)).update('\0').update(readFileSync(f)).update('\0');
  return h.digest('hex').slice(0, 16);
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
