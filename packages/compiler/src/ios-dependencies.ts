// The iOS project's dependencies beyond plugins' platforms/ios code, as the
// NativeScript CLI adds them to platforms/ios: Swift packages
// (`ios.SPMPackages` in the app's and plugins' nativescript.config;
// spm-service, spm-pbxproj-service) and CocoaPods (plugins' and the app's
// Podfiles; cocoapods-service, cocoapods-platform-manager). Their modules get
// symbol tables as the SDK's do, so TypeScript calls into them resolve.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { appResourcesDir, productionPlugins, readConfig } from './app-resources.ts';
import { moduleCache, nativeTable, setEmptyTable } from './natives/symbols.ts';

export interface SwiftPackage {
  name: string;
  libs: string[];
  /** Targets besides the app's that link the libraries (app extensions). */
  targets: string[];
  /** A local package (absolute), or a repository and its version requirement. */
  path?: string;
  url?: string;
  version?: string;
  /** The plugin that declares it, and its directory; null for the app. */
  plugin: string | null;
  pluginDir?: string;
}

/**
 * The app's packages, then each production plugin's whose name the app and an
 * earlier plugin do not take. A local path is the app's; a plugin's path that
 * is not there is the plugin's own.
 */
export function swiftPackages(app: string): SwiftPackage[] {
  const declared = (dir: string) => ((readConfig(dir).ios as { SPMPackages?: Record<string, unknown>[] } | undefined)?.SPMPackages ?? []);
  const out: SwiftPackage[] = [];
  const read = (dir: string, plugin: string | null) => {
    for (const p of declared(dir)) {
      const name = p.name as string;
      if (!name || out.some((o) => o.name === name)) continue;
      const pkg: SwiftPackage = { name, libs: (p.libs as string[]) ?? [], targets: (p.targets as string[]) ?? [], plugin, ...(plugin ? { pluginDir: dir } : {}) };
      if (typeof p.path === 'string') {
        pkg.path = resolve(app, p.path);
        if (plugin && !existsSync(pkg.path) && existsSync(resolve(dir, p.path))) pkg.path = resolve(dir, p.path);
        if (!existsSync(pkg.path)) throw new Error(`${relative(app, join(dir, 'nativescript.config.ts')) || 'nativescript.config.ts'}: the Swift package ${name} is not at ${pkg.path}`);
        // The JavaScript engine's headers (@nativescript/canvas's NativeScriptV8): no engine runs a compiled app.
        if (boundToEngine(pkg.path)) continue;
      } else {
        pkg.url = p.repositoryURL as string;
        pkg.version = String(p.version);
      }
      out.push(pkg);
    }
  };
  read(app, null);
  for (const p of productionPlugins(app, 'ios')) read(p.dir, p.name);
  return out;
}

/** xcodegen's `packages:` entries. */
export function packageLines(packages: SwiftPackage[], projectDir: string): string {
  return packages.map((p) => `  ${p.name}:\n` + (p.path ? `    path: ${JSON.stringify(relative(projectDir, p.path))}\n` : `    url: ${JSON.stringify(p.url)}\n${requirement(p.version!)}`)).join('');
}

/** A target's `dependencies:` entries on the libraries of `packages`; a static library builds against them and the app links them, once. */
export function productLines(packages: SwiftPackage[], link = true): string {
  return packages.flatMap((p) => p.libs.map((lib) => `      - package: ${p.name}\n        product: ${lib}\n${link ? '' : '        link: false\n'}`)).join('');
}

/** `classifyVersion`: an exact version, `^`/`~` ranges, `>=a <b`, `#<revision>`, else a branch. */
function requirement(version: string): string {
  const v = version.trim();
  const line = (k: string, value: string) => `    ${k}: ${JSON.stringify(value)}\n`;
  const full = (s: string) => [...s.split('.'), '0', '0'].slice(0, 3).join('.');
  if (v.startsWith('#')) return line('revision', v.slice(1));
  if (/^v?\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(v)) return line('exactVersion', v.replace(/^v/, ''));
  const caret = /^([\^~])\s*v?(\d+(?:\.\d+){0,2})/.exec(v);
  if (caret) return line(caret[1] === '^' ? 'majorVersion' : 'minorVersion', full(caret[2]));
  const range = /^>=?\s*v?(\d+(?:\.\d+){0,2})\s+<=?\s*v?(\d+(?:\.\d+){0,2})$/.exec(v);
  if (range) return line('minVersion', full(range[1])) + line('maxVersion', full(range[2]));
  const min = /^>=?\s*v?(\d+(?:\.\d+){0,2})$/.exec(v);
  if (min) return line('majorVersion', full(min[1]));
  return line('branch', v);
}

