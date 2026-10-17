import ts from 'typescript';
import { existsSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';

/**
 * The `compilerOptions.paths` of the tsconfig.json nearest `from` (its `extends` followed), as the app's bundler applies
 * them to the app's own files: `~/app/x` is `<app>/src/app/x` for `"~/*": ["./src/*"]`. A specifier no pattern matches,
 * or whose targets name no file of the app, is undefined.
 */
export function pathAliases(from: string): (specifier: string) => string | undefined {
  let config: string | undefined;
  for (let dir = from; !config; dir = dirname(dir)) {
    if (existsSync(resolve(dir, 'tsconfig.json'))) config = resolve(dir, 'tsconfig.json');
    else if (dirname(dir) === dir) return () => undefined;
  }
  const options = ts.getParsedCommandLineOfConfigFile(config, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} })?.options;
  if (!options?.paths) return () => undefined;
  const root = dirname(config);
  const base = options.baseUrl ?? (options as { pathsBasePath?: string }).pathsBasePath ?? root;
  const patterns = Object.entries(options.paths).map(([pattern, targets]) => {
    const star = pattern.indexOf('*');
    return { prefix: star < 0 ? pattern : pattern.slice(0, star), suffix: star < 0 ? null : pattern.slice(star + 1), targets };
  });
  // As TypeScript matches them: an exact pattern first, then the longest prefix.
  patterns.sort((a, b) => Number(a.suffix !== null) - Number(b.suffix !== null) || b.prefix.length - a.prefix.length);
  const names = (path: string) => ['', '.ts', '.tsx', '.d.ts', '/index.ts', '/index.tsx'].some((x) => existsSync(path + x))
    || ['ios', 'android'].some((p) => existsSync(`${path}.${p}.ts`) || existsSync(`${path}/index.${p}.ts`));
  return (spec) => {
    for (const p of patterns) {
      let star = '';
      if (p.suffix === null) {
        if (spec !== p.prefix) continue;
      } else {
        if (spec.length < p.prefix.length + p.suffix.length || !spec.startsWith(p.prefix) || !spec.endsWith(p.suffix)) continue;
        star = spec.slice(p.prefix.length, spec.length - p.suffix.length);
      }
      // Only the app's own files: a target in node_modules or outside the app (a monorepo's `@nativescript/core` → its
      // sources) is a package, which the package resolution finds.
      const found = p.targets.map((t) => resolve(base, t.replace('*', star))).find((t) => t.startsWith(root + sep) && !/[\\/]node_modules[\\/]/.test(t) && names(t));
      if (found) return found;
    }
    return undefined;
  };
}
