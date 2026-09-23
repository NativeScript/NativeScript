import { createRequire } from 'node:module';
import { getProjectRootPath } from './project.js';

export type TypeScript = typeof import('typescript');

const require = createRequire(import.meta.url);

let loaded: TypeScript | null | undefined;

/**
 * The compiler API backs the NativeClass ES5 downlevel and build-time type
 * checking, but a plain JavaScript app has no reason to install `typescript`.
 * Loading it on demand keeps every config helper importable without it; each
 * call site decides what to do when it is absent. The project's own copy is
 * preferred over one reachable from this package so type checking runs on the
 * version the app was written against.
 */
export function loadTypeScript(): TypeScript | null {
	if (loaded !== undefined) return loaded;
	loaded = null;
	for (const paths of [[getProjectRootPath()], undefined]) {
		try {
			loaded = require(require.resolve('typescript', paths ? { paths } : undefined)) as TypeScript;
			break;
		} catch {}
	}
	return loaded;
}

let warned = false;

/**
 * Logged once per process. A `@NativeClass` source that is not downleveled
 * cannot register its native subclass at runtime, so the skip must be visible.
 */
export function warnNativeClassSkipped(fileName: string): void {
	if (warned) return;
	warned = true;
	console.warn(`[ns-vite] ${fileName} uses NativeClass but the 'typescript' package is not installed, so it was left untouched. Add typescript as a devDependency to enable the NativeClass downlevel.`);
}
