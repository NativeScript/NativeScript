import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

/** The package a bare module specifier names (`@scope/name/deep` → `@scope/name`). */
export function packageOf(specifier: string): string {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** How a module is loaded, which picks the `exports` condition its package answers with. */
export type ImportKind = 'import' | 'require';

/**
 * The `exports` conditions a native release answers to, most specific first: the platform's,
 * then React Native's and the browser's builds, which assume no Node.js built-ins. Never `node`.
 */
export function exportConditions(kind: ImportKind, platform: 'ios' | 'android'): string[] {
  return [platform, 'react-native', 'browser', kind, ...(kind === 'import' ? ['module'] : []), 'default'];
}

/** A package's directory for a bare specifier: the nearest `node_modules` above `from` that has it, else `modules`. */
export function packageDirOf(name: string, modules: string, from?: string): string | null {
  for (let dir = from ? dirname(from) : modules; from; dir = dirname(dir)) {
    const candidate = basename(dir) === 'node_modules' ? join(dir, name) : join(dir, 'node_modules', name);
    if (existsSync(join(candidate, 'package.json'))) return candidate;
    if (dirname(dir) === dir) break;
  }
  const top = join(modules, name);
  return existsSync(join(top, 'package.json')) ? top : null;
}

export interface RuntimeFile {
  packageDir: string;
  file: string;
}

/**
 * The file a native release loads for a bare module specifier, or null where the package is
 * not installed. The package's `exports` decide where it has them (conditions as
 * `exportConditions`); otherwise a deep path into the package, or its `react-native`, `module`
 * (for an import), `browser` and `main` fields, with the platform's `.ios`/`.android` variant
 * before the plain file, then the directory's index. The `browser` field's file map applies
 * where the package has one. A package that is installed but resolves to no file throws.
 */
export function runtimeFile(specifier: string, modules: string, platform: 'ios' | 'android', kind: ImportKind = 'import', from?: string): RuntimeFile | null {
  const name = packageOf(specifier);
  const packageDir = packageDirOf(name, modules, from);
  if (!packageDir) return null;
  const pkg = readPackage(packageDir);
  const subpath = '.' + specifier.slice(name.length);
  const where = from ? ` (imported by ${from})` : '';
  if (pkg.exports !== undefined && pkg.exports !== null) {
    const target = exportsTarget(pkg.exports, subpath, exportConditions(kind, platform));
    if (target === undefined) throw new Error(`${specifier}${where}: ${name}'s package.json "exports" has no "${subpath}"`);
    if (target === null) throw new Error(`${specifier}${where}: ${name}'s package.json "exports" maps "${subpath}" to no file for the conditions ${exportConditions(kind, platform).join(', ')}`);
    const file = resolve(packageDir, target);
    if (!isFile(file)) throw new Error(`${specifier}${where}: ${name}'s package.json "exports" maps "${subpath}" to ${target}, which is not installed`);
    return { packageDir, file: browserMapped(pkg, packageDir, file) };
  }
  let base: string;
  if (subpath !== '.') base = join(packageDir, subpath);
  else {
    const field = [pkg['react-native'], kind === 'import' ? pkg.module : undefined, pkg.browser, pkg.main].find((f): f is string => typeof f === 'string' && f.length > 0);
    base = resolve(packageDir, field ?? 'index');
  }
  const file = runtimeCandidate(base, platform) ?? (subpath === '.' && base !== resolve(packageDir, 'index') ? runtimeCandidate(resolve(packageDir, 'index'), platform) : null);
  if (!file) throw new Error(`${specifier}${where}: ${name} is installed at ${packageDir} but no file of it matches ${relative(packageDir, base) || '.'}`);
  return { packageDir, file: browserMapped(pkg, packageDir, file) };
}

/** A relative module a package's JavaScript requires or imports, completed as the bundler completes it; null where no file matches. */
export function runtimeRelativeJs(specifier: string, from: string, platform: 'ios' | 'android'): string | null {
  const file = runtimeCandidate(resolve(dirname(from), specifier), platform);
  if (!file) return null;
  const packageDir = packageRootOf(file);
  return packageDir ? browserMapped(readPackage(packageDir), packageDir, file) : file;
}

/** The directory of the nearest package.json above a file. */
export function packageRootOf(file: string): string | null {
  for (let dir = dirname(file); ; dir = dirname(dir)) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    if (dirname(dir) === dir || basename(dir) === 'node_modules') return null;
  }
}

const packages = new Map<string, any>();
export function readPackage(dir: string): any {
  let pkg = packages.get(dir);
  if (!pkg) packages.set(dir, (pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))));
  return pkg;
}

