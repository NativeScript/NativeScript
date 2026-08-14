import type { FrameworkClientBatchContext, FrameworkClientStrategy } from '../../../client/framework-client-strategy.js';
import { typescriptClientStrategy } from '../../typescript/client/strategy.js';

/**
 * React reuses the generic TypeScript HMR path on BOTH server and client: it
 * has no Fast Refresh, so a module edit drives a plain module reload (the
 * React tree re-renders). This mirrors the server's
 * `{ ...typescriptServerStrategy, flavor: 'react' }` — modal tracking, the
 * TS-style root factory, and the code-behind re-registration all apply — but
 * the batch refresh differs: React mounts a dominative document root via
 * `startReactApp` rather than an `app-root` module, so the TypeScript
 * `resetRootView({moduleName:'app-root'})` path doesn't apply.
 */
export const reactClientStrategy: FrameworkClientStrategy = {
	...typescriptClientStrategy,
	flavor: 'react',

	refreshAfterBatch(_drained: string[], ctx: FrameworkClientBatchContext) {
		// The changed modules were already re-imported into the device cache by
		// the shared queue; the per-page remount is driven by the app's
		// `__NS_HMR_ON_UPDATE__` hook (see `@nativescript/tanstack-router/react`'s
		// `subscribeReactHmrRemount`), which fires right after this queue drains.
		// Here we only mark the overlay complete so it doesn't stick at
		// 'received' (5%).
		ctx.setUpdateOverlayStage('complete', {
			detail: `Total ${Math.max(0, Date.now() - ctx.startedAt)}ms`,
		});
	},
};
