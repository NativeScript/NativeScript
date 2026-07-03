import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import { getProjectAppPath, getProjectAppVirtualPath } from '../../../../helpers/utils.js';
import * as path from 'path';
import { isRuntimeGraphExcludedPath, matchesRuntimeGraphModuleId, shouldIncludeRuntimeGraphFile, shouldSkipRuntimeGraphDirectoryName } from '../../../server/runtime-graph-filter.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';
import type { TsModuleRegistryMessage } from '../../../shared/protocol.js';

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
		return matchesRuntimeGraphModuleId(id, TS_APP_PREFIX, TS_FILE_PATTERN);
	},
	// HMR: reached via the dispatcher's delegation seam. Run the shared
	// prologue (scope gate, pending overlay, common graph upsert, CSS), then —
	// for an in-scope app file — emit a generic graph delta. We treat the changed
	// file as a graph module with no deps so its hash/identity changes and the
	// client sees a delta and can perform a TS root reset; the code body is not
	// used for execution here.
	async handleHotUpdate(ctx, deps) {
		const state = await runHotUpdatePrologue(ctx, deps);
		if (!state) return;
		const { root, metrics, emitSummary } = state;
		const { moduleGraph, verbose, wss, isSocketClientOpen } = deps;
		const { file } = ctx;
		metrics.tAfterFramework = Date.now();
		try {
			const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
			if (verbose) console.log('[hmr-ws][ts] app file hot update', { file, rel });
			moduleGraph.upsert(rel, '', [], { emitDeltaOnInsert: true });
			// For this flavor the ns:hmr-delta broadcast IS the update delivery —
			// count open sockets so the always-on summary line reflects reality
			// instead of reporting recipients=0 for a delivered update.
			try {
				wss?.clients?.forEach((client: any) => {
					if (isSocketClientOpen(client)) metrics.recipients += 1;
				});
			} catch {}
		} catch (e) {
			if (verbose) console.warn('[hmr-ws][ts] failed to emit delta for', file, e);
		}
		emitSummary();
	},
	// preClean/rewriteFrameworkImports/postClean/canonicalizeFrameworkImports default to
	// identity: plain TS apps rely on the generic pipeline (vendor bridge, /ns/entry-rt).
	async processFile(ctx: FrameworkProcessFileContext) {
		// Ensure that any TS app module requested by the HTTP realm is transformed once,
		// so that downstream helpers (rewriteImports, vendor bridge) see a stable shape.
		const { filePath, server, verbose } = ctx;
		if (isRuntimeGraphExcludedPath(filePath)) return;
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
				if (name === 'node_modules' || name.startsWith('.') || shouldSkipRuntimeGraphDirectoryName(name)) {
					continue;
				}
				const full = path.join(dir, name);
				let st: any;
				try {
					st = fs.statSync(full);
				} catch {
					continue;
				}
				if (st.isDirectory()) {
					walk(full);
				} else if (st.isFile() && shouldIncludeRuntimeGraphFile(full, TS_FILE_PATTERN)) {
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
		const msg: TsModuleRegistryMessage = {
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
