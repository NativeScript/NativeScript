import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import * as path from 'path';
import * as PAT from '../../../server/constants.js';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';

// Solid server strategy for NativeScript HMR.
// For Solid we don't have .vue-style SFCs today; this strategy mainly
// ensures Solid runtime imports can be rewritten to vendor when needed
// and allows future per-file processing hooks.

const SOLID_FILE_PATTERN = /\.(tsx?|jsx?)$/i;
const SOLID_APP_PREFIX = `${getProjectAppVirtualPath()}/`;

export const solidServerStrategy: FrameworkServerStrategy = {
	flavor: 'solid',
	matchesFile(id: string) {
		// Treat app TS/TSX/JS/JSX under the configured app root as Solid candidates.
		return SOLID_FILE_PATTERN.test(id) && id.startsWith(SOLID_APP_PREFIX);
	},
	preClean(code: string) {
		// No Solid-specific pre-clean yet.
		return code;
	},
	rewriteFrameworkImports(code: string) {
		// Solid HMR primarily operates via Vite's own solid-refresh plugin;
		// @nativescript/vite vendor bridging handles NativeScript modules.
		// We keep this hook in case we need to remap solid-js imports later.
		return code;
	},
	postClean(code: string) {
		// No extra Solid-specific cleanup for now.
		return code;
	},
	ensureVersionedImports(code: string, _origin: string, _version: number) {
		// Solid currently has no dedicated HTTP endpoints like /ns/sfc.
		return code;
	},
	async processFile(ctx: FrameworkProcessFileContext) {
		// For now we rely on the generic pipeline; no per-file Solid SFC registry.
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
