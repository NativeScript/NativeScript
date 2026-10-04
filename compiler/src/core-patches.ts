import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * An app's patch-package patch of `@nativescript/core`
 * (`patches/@nativescript+core+<version>.patch`), as the kit's `CorePatches`
 * switches. The NativeScript build runs the patched core, so the native build
 * must too: each hunk that changes iOS behavior is recognized here or stops
 * the build.
 */
export type CorePatch = 'opaqueShadowColor' | 'insertBelowSubview' | 'clampedScrollOffsets' | 'resolvedGradientStops';

interface Rule {
  file: RegExp;
  added: RegExp;
  /** The kit switch the hunk turns on; absent when the kit has nothing it changes. */
  patch?: CorePatch;
}

const RULES: Rule[] = [
  { file: /^ui\/styling\/background\.ios\.js$/, added: /shadowColor = .*colorWithAlphaComponent\(1\)/, patch: 'opaqueShadowColor' },
  { file: /^ui\/(core\/view|layouts\/liquid-glass|layouts\/liquid-glass-container|page)\/index\.ios\.js$/, added: /insertSubviewBelowSubview\(\w+, \w+\.subviews\.objectAtIndex\(atIndex\)\)/, patch: 'insertBelowSubview' },
  { file: /^ui\/scroll-view\/index\.ios\.js$/, added: /setContentOffsetAnimated\(.*Math\.min\(Math\.max\(value, min\), max\)/, patch: 'clampedScrollOffsets' },
  { file: /^ui\/(utils\.ios|styling\/linear-gradient)\.js$/, added: /resolveGradientStopOffsets/, patch: 'resolvedGradientStops' },
  // A native child index past `_glassEffectView`, a subview the kit does not make.
  { file: /^ui\/(core\/view\/index\.ios|layouts\/layout-base-common)\.js$/, added: /_childIndexToNativeChildIndex/ },
];

const ANDROID_ONLY = /\.android\.js$|-for-android\.js$/;

export function corePatches(app: string, modules: string): { file: string; patches: CorePatch[] } | null {
  const version = JSON.parse(readFileSync(join(modules, '@nativescript/core/package.json'), 'utf8')).version;
  const file = join(app, 'patches', `@nativescript+core+${version}.patch`);
  if (!existsSync(file)) return null;
  const patches = new Set<CorePatch>();
  for (const section of readFileSync(file, 'utf8').split(/^diff --git /m).slice(1)) {
    const path = /^a\/node_modules\/@nativescript\/core\/(\S+)/.exec(section)?.[1];
    if (!path) throw new Error(`${file}: a section that does not patch @nativescript/core`);
    if (ANDROID_ONLY.test(path)) continue;
    for (const hunk of section.split(/^(?=@@ )/m).slice(1)) {
      const added = hunk.split('\n').filter((l) => l.startsWith('+')).map((l) => l.slice(1)).join('\n');
      const rule = RULES.find((r) => r.file.test(path) && r.added.test(added));
      if (!rule) throw new Error(`${file}: ${path} ${hunk.split('\n')[0]} changes core in a way the native build does not port`);
      if (rule.patch) patches.add(rule.patch);
    }
  }
  return { file, patches: [...patches] };
}
