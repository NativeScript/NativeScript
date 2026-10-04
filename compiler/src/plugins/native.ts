import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, sep } from 'node:path';
import { iosTarget, nativeTable, registerDeclarationModule } from '../natives/symbols.ts';
import type { PluginSource } from './source.ts';

/**
 * The iOS code plugins ship in `platforms/ios`, linked as it is, its files
 * copied unchanged into `Plugins/` in the generated project: Swift as a static
 * library target of the project (built with its settings, as the link's
 * hermetic seal needs every Swift module to be), the rest as targets of a
 * local Swift package. One target per plugin source set:
 * - Objective-C and C: the module its `module.modulemap` declares, else `NSPlugin_<package>`;
 * - Swift: `NSPlugin_<package>`, the package's name without `@` and with every
 *   other character that is not a letter or digit as `_`
 *   (`@nativescript/input-accessory` → `NSPlugin_nativescript_input_accessory`);
 * - an `.xcframework`: a binary target, imported as the module its framework declares.
 * Each module gets a symbol table as the SDK's modules do, cached by a hash of
 * its files, and each typings file of the package is registered as declaring
 * the module whose table has the classes and protocols it declares.
 */
export interface PluginNative {
  /** The modules the app's Swift imports. */
  modules: string[];
  /** The local package (absolute), its name and its library products; null when no plugin ships code for it. */
  package: { dir: string; name: string; products: string[] } | null;
  /** Swift modules built as the project's own static library targets: their names and source directories (absolute). */
  swift: { name: string; dir: string }[];
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
  /** Arguments that let the extractor see the module, given the copied files and a scratch directory. */
  extract: (scratch: string) => string[];
}

const PACKAGE = 'NSPlugins';

export function pluginNative(sources: PluginSource[], outDir: string): PluginNative {
  const root = join(outDir, 'Plugins');
  rmSync(root, { recursive: true, force: true });
  const errors: string[] = [];
  const perPackage = [...sources].sort((a, b) => a.name.localeCompare(b.name)).map((source) => ({ source, targets: targetsOf(source, errors) }));
  if (errors.length) throw new Error(`plugins' iOS code that cannot be built yet:\n  ${errors.join('\n  ')}`);
  const all = perPackage.flatMap((p) => p.targets);
  if (!all.length) return { modules: [], package: null, swift: [] };

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

  for (const { source, targets } of perPackage) {
    const tables = targets.map((t) => {
      const scratch = mkdtempSync(join(tmpdir(), `ns-plugin-${t.module}-`));
      try {
        return nativeTable(t.module, { key: hash(t), extraArgs: () => t.extract(scratch) });
      } catch (e) {
        throw new Error(`${source.name}: ${(e as Error).message}`);
      } finally {
        rmSync(scratch, { recursive: true, force: true });
      }
    });
    for (const dts of source.typings) {
      const names = declaredNames(dts);
      const score = (i: number) => names.filter((n) => tables[i].classes[n] && !tables[i].classes[n].extension).length;
      const best = targets.map((_, i) => i).sort((a, b) => score(b) - score(a))[0];
      if (best !== undefined && score(best) > 0) registerDeclarationModule(dts, targets[best].module);
    }
  }
  return {
    modules: all.map((t) => t.module),
    package: packaged.length ? { dir: root, name: PACKAGE, products: packaged.map((t) => t.name) } : null,
    swift: all.filter((t) => t.kind === 'swift').map((t) => ({ name: t.name, dir: join(root, t.path) })),
  };
}

/** The plugins in xcodegen's project.yml: the package under `packages:`, the Swift modules' targets, and the app target's `dependencies:` on both. */
export function xcodegenLines(native: PluginNative, projectDir: string): { packages: string; targets: string; dependencies: string } {
  const p = native.package;
  return {
    packages: p ? `  ${p.name}:\n    path: ${relative(projectDir, p.dir)}\n` : '',
    targets: native.swift.map((t) => `  ${t.name}:\n    type: library.static\n    platform: iOS\n    sources: [${relative(projectDir, t.dir)}]\n    settings:\n      base:\n        SWIFT_VERSION: "5"\n`).join(''),
    dependencies: [
      ...(p?.products ?? []).map((product) => `      - package: ${p!.name}\n        product: ${product}\n`),
      ...native.swift.map((t) => `      - target: ${t.name}\n`),
    ].join(''),
  };
}

const derivedModule =(pkg: string) => 'NSPlugin_' + pkg.replace(/^@/, '').replace(/[^A-Za-z0-9]/g, '_');

function targetsOf(source: PluginSource, errors: string[]): Target[] {
  const ios = join(source.dir, 'platforms', 'ios');
  if (!existsSync(ios)) return [];
  const clang: string[] = [], swift: string[] = [], maps: string[] = [], xcframeworks: string[] = [];
  const fail = (file: string, why: string) => errors.push(`${source.name}@${source.version}: ${relative(source.dir, file)}: ${why}`);
  const walk = (dir: string) => {
    for (const f of readdirSync(dir).sort()) {
      const p = join(dir, f);
      if (f === '.DS_Store' || /\.md$/i.test(f)) continue;
      if (statSync(p).isDirectory()) {
        if (f.endsWith('.xcframework')) xcframeworks.push(p);
        else if (f.endsWith('.framework')) fail(p, 'a .framework is not supported yet (an .xcframework is)');
        else if (f.endsWith('.bundle')) fail(p, 'resource bundles are not supported yet');
        else walk(p);
      } else if (f.endsWith('.swift')) swift.push(p);
      else if (/\.(h|hh|hpp|m|mm|c|cc|cpp)$/.test(f)) clang.push(p);
      else if (f === 'module.modulemap') maps.push(p);
      else if (f === 'Podfile' || f.endsWith('.podspec')) fail(p, 'CocoaPods dependencies are not supported yet');
      else if (f === 'Info.plist') fail(p, "merging into the app's Info.plist is not supported yet");
      else if (/\.(xcconfig|entitlements)$/.test(f)) fail(p, 'build settings and entitlements are not supported yet');
      else if (f.endsWith('.a')) fail(p, 'static libraries are not supported yet (an .xcframework is)');
      else fail(p, 'not a source file the build knows what to do with');
    }
  };
  walk(ios);
  if (swift.length && clang.length) fail(ios, 'Swift and Objective-C sources in one plugin are not supported yet');
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
    const module = derivedModule(source.name);
    const from = commonDir(swift);
    targets.push({
      kind: 'swift', name: module, module, from, path: `Sources/${module}`, files: swift,
      extract: (scratch) => {
        try {
          execFileSync('xcrun', ['swiftc', '-emit-module', '-module-name', module, '-target', target, '-sdk', sdk, '-swift-version', '5', '-parse-as-library',
            '-emit-module-path', join(scratch, `${module}.swiftmodule`), ...swift], { stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 28 });
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
  const h = createHash('sha256').update(`${t.kind}\0${t.module}\0`);
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