// ---------------------------------------------------------------- CocoaPods

const NS_BASE_PODFILE = 'NSPodfileBase';

/**
 * One Podfile from each production plugin's `platforms/ios/Podfile` and the
 * app's `App_Resources/iOS/Podfile`, as `applyPodfileToProject` builds it:
 * each inside `# Begin Podfile`/`# End Podfile`, its `post_install` block a
 * function the one hook calls, its `platform :ios` row commented out and the
 * platform section taken from the Podfile the CLI would choose (else the
 * deployment target); then each extension's Podfile as its own target.
 * `nested` targets (the project's static libraries) inherit every pod, so
 * plugin Swift that imports a pod compiles after it. Null when no Podfile.
 */
export function podfile(o: { app: string; name: string; deploymentTarget: string; nested?: string[]; extensions?: string[] }): string | null {
  const res = join(appResourcesDir(o.app), 'iOS');
  const appPodfile = join(res, 'Podfile');
  const files = [...productionPlugins(o.app, 'ios').map((p) => ({ module: p.name, file: join(p.dir, 'platforms', 'ios', 'Podfile') })), { module: NS_BASE_PODFILE, file: appPodfile }].filter((f) => existsSync(f.file));
  if (!files.length) return null;
  const overridden = readConfig(o.app).overridePods && existsSync(appPodfile) ? podsOf(readFileSync(appPodfile, 'utf8')) : [];
  const hooks: string[] = [];
  let platform: { content: string; version?: string; file: string } | null = null;
  const blocks: string[] = [];
  for (const { module, file } of files) {
    let text = readFileSync(file, 'utf8');
    const fn = `post_install${module.replace(/_/g, '___').replace(/[^A-Za-z0-9_]/g, '_')}`;
    let count = 0;
    text = text.replace(/post_install do *(\|(\w+)\|)?/g, (_m, _block, param?: string) => {
      const name = `${fn}_${count++}`;
      hooks.push(param ? `  ${name} installer` : `  ${name}`);
      return param ? `def ${name} (${param})` : `def ${name}`;
    });
    text = text.replace(/^\s*?(platform\b\s*?:\s*?ios\b(?:,\s*?['"](.+)['"])?)/gm, (row, content: string, version?: string) => {
      const found = { content, version, file };
      if (!platform || replacesPlatform(platform, found, appPodfile)) platform = found;
      return `# ${row.trim()}`;
    });
    if (file !== appPodfile) for (const pod of overridden) text = text.replace(new RegExp(`^[ ]*pod\\s*["']${pod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"].*$`, 'gm'), '#$&');
    blocks.push(`# Begin Podfile - ${file}\n${text.trim()}\n# End Podfile`);
  }
  const chosen = platform as { content: string; version?: string; file: string } | null;
  const section = chosen
    ? `# NativeScriptPlatformSection ${chosen.file} with${chosen.version ? ` ${chosen.version}` : ''}\n${chosen.content}\n# End NativeScriptPlatformSection`
    : `platform :ios, '${o.deploymentTarget}'`;
  // The CLI builds every target, pods included, with the app's deployment target on xcodebuild's command line.
  hooks.push(`  installer.pods_project.targets.each do |target|\n    target.build_configurations.each { |config| config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${o.deploymentTarget}' }\n  end`);
  const nested = (o.nested ?? []).map((t) => `\n  target "${t}" do\n  end\n`).join('');
  const extensions = (o.extensions ?? []).flatMap((ext) => {
    const file = join(res, 'extensions', ext, 'Podfile');
    return existsSync(file) ? [`# Begin Podfile - ${file}\ntarget "${ext}" do\n${readFileSync(file, 'utf8').trim()}\nend\n# End Podfile\n`] : [];
  });
  return `use_frameworks!\n\ntarget "${o.name}" do\n${section}\n\n${blocks.join('\n\n')}\n\npost_install do |installer|\n${hooks.join('\n')}\nend\n${nested}end\n${extensions.length ? `\n${extensions.join('\n')}` : ''}`;
}

/** `shouldReplacePlatformSection`: the app's Podfile over a plugin's, a platform without a version, or a higher version. */
function replacesPlatform(old: { version?: string; file: string }, cur: { version?: string; file: string }, appPodfile: string): boolean {
  const higher = (a?: string, b?: string) => compareVersions(a ?? '0', b ?? '0') > 0;
  if (old.file !== appPodfile && cur.file === appPodfile) return true;
  if (old.file === appPodfile && cur.file === appPodfile && higher(cur.version, old.version)) return true;
  return !cur.version || (!!old.version && higher(cur.version, old.version));
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0), pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}

function podsOf(text: string): string[] {
  return [...text.matchAll(/^\s*pod\s*["'](.*?)['"].*$/gm)].map((m) => m[1]).filter(Boolean);
}

// ---------------------------------------------------------------- the project

/** Written beside a generated project that the compiler has already generated and integrated with CocoaPods: build its workspace. */
export const PROJECT_MARKER = 'ns-native-project.json';

/**
 * xcodegen, then, with a Podfile, `pod install` and the app target's
 * configuration files merged with the pods' (`mergePodXcconfigFile`).
 * Returns the arguments that name the project to xcodebuild.
 */
export function generateProject(o: { out: string; name: string; pods: boolean; mergeXcconfig: () => void; say: (m: string) => void }): string[] {
  execFileSync('xcodegen', ['generate', '--quiet'], { cwd: o.out, stdio: 'inherit' });
  if (!o.pods) return ['-project', `${o.name}.xcodeproj`];
  o.say('pod install');
  podInstall(o.out);
  o.mergeXcconfig();
  return ['-workspace', `${o.name}.xcworkspace`];
}

/** What a generated project without a Podfile leaves behind from one that had it. */
export function removePods(out: string, name: string) {
  for (const f of ['Podfile', 'Podfile.lock', 'Pods', `${name}.xcworkspace`, PROJECT_MARKER]) rmSync(join(out, f), { recursive: true, force: true });
}

function podInstall(dir: string) {
  try {
    execFileSync('pod', ['install'], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 });
  } catch (e: any) {
    if (e.code === 'ENOENT') throw new Error('the app has CocoaPods dependencies: install CocoaPods (`brew install cocoapods`)');
    throw new Error(`pod install failed in ${dir}:\n${String(e.stdout ?? '')}${String(e.stderr ?? e.message)}`);
  }
}

