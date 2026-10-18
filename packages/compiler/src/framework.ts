import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export type FrameworkFlavor =
  | 'angular'
  | 'vue'
  | 'solid'
  | 'svelte'
  | 'react'
  | 'octane'
  | 'core';

export interface FrameworkKitInfo {
  flavor: FrameworkFlavor;
  kitName: string;
  appleSourceFiles: string[];
  androidSourceFiles: string[];
}

const FLAVOR_CONFIG_KEYS = [
  ['nativescript', 'compiler', 'flavor'],
  ['nativescript', 'vite', 'flavor'],
] as const;

const KNOWN_FLAVORS = new Set<FrameworkFlavor>([
  'angular',
  'vue',
  'solid',
  'svelte',
  'react',
  'octane',
  'core',
]);

function readNestedString(obj: unknown, path: readonly string[]): string | undefined {
  let cur: unknown = obj;
  for (const key of path) {
    if (!cur || typeof cur !== 'object' || !(key in cur)) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === 'string' ? cur : undefined;
}

function readPackageJson(dir: string): Record<string, unknown> | undefined {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return undefined;
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch {
    return undefined;
  }
}

function collectDependencies(projectRoot: string): Record<string, string> {
  let dir = resolve(projectRoot);
  for (let depth = 0; depth < 5; depth++) {
    const pkg = readPackageJson(dir);
    if (pkg) {
      const devDeps = (pkg.devDependencies as Record<string, string>) || {};
      const deps = (pkg.dependencies as Record<string, string>) || {};
      return { ...devDeps, ...deps };
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return {};
}

function resolveInstalledPkgJson(projectRoot: string, depName: string): Record<string, unknown> | undefined {
  let dir = resolve(projectRoot);
  for (let depth = 0; depth < 5; depth++) {
    const candidate = join(dir, 'node_modules', depName);
    const pkg = readPackageJson(candidate);
    if (pkg) return pkg;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

function hasXmlViews(dir: string, appFiles?: string[], appDir?: string): boolean {
  if (appFiles && appDir) {
    return appFiles.some((f) => f.endsWith('.xml') && f.startsWith(appDir));
  }
  for (const sub of ['src', 'app']) {
    const target = join(dir, sub);
    if (!existsSync(target)) continue;
    try {
      const entries = readdirSync(target, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.xml')) return true;
      }
    } catch {}
  }
  return false;
}

export function detectFramework(
  projectRoot: string,
  entryFile?: string,
  appFiles?: string[],
  appDir?: string,
): FrameworkFlavor | null {
  const rootPkg = readPackageJson(projectRoot);
  if (rootPkg) {
    for (const keyPath of FLAVOR_CONFIG_KEYS) {
      const explicit = readNestedString(rootPkg, keyPath) as FrameworkFlavor | undefined;
      if (explicit && KNOWN_FLAVORS.has(explicit)) return explicit;
    }
  }

  const allDeps = collectDependencies(projectRoot);

  // Check installed packages that declare nativescript.compiler.flavor or nativescript.vite.flavor.
  for (const depName of Object.keys(allDeps)) {
    const depPkg = resolveInstalledPkgJson(projectRoot, depName);
    if (!depPkg) continue;
    for (const keyPath of FLAVOR_CONFIG_KEYS) {
      const declared = readNestedString(depPkg, keyPath) as FrameworkFlavor | undefined;
      if (declared && KNOWN_FLAVORS.has(declared)) return declared;
    }
  }

  if (allDeps['nativescript-vue'] || allDeps['vue']) return 'vue';
  if (allDeps['@nativescript/angular'] || allDeps['@angular/core']) return 'angular';
  if (allDeps['@nativescript-community/svelte-native'] || allDeps['svelte']) return 'svelte';
  if (allDeps['react-nativescript'] || allDeps['react']) return 'react';
  if (allDeps['@nativescript-community/solid-js'] || allDeps['solid-js']) return 'solid';
  if (allDeps['@nativescript-community/octane'] || allDeps['@nativescript/octane']) return 'octane';

  if (entryFile && existsSync(entryFile)) {
    try {
      const src = readFileSync(entryFile, 'utf8');
      if (/nativescript-vue|from\s+['"]vue['"]/.test(src)) return 'vue';
      if (/@nativescript\/angular|@angular\/core/.test(src)) return 'angular';
      if (/svelte-native|from\s+['"]svelte['"]/.test(src)) return 'svelte';
      if (/react-nativescript|from\s+['"]react['"]/.test(src)) return 'react';
      if (/solid-js/.test(src)) return 'solid';
    } catch {}
  }

  if (hasXmlViews(projectRoot, appFiles, appDir)) return 'core';
  return null;
}

const FRAMEWORK_KIT_MAP: Record<FrameworkFlavor, FrameworkKitInfo> = {
  angular: {
    flavor: 'angular',
    kitName: 'NativeScriptAngularKit',
    appleSourceFiles: ['AngularAPI.swift'],
    androidSourceFiles: ['AngularAPI.kt'],
  },
  vue: {
    flavor: 'vue',
    kitName: 'NativeScriptVueKit',
    appleSourceFiles: ['Vue.swift'],
    androidSourceFiles: [],
  },
  solid: {
    flavor: 'solid',
    kitName: 'NativeScriptSolidKit',
    appleSourceFiles: [],
    androidSourceFiles: [],
  },
  svelte: {
    flavor: 'svelte',
    kitName: 'NativeScriptSvelteKit',
    appleSourceFiles: [],
    androidSourceFiles: [],
  },
  react: {
    flavor: 'react',
    kitName: 'NativeScriptReactKit',
    appleSourceFiles: [],
    androidSourceFiles: [],
  },
  octane: {
    flavor: 'octane',
    kitName: 'NativeScriptOctaneKit',
    appleSourceFiles: [],
    androidSourceFiles: [],
  },
  core: {
    flavor: 'core',
    kitName: 'NativeScriptKit',
    appleSourceFiles: [],
    androidSourceFiles: [],
  },
};

export function getFrameworkKitInfo(flavor: FrameworkFlavor): FrameworkKitInfo {
  return FRAMEWORK_KIT_MAP[flavor] ?? FRAMEWORK_KIT_MAP.core;
}

/**
 * Returns the set of framework-specific kit source files that belong to OTHER
 * frameworks and can be excluded when staging a build for `flavor`.
 */
export function excludedFrameworkKitFiles(
  flavor: FrameworkFlavor,
  platform: 'apple' | 'android',
): Set<string> {
  const excluded = new Set<string>();
  const active = getFrameworkKitInfo(flavor);
  const keep = new Set(
    platform === 'apple' ? active.appleSourceFiles : active.androidSourceFiles,
  );
  for (const info of Object.values(FRAMEWORK_KIT_MAP)) {
    const files = platform === 'apple' ? info.appleSourceFiles : info.androidSourceFiles;
    for (const f of files) {
      if (!keep.has(f)) excluded.add(f);
    }
  }
  return excluded;
}
