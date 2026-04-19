import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockExistsSync = vi.fn();
const mockReaddirSync = vi.fn();

vi.mock('fs', () => ({
	existsSync: (...args: unknown[]) => mockExistsSync(...args),
	readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
	readFileSync: vi.fn(),
}));

vi.mock('../shared/vendor/registry.js', () => ({
	getVendorManifest: vi.fn(() => null),
	listVendorModules: vi.fn(() => []),
}));

vi.mock('../../helpers/project.js', () => ({
	getProjectRootPath: vi.fn(() => '/workspace/app'),
}));

import { generateImportMap } from './import-map.js';

function dir(name: string) {
	return {
		name,
		isDirectory: () => true,
		isSymbolicLink: () => false,
	};
}

describe('generateImportMap', () => {
	beforeEach(() => {
		mockExistsSync.mockReturnValue(true);
		mockReaddirSync.mockImplementation((target: string) => {
			const normalized = String(target).replace(/\\/g, '/');
			if (normalized.endsWith('/node_modules')) {
				return [dir('@nativescript'), dir('@vitejs'), dir('vite'), dir('solid-js')];
			}
			if (normalized.endsWith('/node_modules/@nativescript')) {
				return [dir('vite')];
			}
			if (normalized.endsWith('/node_modules/@vitejs')) {
				return [dir('plugin-vue')];
			}
			return [];
		});
	});

	it('omits build-time package roots while keeping the NativeScript Vite runtime prefix', () => {
		const { imports } = generateImportMap({ origin: 'http://localhost:5173', flavor: 'angular' });

		expect(imports['@nativescript/vite']).toBeUndefined();
		expect(imports['@nativescript/vite/']).toBe('http://localhost:5173/ns/m/node_modules/@nativescript/vite/');
		expect(imports['vite']).toBeUndefined();
		expect(imports['vite/']).toBeUndefined();
		expect(imports['@vitejs/plugin-vue']).toBeUndefined();
		expect(imports['@vitejs/plugin-vue/']).toBeUndefined();
		expect(imports['solid-js']).toBe('http://localhost:5173/ns/m/node_modules/solid-js');
		expect(imports['solid-js/']).toBe('http://localhost:5173/ns/m/node_modules/solid-js/');
	});
});
