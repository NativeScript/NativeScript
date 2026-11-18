import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import * as path from 'path';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';
import { purgeTransformCachesForHotUpdate } from '../../../server/transform-cache-invalidation.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';

// Solid server strategy for NativeScript HMR.

const SOLID_FILE_PATTERN = /\.(tsx?|jsx?)$/i;
const SOLID_APP_PREFIX = `${getProjectAppVirtualPath()}/`;

export const solidServerStrategy: FrameworkServerStrategy = {
	flavor: 'solid',
	matchesFile(id: string) {
		// Treat app TS/TSX/JS/JSX under the configured app root as Solid candidates.
		return SOLID_FILE_PATTERN.test(id) && id.startsWith(SOLID_APP_PREFIX);
	},
	// Suppress the prologue's common-block delta broadcast: Solid HMR depends on
	// the client re-fetching the just-changed module to drive
	// `solid-refresh.patchRegistry`, so the broadcast must come AFTER this
	// handler invalidates the Vite module graph (see handleHotUpdate's tail). Otherwise
	// the client's evict + re-import races the server's invalidation and serves
	// the previous save's transform.
	deferDeltaBroadcast: true,
	// HMR: emit a graph delta for a changed app TSX/TS/JSX file, then invalidate
	// the Vite module graph (file + transitive importers) so the client's
	// re-import evaluates fresh code.
	async handleHotUpdate(ctx, deps) {
		const state = await runHotUpdatePrologue(ctx, deps);
		if (!state) return;
		const { root, metrics, emitSummary } = state;
		const { moduleGraph, verbose } = deps;
		const { file, server } = ctx;
		const isSolidFile = /\.(tsx?|jsx?)$/i.test(file);
		if (!isSolidFile) return;
		metrics.tAfterFramework = Date.now();
		try {
			const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
			if (verbose) console.log('[hmr-ws][solid] app file hot update', { file, rel });
			// The prologue's common graph-update block may have already emitted a
			// delta if the file was in Vite's module graph. This forces emission
			// for files it missed (e.g. new file, or moduleGraph mismatch).
			const normalizedId = moduleGraph.normalizeGraphId(rel);
			const existing = moduleGraph.get(normalizedId);
			if (!existing) {
				// Module not in graph yet — force upsert with timestamp-based
				// hash so the client sees a change.
				moduleGraph.upsert(rel, `/* solid-hmr ${Date.now()} */`, [], { emitDeltaOnInsert: true });
			}
			// Log what we're sending so devs can trace the flow on the server side.
			if (verbose) {
				const gm = moduleGraph.get(normalizedId);
				console.log('[hmr-ws][solid] delta module', { id: gm?.id, hash: gm?.hash });
			}
			// Invalidate Vite's module graph for the changed file + its bounded
			// transitive importers. Transitive importers matter because TanStack
			// file-based routing (and similar) statically import their components:
			// when `home.tsx` changes, `routes/index.tsx`'s cached transform still
			// encodes the previous resolution and must be re-run.
			purgeTransformCachesForHotUpdate({ file, server, verbose, label: 'solid' });
			// Re-run the transform AFTER all caches are invalidated, then
			// re-upsert the graph so the broadcast hash matches the freshly-
			// transformed content. The prologue's common upsert block ran
			// `server.transformRequest` BEFORE invalidation — at that
			// moment Vite's auto-invalidate hadn't fired yet (it runs after
			// `plugin.handleHotUpdate`), so the result it cached was the
			// previous save's. Without this re-transform, the broadcast
			// carries a stale hash and iOS evaluates the previous save's
			// bytes ("one save behind").
			try {
				const ext = file.match(/\.(?:[mc]?[jt]sx?)$/i)?.[0] || '';
				const baseSpec = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
				const baseNoExt = ext ? baseSpec.replace(/\.(?:[mc]?[jt]sx?)$/i, '') : baseSpec;
				const candidates = Array.from(new Set([baseSpec, baseNoExt, baseNoExt + '.ts', baseNoExt + '.tsx', baseNoExt + '.js', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', file]));
				let freshCode = '';
				for (const cand of candidates) {
					try {
						const fresh = await server.transformRequest(cand);
						if (fresh?.code && !freshCode) freshCode = fresh.code;
					} catch {}
				}
				if (freshCode) {
					const existingGm = moduleGraph.get(normalizedId);
					const existingDeps = existingGm?.deps || [];
					moduleGraph.upsert(normalizedId, freshCode, existingDeps as string[], {
						broadcastDelta: false,
					});
				}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][solid] post-invalidation re-transform failed', e);
			}
			// Broadcast the (now-fresh) delta here, AFTER cache invalidation. The
			// prologue suppresses the common-block broadcast for this flavor (via
			// `deferDeltaBroadcast`), so emitting it now ensures the client's
			// eviction + re-import doesn't race the server's cache invalidation.
			try {
				const gm = moduleGraph.get(normalizedId);
				if (gm) {
					moduleGraph.emitDelta([gm], []);
					if (verbose) {
						console.log('[hmr-ws][solid] broadcast delta after cache invalidation', { id: gm.id, hash: gm.hash });
					}
				}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][solid] post-invalidation broadcast failed', e);
			}
		} catch (e) {
			if (verbose) console.warn('[hmr-ws][solid] failed to handle hot update for', file, e);
		}
		emitSummary();
	},
	// The vendor bundle externalizes `solid-js` for this flavor, so its bare
	// import must resolve through the import map to the app graph's copy.
	importMapSpecifiers() {
		return ['solid-js'];
	},
	async processFile(ctx: FrameworkProcessFileContext) {
		const { filePath, server, verbose } = ctx;
		try {
			const transformed = await server.transformRequest(filePath);
			if (!transformed?.code) return;
			if (verbose) {
				console.log(`[solid-hmr] processed ${filePath}`);
			}
		} catch (err) {
			if (verbose) {
				console.warn('[solid-hmr] processFile error for', filePath, err);
			}
		}
	},
	async buildRegistry(_ctx: FrameworkRegistryContext) {
		// No Solid registry messaging yet; HTTP-only boot imports app modules directly.
		return;
	},
};
