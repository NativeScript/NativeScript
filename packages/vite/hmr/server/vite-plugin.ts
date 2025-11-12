import type { Plugin, ResolvedConfig } from 'vite';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const VIRTUAL_ID = 'virtual:ns-hmr-client';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

export function nsHmrClientVitePlugin(opts: { platform: string; verbose?: boolean }): Plugin {
	let config: ResolvedConfig | undefined;

	return {
		name: 'ns-hmr-client',
		configResolved(c) {
			config = c;
		},
		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
			return null;
		},
		load(id) {
			if (id !== RESOLVED_ID) return null;

			const clientPath = require.resolve('@nativescript/vite/hmr/client/index.js');

			// Build ws url from Vite server info
			let host = process.env.NS_HMR_HOST || (config?.server?.host as any);
			// Android emu special-case
			if (opts.platform === 'android' && (host === '0.0.0.0' || !host || host === true)) {
				host = '10.0.2.2';
			} else if (!host) {
				host = 'localhost';
			}
			const port = Number(config?.server?.port || 5173);
			const secure = !!config?.server?.https;
			const protocol = secure ? 'wss' : 'ws';
			const wsUrl = `${protocol}://${host}:${port}/ns-hmr`;

			// Import client and start it with explicit ws URL
			const banner = opts.verbose ? `console.log('[ns-hmr-client] starting client -> ${wsUrl} (HTTP loader enabled via __NS_HTTP_ORIGIN__)');` : '';
			return `
import startViteHMR from "${clientPath}";
${banner}
startViteHMR({ wsUrl: ${JSON.stringify(wsUrl)} });
`;
		},
	};
}