// ---------------------------------------------------------------- symbol tables

export interface Dependencies {
  /** The Swift and Clang modules the packages and pods build, each with a table. */
  modules: string[];
  /** Arguments that let the Swift compiler and the extractor see those modules; the first call builds them. */
  searchArgs: () => string[];
  /** The Objective-C classes each module's built binary defines, by module; a module missing here is not known. */
  classes: Record<string, string[]>;
  /** Removes what the build left. */
  dispose: () => void;
}

const SCRATCH_TARGET = 'NSDependencies';

/**
 * A table for every module the packages and pods build. The tables are cached
 * under a hash of what the dependencies are; the first compile with them
 * builds them for the simulator in a project of their own (the packages as
 * the app target's dependencies, the pods by the same Podfile) and extracts
 * each module's symbol graph from what that build leaves.
 */
export function iosDependencies(o: { app: string; packages: SwiftPackage[]; deploymentTarget: string; say: (m: string) => void }): Dependencies {
  const pods = podfile({ app: o.app, name: SCRATCH_TARGET, deploymentTarget: o.deploymentTarget });
  if (!o.packages.length && !pods) return { modules: [], searchArgs: () => [], classes: {}, dispose: () => {} };
  const key = dependencyKey(o.packages, pods);
  let built: Built | null = null;
  const build = () => built ??= buildDependencies(o.packages, pods, o.deploymentTarget, o.say);
  const manifest = join(moduleCache(), `dependencies-${key}.json`);
  const cached: { modules: string[]; classes?: Record<string, string[]> } | null = existsSync(manifest) ? JSON.parse(readFileSync(manifest, 'utf8')) : null;
  const { modules, classes } = cached?.classes ? { modules: cached.modules, classes: cached.classes } : build();
  for (const m of modules) {
    try {
      nativeTable(m, { key, extraArgs: () => build().args });
    } catch (e) {
      o.say(`${m}: no symbol table (${(e as Error).message.split('\n').slice(0, 2).join(' ')}); calls into it from TypeScript will not resolve`);
      setEmptyTable(m, key);
    }
  }
  mkdirSync(moduleCache(), { recursive: true });
  writeFileSync(manifest, JSON.stringify({ modules, classes }));
  return {
    modules,
    searchArgs: () => build().args,
    classes,
    dispose: () => { if (built) rmSync(built.dir, { recursive: true, force: true }); },
  };
}

