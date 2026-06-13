import { createHash } from 'crypto';
import { readdirSync, statSync } from 'fs';
import * as path from 'path';
import * as PAT from '../../../server/constants.js';
import { rewriteVendorVueSpec } from '../../../helpers/vendor-rewrite.js';
import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkRouteContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import { registerSfcHandlers } from './websocket-sfc.js';
import { getProjectAppPath } from '../../../../helpers/utils.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';
import { cleanCode, collectImportDependencies, processSfcCode, rewriteImports } from '../../../server/websocket-device-transform.js';
import { isCoreGlobalsReference, isNativeScriptCoreModule, isNativeScriptPluginModule, resolveVendorFromCandidate } from '../../../server/websocket-module-specifiers.js';
import { purgeTransformCachesForHotUpdate } from '../../../server/transform-cache-invalidation.js';
import type { VueSfcRegistryEntry, VueSfcRegistryMessage, VueSfcRegistryUpdateMessage } from '../../../shared/protocol.js';

const VENDOR_MJS = '/@nativescript/vendor.mjs';
const VUE_HTTP_SFC_DIR = `${getProjectAppPath()}/sfc`;
const VUE_IMPORTS_TO_VENDOR: RegExp[] = [/(from\s+["'])vue(?:\/[A-Za-z0-9_\-\/]+)?(["'])/g, /(from\s+["'])nativescript-vue(?:\/[A-Za-z0-9_\-\/]+)?(["'])/g];

function stripVueHmrNoise(code: string): string {
	return code
		.replace(/__VUE_HMR_RUNTIME__\.(?:createRecord|reload|rerender)\s*\([\s\S]*?\);\s*/g, '')
		.replace(/\}\s*else\s*\{\s*__VUE_HMR_RUNTIME__\.(?:reload|rerender)\s*\([\s\S]*?\);\s*\}\s*/g, '')
		.replace(/(?:^|\n)\s*else\s*\{\s*__VUE_HMR_RUNTIME__\.(?:reload|rerender)\s*\([\s\S]*?\);\s*\}\s*/g, '\n')
		.replace(/\}\s*else\s*\{\s*\}\s*/g, '}\n');
}

function stripVueHmrTail(code: string): string {
	return code.replace(/\n[^\n]*__hmrId\s*=\s*['"][^'"]+['"];[\s\S]*?(?=\n\s*export\s+default)/g, '\n').replace(/^[^\n]*typeof\s+__VUE_HMR_RUNTIME__[^\n]*$/gm, '');
}

function ensureVersionedSfcImports(code: string, origin: string, ver: number): string {
	if (!code || !origin || !Number.isFinite(ver)) return code;
	code = code.replace(/(from\s+["'])(?:https?:\/\/[^"']+)?(\/ns\/sfc)(?:\/[\d]+)?(\/[^"']*)(["'])/g, (_m, p1, _p2, p3, p4) => `${p1}/ns/sfc/${ver}${p3}${p4}`);
	code = code.replace(/(import\(\s*["'])(?:https?:\/\/[^"']+)?(\/ns\/sfc)(?:\/[\d]+)?(\/[^"']*)(["']\s*\))/g, (_m, p1, _p2, p3, p4) => `${p1}/ns/sfc/${ver}${p3}${p4}`);
	return code;
}

function shortHash(value: string, helpers?: FrameworkProcessFileContext['helpers']): string {
	const fromHelper = helpers?.createHash?.(value);
	const base = fromHelper || createHash('md5').update(value).digest('hex');
	return base.slice(0, 8);
}

function normalizeDep(dep: string): string {
	return dep.replace(PAT.QUERY_PATTERN, '');
}

function isCoreGlobals(dep: string, helpers?: FrameworkProcessFileContext['helpers']): boolean {
	return !!helpers?.isCoreGlobalsReference?.(dep);
}

function isNativeScriptCore(dep: string, helpers?: FrameworkProcessFileContext['helpers']): boolean {
	return !!helpers?.isNativeScriptCoreModule?.(dep);
}

function isNativeScriptPlugin(dep: string, helpers?: FrameworkProcessFileContext['helpers']): boolean {
	return !!helpers?.isNativeScriptPluginModule?.(dep);
}

function isVendor(dep: string, helpers?: FrameworkProcessFileContext['helpers']): boolean {
	return !!helpers?.resolveVendorFromCandidate?.(dep);
}

async function processVueSfc(ctx: FrameworkProcessFileContext): Promise<void> {
	const { filePath, server, sfcFileMap, depFileMap, visitedPaths, wss, verbose, helpers } = ctx;

	if (visitedPaths.has(filePath)) {
		return;
	}
	visitedPaths.add(filePath);

	try {
		const transformed = await server.transformRequest(filePath);
		if (!transformed?.code) {
			if (verbose) {
				console.log(`[vue-sfc] Could not transform: ${filePath}`);
			}
			return;
		}

		const clean = helpers?.cleanCode ?? ((code: string) => code);
		const code = clean(transformed.code);

		const collectDeps = helpers?.collectImportDependencies;
		const deps = collectDeps ? collectDeps(code, filePath) : new Set<string>();

		for (const dep of deps) {
			const cleanDep = normalizeDep(dep);
			if (isCoreGlobals(dep, helpers)) continue;
			if (isNativeScriptCore(dep, helpers)) continue;
			if (isNativeScriptPlugin(dep, helpers)) continue;
			if (isVendor(cleanDep, helpers)) continue;
			if (!PAT.VUE_FILE_PATTERN.test(dep)) continue;

			if (!sfcFileMap.has(dep)) {
				const hash = shortHash(dep, helpers);
				sfcFileMap.set(dep, `sfc-${hash}.mjs`);
				if (verbose) {
					console.log(`[vue-sfc] Registered nested .vue: ${dep} → sfc-${hash}.mjs`);
				}
			}
		}

		for (const dep of deps) {
			if (dep === filePath) continue;
			const cleanDep = normalizeDep(dep);
			if (isCoreGlobals(dep, helpers)) {
				if (verbose) {
					console.log(`[vue-sfc] Skipping core globals dependency ${dep}`);
				}
				continue;
			}
			if (isNativeScriptCore(dep, helpers)) {
				if (verbose) {
					console.log(`[vue-sfc] Skipping NativeScript core dependency ${dep}`);
				}
				continue;
			}
			if (isNativeScriptPlugin(dep, helpers)) {
				if (verbose) {
					console.log(`[vue-sfc] Skipping NativeScript plugin dependency ${dep}`);
				}
				continue;
			}
			if (isVendor(cleanDep, helpers)) {
				if (verbose) {
					console.log(`[vue-sfc] Skipping vendor dependency ${dep}`);
				}
				continue;
			}
			if (PAT.VUE_FILE_PATTERN.test(dep)) {
				await processVueSfc({
					filePath: dep,
					server,
					sfcFileMap,
					depFileMap,
					visitedPaths,
					wss,
					verbose,
					helpers,
				});
			}
		}

		const fileName = sfcFileMap.get(filePath);
		if (!fileName) {
			console.warn(`[vue-sfc] No filename mapping for: ${filePath}`);
			return;
		}
	} catch (error) {
		console.warn(`[vue-sfc] Error processing ${filePath}:`, error);
	}
}

function findVueFiles(dir: string, root: string, result: string[] = []): string[] {
	const skipDirs = ['package.json', 'package-lock.json', 'node_modules', '.git', 'dist', '.ns-vite-build', '.DS_Store', 'hooks', 'platforms', 'App_Resources'];

	for (const name of readdirSync(dir)) {
		if (skipDirs.includes(name)) continue;

		const full = path.join(dir, name);
		const stat = statSync(full);

		if (stat.isDirectory()) {
			findVueFiles(full, root, result);
		} else if (stat.isFile() && name.endsWith('.vue')) {
			const rel = '/' + path.relative(root, full).split(path.sep).join('/');
			result.push(rel);
		}
	}

	return result;
}

/**
 * Purge BOTH transform-cache layers for a changed file so the device's
 * eviction + re-import evaluates the CURRENT save's code (mirrors the
 * Solid/Angular hot-update tails — see solid/server/strategy.ts for the full
 * two-layer rationale):
 *
 *   1. `sharedTransformRequest` keeps a 60s TTL result cache to amortize the
 *      cold-boot bulk walk + device request bursts. Without purging, a save
 *      that lands inside the TTL window (e.g. the FIRST save after boot, whose
 *      entry the initial graph walk populated) serves the device the PREVIOUS
 *      transform — the HMR cycle runs perfectly on-device yet renders stale
 *      values.
 *   2. Vite's own `ModuleNode.transformResult` for the file + transitive
 *      importers, so `server.transformRequest` re-runs the pipeline.
 *
 * Ends with the same `clear()` sledgehammer Solid uses: the `/ns/m/` handler
 * probes many candidate extensions per spec and EACH candidate is a separate
 * cache key, so targeted invalidation alone can miss the key a previous serve
 * actually populated.
 */
export function purgeVueTransformCachesForHotUpdate(options: { file: string; server: { config?: { root?: string }; moduleGraph?: any }; sharedTransformRequest?: { invalidateMany: (urls: Iterable<string>) => void; clear: () => void } | null; verbose?: boolean }): void {
	purgeTransformCachesForHotUpdate({ ...options, label: 'vue' });
}

async function buildAndSendRegistry(ctx: FrameworkRegistryContext): Promise<void> {
	const { server, sfcFileMap, depFileMap, wss, verbose, helpers } = ctx;
	const root = server.config.root || process.cwd();
	const vueFiles = findVueFiles(root, root);

	if (!vueFiles.length) {
		return;
	}

	for (const rel of vueFiles) {
		const hash = shortHash(rel, helpers as FrameworkProcessFileContext['helpers']);
		sfcFileMap.set(rel, `sfc-${hash}.mjs`);
	}

	const entries: VueSfcRegistryEntry[] = [];
	const visitedPaths = new Set<string>();

	for (const rel of vueFiles) {
		try {
			const transformed = await server.transformRequest(rel);
			if (!transformed?.code) continue;

			const clean = helpers?.cleanCode ?? ((code: string) => code);
			let code = clean(transformed.code);

			const collectDeps = helpers?.collectImportDependencies;
			const deps = collectDeps ? collectDeps(code, rel) : new Set<string>();

			for (const dep of deps) {
				if (!PAT.VUE_FILE_PATTERN.test(dep)) continue;
				await processVueSfc({
					filePath: dep,
					server,
					sfcFileMap,
					depFileMap,
					visitedPaths,
					wss,
					verbose,
					helpers: helpers as FrameworkProcessFileContext['helpers'],
				});
			}

			if (helpers?.processSfcCode) {
				code = helpers.processSfcCode(code);
			}

			if (helpers?.rewriteImports) {
				const projectRoot = server.config.root || process.cwd();
				code = helpers.rewriteImports(code, rel, sfcFileMap, depFileMap, projectRoot, verbose, VUE_HTTP_SFC_DIR);
			}

			const fileName = sfcFileMap.get(rel);
			if (!fileName) {
				if (verbose) {
					console.warn(`[registry] Missing filename for ${rel}`);
				}
				continue;
			}

			const hash = shortHash(rel, helpers as FrameworkProcessFileContext['helpers']);
			entries.push({
				path: rel,
				fileName,
				hmrId: hash,
				code: '',
			});
		} catch (error) {
			console.warn(`[registry] Failed to process ${rel}:`, error);
		}
	}

	if (!entries.length) {
		return;
	}

	const msg: VueSfcRegistryMessage = {
		type: 'ns:vue-sfc-registry',
		entries,
		ts: Date.now(),
	};

	if (!wss) {
		return;
	}

	wss.clients.forEach((client) => {
		if (client.readyState === client.OPEN) {
			client.send(JSON.stringify(msg));
		}
	});

	if (verbose) {
		console.log(`[registry] Sent ${entries.length} SFC entries`);
	}
}

export const vueServerStrategy: FrameworkServerStrategy = {
	flavor: 'vue',
	matchesFile(id: string) {
		return PAT.VUE_FILE_PATTERN.test(id);
	},
	// HMR: reached via the dispatcher's delegation seam. Run the shared prologue
	// (scope gate, pending overlay, common graph upsert, CSS), then — for a
	// changed `.vue` SFC — re-transform + clean it, register its nested `.vue`
	// imports in the SFC map, and broadcast a metadata-only registry update so the
	// device re-fetches the SFC artifact over HTTP. Non-`.vue` edits fall through
	// (the prologue already handled CSS / the common graph delta).
	async handleHotUpdate(ctx, deps) {
		const state = await runHotUpdatePrologue(ctx, deps);
		if (!state) return;
		const { emitSummary } = state;
		const { strategy, verbose, wss, moduleGraph, sfcFileMap, depFileMap, isSocketClientOpen, shouldRemapImport, sharedTransformRequest } = deps;
		const { file, server } = ctx;

		// Runs for EVERY changed file (not just .vue): the device HMR client
		// re-imports changed .ts/.js deps and re-assembles their SFC boundary,
		// and both must transform against the CURRENT file content.
		purgeVueTransformCachesForHotUpdate({ file, server, sharedTransformRequest, verbose });

		if (!file.endsWith('.vue')) {
			if (verbose) console.log('[hmr-ws] Not a .vue file, skipping');
			return;
		}

		if (verbose) console.log('[hmr-ws] Processing .vue file update...');

		try {
			const root = server.config.root || process.cwd();
			const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');

			// Transform the .vue file
			const transformed = await server.transformRequest(rel);
			if (!transformed?.code) return;

			let code = transformed.code;

			// Clean and process
			code = cleanCode(code, strategy);

			// Process dependencies
			const visitedPaths = new Set<string>();
			const importerDir = path.posix.dirname(rel);

			// Collect dependencies from this file
			const deps = new Set<string>();
			const collectDeps = (pattern: RegExp) => {
				let match: RegExpExecArray | null;
				while ((match = pattern.exec(code)) !== null) {
					const spec = match[2];
					if (!spec || PAT.VUE_FILE_PATTERN.test(spec) || !shouldRemapImport(spec)) {
						continue;
					}

					let key: string;
					if (spec.startsWith('/')) {
						key = spec;
					} else if (spec.startsWith('./') || spec.startsWith('../')) {
						key = path.posix.normalize(path.posix.join(importerDir, spec));
						if (!key.startsWith('/')) key = '/' + key;
					} else {
						continue;
					}

					key = key.replace(PAT.QUERY_PATTERN, '');
					deps.add(key);
				}
			};

			collectDeps(PAT.IMPORT_PATTERN_1);
			collectDeps(PAT.IMPORT_PATTERN_2);
			collectDeps(PAT.EXPORT_PATTERN);
			collectDeps(PAT.IMPORT_PATTERN_3);

			// CRITICAL: Collect .vue file imports separately
			// Use matchAll() to avoid regex state issues
			const vueDeps = new Set<string>();
			const vueImportMatches = [...code.matchAll(PAT.IMPORT_PATTERN_1), ...code.matchAll(PAT.VUE_FILE_IMPORT)];

			for (const match of vueImportMatches) {
				const spec = match[2];
				if (!spec || !PAT.VUE_FILE_PATTERN.test(spec)) {
					continue;
				}

				let key: string;
				if (spec.startsWith('/')) {
					key = spec.replace(PAT.QUERY_PATTERN, '');
				} else if (spec.startsWith('./') || spec.startsWith('../')) {
					key = path.posix.normalize(path.posix.join(importerDir, spec.replace(PAT.QUERY_PATTERN, '')));
					if (!key.startsWith('/')) key = '/' + key;
				} else {
					continue;
				}

				// Ensure this .vue file is registered in sfcFileMap
				if (!sfcFileMap.has(key)) {
					const hash = createHash('md5').update(key).digest('hex').slice(0, 8);
					sfcFileMap.set(key, `sfc-${hash}.mjs`);
					if (verbose) {
						console.log(`[hmr-ws] Registered .vue import: ${key} → sfc-${hash}.mjs`);
					}
				}

				// Add to vueDeps for separate processing
				vueDeps.add(key);
			}

			// Process .vue dependencies (they stay as sfc-*.mjs imports)
			for (const vueDep of vueDeps) {
				await strategy.processFile({
					filePath: vueDep,
					server,
					sfcFileMap,
					depFileMap,
					visitedPaths,
					wss,
					verbose,
					helpers: {
						cleanCode: (code: string) => cleanCode(code, strategy),
						collectImportDependencies,
						isCoreGlobalsReference,
						isNativeScriptCoreModule,
						isNativeScriptPluginModule,
						resolveVendorFromCandidate,
						createHash: (value: string) => createHash('md5').update(value).digest('hex'),
					},
				});
			}

			// Process with consistent SFC processor (removes non-.vue imports)
			code = processSfcCode(code);

			// Rewrite ONLY .vue imports (everything else is now inlined)
			const projectRoot = server.config.root || process.cwd();
			code = rewriteImports(code, rel, sfcFileMap, depFileMap, projectRoot, verbose, undefined);
			moduleGraph.upsert(rel, code, [...deps, ...vueDeps]);

			// Add HMR runtime prelude (CRITICAL for runtime)
			const hmrPrelude = `
// Embedded HMR Runtime for NativeScript runtime
const createHotContext = (id) => ({
  on: (event, handler) => {
    if (!globalThis.__NS_HMR_HANDLERS__) globalThis.__NS_HMR_HANDLERS__ = new Map();
    if (!globalThis.__NS_HMR_HANDLERS__.has(id)) globalThis.__NS_HMR_HANDLERS__.set(id, []);
    globalThis.__NS_HMR_HANDLERS__.get(id).push({ event, handler });
  },
  accept: (handler) => {
    if (!globalThis.__NS_HMR_ACCEPTS__) globalThis.__NS_HMR_ACCEPTS__ = new Map();
    globalThis.__NS_HMR_ACCEPTS__.set(id, handler);
  }
});

if (typeof import.meta === 'undefined') {
  globalThis.importMeta = { hot: null };
} else if (!import.meta.hot) {
  import.meta.hot = null;
}

const __vite__createHotContext = createHotContext;

if (typeof __VUE_HMR_RUNTIME__ === 'undefined') {
  globalThis.__VUE_HMR_RUNTIME__ = {
    createRecord: () => true,
    reload: () => {},
    rerender: () => {},
  };
}

// Install a lightweight guard to capture require('http(s)://...') attempts with stack traces
(() => {
  try {
    const g = globalThis;
    if (g.__NS_REQUIRE_GUARD_INSTALLED__) return;
	const makeGuard = (orig, label) => function () {
      try {
        const spec = arguments[0];
        if (typeof spec === 'string' && /^(?:https?:)\/\//.test(spec)) {
          const err = new Error('[ns-hmr][require-guard] require of URL: ' + spec + ' via ' + label);
          const stack = err.stack || '';
          console.error(err.message + '\n' + stack);
          try { g.__NS_REQUIRE_GUARD_LAST__ = { spec, stack, label, ts: Date.now() }; } catch {}
        }
      } catch {}
      return orig.apply(this, arguments);
    };
    if (typeof g.require === 'function' && !g.require.__NS_REQ_GUARDED__) {
      const orig = g.require; g.require = makeGuard(orig, 'require'); g.require.__NS_REQ_GUARDED__ = true;
    }
    if (typeof g.__nsRequire === 'function' && !g.__nsRequire.__NS_REQ_GUARDED__) {
      const orig = g.__nsRequire; g.__nsRequire = makeGuard(orig, '__nsRequire'); g.__nsRequire.__NS_REQ_GUARDED__ = true;
    }
    g.__NS_REQUIRE_GUARD_INSTALLED__ = true;
  } catch {}
})();
`;

			code = hmrPrelude + '\n' + code;

			// Update SFC registry
			const hash = createHash('md5').update(rel).digest('hex').slice(0, 8);
			const fileName = sfcFileMap.get(rel) || `sfc-${hash}.mjs`;
			sfcFileMap.set(rel, fileName);

			const ts = Date.now();

			// FIRST: Send mapping-only registry update (no code)
			const registryUpdateMsg: VueSfcRegistryUpdateMessage = {
				type: 'ns:vue-sfc-registry-update',
				path: rel,
				fileName,
				ts,
				version: moduleGraph.version,
			};

			wss.clients.forEach((client) => {
				if (isSocketClientOpen(client)) {
					client.send(JSON.stringify(registryUpdateMsg));
				}
			});

			// HTTP-only mode: the device loads SFC artifacts and their dependencies via
			// HTTP endpoints on demand, so the WS channel stays metadata-only (just the
			// registry update above). No code-push, dependency harvest, or legacy dynamic
			// module message is emitted here.
		} catch (error) {
			console.warn('[hmr-ws] HMR update failed:', error);
			console.error(error);
		}

		// Emit the update summary at the end so every code path gets exactly one
		// log line. Idempotent — a no-op if an earlier return already emitted.
		emitSummary();
		// CRITICAL: Return empty array to prevent Vite's default HMR
		return [];
	},
	preClean(code: string) {
		let result = code;
		result = result.replace(PAT.VUE_STYLE_IMPORTS, '');
		result = result.replace(PAT.VUE_EXPORT_SFC_IMPORT, '');
		result = result.replace(PAT.VUE_VIRTUAL_ID_IMPORT, '');
		return result;
	},
	rewriteFrameworkImports(code: string) {
		let result = code;
		for (const pattern of VUE_IMPORTS_TO_VENDOR) {
			result = result.replace(pattern, `from "${VENDOR_MJS}"`);
		}
		return result;
	},
	postClean(code: string) {
		let result = stripVueHmrNoise(code);
		result = stripVueHmrTail(result);
		return result;
	},
	ensureVersionedImports(code: string, origin: string, version: number) {
		return ensureVersionedSfcImports(code, origin, version);
	},
	rewriteVendorSpec(code: string, origin: string, version: number) {
		return rewriteVendorVueSpec(code, origin, version);
	},
	// ── Vue owns its dev HTTP surface + device config ─────────────────────
	// The SFC dev endpoints are inherently Vue-only, so Vue owns registering
	// them (and contributing its import-map + volatile-pattern entries) rather
	// than the shared server modules branching on flavor.
	registerRoutes(ctx: FrameworkRouteContext) {
		registerSfcHandlers(ctx.server, {
			verbose: ctx.verbose,
			appVirtualWithSlash: ctx.appVirtualWithSlash,
			sfcFileMap: ctx.sfcFileMap,
			depFileMap: ctx.depFileMap,
			getGraphVersion: ctx.getGraphVersion,
			getStrategy: ctx.getStrategy,
		});
	},
	importMapEntries(_origin: string) {
		// `nativescript-vue` + `vue` resolve from the vendor bundle. Key order
		// (nativescript-vue then vue) is significant; the caller merges
		// conditionally so an existing vendor entry wins.
		return {
			'nativescript-vue': `ns-vendor://nativescript-vue`,
			vue: `ns-vendor://vue`,
		};
	},
	volatilePatterns() {
		// SFC + assembler endpoints change on every edit (order: sfc then asm).
		return ['/@ns/sfc/', '/@ns/asm/'];
	},
	async processFile(ctx: FrameworkProcessFileContext) {
		await processVueSfc(ctx);
	},
	async buildRegistry(ctx: FrameworkRegistryContext) {
		await buildAndSendRegistry(ctx);
	},
};
