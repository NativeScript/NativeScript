import type { NsDevPlatform } from '../shared/runtime/browser-runtime-contract.js';
import { nsHmrClientVitePlugin } from './vite-plugin.js';
import { nsDevRoutesPlugin } from './dev-routes.js';
import { nsCssUpdatesPlugin } from './css-updates.js';
import { nsAppRestartPlugin } from './app-restart.js';
import { nsEntryBoundaryPlugin, nsRerunPlugin } from './entry-boundary.js';

export function getHMRPlugins(opts: { platform: NsDevPlatform; flavor: string; verbose: boolean }) {
	return [nsHmrClientVitePlugin(opts), nsDevRoutesPlugin(opts), nsAppRestartPlugin(), nsCssUpdatesPlugin(opts), nsRerunPlugin(), nsEntryBoundaryPlugin(opts)].filter((plugin) => !!plugin);
}