function dependencyKey(packages: SwiftPackage[], pods: string | null): string {
  const h = createHash('sha256').update('dependencies-1\0').update(pods ?? '').update('\0');
  for (const p of packages) {
    h.update(JSON.stringify({ ...p, path: undefined, plugin: undefined, pluginDir: undefined })).update('\0');
    if (p.path) for (const f of filesUnder(p.path)) h.update(relative(p.path, f)).update('\0').update(readFileSync(f)).update('\0');
  }
  return h.digest('hex').slice(0, 16);
}

interface Built { dir: string; args: string[]; modules: string[]; classes: Record<string, string[]> }

function buildDependencies(packages: SwiftPackage[], pods: string | null, deploymentTarget: string, say: (m: string) => void): Built {
  const dir = mkdtempSync(join(tmpdir(), 'ns-dependencies-'));
  say(`building the Swift packages and pods once for their symbol tables (${[...packages.map((p) => p.name), ...(pods ? ['CocoaPods'] : [])].join(', ')})`);
  mkdirSync(join(dir, 'Empty'));
  writeFileSync(join(dir, 'Empty', 'Empty.swift'), '');
  writeFileSync(join(dir, 'project.yml'), `name: ${SCRATCH_TARGET}
options:
  deploymentTarget:
    iOS: "${deploymentTarget}"
${packages.length ? `packages:\n${packageLines(packages, dir)}` : ''}targets:
  ${SCRATCH_TARGET}:
    type: framework
    platform: iOS
    sources: [Empty]
${packages.length ? `    dependencies:\n${productLines(packages)}` : ''}    settings:
      base:
        GENERATE_INFOPLIST_FILE: YES
        CODE_SIGNING_ALLOWED: NO
        PRODUCT_BUNDLE_IDENTIFIER: org.nativescript.dependencies
`);
  execFileSync('xcodegen', ['generate', '--quiet'], { cwd: dir, stdio: 'inherit' });
  if (pods) {
    writeFileSync(join(dir, 'Podfile'), pods);
    podInstall(dir);
  }
  const derived = join(dir, 'DerivedData');
  try {
    execFileSync('xcodebuild', [...(pods ? ['-workspace', `${SCRATCH_TARGET}.xcworkspace`] : ['-project', `${SCRATCH_TARGET}.xcodeproj`]), '-scheme', SCRATCH_TARGET,
      '-configuration', 'Debug', '-destination', 'generic/platform=iOS Simulator', '-derivedDataPath', derived, 'build', '-quiet'], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
  } catch (e: any) {
    const lines = `${e.stdout ?? ''}${e.stderr ?? ''}`.split('\n').filter((l) => /\berror\b/.test(l));
    throw new Error(`the Swift packages and pods do not build for the simulator:\n${lines.slice(0, 20).join('\n') || e.message}`);
  }
  const products = join(derived, 'Build', 'Products', 'Debug-iphonesimulator');
  const maps = join(derived, 'Build', 'Intermediates.noindex', 'GeneratedModuleMaps-iphonesimulator');
  const modules = new Set<string>();
  const args = ['-I', products];
  if (existsSync(maps)) {
    args.push('-I', maps);
    for (const f of readdirSync(maps)) if (f.endsWith('.modulemap')) modules.add(basename(f, '.modulemap'));
  }
  // A binary target of a static library: its headers and module map are copied to `include`.
  const include = join(products, 'include');
  if (existsSync(include)) {
    args.push('-I', include);
    for (const f of readdirSync(include, { recursive: true }) as string[]) {
      if (basename(f) !== 'module.modulemap') continue;
      for (const m of readFileSync(join(include, f), 'utf8').matchAll(/^\s*(?:framework\s+)?module\s+(\w+)/gm)) modules.add(m[1]);
    }
  }
  // A binary target's framework is copied to the products themselves.
  if (readdirSync(products).some((f) => f.endsWith('.framework'))) args.push('-F', products);
  for (const f of readdirSync(products)) {
    const p = join(products, f);
    if (f.endsWith('.swiftmodule')) modules.add(basename(f, '.swiftmodule'));
    else if (f.endsWith('.framework') && f !== `${SCRATCH_TARGET}.framework` && existsSync(join(p, 'Modules'))) modules.add(basename(f, '.framework'));
    else if (statSync(p).isDirectory() && !/\.(framework|bundle)$/.test(f)) {
      const frameworks = readdirSync(p).filter((x) => x.endsWith('.framework'));
      if (frameworks.length) args.push('-F', p);
      for (const fw of frameworks) modules.add(basename(fw, '.framework'));
    }
  }
  // What each module's binary (`libX.a`, `X.o`, `X.framework/X`) defines.
  const classes: Record<string, string[]> = {};
  for (const f of readdirSync(products, { recursive: true }) as string[]) {
    const name = /(?:^|\/)(?:lib(\w+)\.a|(\w+)\.o|(\w+)\.framework\/\3)$/.exec(f);
    const module = name && (name[1] ?? name[2] ?? name[3]);
    if (module && modules.has(module) && statSync(join(products, f)).isFile()) classes[module] = definedObjCClasses([join(products, f)]);
  }
  return { dir, args, modules: [...modules].sort(), classes };
}

/**
 * The Objective-C classes a binary defines, by their runtime names: a class a header declares
 * may have no implementation, and NativeScript's runtime then has no class of that name.
 */
export function definedObjCClasses(binaries: string[]): string[] {
  const out = new Set<string>();
  for (const f of binaries) {
    let names: string;
    try {
      names = execFileSync('nm', ['-gUj', '-arch', 'arm64', f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 });
    } catch { continue; }
    for (const m of names.matchAll(/^_OBJC_CLASS_\$_(\S+)$/gm)) out.add(swiftClassName(m[1]) ?? m[1]);
  }
  return [...out].sort();
}

/** A Swift class without an Objective-C name, `_TtC<module><name>` each length-prefixed: its name. */
function swiftClassName(symbol: string): string | null {
  if (!symbol.startsWith('_TtC')) return null;
  let at = 4;
  const part = () => {
    const digits = /^\d+/.exec(symbol.slice(at))?.[0];
    if (!digits) return null;
    at += digits.length;
    const text = symbol.slice(at, at + Number(digits));
    at += Number(digits);
    return text;
  };
  return part() !== null ? part() : null;
}

/** A directory of the V8 engine's headers, or of sources written against them. */
export function boundToEngine(dir: string): boolean {
  if (basename(dir) === 'NativeScriptV8' || existsSync(join(dir, 'include', 'v8.h'))) return true;
  const sources = (readdirSync(dir, { recursive: true }) as string[]).filter((f) => /\.(cpp|cc|mm)$/.test(f));
  return sources.length > 0 && sources.some((f) => /\bv8::|#include\s*[<"]v8\.h[>"]/.test(readFileSync(join(dir, f), 'utf8')));
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && !/(^|\/)(\.build|\.swiftpm|\.git|\.DS_Store)(\/|$)/.test(relative(dir, join(e.parentPath, e.name))))
    .map((e) => join(e.parentPath, e.name)).sort();
}
