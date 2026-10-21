import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { componentOf, declarablesIn } from './angular.ts';
import { CLOSED_SOURCE_UI_PLUGINS, KIT_PLUGINS } from './core.ts';
import type { PluginSources } from './plugins/source.ts';

/** The TypeScript of each `<package>/angular` entry the app imports, from the plugin's source beside its main module. */
export function angularLibraries(sources: string[], modulesDir: string, plugins: PluginSources, replaced: ReadonlySet<string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const f of sources) {
    for (const m of readFileSync(f, 'utf8').matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]((?:@[\w.-]+\/)?[\w.-]+)\/angular['"]/g)) {
      const wanted = m[1].split(',').map((x) => x.trim().split(/\s+as\s+/)[0]).filter(Boolean);
      // A plugin the kit implements renders its elements itself, and one the app replaces is the app's module: neither
      // has an Angular wrapper of its own compiled.
      if (seen.has(m[2]) || KIT_PLUGINS.includes(m[2]) || CLOSED_SOURCE_UI_PLUGINS.has(m[2]) || replaced.has(m[2])) continue;
      seen.add(m[2]);
      const dir = join(modulesDir, m[2]);
      const main = ['index.ios.js', 'index.js'].map((x) => join(dir, x)).find(existsSync);
      if (!main) continue;
      plugins.get(dir);
      const mainSource = plugins.sourceOf(main);
      const angular = mainSource && join(dirname(mainSource), 'angular');
      // A wrapper written against Angular's view internals (ElementRef, ViewContainerRef) has no components of its own the build reads.
      if (!angular || !existsSync(angular)) continue;
      const components = new Map<string, string>();
      /** The names an NgModule's `declarations`, `imports` and `exports` list: an app importing the module imports those. */
      const modules = new Map<string, string[]>();
      const walk = (d: string) => {
        for (const x of readdirSync(d)) {
          const p = join(d, x);
          if (statSync(p).isDirectory()) walk(p);
          else if (x.endsWith('.ts') && !x.endsWith('.d.ts') && !x.endsWith('.spec.ts')) {
            const text = readFileSync(p, 'utf8');
            const name = /\b(ViewContainerRef|DetachedContainer)\b/.test(text) ? undefined : componentOf(p, text)?.name;
            if (name) components.set(name, p);
            const found = declarablesIn(p, text);
            for (const d of found.classes) components.set(d, p);
            for (const [m, names] of found.modules) modules.set(m, names);
          }
        }
      };
      walk(angular);
      const listed = (names: string[]): string[] => names.flatMap((n) => (modules.has(n) ? listed(modules.get(n)!.filter((x) => x !== n)) : [n]));
      // The components and pipes the app imports, directly or through an NgModule, and those their `imports` name,
      // transitively, with the modules of their own they import.
      const queue = listed(wanted).filter((w) => components.has(w));
      const taken = new Set<string>();
      const files = [...components.values()];
      while (queue.length) {
        const name = queue.pop()!;
        if (taken.has(name)) continue;
        taken.add(name);
        const file = components.get(name)!;
        out.push(file);
        const text = readFileSync(file, 'utf8');
        const imports = /imports:\s*\[([^\]]*)\]/.exec(text)?.[1] ?? '';
        for (const i of imports.split(',').map((x) => x.trim())) if (components.has(i)) queue.push(i);
        for (const m of text.matchAll(/from\s*['"](\.[^'"]+)['"]/g)) {
          const support = [resolve(dirname(file), m[1]) + '.ts', join(resolve(dirname(file), m[1]), 'index.ts')].find(existsSync);
          if (support && !files.includes(support) && !out.includes(support)) out.push(support);
          // A component the code itself uses (a dialog it opens).
          for (const [other, f] of components) if (f === support) queue.push(other);
        }
      }
    }
  }
  return out;
}

