import type { NsDevPlatform } from '../shared/runtime/browser-runtime-contract.js';
import { nsHmrClientVitePlugin, nsViteClientPlugin } from './vite-plugin.js';
import type { DevOutputOptions } from './dev-output.js';
import { nsImportMapPlugin } from './import-map-route.js';
import { nsAppRestartPlugin } from './app-restart.js';
import { nsAppCssModulePlugins } from './app-css-module.js';
import { nsEntryBoundaryPlugin } from './entry-boundary.js';
import { nsRerunPlugin } from './update-gate.js';
import { nsModuleRequirePlugin } from './module-require.js';
import { nsPreBundleWatchPlugin } from './prebundle-watch.js';

export function getHMRPlugins(opts: { platform: NsDevPlatform; flavor: string; verbose: boolean; devOutput?: DevOutputOptions }) {
	// The pre-bundle watch hot-update hook ahead of the app restart one: both
	// are `pre`, and rebuilding the pre-bundles supersedes any other handling
	// of the same file.
	// The app CSS hot-update hook ahead of `nsRerunPlugin`'s: both are `post`,
	// and the update gate must record the stylesheet's modules, not the ones a
	// framework hook swapped in.
	return [nsViteClientPlugin(), nsHmrClientVitePlugin(opts), nsImportMapPlugin(opts), nsPreBundleWatchPlugin(), nsAppRestartPlugin(), ...nsAppCssModulePlugins(), nsRerunPlugin(opts), nsEntryBoundaryPlugin(opts), nsModuleRequirePlugin()].filter((plugin) => !!plugin);
}
