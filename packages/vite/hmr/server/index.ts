import type { NsDevPlatform } from '../shared/runtime/browser-runtime-contract.js';
import { nsHmrClientVitePlugin } from './vite-plugin.js';
import { hmrWebSocketPluginForFlavor } from './websocket.js';

export function getHMRPlugins(opts: { platform: NsDevPlatform; flavor: string; verbose: boolean }) {
	const plugins = [nsHmrClientVitePlugin(opts)];
	// The server-side HMR WebSocket plugin is selected from STRATEGY_REGISTRY by
	// flavor. Flavors without a registered server strategy (e.g. `react`) ship
	// only the client plugin above — no per-flavor switch or no-op special case.
	const frameworkPlugin = hmrWebSocketPluginForFlavor(opts.flavor, opts);
	if (frameworkPlugin) {
		plugins.push(frameworkPlugin);
	}
	return plugins;
}
