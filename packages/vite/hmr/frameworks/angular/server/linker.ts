import { createRequire } from 'node:module';
import path from 'path';
import { getProjectRootPath } from '../../../../helpers/project.js';

const ANGULAR_PARTIAL_RE = /\u0275\u0275ngDeclare|ɵɵngDeclare|ngDeclare/;

interface AngularLinkerDeps {
	babel: typeof import('@babel/core');
	createLinkerPlugin: (options?: Record<string, unknown>) => any;
	fileSystem?: any;
}

let cachedDeps: AngularLinkerDeps | null = null;
let triedLoad = false;
let warnedMissing = false;
const projectRoot = getProjectRootPath();

/**
 * Resolve the Angular NodeJSFileSystem required by Angular 21+ linker.
 * Without it, the Babel transform throws "Cannot read properties of undefined (reading 'resolve')".
 */
function resolveFileSystem(requireBase: ReturnType<typeof createRequire>): any {
	try {
		const cliMod = requireBase('@angular/compiler-cli');
		if (cliMod.NodeJSFileSystem) {
			return new cliMod.NodeJSFileSystem();
		}
	} catch {}
	// Fallback: minimal fileSystem that satisfies the linker
	return {
		resolve: (...paths: string[]) => path.resolve(...paths),
		dirname: (p: string) => path.dirname(p),
		join: (...paths: string[]) => path.join(...paths),
		isRooted: (p: string) => path.isAbsolute(p),
		exists: (p: string) => {
			try {
				const fs = requireBase('fs');
				return fs.existsSync(p);
			} catch {
				return false;
			}
		},
		readFile: (p: string) => {
			const fs = requireBase('fs');
			return fs.readFileSync(p, 'utf8');
		},
	};
}

function attemptLoad(requireBase: ReturnType<typeof createRequire> | null): AngularLinkerDeps | null {
	if (!requireBase) return null;
	try {
		const babel = requireBase('@babel/core');
		const linkerMod = requireBase('@angular/compiler-cli/linker/babel');
		const createLinkerPlugin = (linkerMod && (linkerMod.createLinkerPlugin || linkerMod.createEs2015LinkerPlugin)) || null;
		if (babel && createLinkerPlugin) {
			const fileSystem = resolveFileSystem(requireBase);
			return { babel, createLinkerPlugin, fileSystem };
		}
	} catch {}
	return null;
}

function ensureDeps(): AngularLinkerDeps | null {
	if (cachedDeps || triedLoad) {
		return cachedDeps;
	}
	triedLoad = true;
	const attempts: Array<ReturnType<typeof createRequire> | null> = [];
	try {
		attempts.push(createRequire(path.join(projectRoot, 'package.json')));
	} catch {
		attempts.push(null);
	}
	try {
		attempts.push(createRequire(import.meta.url));
	} catch {
		attempts.push(null);
	}
	for (const req of attempts) {
		const deps = attemptLoad(req);
		if (deps) {
			cachedDeps = deps;
			return cachedDeps;
		}
	}
	return null;
}

function needsLinking(code: string): boolean {
	return typeof code === 'string' && ANGULAR_PARTIAL_RE.test(code);
}

const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
const strictLink = process.env.NS_STRICT_NG_LINK === '1' || process.env.NS_STRICT_NG_LINK === 'true';

export function linkAngularPartialsIfNeeded(code: string, filename = 'hmr-inline.mjs'): string {
	if (!needsLinking(code)) {
		return code;
	}
	const deps = ensureDeps();
	if (!deps) {
		if (strictLink) {
			throw new Error('[ns-hmr][angular-linker] Unable to load @angular/compiler-cli/linker/babel; partial declarations may reach runtime.');
		}
		if (!warnedMissing) {
			warnedMissing = true;
			console.warn('[ns-hmr][angular-linker] Unable to load @angular/compiler-cli/linker/babel; partial declarations may reach runtime.');
		}
		return code;
	}
	try {
		const plugin = deps.createLinkerPlugin({ sourceMapping: false, ...(deps.fileSystem ? { fileSystem: deps.fileSystem } : {}) });
		const result = deps.babel.transformSync(code, {
			filename,
			configFile: false,
			babelrc: false,
			sourceMaps: false,
			compact: false,
			plugins: [plugin],
		});
		if (result?.code && result.code !== code) {
			if (debug) {
				console.log('[ns-hmr][angular-linker] linked', filename);
			}
			return result.code;
		}
	} catch (error) {
		if (strictLink) {
			throw error;
		}
		if (!warnedMissing) {
			warnedMissing = true;
			console.warn('[ns-hmr][angular-linker] linker failed:', error);
		}
	}
	return code;
}
