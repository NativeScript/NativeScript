import type { Plugin } from 'vite';
import { existsSync } from 'node:fs';
import { viteUrlForFile } from '../hmr/server/vite-url.js';
import { corePathToSub, specToCoreSub } from './ns-core-url.js';
import { resolveDeviceReachableOrigin } from './dev-host.js';
import type { Platform } from './platform-types.js';

export interface NsCoreExternalUrlsPluginOptions {
	platform: Platform;
	projectRoot: string;
	/** Resolved @nativescript/core root (workspace source or node_modules install). */
	nsCoreRoot: string;
	hmrPort: number;
	useHttps: boolean;
}

/**
 * HMR builds only: externalize every `@nativescript/core*` reference (bare
 * specifier, or absolute path into the resolved core root) to the device URL
 * the dev server serves that file under, so the local chunks of an HMR build
 * (Android app components) bundle no copy of core and share the served one.
 * The URL carries no `?v=`: it can't match the served core's once a dep
 * optimizer exists. enforce:'pre' so it fires BEFORE Vite's alias resolution
 * converts bare specifiers to absolute filesystem paths.
 */
export function nsCoreExternalUrlsPlugin(opts: NsCoreExternalUrlsPluginOptions): Plugin {
	const { platform, projectRoot, nsCoreRoot, hmrPort, useHttps } = opts;
	// Same device-reachable origin helper as `main-entry.ts`, so both emit
	// byte-identical origins (the runtime keys HTTP modules by URL).
	//
	// Protocol must match the dev server's protocol. `NS_HTTPS` is the single
	// switch (it also drives the server TLS + `wss` HMR socket); `NS_HMR_PROTO`
	// remains an explicit override when set.
	const proto: 'http' | 'https' = (process.env.NS_HMR_PROTO ? process.env.NS_HMR_PROTO === 'https' : useHttps) ? 'https' : 'http';
	const { origin } = resolveDeviceReachableOrigin({
		host: process.env.NS_HMR_HOST,
		platform,
		protocol: proto,
		port: hmrPort,
	});
	return {
		name: 'ns-core-external-urls',
		enforce: 'pre',
		apply: 'build',
		async resolveId(source: string, importer: string | undefined) {
			if (specToCoreSub(source) === null && corePathToSub(source, nsCoreRoot) === null) return null;
			const resolved = await this.resolve(source, importer, { skipSelf: true });
			const file = resolved && !resolved.external ? resolved.id.split('?')[0] : null;
			if (!file || !existsSync(file)) return null;
			// Same resolver id the dev server's import analysis serves (no realpath).
			return { id: `${origin}${viteUrlForFile(file, projectRoot)}`, external: 'absolute' as const };
		},
	};
}
