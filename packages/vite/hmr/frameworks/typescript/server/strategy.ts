import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import { getProjectAppPath, getProjectAppVirtualPath } from '../../../../helpers/utils.js';
import * as path from 'path';

// TypeScript server strategy for NativeScript HMR.
// This is a lightweight strategy that treats app TS/JS files
// as HTTP-loaded modules, relying on the shared HMR pipeline
// (rewriteImports, device-side require bridge, etc.).

const TS_APP_PREFIX = `${getProjectAppVirtualPath()}/`;
const TS_FILE_PATTERN = /\.(ts|tsx|js|jsx|mjs)$/i;

export const typescriptServerStrategy: FrameworkServerStrategy = {
	flavor: 'typescript',
	matchesFile(id: string) {
		// Treat any app TS/JS under the virtual app root as HMR-relevant.
		return TS_FILE_PATTERN.test(id) && id.startsWith(TS_APP_PREFIX);
	},
	preClean(code: string) {
		// No TS-specific pre-clean; generic sanitizers handle core/HMR noise.
		return code;
	},
	rewriteFrameworkImports(code: string) {
		// For plain TS apps we rely on vendor bridging and generic import rewriting.
		return code;
	},
	postClean(code: string) {
		return code;
	},
	ensureVersionedImports(code: string, _origin: string, _version: number) {
		// TypeScript flavor uses direct /ns/entry-rt and HTTP graph; no extra versioning.
		return code;
	},
	async processFile(ctx: FrameworkProcessFileContext) {
		// Ensure that any TS app module requested by the HTTP realm is transformed once,
		// so that downstream helpers (rewriteImports, vendor bridge) see a stable shape.
		const { filePath, server, verbose } = ctx;
		try {
			const transformed = await server.transformRequest(filePath);
			if (!transformed?.code) return;
			if (verbose) {
				console.log(`[ts-hmr] processed ${filePath}`);
			}
		} catch (err) {
			if (verbose) {
				console.warn('[ts-hmr] processFile error for', filePath, err);
			}
		}
	},
	async buildRegistry(ctx: FrameworkRegistryContext) {
		// Build a minimal registry for TS apps: treat all TS/JS
		// modules under the app root as HMR graph members so the
		// server can emit a non-empty ns:hmr-full-graph.
		const { server, verbose, wss } = ctx;
		const root = server.config.root || process.cwd();
		const appDir = getProjectAppPath();
		const appRootAbs = path.join(root, appDir);
		const entries: string[] = [];
		// Use Node's fs since getProjectAppPath/root are real filesystem paths.
		const fs = await import('fs');
		function walk(dir: string) {
			let list: string[] = [];
			try {
				list = fs.readdirSync(dir) as unknown as string[];
			} catch {
				return;
			}
			for (const name of list) {
				const full = path.join(dir, name);
				let st: any;
				try {
					st = fs.statSync(full);
				} catch {
					continue;
				}
				if (st.isDirectory()) {
					walk(full);
				} else if (st.isFile() && TS_FILE_PATTERN.test(name)) {
					const rel = '/' + path.relative(root, full).split(path.sep).join('/');
					entries.push(rel);
				}
			}
		}
		walk(appRootAbs);
		if (!entries.length) {
			if (verbose) {
				console.log('[ts-hmr][registry] no TS app modules found');
			}
			return;
		}
		// Prime transforms so the shared pipeline can analyze deps.
		for (const rel of entries) {
			try {
				const transformed = await server.transformRequest(rel);
				if (verbose && transformed?.code) {
					console.log('[ts-hmr][registry] primed module', rel);
				}
			} catch (e) {
				if (verbose) {
					console.warn('[ts-hmr][registry] failed to transform', rel, e);
				}
			}
		}
		// Send a TS-oriented registry message; server-side graph
		// code will coalesce this into ns:hmr-full-graph.
		if (!wss) return;
		const msg = {
			type: 'ns:ts-module-registry',
			modules: entries,
			ts: Date.now(),
		};
		wss.clients.forEach((client) => {
			if (client.readyState === client.OPEN) {
				client.send(JSON.stringify(msg));
			}
		});
		if (verbose) {
			console.log(`[ts-hmr][registry] sent ${entries.length} TS modules`);
		}
	},
};
