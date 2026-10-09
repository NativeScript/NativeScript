import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readPackage } from './resolve.ts';

/**
 * How a release build compiles an installed package:
 * - `plugin`: a NativeScript plugin, compiled from its TypeScript source (`source.ts`), which
 *   types its calls into the platform's native API;
 * - `library`: any other npm package, compiled from the JavaScript npm installed (`js-dynamic.ts`),
 *   typed for the app by its declarations.
 * A plugin whose source cannot be found or checked falls back to its published JavaScript.
 */
export type PackageKind = 'plugin' | 'library';

const kinds = new Map<string, PackageKind>();

export function packageKind(packageDir: string): PackageKind {
  let kind = kinds.get(packageDir);
  if (!kind) kinds.set(packageDir, (kind = classify(packageDir)));
  return kind;
}

function classify(dir: string): PackageKind {
  const pkg = readPackage(dir);
  const name: string = pkg.name ?? '';
  if (pkg.nativescript || /^(@nativescript(-community)?\/|nativescript-)/.test(name)) return 'plugin';
  const deps = { ...pkg.dependencies, ...pkg.peerDependencies };
  if ('@nativescript/core' in deps || 'tns-core-modules' in deps) return 'plugin';
  if (existsSync(join(dir, 'platforms', 'ios')) || existsSync(join(dir, 'platforms', 'android'))) return 'plugin';
  if (hasPlatformFiles(dir, 0)) return 'plugin';
  return 'library';
}

/** A `.ios.js` or `.android.js` file near the package's root: code NativeScript's bundler picks per platform. */
function hasPlatformFiles(dir: string, depth: number): boolean {
  if (depth > 2) return false;
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return false; }
  for (const f of entries) {
    if (/\.(ios|android)\.js$/.test(f)) return true;
    if (depth < 2 && !f.startsWith('.') && f !== 'node_modules' && !f.includes('.')) {
      if (hasPlatformFiles(join(dir, f), depth + 1)) return true;
    }
  }
  return false;
}
