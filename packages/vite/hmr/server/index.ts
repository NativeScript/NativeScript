import type { NsDevPlatform } from '../shared/runtime/browser-runtime-contract.js';
import { nsHmrClientVitePlugin } from './vite-plugin.js';
import { nsDevRoutesPlugin } from './dev-routes.js';
import { nsCssUpdatesPlugin } from './css-updates.js';

export function getHMRPlugins(opts: { platform: NsDevPlatform; flavor: string; verbose: boolean }) {
	return [nsHmrClientVitePlugin(opts), nsDevRoutesPlugin(opts), nsCssUpdatesPlugin(opts)];
}
