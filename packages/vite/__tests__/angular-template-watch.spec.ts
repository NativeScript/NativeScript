import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@analogjs/vite-plugin-angular', () => ({
	default: vi.fn(() => []),
}));

vi.mock('../configuration/base.js', () => ({
	baseConfig: vi.fn(() => ({})),
}));

vi.mock('../helpers/angular/angular-linker.js', () => ({
	angularLinkerVitePlugin: vi.fn(() => ({ name: 'mock-angular-linker-pre' })),
	angularLinkerVitePluginPost: vi.fn(() => ({ name: 'mock-angular-linker-post' })),
}));

vi.mock('../helpers/cli-flags.js', () => ({
	getCliFlags: vi.fn(() => ({})),
}));

import { angularConfig } from '../configuration/angular.js';

function normalizePath(filePath: string): string {
	return filePath.replace(/\\/g, '/');
}

function getAngularTemplateDepsPlugin() {
	const config = angularConfig({ mode: 'development' });
	const plugins = ((config.plugins as any[]) || []).flat().filter(Boolean);
	const plugin = plugins.find((entry) => entry?.name === 'angular-template-deps');
	if (!plugin) {
		throw new Error('angular-template-deps plugin not found');
	}
	return plugin as {
		configResolved?: (config: any) => void;
		transform?: (this: { addWatchFile: (filePath: string) => void }, code: string, id: string) => null;
		watchChange?: (id: string, change: { event: string }) => void;
		buildStart?: () => void;
	};
}

function createComponentFixture() {
	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-angular-template-watch-'));
	const componentPath = path.join(tempDir, 'example.component.ts');
	const templatePath = path.join(tempDir, 'example.component.html');
	const stylePath = path.join(tempDir, 'example.component.css');

	fs.writeFileSync(templatePath, '<Label text="Hello"></Label>');
	fs.writeFileSync(stylePath, '.example { color: red; }');
	fs.writeFileSync(componentPath, ["import { Component } from '@angular/core';", '', '@Component({', "  templateUrl: './example.component.html',", "  styleUrls: ['./example.component.css']", '})', 'export class ExampleComponent {}'].join('\n'));

	return {
		tempDir,
		componentPath,
		templatePath,
		stylePath,
		componentCode: fs.readFileSync(componentPath, 'utf8'),
	};
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('angular-template-deps watch invalidation', () => {
	it('registers external template and stylesheet dependencies', () => {
		const plugin = getAngularTemplateDepsPlugin();
		const fixture = createComponentFixture();
		const watchedFiles: string[] = [];

		try {
			plugin.transform?.call(
				{
					addWatchFile(filePath: string) {
						watchedFiles.push(normalizePath(filePath));
					},
				},
				fixture.componentCode,
				fixture.componentPath,
			);

			expect(watchedFiles).toEqual(expect.arrayContaining([normalizePath(fixture.templatePath), normalizePath(fixture.stylePath)]));
		} finally {
			fs.rmSync(fixture.tempDir, { recursive: true, force: true });
		}
	});

	it.each([
		['template', 'templatePath'],
		['style', 'stylePath'],
	])('invalidates the component transform cache when the %s asset changes in build watch mode', (_label, changedAssetKey) => {
		const plugin = getAngularTemplateDepsPlugin();
		const fixture = createComponentFixture();

		try {
			plugin.configResolved?.({ build: { watch: {} } });
			plugin.transform?.call(
				{
					addWatchFile() {},
				},
				fixture.componentCode,
				fixture.componentPath,
			);

			plugin.watchChange?.(fixture[changedAssetKey as 'templatePath' | 'stylePath'], { event: 'update' });

			expect(plugin.shouldTransformCachedModule?.({ id: fixture.componentPath })).toBe(true);
			expect(plugin.shouldTransformCachedModule?.({ id: fixture.componentPath })).toBeNull();
		} finally {
			fs.rmSync(fixture.tempDir, { recursive: true, force: true });
		}
	});
});
