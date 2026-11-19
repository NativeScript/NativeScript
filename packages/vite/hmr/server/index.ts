import type { NsDevPlatform } from '../shared/runtime/browser-runtime-contract.js';
import { nsHmrClientVitePlugin, nsViteClientPlugin } from './vite-plugin.js';
import { nsDevRoutesPlugin } from './dev-routes.js';
import { nsCssUpdatesPlugin } from './css-updates.js';
import { nsAppRestartPlugin } from './app-restart.js';
import { nsEntryBoundaryPlugin } from './entry-boundary.js';
import { nsRerunPlugin } from './update-gate.js';
import { nsCoreRegistrationPlugin } from './core-registration.js';

export function getHMRPlugins(opts: { platform: NsDevPlatform; flavor: string; verbose: boolean }) {
	return [nsViteClientPlugin(), nsHmrClientVitePlugin(opts), nsDevRoutesPlugin(opts), nsCoreRegistrationPlugin(), nsAppRestartPlugin(), nsCssUpdatesPlugin(opts), nsRerunPlugin(opts), nsEntryBoundaryPlugin(opts)].filter((plugin) => !!plugin);
}
