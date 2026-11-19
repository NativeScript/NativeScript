import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, type Plugin, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const ORIGIN = 'http://192.168.1.2:5173';
vi.mock('./server-origin.js', () => ({ getServerOrigin: () => ORIGIN }));

import { NS_DEV_EXPR } from '../shared/runtime/dev-globals.js';
import { nsCoreRegistrationPlugin } from './core-registration.js';
import { stripDevNonce } from './device-requests.js';
import { getServedModules } from './served-modules.js';
import { nsHmrClientVitePlugin, nsViteClientPlugin } from './vite-plugin.js';

describe('stripDevNonce', () => {
	it('drops the param and keeps the others in order, with no dangling separator', () => {
		expect(stripDevNonce('/src/app.ts?__ns_dev_nonce=1700000000000-3')).toBe('/src/app.ts');
		expect(stripDevNonce('/src/app.ts?t=1700000000000&__ns_dev_nonce=1-4')).toBe('/src/app.ts?t=1700000000000');
		expect(stripDevNonce('/src/app.ts?__ns_dev_nonce=1-4&t=1700000000000&import')).toBe('/src/app.ts?t=1700000000000&import');
		expect(stripDevNonce('/src/a.vue?vue&__ns_dev_nonce=1-5&type=style')).toBe('/src/a.vue?vue&type=style');
		expect(stripDevNonce('/src/app.ts?x__ns_dev_nonce=1')).toBe('/src/app.ts?x__ns_dev_nonce=1');
	});
});

