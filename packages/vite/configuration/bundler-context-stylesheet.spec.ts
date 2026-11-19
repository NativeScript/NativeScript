import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({ root: '', flags: {} as Record<string, unknown> }));

vi.mock('./base.js', () => ({ baseConfig: vi.fn(() => ({})) }));
vi.mock('../helpers/typescript-check.js', () => ({ getTypeCheckPlugins: vi.fn(() => []) }));
vi.mock('../helpers/cli-flags.js', () => ({ getCliFlags: () => fixture.flags, resolvePlatform: () => 'ios' }));
vi.mock('../helpers/project.js', () => ({
	getPackageJson: () => ({ main: 'src/main.ts' }),
	getProjectFilePath: (rel: string) => path.join(fixture.root, rel),
	getProjectRootPath: () => fixture.root,
}));
vi.mock('../helpers/utils.js', () => ({
	getProjectAppPath: () => path.join(fixture.root, 'src'),
	resolveProjectGlobalCssPath: () => path.join(fixture.root, 'src', 'app.css'),
}));

import { javascriptConfig } from './javascript.js';
import { typescriptConfig } from './typescript.js';

fixture.root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-bundler-context-')));
for (const [name, content] of Object.entries({ 'src/app.css': '.a {}', 'src/main-page.css': '.b {}', 'src/main-page.xml': '<Page/>', 'src/main.ts': '' })) {
	fs.mkdirSync(path.dirname(path.join(fixture.root, name)), { recursive: true });
	fs.writeFileSync(path.join(fixture.root, name), content);
}

async function contextCode(config: { plugins?: unknown[] }, name: string): Promise<string> {
	const plugin = (config.plugins as any[]).flat(Infinity).find((p) => p?.name === name);
	return (await plugin.load('\0virtual:ns-bundler-context')).code;
}

describe.each([
	['typescript', () => typescriptConfig({ mode: 'development' }), () => typescriptConfig({ mode: 'production' }), 'ns-bundler-context-ts'],
	['javascript', () => javascriptConfig({ mode: 'development' }), () => javascriptConfig({ mode: 'production' }), 'ns-bundler-context-js'],
] as const)('%s bundler context', (_flavor, dev, release, pluginName) => {
	beforeEach(() => {
		fixture.flags = { hmr: true };
	});

	it('leaves the global stylesheet out under HMR, keeping the other stylesheets', async () => {
		const code = await contextCode(dev(), pluginName);
		expect(code).not.toContain('app.css');
		expect(code).toContain(`${fixture.root}/src/main-page.css?raw`);
	});

	it('registers the global stylesheet in release and without HMR', async () => {
		expect(await contextCode(release(), pluginName)).toContain(`${fixture.root}/src/app.css?raw`);
		fixture.flags = {};
		expect(await contextCode(dev(), pluginName)).toContain(`${fixture.root}/src/app.css?raw`);
	});
});

afterAll(() => {
	fs.rmSync(fixture.root, { recursive: true, force: true });
});
