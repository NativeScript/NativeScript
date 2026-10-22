import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { componentOf, declarablesIn } from './angular.ts';
import { KIT_PLUGINS, STUBBED_PLUGINS } from './core.ts';
import type { PluginSources } from './plugins/source.ts';
import { packageOf } from './plugins/resolve.ts';
import ts from 'typescript';

/** The TypeScript of each `<package>/angular` entry the app imports, from the plugin's source beside its main module. */
export function angularLibraries(sources: string[], modulesDir: string, plugins: PluginSources, replaced: ReadonlySet<string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const f of sources) {
    for (const m of readFileSync(f, 'utf8').matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]((?:@[\w.-]+\/)?[\w.-]+)\/angular['"]/g)) {
      const wanted = m[1].split(',').map((x) => x.trim().split(/\s+as\s+/)[0]).filter(Boolean);
      // A plugin the kit implements renders its elements itself, and one the app replaces is the app's module: neither
      // has an Angular wrapper of its own compiled.
      if (seen.has(m[2]) || KIT_PLUGINS.includes(m[2]) || STUBBED_PLUGINS.has(m[2]) || replaced.has(m[2])) continue;
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


/** A tag registered for a plugin view: its class, the module it is from, and the `ViewClassMeta` keys it was registered with. */
export interface RegisteredElement {
  name: string;
  from: string;
  /** The keys of the third argument (`insertChild`, `skipAddToDom`…), or null when it is not an object literal the file declares. */
  meta?: string[] | null;
}

/**
 * Tags registered for plugin views: `registerElement('Tag', () => Class)` or `registerElement('Tag', () => Class, meta)`
 * in the app, and in the Angular entry (`<package>/angular`) of a plugin the app imports, with the module each class is from.
 */
export function registeredElements(sources: string[], modulesDir: string): Map<string, RegisteredElement> {
  const found = new Map<string, RegisteredElement>();
  const scan = (text: string, file: string | null) => {
    if (!text.includes('registerElement')) return;
    const imports = new Map<string, string>();
    for (const m of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
      for (const part of m[1].split(',')) {
        const [orig, alias] = part.trim().split(/\s+as\s+/);
        if (orig) imports.set((alias ?? orig).trim(), JSON.stringify([orig.trim(), m[2]]));
      }
    }
    const sf = ts.createSourceFile(file ?? 'entry.mjs', text, ts.ScriptTarget.Latest, true, file?.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS);
    const objectOf = (e: ts.Expression): ts.ObjectLiteralExpression | null => {
      if (ts.isObjectLiteralExpression(e)) return e;
      if (!ts.isIdentifier(e)) return null;
      for (const st of sf.statements) {
        if (!ts.isVariableStatement(st) || !(st.declarationList.flags & ts.NodeFlags.Const)) continue;
        for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.name.text === e.text && d.initializer) return objectOf(d.initializer);
      }
      return null;
    };
    const visit = (n: ts.Node) => {
      ts.forEachChild(n, visit);
      if (!ts.isCallExpression(n) || !ts.isIdentifier(n.expression) || n.expression.text !== 'registerElement') return;
      const [tag, resolver, meta] = n.arguments;
      if (!tag || !ts.isStringLiteralLike(tag) || !resolver || !ts.isArrowFunction(resolver) || resolver.parameters.length || !ts.isIdentifier(resolver.body)) return;
      const imported = imports.get(resolver.body.text);
      if (!imported) return;
      const [name, from] = JSON.parse(imported) as [string, string];
      // Core's own views are elements already.
      if (from === '@nativescript/core' || STUBBED_PLUGINS.has(packageOf(from))) return;
      const object = meta ? objectOf(meta) : null;
      const keys = object && object.properties.every((p) => p.name && !ts.isComputedPropertyName(p.name)) ? object.properties.map((p) => p.name!.getText().replace(/^['"]|['"]$/g, '')) : null;
      found.set(tag.text, { name, from: from.startsWith('.') && file ? resolve(dirname(file), from) : from, ...(meta ? { meta: keys } : {}) });
    };
    visit(sf);
  };
  for (const f of sources) {
    const text = readFileSync(f, 'utf8');
    scan(text, f);
    for (const m of text.matchAll(/from\s*['"]((?:@[\w.-]+\/)?[\w.-]+)\/angular['"]/g)) {
      if (STUBBED_PLUGINS.has(m[1])) continue;
      const dir = join(modulesDir, m[1], 'angular');
      const entry = existsSync(dir) ? readdirSync(dir).flatMap((d) => (/^fesm/.test(d) ? readdirSync(join(dir, d)).filter((x) => x.endsWith('.mjs')).map((x) => join(dir, d, x)) : [])).sort().reverse()[0] : undefined;
      if (entry) scan(readFileSync(entry, 'utf8'), null);
    }
  }
  return found;
}