describe('device requests on a real Vite server', () => {
	const packageDir = fileURLToPath(new URL('../../', import.meta.url)).replace(/\/$/, '');
	let tmp: string;
	let root: string;
	let coreDir: string;
	let server: ViteDevServer;
	let httpServer: http.Server;
	let port: number;
	const seenByPreMiddleware: string[] = [];
	const previousHost = process.env.NS_HMR_HOST;

	beforeAll(async () => {
		tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-device-requests-')));
		root = path.join(tmp, 'app');
		// Outside the root, like a linked or workspace core.
		coreDir = path.join(tmp, 'core');
		const files: Record<string, string> = {
			'app/package.json': JSON.stringify({ name: 'app', main: 'src/main.js' }),
			'app/src/main.js': "import { core } from '@nativescript/core';\nexport const load = () => import('/src/lazy.js');\nexport const app = core;\n",
			'app/src/lazy.js': "import { dep } from './dep.js';\nexport const lazy = dep;\n",
			'app/src/dep.js': "export const dep = 'a';\n",
			'core/package.json': JSON.stringify({ name: '@nativescript/core', main: 'index.js' }),
			'core/index.js': "export const core = 'core';\n",
		};
		for (const [name, content] of Object.entries(files)) {
			fs.mkdirSync(path.dirname(path.join(tmp, name)), { recursive: true });
			fs.writeFileSync(path.join(tmp, name), content);
		}
		const prePlugin: Plugin = {
			name: 'spec-pre-middleware',
			enforce: 'pre',
			configureServer(s) {
				s.middlewares.use((req, _res, next) => {
					seenByPreMiddleware.push(req.url ?? '');
					next();
				});
			},
		};
		process.env.NS_HMR_HOST = 'dev-mac.local';
		server = await createServer({
			root,
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			resolve: { alias: [{ find: /^@nativescript\/core$/, replacement: coreDir }] },
			optimizeDeps: { noDiscovery: true, include: [] },
			server: { middlewareMode: true, ws: false, watch: null, fs: { allow: [root] } },
			plugins: [prePlugin, nsViteClientPlugin(), nsHmrClientVitePlugin({ platform: 'ios' }), nsCoreRegistrationPlugin()],
		});
		httpServer = http.createServer(server.middlewares);
		await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
		port = (httpServer.address() as AddressInfo).port;
	});

	afterAll(async () => {
		if (previousHost === undefined) delete process.env.NS_HMR_HOST;
		else process.env.NS_HMR_HOST = previousHost;
		await new Promise((resolve) => httpServer?.close(resolve));
		await server?.close();
		fs.rmSync(tmp, { recursive: true, force: true });
	});

	function get(url: string, host = `127.0.0.1:${port}`): Promise<{ status: number; type: string | undefined; body: string }> {
		return new Promise((resolve, reject) => {
			http
				.get({ host: '127.0.0.1', port, path: url, headers: { host } }, (res) => {
					let body = '';
					res.setEncoding('utf8');
					res.on('data', (chunk) => (body += chunk));
					res.on('end', () => resolve({ status: res.statusCode ?? 0, type: res.headers['content-type'], body }));
				})
				.on('error', reject);
		});
	}

	it('strips the nonce before every other middleware, Vite and enforce:pre plugins included', async () => {
		const { status } = await get('/src/dep.js?__ns_dev_nonce=1700000000000-1');
		expect(status).toBe(200);
		expect(seenByPreMiddleware).toContain('/src/dep.js');
		expect(seenByPreMiddleware.some((url) => url.includes('__ns_dev_nonce'))).toBe(false);
		expect(server.environments.client.moduleGraph.urlToModuleMap.has('/src/dep.js')).toBe(true);
	});

	it('serves dynamic imports with absolute URLs and keeps them stamped after a transitive edit', async () => {
		const first = await get('/src/main.js');
		expect(first.body).toContain(`import('${ORIGIN}/src/lazy.js')`);
		expect(first.body).toMatch(/from "\/@fs\/[^"]+\/core\/index\.js"/);
		await get('/src/lazy.js');

		const dep = path.join(root, 'src/dep.js');
		fs.writeFileSync(dep, "export const dep = 'b';\n");
		server.watcher.emit('change', dep);
		const lazy = () => server.environments.client.moduleGraph.getModuleById(path.join(root, 'src/lazy.js'));
		await expect.poll(() => lazy()?.lastHMRTimestamp ?? 0).toBeGreaterThan(0);

		const second = await get('/src/main.js');
		expect(second.body).toContain(`import('${ORIGIN}/src/lazy.js?t=${lazy()!.lastHMRTimestamp}')`);
	});

	it('records the graph URL of a served module once its response finishes', async () => {
		await get('/src/dep.js?import&t=1700000000000');
		await expect.poll(() => getServedModules(server).has('/src/dep.js', 1700000000000)).toBe(true);
		await get('/__ns_dev__/session');
		expect([...getServedModules(server).servedAt()].map(([url]) => url)).not.toContain('/__ns_dev__/session');
	});

	it('resolves /@vite/client to the NativeScript client through Vite’s alias', async () => {
		const resolved = await server.environments.client.pluginContainer.resolveId('/@vite/client');
		expect(resolved?.id).toBe(path.join(packageDir, 'hmr/client/thin-vite-client.js'));
	});

	it('allows serving this package and the resolved @nativescript/core outside the root', async () => {
		expect((await get(`/@fs${packageDir}/hmr/server/vite-url.ts`)).status).toBe(200);
		const core = await get(`/@fs${coreDir}/index.js`);
		expect(core.status).toBe(200);
		expect(core.body).toContain(`import * as __ns_core_self__ from "/@fs${coreDir}/index.js";`);
		expect(core.body).toContain('if (!t[k]) t[k] = v;');
		expect(core.body).toContain(`const d = ${NS_DEV_EXPR};`);
		expect(core.body).toContain('["@nativescript/core/index.js","@nativescript/core/index","@nativescript/core"]');
		expect((await get(`/@fs${tmp}/outside.js`)).status).not.toBe(200);
	});

	it("passes Vite's host check for the NS_HMR_HOST hostname only", async () => {
		expect((await get('/src/dep.js', `dev-mac.local:${port}`)).status).toBe(200);
		expect((await get('/src/dep.js', `evil.example:${port}`)).status).toBe(403);
	});
});
