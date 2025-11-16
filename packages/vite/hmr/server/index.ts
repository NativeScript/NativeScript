import { nsHmrClientVitePlugin } from './vite-plugin.js';
import { hmrWebSocketVue, hmrWebSocketAngular, hmrWebSocketSolid } from './websocket.js';

export function getHMRPlugins(opts: { platform: string; flavor: string; verbose: boolean }) {
	const plugins = [nsHmrClientVitePlugin(opts)];
	switch (opts.flavor) {
		case 'vue':
			plugins.push(hmrWebSocketVue(opts));
			break;
		case 'react':
			break;
		case 'angular':
			plugins.push(hmrWebSocketAngular(opts));
			break;
		case 'typescript':
			// TypeScript flavor uses the generic HTTP-loaded realm with TS app modules.
			// It shares the same HMR WebSocket implementation as Vue (HTTP graph + SFC-style rewrites),
			// but is wired to the typescript server strategy so TS files participate in the graph.
			plugins.push(hmrWebSocketVue(opts));
			break;
		case 'solid':
			plugins.push(hmrWebSocketSolid(opts));
			break;
	}
	return plugins;
}
