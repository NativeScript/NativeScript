import path from 'node:path';
import type { DevEnvironment, Plugin, ViteDevServer } from 'vite';
import { NS_DEV_EXPR } from '../shared/runtime/dev-globals.js';
import { viteUrlForFile } from './vite-url.js';
import { corePackageDir, resolveCoreEntryFile } from './vite-plugin.js';

/**
 * `require('@nativescript/core[/sub]')` keys a served core file answers to, in
 * the shapes the bundle.mjs require shim looks up (the dev globals' `coreModules`).
 */
export function coreRequireKeys(fileAbs: string, coreRoot: string): string[] {
	const rel = path.relative(coreRoot, fileAbs).replace(/\\/g, '/');
	if (!rel || rel.startsWith('..')) return [];
	const noExt = rel.replace(/\.(?:mjs|cjs|js|mts|cts|ts)$/, '');
	const noPlatform = noExt.replace(/\.(?:ios|android|visionos)$/, '');
	const noIndex = noPlatform === 'index' ? '' : noPlatform.replace(/\/index$/, '');
	const key = (sub: string) => (sub ? `@nativescript/core/${sub}` : '@nativescript/core');
	return [...new Set([key(rel), key(noExt), key(noPlatform), key(noIndex)])];
}

/**
 * Sync `require()` of core (NS plugins, HMR runtime helpers) must return the
 * module instance already loaded from the dev server; otherwise the native
 * loader resolves the bare name itself and evaluates a second core. The
 * self-import names the module's own Vite URL, so import analysis gives it
 * the same `?t=` the device fetched it under. A timestamped instance is a
 * newer copy of the same file and replaces the registered one; otherwise the
 * first file to claim a key keeps it.
 */
export function coreRegistrationFooter(selfUrl: string, keys: string[], replace: boolean): string {
	const assign = replace ? 't[k] = v;' : 'if (!t[k]) t[k] = v;';
	return `\nimport * as __ns_core_self__ from ${JSON.stringify(selfUrl)};\n` + `try { const d = ${NS_DEV_EXPR}; const t = d.coreModules || (d.coreModules = {}); ` + `const v = typeof d.cjsShape === 'function' ? d.cjsShape(__ns_core_self__) : __ns_core_self__; ` + `for (const k of ${JSON.stringify(keys)}) ${assign} } catch {}\n`;
}

// No query, no virtual id: a plain script file. CSS and other assets are still
// in their source language when a normal-order transform sees them.
const scriptFileRE = /^[^\0?]+\.(?:[cm]?js|[cm]?ts)$/;

/** Appends {@link coreRegistrationFooter} to every `@nativescript/core` file the client environment serves. */
export function nsCoreRegistrationPlugin(): Plugin {
	let server: ViteDevServer | undefined;
	let coreDir: Promise<string | null> | undefined;

	return {
		name: 'nativescript-core-registration',
		apply: 'serve',
		configureServer(s) {
			server = s;
		},
		async transform(code, id) {
			if (!server || this.environment.name !== 'client' || !scriptFileRE.test(id)) return null;
			coreDir ??= resolveCoreEntryFile(server)
				.then(corePackageDir)
				.catch(() => null);
			const dir = await coreDir;
			const keys = dir ? coreRequireKeys(id, dir) : [];
			if (!keys.length) return null;
			// Only HMR stamps a module with `lastHMRTimestamp`, which is what makes
			// import analysis stamp the self-import with `?t=`.
			const replace = ((this.environment as DevEnvironment).moduleGraph.getModuleById(id)?.lastHMRTimestamp ?? 0) > 0;
			return { code: code + coreRegistrationFooter(viteUrlForFile(id, server.config.root), keys, replace), map: null };
		},
	};
}
