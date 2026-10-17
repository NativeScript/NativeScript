import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/** How the app's TypeScript files import each other, as its bundler resolves the specifiers. */
export interface AppImports {
  /** Each file's imports of the app's files. */
  importsOf: Map<string, Set<string>>;
  /** The files importing each file (a worker's script is not imported by its starter). */
  usedBy: Map<string, Set<string>>;
  /** The scripts workers are started with (`new Worker(new URL('./worker', …))`). */
  workerScripts: Set<string>;
}

/**
 * The imports among `files`: relative specifiers and those the app's tsconfig `paths` alias (`aliased`), each completed
 * as the bundler does, the platform's own file (`thisPlatform`, `.ios.ts`) beside the shared one.
 */
export function appImports(files: string[], aliased: (specifier: string) => string | undefined, thisPlatform: string): AppImports {
  const out: AppImports = { importsOf: new Map(), usedBy: new Map(), workerScripts: new Set() };
  const known = new Set(files);
  for (const f of files.filter((x) => /\.tsx?$/.test(x) && !x.endsWith('.d.ts'))) {
    const text = readFileSync(f, 'utf8');
    for (const m of text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|(new\s+Worker\s*\(\s*(?:new\s+URL\s*\(\s*)?)|\brequire\s*\(\s*)['"]([^'"\s]+)['"]/g)) {
      const target = m[2].startsWith('.') ? resolve(dirname(f), m[2]) : aliased(m[2]);
      if (!target) continue;
      const base = target.replace(/\.(ts|js)$/, '');
      for (const c of [base + '.ts', base + thisPlatform, base + '.tsx', base + '/index.ts', `${base}/index${thisPlatform}`]) {
        if (!known.has(c)) continue;
        if (m[1]) out.workerScripts.add(c);
        else out.usedBy.set(c, (out.usedBy.get(c) ?? new Set()).add(f));
        out.importsOf.set(f, (out.importsOf.get(f) ?? new Set()).add(c));
      }
    }
  }
  return out;
}

/** `roots` and every file they import, transitively. */
export function reachedFrom(roots: Iterable<string>, importsOf: Map<string, Set<string>>): Set<string> {
  const reached = new Set<string>();
  const pending = [...roots];
  while (pending.length) {
    const f = pending.pop()!;
    if (reached.has(f)) continue;
    reached.add(f);
    pending.push(...(importsOf.get(f) ?? []));
  }
  return reached;
}

/** The TypeScript files under `dir` the app's tsconfig.json does not exclude; null where the app has none. */
export function tsconfigIncluded(app: string, dir: string): Set<string> | null {
  const file = join(app, 'tsconfig.json');
  if (!existsSync(file)) return null;
  const config = ts.readConfigFile(file, ts.sys.readFile).config ?? {};
  const parsed = ts.parseJsonConfigFileContent({ ...config, files: undefined, include: [join(relative(app, dir) || '.', '**/*')] }, ts.sys, app, undefined, file);
  return new Set(parsed.fileNames.map((f) => resolve(f)));
}
