import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import os from 'os';
import * as path from 'path';

import { angularServerStrategy } from './strategy.js';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';

const APP_ENTRY = getProjectAppVirtualPath('main.ts');
const APP_ENTRY_WITH_QUERY = `${APP_ENTRY}?import`;

describe('angularServerStrategy', () => {
	it('matches app runtime modules and excludes Angular test files', () => {
		expect(angularServerStrategy.matchesFile(APP_ENTRY)).toBe(true);
		expect(angularServerStrategy.matchesFile(APP_ENTRY_WITH_QUERY)).toBe(true);
		expect(angularServerStrategy.matchesFile(getProjectAppVirtualPath('main.spec.ts'))).toBe(false);
		expect(angularServerStrategy.matchesFile(`${getProjectAppVirtualPath('main.test.ts')}?import`)).toBe(false);
		expect(angularServerStrategy.matchesFile(getProjectAppVirtualPath('__tests__/main.ts'))).toBe(false);
	});

	it('builds the Angular registry without priming or watching test files', async () => {
		const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'angular-strategy-'));
		try {
			const srcDir = path.join(tmpRoot, 'src');
			const appDir = path.join(srcDir, 'app');
			const testDir = path.join(srcDir, '__tests__');
			mkdirSync(appDir, { recursive: true });
			mkdirSync(testDir, { recursive: true });

			writeFileSync(path.join(srcDir, 'main.ts'), 'bootstrapApplication(AppComponent);');
			writeFileSync(path.join(srcDir, 'main.spec.ts'), 'bootstrapApplication(TestComponent);');
			writeFileSync(path.join(testDir, 'harness.ts'), 'bootstrapApplication(TestHarness);');
			writeFileSync(path.join(appDir, 'home.component.ts'), "@Component({ templateUrl: './home.component.html', styleUrls: ['./home.component.css'] })\nexport class HomeComponent {}\n");
			writeFileSync(path.join(appDir, 'home.component.html'), '<StackLayout />');
			writeFileSync(path.join(appDir, 'home.component.css'), '.home {}');
			writeFileSync(path.join(appDir, 'home.component.spec.ts'), "@Component({ templateUrl: './home.component.spec.html', styleUrls: ['./home.component.spec.css'] })\nexport class HomeComponentSpec {}\n");
			writeFileSync(path.join(appDir, 'home.component.spec.html'), '<Label />');
			writeFileSync(path.join(appDir, 'home.component.spec.css'), '.spec {}');

			const watcher = {
				add: vi.fn(),
			};
			const server = {
				config: { root: tmpRoot },
				transformRequest: vi.fn(async (id: string) => ({ code: `// transformed ${id}` })),
				watcher,
			} as any;

			await angularServerStrategy.buildRegistry({
				server,
				sfcFileMap: new Map(),
				depFileMap: new Map(),
				wss: {} as any,
				verbose: false,
			});

			expect(server.transformRequest).toHaveBeenCalledWith('/src/main.ts');
			expect(server.transformRequest).not.toHaveBeenCalledWith('/src/main.spec.ts');
			expect(watcher.add).toHaveBeenCalledWith(path.join(appDir, 'home.component.html'));
			expect(watcher.add).toHaveBeenCalledWith(path.join(appDir, 'home.component.css'));
			expect(watcher.add).toHaveBeenCalledWith(appDir);
			expect(watcher.add).not.toHaveBeenCalledWith(path.join(appDir, 'home.component.spec.html'));
			expect(watcher.add).not.toHaveBeenCalledWith(path.join(appDir, 'home.component.spec.css'));
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});

	it('skips commented-out templateUrl / styleUrls when registering template watches', async () => {
		const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'angular-strategy-commented-'));
		try {
			const srcDir = path.join(tmpRoot, 'src');
			const appDir = path.join(srcDir, 'app');
			mkdirSync(appDir, { recursive: true });

			writeFileSync(path.join(srcDir, 'main.ts'), 'bootstrapApplication(AppComponent);');
			writeFileSync(path.join(appDir, 'commented.component.ts'), ["import { Component } from '@angular/core';", '@Component({', "  selector: 'app-cmt',", "  templateUrl: './commented.component.html',", "  // styleUrls: ['./commented.component.scss'],", "  /* templateUrl: './phantom.component.html', */", '})', 'export class CommentedComponent {}'].join('\n'));
			writeFileSync(path.join(appDir, 'commented.component.html'), '<Label text="Hello" />');

			const watcher = { add: vi.fn() };
			const server = {
				config: { root: tmpRoot },
				transformRequest: vi.fn(async (id: string) => ({ code: `// transformed ${id}` })),
				watcher,
			} as any;

			await angularServerStrategy.buildRegistry({
				server,
				sfcFileMap: new Map(),
				depFileMap: new Map(),
				wss: {} as any,
				verbose: false,
			});

			expect(watcher.add).toHaveBeenCalledWith(path.join(appDir, 'commented.component.html'));
			expect(watcher.add).not.toHaveBeenCalledWith(path.join(appDir, 'commented.component.scss'));
			expect(watcher.add).not.toHaveBeenCalledWith(path.join(appDir, 'phantom.component.html'));
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});
});
