import type { NsDevPlatform } from '../shared/runtime/browser-runtime-contract.js';
import { nsHmrClientVitePlugin, nsViteClientPlugin } from './vite-plugin.js';
import { nsImportMapPlugin } from './import-map-route.js';
import { nsAppRestartPlugin } from './app-restart.js';
import { nsAppCssModulePlugins } from './app-css-module.js';
import { nsEntryBoundaryPlugin } from './entry-boundary.js';
import { nsRerunPlugin } from './update-gate.js';
import { nsModuleRequirePlugin } from './module-require.js';
import { nsPreBundleWatchPlugin } from './prebundle-watch.js';

export function getHMRPlugins(opts: { platform: NsDevPlatform; flavor: string; verbose: boolean; watchNodeModules?: boolean }) {
	// The app CSS hot-update hook ahead of `nsRerunPlugin`'s: both are `post`,
	// and the update gate must record the stylesheet's modules, not the ones a
	// framework hook swapped in.
	return [nsViteClientPlugin(), nsHmrClientVitePlugin(opts), nsImportMapPlugin(opts), nsAppRestartPlugin(), ...nsAppCssModulePlugins(), nsRerunPlugin(opts), nsEntryBoundaryPlugin(opts), nsModuleRequirePlugin(), opts.watchNodeModules && nsPreBundleWatchPlugin()].filter((plugin) => !!plugin);
}
