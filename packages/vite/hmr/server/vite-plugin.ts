import type { Plugin, ResolvedConfig } from 'vite';
import { createRequire } from 'node:module';
import path from 'path';
import { pathToFileURL } from 'url';
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

			/**
			 * Use a POSIX-style import specifier for the client entry to avoid
			 * Windows drive-letter paths (e.g. "D:\\...") accidentally
			 * becoming bare import ids that Rollup/Vite cannot resolve.
			 * We still resolve the real filesystem path for correctness, but convert it to a project-relative POSIX path before interpolating it into the generated module.
			 **/
			const clientFsPath = require.resolve('@nativescript/vite/hmr/client/index.js');
			// Prefer project root when available; otherwise fall back to cwd.
			const projectRoot = config?.root || process.cwd();
			let clientImport = clientFsPath;
			try {
				// Compute a project-relative POSIX path when possible. When `path.relative`
				// returns an absolute path (this can occur on Windows if roots differ or
				// when path.relative returns a drive-letter-prefixed path), avoid creating
				// a specifier like `/D:/...` which later gets resolved to `D:\D:\...`.
				const rel = path.relative(projectRoot, clientFsPath);
				const relPosix = rel.replace(/\\/g, '/');

				// If `rel` is absolute (e.g. starts with a drive letter on Windows),
				// use a file:// URL for the import so Vite/Rollup do not prepend the
				// project root and cause duplicated drive prefixes.
				if (path.isAbsolute(rel)) {
					clientImport = pathToFileURL(clientFsPath).toString();
				} else {
					clientImport = (relPosix.startsWith('.') ? relPosix : `/${relPosix}`).replace(/\/+/g, '/');
				}
			} catch {
				// On any failure, keep the original path but normalize to POSIX
				clientImport = clientFsPath.replace(/\\/g, '/');
			}

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
import startViteHMR from "${clientImport}";
${banner}
startViteHMR({ wsUrl: ${JSON.stringify(wsUrl)} });
`;
		},
	};
}
