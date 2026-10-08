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
 * variant before the plain one, then the directory's index.
 */
export function runtimeFile(specifier: string, modules: string, platform: 'ios' | 'android'): { packageDir: string; file: string } | null {
  const name = packageOf(specifier);
  const packageDir = join(modules, name);
  if (!existsSync(join(packageDir, 'package.json'))) return null;
  const deep = specifier.slice(name.length).replace(/^\//, '');
  let base: string;
  if (deep) base = join(packageDir, deep);
  else {
    const pkg = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
    base = resolve(packageDir, (pkg.main ?? 'index').replace(/\.js$/, ''));
  }
  const file = runtimeCandidate(base, platform);
  return file ? { packageDir, file } : null;
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
