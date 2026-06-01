import type { FrameworkClientStrategy, FrameworkClientMessageContext } from '../../../client/framework-client-strategy.js';
import { installAngularHmrClientHooks, handleAngularHotUpdateMessage } from './index.js';

/**
 * Angular's on-device HMR behavior, surfaced as a `FrameworkClientStrategy` so
 * the shared client never references the Angular client module directly. Both
 * methods delegate to the existing `angular/client` functions — no behavior
 * change. Angular drives its own view refresh inside `handleHotUpdateMessage`,
 * so the mount/navigate/batch hooks stay unimplemented (shared defaults apply).
 */
export const angularClientStrategy: FrameworkClientStrategy = {
	flavor: 'angular',
	allowNavigateFastPath: true,

	install() {
		installAngularHmrClientHooks();
	},

	handleHotUpdateMessage(msg: any, ctx: FrameworkClientMessageContext): Promise<boolean> {
		return handleAngularHotUpdateMessage(msg, { getCore: ctx.getCore, verbose: ctx.verbose });
	},
};
