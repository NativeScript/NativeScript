import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer, normalizePath, type Plugin } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

import { getProjectAppPath } from '../../helpers/utils.js';
import { hmrWebSocketPluginForFlavor } from './websocket.js';

describe('HMR graph population start', () => {
	let root: string;

	afterEach(() => {
		rmSync(root, { recursive: true, force: true });
	});

	it('waits until every plugin has run configureServer before transforming app modules', async () => {
		root = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-populate-order-')));
		mkdirSync(join(root, getProjectAppPath()), { recursive: true });
		writeFileSync(join(root, getProjectAppPath(), 'probe.ts'), 'export const probe = 1;\n');

		// Stands in for plugins ordered between the HMR plugin and the framework
		// plugin whose configureServer awaits (the vue config's type-check plugins).
		const slowPlugin: Plugin = {
			name: 'slow-configure-server',
			async configureServer() {
				await new Promise((resolve) => setTimeout(resolve, 150));
			},
		};
		// Stands in for @vitejs/plugin-vue, which only receives the dev server in
		// its own configureServer and compiles SFCs differently before that.
		let configured = false;
		const transformsBeforeConfigured: string[] = [];
		const transformsAfterConfigured: string[] = [];
		const lateFrameworkPlugin: Plugin = {
			name: 'late-framework-plugin',
			configureServer() {
				configured = true;
			},
			transform(_code, id) {
				(configured ? transformsAfterConfigured : transformsBeforeConfigured).push(id);
			},
		};

		const server = await createServer({
			root,
			configFile: false,
			logLevel: 'silent',
			server: { port: 0, hmr: false },
			plugins: [hmrWebSocketPluginForFlavor('typescript', {})!, slowPlugin, lateFrameworkPlugin],
		});
		try {
			await new Promise((resolve) => setTimeout(resolve, 300));
			expect(configured).toBe(true);
			expect(transformsBeforeConfigured).toEqual([]);
			expect(transformsAfterConfigured).toContain(normalizePath(join(root, getProjectAppPath(), 'probe.ts')));
		} finally {
			await server.close();
		}
	});
});
