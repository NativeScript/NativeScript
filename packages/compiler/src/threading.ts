import ts from 'typescript';
import { evaluatedImports } from './modules.ts';

/**
 * The thread a module's code runs on, one answer for every backend:
 * - `ui`: the main thread only, as views, the application and its windows are used;
 * - `any`: any thread, as a worker's realm runs what its script imports.
 */
export type ModuleThread = 'ui' | 'any';

/**
 * Core's modules a worker may import, by path relative to core: a prefix, or one module. Each imports only modules
 * of this list (checked where the kit is generated). Every other core module is `ui`: views and all of ui/, the
 * application and its windows, and what imports them.
 */
const ANY_THREAD_MODULES = [
  'abortcontroller/',
  'application/helpers-common',
  'color/',
  'data/',
  'debugger/',
  'file-system/',
  'globals/',
  'http/',
  'image-asset/',
  'image-source/',
  'js-libs/',
  'module-name-resolver/',
  'platform/',
  'profiling/',
  'text/index',
  'text/text-common',
  'timer/',
  'trace/',
  'utils/',
  'xml/',
];

/** Modules under those that import views (utils' Android dismissSoftInput reads the frames; a span is a view): `ui`. */
const UI_EXCEPTIONS = ['utils/index', 'utils/native-helper'];

/** A core module's path relative to core, without its extension or platform (`data/observable/index`). */
function coreModule(rel: string): string {
  return rel.replace(/\.d\.ts$|\.(android|ios|visionos)\.ts$|\.ts$|\.m?js$/, '');
}

/** What a core module (relative to core) runs on. */
export function coreModuleThread(rel: string): ModuleThread {
  const m = coreModule(rel);
  if (UI_EXCEPTIONS.some((p) => m.startsWith(p))) return 'ui';
  return ANY_THREAD_MODULES.some((p) => m.startsWith(p)) ? 'any' : 'ui';
}

export interface ThreadingInput {
  program: ts.Program;
  /** The modules to classify (absolute paths): an app's own, or core's when the kit is generated. */
  modules: readonly string[];
  /** A module's path relative to core when it is one of core's (its source, or the declaration an app imports), else null. */
  coreModuleOf: (file: string) => string | null;
  /** The entry scripts of the app's workers. */
  workers?: readonly string[];
  resolved?: (containing: string, specifier: string) => string | undefined;
}

/**
 * Each module's thread. A core module's is fixed (coreModuleThread); an app module is `any` when a worker's script
 * reaches it, else `ui`. What a worker reaches must be `any`, and so must what an `any` core module imports: either
 * otherwise is an error naming the import chain, not something to run off the main thread anyway.
 */
export function moduleThreads(o: ThreadingInput): Map<string, ModuleThread> {
  const all = new Set(o.program.getSourceFiles().map((sf) => sf.fileName));
  const threads = new Map<string, ModuleThread>();
  const failures: string[] = [];
  const name = (f: string) => o.coreModuleOf(f) ?? f;
  // Every module a worker's script reaches, with the chain to it; past a core module, core's own check covers it.
  const walk = (start: string, reached: (file: string, chain: string[]) => void) => {
    const seen = new Set([start]);
    const queue: [string, string[]][] = [[start, [start]]];
    while (queue.length) {
      const [file, chain] = queue.shift()!;
      for (const next of evaluatedImports(o.program, file, all, o.resolved)) {
        if (seen.has(next)) continue;
        seen.add(next);
        const to = [...chain, next];
        reached(next, to);
        if (o.coreModuleOf(next) === null) queue.push([next, to]);
      }
    }
  };
  const fail = (what: string, chain: string[]) => failures.push(`${what}: ${chain.map(name).join(' → ')}`);
  const reachedByWorker = new Set<string>();
  for (const worker of o.workers ?? []) {
    reachedByWorker.add(worker);
    walk(worker, (file, chain) => {
      reachedByWorker.add(file);
      const core = o.coreModuleOf(file);
      if (core !== null && coreModuleThread(core) === 'ui') fail('a worker reaches a main-thread module', chain);
    });
  }
  for (const file of o.modules) {
    const core = o.coreModuleOf(file);
    const thread: ModuleThread = core !== null ? coreModuleThread(core) : reachedByWorker.has(file) ? 'any' : 'ui';
    threads.set(file, thread);
    // Each `any` core module's own imports: together they keep what a worker reaches off `ui` modules.
    if (core !== null && thread === 'any') {
      for (const next of evaluatedImports(o.program, file, all, o.resolved)) {
        const to = o.coreModuleOf(next);
        if (to !== null && coreModuleThread(to) === 'ui') fail('a module every thread may run imports a main-thread module', [file, next]);
      }
    }
  }
  if (failures.length) throw new Error(`Threading:\n  ${[...new Set(failures)].join('\n  ')}`);
  return threads;
}
