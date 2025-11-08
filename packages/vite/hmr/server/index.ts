import { nsHmrClientVitePlugin } from './vite-plugin.js';
import { hmrWebSocketVue, hmrWebSocketAngular } from './websocket.js';

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
		case 'solid':
			break;
	}
	return plugins;
}
