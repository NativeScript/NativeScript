import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import * as path from 'path';
import * as PAT from '../../../server/constants.js';
import type { FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import { getProjectAppPath } from '../../../../helpers/utils.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';
import { purgeTransformCachesForHotUpdate } from '../../../server/transform-cache-invalidation.js';
import { classifySfcChange, seedSfcSignature, type SfcSignatureStore } from './sfc-change-kind.js';
import type { VueSfcRegistryEntry, VueSfcRegistryMessage, VueSfcRegistryUpdateMessage } from '../../../shared/protocol.js';

function shortHash(value: string): string {
	return createHash('md5').update(value).digest('hex').slice(0, 8);
}

/**
 * Script-block signatures per SFC path, seeded by the startup registry walk and
 * updated on every hot update. Drives the `rerenderOnly` flag — see
 * `sfc-change-kind.ts` for why that distinction matters on a native runtime.
 */
const sfcScriptSignatures: SfcSignatureStore = new Map();

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
 * Invalidate Vite's module graph for a changed file + its transitive importers
 * so the device's eviction + re-import evaluates the CURRENT save's code.
 */
export function purgeVueTransformCachesForHotUpdate(options: { file: string; server: { config?: { root?: string }; moduleGraph?: any }; verbose?: boolean }): void {
	purgeTransformCachesForHotUpdate({ ...options, label: 'vue' });
}

async function buildAndSendRegistry(ctx: FrameworkRegistryContext): Promise<void> {
	const { server, sfcFileMap, wss, verbose } = ctx;
	const root = server.config.root || process.cwd();
	// Scan the app source directory, not the whole project: a `.vue` file that
	// lives outside it (fixtures, docs, demo snapshots) is not part of the app.
	const appDir = path.join(root, getProjectAppPath());
	const scanRoot = existsSync(appDir) ? appDir : root;
	const vueFiles = findVueFiles(scanRoot, root);

	if (!vueFiles.length) {
		return;
	}

	const entries: VueSfcRegistryEntry[] = [];
	for (const rel of vueFiles) {
		const hash = shortHash(rel);
		const fileName = `sfc-${hash}.mjs`;
		sfcFileMap.set(rel, fileName);
		// Seed the script signature so the FIRST edit of a session can still be
		// classified as render-only; without a baseline it would fall back to a
		// full reload.
		try {
			const abs = path.join(root, rel.replace(/^\//, ''));
			await seedSfcSignature(rel, readFileSync(abs, 'utf-8'), abs, sfcScriptSignatures);
		} catch {}
		entries.push({ path: rel, fileName, hmrId: hash, code: '' });
	}

	if (!wss) {
		return;
	}

	const msg: VueSfcRegistryMessage = {
		type: 'ns:vue-sfc-registry',
		entries,
		ts: Date.now(),
	};
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
	// Run the shared prologue (scope gate, pending overlay, common graph upsert,
	// CSS), then for a changed `.vue` SFC broadcast a metadata-only registry
	// update. Non-`.vue` edits fall through (the prologue already handled CSS
	// and the common graph delta).
	async handleHotUpdate(ctx, deps) {
		const state = await runHotUpdatePrologue(ctx, deps);
		if (!state) return;
		const { emitSummary } = state;
		const { verbose, wss, moduleGraph, sfcFileMap, isSocketClientOpen } = deps;
		const { file, server } = ctx;

		// Runs for EVERY changed file (not just .vue): the device re-imports
		// changed deps, which must transform against the CURRENT file content.
		purgeVueTransformCachesForHotUpdate({ file, server, verbose });

		if (!file.endsWith('.vue')) {
			if (verbose) console.log('[hmr-ws] Not a .vue file, skipping');
			return;
		}

		try {
			const root = server.config.root || process.cwd();
			const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
			const fileName = sfcFileMap.get(rel) || `sfc-${shortHash(rel)}.mjs`;
			sfcFileMap.set(rel, fileName);

			// Did anything outside <template>/<style> change? When nothing did,
			// the client patches live instances in place instead of remounting
			// them — the only path that reaches a pushed page or a presented
			// modal. See sfc-change-kind.ts.
			let rerenderOnly = false;
			try {
				rerenderOnly = (await classifySfcChange(rel, readFileSync(file, 'utf-8'), file, sfcScriptSignatures)) === 'render-only';
			} catch {
				sfcScriptSignatures.delete(rel);
			}
			if (verbose) console.log(`[hmr-ws] ${rel} → ${rerenderOnly ? 'render-only (rerender)' : 'full (reload)'}`);

			const registryUpdateMsg: VueSfcRegistryUpdateMessage = {
				type: 'ns:vue-sfc-registry-update',
				path: rel,
				fileName,
				ts: Date.now(),
				version: moduleGraph.version,
				rerenderOnly,
			};
			wss?.clients.forEach((client) => {
				if (isSocketClientOpen(client)) {
					client.send(JSON.stringify(registryUpdateMsg));
				}
			});
		} catch (error) {
			console.warn('[hmr-ws] HMR update failed:', error);
		}

		// Exactly one summary line per update; idempotent if already emitted.
		emitSummary();
		// An empty array prevents Vite's default HMR.
		return [];
	},
	// Key order (nativescript-vue then vue) is significant for the import map.
	importMapSpecifiers() {
		return ['nativescript-vue', 'vue'];
	},
	async processFile() {},
	async buildRegistry(ctx: FrameworkRegistryContext) {
		await buildAndSendRegistry(ctx);
	},
};
