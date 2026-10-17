import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/** The package a bare module specifier names (`@scope/name/deep` → `@scope/name`). */
export function packageOf(specifier: string): string {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/**
 * The file NativeScript's bundler loads for a module specifier: a package's
 * `main` (or a deep path into it), with the platform's `.ios`/`.android`
 * variant before the plain one, then the directory's index; for a package
 * with neither, the ES module its `exports` or `module` names.
 */
export function runtimeFile(specifier: string, modules: string, platform: 'ios' | 'android'): { packageDir: string; file: string } | null {
  const name = packageOf(specifier);
  const packageDir = join(modules, name);
  if (!existsSync(join(packageDir, 'package.json'))) return null;
  const deep = specifier.slice(name.length).replace(/^\//, '');
  const pkg = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
  const base = deep ? join(packageDir, deep) : resolve(packageDir, (pkg.main ?? 'index').replace(/\.js$/, ''));
  const file = runtimeCandidate(base, platform);
  if (file) return { packageDir, file };
  // A package published as ES modules only (`exports`, `module`; no `main`), as the bundler's import conditions pick its file.
  const esm = exported(pkg.exports, deep ? `./${deep}` : '.') ?? (deep || pkg.main ? null : typeof pkg.module === 'string' ? pkg.module : null);
  const target = esm && resolve(packageDir, esm);
  return target && existsSync(target) && statSync(target).isFile() ? { packageDir, file: target } : null;
}

/** The file `exports` maps a subpath to under the conditions a bundler importing it sets; type declarations are not one. */
function exported(exports: unknown, subpath: string): string | null {
  if (!exports) return null;
  const subpaths = typeof exports === 'object' && !Array.isArray(exports) && Object.keys(exports).some((k) => k.startsWith('.'));
  const entry = subpaths ? (exports as Record<string, unknown>)[subpath] : subpath === '.' ? exports : undefined;
  const pick = (e: unknown): string | null => {
    if (typeof e === 'string') return /\.d\.[cm]?ts$/.test(e) ? null : e;
    if (Array.isArray(e)) return e.map(pick).find((x) => x) ?? null;
    if (!e || typeof e !== 'object') return null;
    // The first condition, in the order the package lists them, that an importing bundler matches.
    for (const [k, v] of Object.entries(e)) if (['import', 'module', 'default', 'require'].includes(k)) { const f = pick(v); if (f) return f; }
    return null;
  };
  return pick(entry);
}

/** `base` as the bundler completes it: `base.ios.js`, `base.js`, `base/index.ios.js`, `base/index.js`. */
export function runtimeCandidate(base: string, platform: 'ios' | 'android', ext = '.js'): string | null {
  const isFile = (f: string) => existsSync(f) && statSync(f).isFile();
  if (base.endsWith(ext) && isFile(base)) return base;
  for (const f of [`${base}.${platform}${ext}`, `${base}${ext}`, join(base, `index.${platform}${ext}`), join(base, `index${ext}`)]) if (isFile(f)) return f;
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