/**
 * The target `exports` gives a subpath (Node's PACKAGE_EXPORTS_RESOLVE): an exact key, else the
 * longest `*` pattern, each target the first of its conditions that is listed. undefined where the
 * subpath is not exported, null where it is but no condition matched.
 */
export function exportsTarget(exports: unknown, subpath: string, conditions: string[]): string | null | undefined {
  const map: Record<string, unknown> = typeof exports === 'string' || Array.isArray(exports) || !Object.keys(exports as object).some((k) => k.startsWith('.'))
    ? { '.': exports }
    : (exports as Record<string, unknown>);
  if (Object.prototype.hasOwnProperty.call(map, subpath) && !subpath.includes('*')) return conditionalTarget(map[subpath], conditions, null);
  let best: { key: string; match: string } | null = null;
  for (const key of Object.keys(map)) {
    const star = key.indexOf('*');
    if (star < 0) continue;
    const prefix = key.slice(0, star), suffix = key.slice(star + 1);
    if (subpath.length >= key.length && subpath.startsWith(prefix) && subpath.endsWith(suffix) && (!best || prefix.length > best.key.indexOf('*'))) {
      best = { key, match: subpath.slice(prefix.length, subpath.length - suffix.length) };
    }
  }
  if (best) return conditionalTarget(map[best.key], conditions, best.match);
  // The deprecated folder mapping (`"./lib/": "./lib/"`).
  const folder = Object.keys(map).filter((k) => k.endsWith('/') && subpath.startsWith(k)).sort((a, b) => b.length - a.length)[0];
  if (folder) {
    const target = conditionalTarget(map[folder], conditions, null);
    return typeof target === 'string' ? target + subpath.slice(folder.length) : target;
  }
  return undefined;
}

function conditionalTarget(target: unknown, conditions: string[], match: string | null): string | null {
  if (typeof target === 'string') return match === null ? target : target.replace(/\*/g, match);
  if (Array.isArray(target)) {
    for (const t of target) {
      const r = conditionalTarget(t, conditions, match);
      if (r !== null) return r;
    }
    return null;
  }
  if (target && typeof target === 'object') {
    for (const [key, value] of Object.entries(target)) {
      if (!conditions.includes(key)) continue;
      const r = conditionalTarget(value, conditions, match);
      if (r !== null) return r;
    }
  }
  return null;
}

/** A file the package's `browser` field maps to another (`{ "./index.js": "./index.browser.js" }`). */
function browserMapped(pkg: any, packageDir: string, file: string): string {
  const map = pkg.browser;
  if (!map || typeof map !== 'object') return file;
  for (const [from, to] of Object.entries(map)) {
    if (!from.startsWith('.') || typeof to !== 'string') continue;
    const source = resolve(packageDir, from);
    if (source === file || runtimeCandidate(source.replace(/\.js$/, ''), 'ios') === file) {
      const mapped = resolve(packageDir, to);
      if (isFile(mapped)) return mapped;
    }
  }
  return file;
}

const isFile = (f: string) => existsSync(f) && statSync(f).isFile();

/** `base` as the bundler completes it: `base.ios.js`, `base.js`, `base/index.ios.js`, `base/index.js`. */
export function runtimeCandidate(base: string, platform: 'ios' | 'android', ext = '.js'): string | null {
  if (base.endsWith(ext) && isFile(base)) return base;
  const exts = ext === '.js' ? ['.js', '.mjs', '.cjs'] : [ext];
  if (ext === '.js' && /\.[mc]?js$/.test(base) && isFile(base)) return base;
  for (const e of exts) for (const f of [`${base}.${platform}${e}`, `${base}${e}`]) if (isFile(f)) return f;
  // A directory with its own package.json (`lodash/fp`): its main.
  if (ext === '.js' && isFile(join(base, 'package.json'))) {
    const main = readPackage(base).main;
    if (typeof main === 'string' && resolve(base, main) !== base) {
      const f = runtimeCandidate(resolve(base, main), platform, ext);
      if (f) return f;
    }
  }
  for (const e of exts) for (const f of [join(base, `index.${platform}${e}`), join(base, `index${e}`)]) if (isFile(f)) return f;
  return null;
}

/** A relative import in a plugin's source as the bundler resolves it, platform variant first. */
export function runtimeRelative(specifier: string, from: string, platform: 'ios' | 'android'): string | null {
  const base = resolve(dirname(from), specifier);
  for (const ext of ['.ts', '.tsx']) {
    const f = runtimeCandidate(base, platform, ext);
    if (f) return f;
  }
  return null;
}
