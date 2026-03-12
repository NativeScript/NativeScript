import { nsHmrClientVitePlugin } from './vite-plugin.js';
import { hmrWebSocketVue, hmrWebSocketAngular, hmrWebSocketSolid, hmrWebSocketTypescript } from './websocket.js';

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
			plugins.push(hmrWebSocketTypescript(opts));
			break;
		case 'solid':
			plugins.push(hmrWebSocketSolid(opts));
			break;
	}
	return plugins;
}
