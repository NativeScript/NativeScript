import * as path from 'node:path';
import type { FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import { typescriptServerStrategy } from '../../typescript/server/strategy.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';
import { purgeTransformCachesForHotUpdate } from '../../../server/transform-cache-invalidation.js';

// React server strategy for NativeScript HMR.
//
// React renders through DOMiNATIVE via `@nativescript-community/react` and runs
// WITHOUT React Fast Refresh (module-level reload, mirroring the Solid flavor's
// `hot: false`). It reuses the generic TypeScript strategy and only overrides
// the hot-update tail.
//
// It must be REGISTERED in `STRATEGY_REGISTRY`: the server-side HMR plugin
// (which installs the `/ns/*` device routes) is only added for flavors with a
// registered strategy, and without those routes the app cannot boot.

export const reactServerStrategy: FrameworkServerStrategy = {
	...typescriptServerStrategy,
	flavor: 'react',
	// Like Solid (and unlike plain TypeScript, which recovers via a full
	// `resetRootView`), React HMR applies an edit by having the CLIENT re-fetch +
	// re-evaluate the just-changed route module and read its fresh
	// `Route.options.component`. So the server MUST invalidate the Vite module
	// graph BEFORE the client re-imports — otherwise the client races the server
	// and the re-fetch returns the PREVIOUS save's transform → V8 evaluates stale
	// code → the visible page is "one save behind". We mirror Solid's contract:
	// defer the prologue's delta broadcast, invalidate the file AND its transitive
	// importers (the route tree statically imports the route), re-transform fresh,
	// then broadcast the delta.
	deferDeltaBroadcast: true,
	async handleHotUpdate(ctx, deps) {
		const state = await runHotUpdatePrologue(ctx, deps);
		if (!state) return;
		const { root, metrics, emitSummary } = state;
		const { moduleGraph, verbose } = deps;
		const { file, server } = ctx;
		const isAppScriptFile = /\.(tsx?|jsx?)$/i.test(file);
		if (!isAppScriptFile) {
			emitSummary();
			return;
		}
		metrics.tAfterFramework = Date.now();
		try {
			const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
			const normalizedId = moduleGraph.normalizeGraphId(rel);
			if (!moduleGraph.get(normalizedId)) {
				moduleGraph.upsert(rel, `/* react-hmr ${Date.now()} */`, [], { emitDeltaOnInsert: true });
			}
			// Invalidate Vite's module graph for the changed file + its bounded
			// transitive importers (route tree → route file), so the client's
			// re-import evaluates fresh code.
			purgeTransformCachesForHotUpdate({ file, server, verbose, label: 'react' });
			// Re-transform AFTER invalidation so the broadcast hash matches fresh
			// content (the prologue's upsert ran before Vite's auto-invalidate fired).
			try {
				const ext = file.match(/\.(?:[mc]?[jt]sx?)$/i)?.[0] || '';
				const baseSpec = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
				const baseNoExt = ext ? baseSpec.replace(/\.(?:[mc]?[jt]sx?)$/i, '') : baseSpec;
				const candidates = Array.from(new Set([baseSpec, baseNoExt, baseNoExt + '.ts', baseNoExt + '.tsx', baseNoExt + '.js', baseNoExt + '.jsx', baseNoExt + '.mjs', file]));
				let freshCode = '';
				for (const cand of candidates) {
					try {
						const fresh = await server.transformRequest(cand);
						if (fresh?.code && !freshCode) freshCode = fresh.code;
					} catch {}
				}
				if (freshCode) {
					const existingGm = moduleGraph.get(normalizedId);
					moduleGraph.upsert(normalizedId, freshCode, (existingGm?.deps || []) as string[], { broadcastDelta: false });
				}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][react] post-invalidation re-transform failed', e);
			}
			// Broadcast the now-fresh delta, AFTER cache invalidation.
			try {
				const gm = moduleGraph.get(normalizedId);
				if (gm) moduleGraph.emitDelta([gm], []);
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][react] post-invalidation broadcast failed', e);
			}
		} catch (e) {
			if (verbose) console.warn('[hmr-ws][react] failed to handle hot update for', file, e);
		}
		emitSummary();
	},
};
