import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildVersionedCoreMainBridgeModule, buildVersionedCoreSubpathAliasModule, collectStaticExportNamesFromFile, collectStaticExportOriginsFromFile, ensureVersionedCoreImports, normalizeCoreExportOriginsForRuntime } from './websocket.js';

describe('buildVersionedCoreSubpathAliasModule', () => {
	it('aliases an unversioned deep core subpath to the canonical versioned module', () => {
		const out = buildVersionedCoreSubpathAliasModule('ui/core/view-base/index.js', 7);

		expect(out).toContain('import * as __ns_core_alias from "/ns/core/7?p=ui/core/view-base/index.js";');
		expect(out).toContain('export default __ns_core_alias;');
		expect(out).toContain('export * from "/ns/core/7?p=ui/core/view-base/index.js";');
	});

	it('emits explicit named re-exports when canonical export names are known', () => {
		const out = buildVersionedCoreSubpathAliasModule('data/observable-array/index.js', 7, ['ChangeType', 'ObservableArray']);

		expect(out).toContain('import * as __ns_core_alias from "/ns/core/7?p=data/observable-array/index.js";');
		expect(out).toContain('export default __ns_core_alias;');
		expect(out).toContain('export { ChangeType, ObservableArray } from "/ns/core/7?p=data/observable-array/index.js";');
		expect(out).not.toContain('const { ChangeType, ObservableArray } = __ns_core_alias;');
		expect(out).not.toContain('export * from');
	});

	it('re-exports a real default binding without touching the namespace object eagerly', () => {
		const out = buildVersionedCoreSubpathAliasModule('timer/index.js', 7, ['setTimeout'], true);

		expect(out).toContain('export { default } from "/ns/core/7?p=timer/index.js";');
		expect(out).toContain('export { setTimeout } from "/ns/core/7?p=timer/index.js";');
		expect(out).not.toContain('import * as __ns_core_alias');
	});

	it('strips leading slashes from the requested core subpath', () => {
		const out = buildVersionedCoreSubpathAliasModule('/ui/layouts/layout-base-common.js', 3);

		expect(out).toContain('"/ns/core/3?p=ui/layouts/layout-base-common.js"');
		expect(out).not.toContain('"/ns/core/3?p=/ui/layouts/layout-base-common.js"');
	});
});

describe('ensureVersionedCoreImports', () => {
	it('versions origin-prefixed static deep-core imports', () => {
		const out = ensureVersionedCoreImports('import { getString } from "http://localhost:5173/ns/core?p=application-settings/index.ios.js";', 'http://localhost:5173', 0);

		expect(out).toBe('import { getString } from "/ns/core/0?p=application-settings/index.ios.js";');
	});

	it('versions origin-prefixed dynamic deep-core imports', () => {
		const out = ensureVersionedCoreImports('const mod = import("http://localhost:5173/ns/core?p=utils/index.js");', 'http://localhost:5173', 3);

		expect(out).toBe('const mod = import("/ns/core/3?p=utils/index.js");');
	});
});

describe('buildVersionedCoreMainBridgeModule', () => {
	it('resolves through NativeScript module APIs and emits explicit named exports when known', () => {
		const out = buildVersionedCoreMainBridgeModule('@nativescript/core', 7, ['View', 'Page', 'ViewBase']);

		expect(out).toContain("g.moduleExists === 'function'");
		expect(out).toContain("g.loadModule === 'function'");
		expect(out).toContain('g.__nsVendorRequire || g.__nsRequire || g.require');
		expect(out).toContain('@nativescript/core/application');
		expect(out).toContain('@nativescript/core/ui');
		expect(out).toContain('const View = __getCoreExport("View");');
		expect(out).toContain('const Page = __getCoreExport("Page");');
		expect(out).toContain('const ViewBase = __getCoreExport("ViewBase");');
		expect(out).toContain('export { View, Page, ViewBase };');
		expect(out).toContain('export default __core;');
	});

	it('preserves namespace modules that expose both default and named exports', async () => {
		const originalModuleExists = (globalThis as any).moduleExists;
		const originalLoadModule = (globalThis as any).loadModule;
		const originalVendorRequire = (globalThis as any).__nsVendorRequire;
		const originalNsRequire = (globalThis as any).__nsRequire;
		const originalRequire = (globalThis as any).require;
		const originalNativeRequire = (globalThis as any).__nativeRequire;
		const traceApi = { isEnabled: () => true };
		const viewCtor = class View {};

		try {
			(globalThis as any).moduleExists = (moduleId: string) => moduleId === '@nativescript/core' || moduleId === '@nativescript/core/ui';
			(globalThis as any).loadModule = (moduleId: string) => {
				if (moduleId === '@nativescript/core') {
					return { __esModule: true, default: { View: viewCtor }, View: viewCtor, Trace: traceApi };
				}
				if (moduleId === '@nativescript/core/ui') {
					return { View: viewCtor };
				}
				return null;
			};
			delete (globalThis as any).__nsVendorRequire;
			delete (globalThis as any).__nsRequire;
			delete (globalThis as any).require;
			delete (globalThis as any).__nativeRequire;

			const bridgeCode = buildVersionedCoreMainBridgeModule('@nativescript/core', 7, ['Trace', 'View']);
			const encoded = Buffer.from(bridgeCode, 'utf8').toString('base64');
			const mod = await import(`data:text/javascript;base64,${encoded}#ns-core-bridge-trace`);

			expect(mod.Trace).toBe(traceApi);
			expect(mod.View).toBe(viewCtor);
			expect(mod.default.Trace).toBe(traceApi);
			expect(mod.default.View).toBe(viewCtor);
		} finally {
			(globalThis as any).moduleExists = originalModuleExists;
			(globalThis as any).loadModule = originalLoadModule;
			(globalThis as any).__nsVendorRequire = originalVendorRequire;
			(globalThis as any).__nsRequire = originalNsRequire;
			(globalThis as any).require = originalRequire;
			(globalThis as any).__nativeRequire = originalNativeRequire;
		}
	});

	it('falls back to export-origin modules for root-core symbols missing on the primary module', async () => {
		const originalModuleExists = (globalThis as any).moduleExists;
		const originalLoadModule = (globalThis as any).loadModule;
		const originalVendorRequire = (globalThis as any).__nsVendorRequire;
		const originalNsRequire = (globalThis as any).__nsRequire;
		const originalRequire = (globalThis as any).require;
		const originalNativeRequire = (globalThis as any).__nativeRequire;
		const traceApi = { isEnabled: () => true };

		try {
			(globalThis as any).moduleExists = (moduleId: string) => moduleId === '@nativescript/core' || moduleId === '@nativescript/core/trace';
			(globalThis as any).loadModule = (moduleId: string) => {
				if (moduleId === '@nativescript/core') {
					return { __esModule: true, default: {} };
				}
				if (moduleId === '@nativescript/core/trace') {
					return { Trace: traceApi };
				}
				return null;
			};
			delete (globalThis as any).__nsVendorRequire;
			delete (globalThis as any).__nsRequire;
			delete (globalThis as any).require;
			delete (globalThis as any).__nativeRequire;

			const bridgeCode = buildVersionedCoreMainBridgeModule('@nativescript/core', 7, ['Trace'], {
				Trace: [{ moduleId: '@nativescript/core/trace', mode: 'named', importedName: 'Trace' }],
			});
			const encoded = Buffer.from(bridgeCode, 'utf8').toString('base64');
			const mod = await import(`data:text/javascript;base64,${encoded}#ns-core-bridge-trace-origin`);

			expect(mod.Trace).toBe(traceApi);
			expect(mod.default.Trace).toBe(traceApi);
		} finally {
			(globalThis as any).moduleExists = originalModuleExists;
			(globalThis as any).loadModule = originalLoadModule;
			(globalThis as any).__nsVendorRequire = originalVendorRequire;
			(globalThis as any).__nsRequire = originalNsRequire;
			(globalThis as any).require = originalRequire;
			(globalThis as any).__nativeRequire = originalNativeRequire;
		}
	});

	it('emits static canonical deep-core imports when export origins provide canonical subpaths', () => {
		const out = buildVersionedCoreMainBridgeModule('@nativescript/core', 7, ['Trace', 'Utils'], {
			Trace: [{ moduleId: '@nativescript/core/trace', mode: 'named', importedName: 'Trace', canonicalSubpath: 'trace/index.js' }],
			Utils: [{ moduleId: '@nativescript/core/utils', mode: 'module', canonicalSubpath: 'utils/index.js' }],
		});

		expect(out).toContain('import * as __ns_core_origin_0 from "/ns/core/7?p=trace/index.js";');
		expect(out).toContain('import * as __ns_core_origin_1 from "/ns/core/7?p=utils/index.js";');
		expect(out).toContain('const __nsCoreOriginModules = { "trace/index.js": __ns_core_origin_0, "utils/index.js": __ns_core_origin_1 };');
	});
});

describe('collectStaticExportNamesFromFile', () => {
	it('collects relative star exports and export-star-as names from the core entry file', () => {
		const names = collectStaticExportNamesFromFile(path.resolve(process.cwd(), 'packages/core/index.ts'));

		expect(names).toContain('Trace');
		expect(names).toContain('View');
		expect(names).toContain('ApplicationSettings');
		expect(names).toContain('Utils');
	});
});

describe('collectStaticExportOriginsFromFile', () => {
	it('tracks the source module for re-exported root-core symbols', () => {
		const origins = collectStaticExportOriginsFromFile(path.resolve(process.cwd(), 'packages/core/index.ts'));

		expect(origins.Trace).toEqual(expect.arrayContaining([expect.objectContaining({ moduleId: '@nativescript/core/trace', mode: 'named', importedName: 'Trace', canonicalSubpath: 'trace/index.js' })]));
		expect(origins.Utils).toEqual(expect.arrayContaining([expect.objectContaining({ moduleId: '@nativescript/core/utils', mode: 'module', canonicalSubpath: 'utils/index.js' })]));
		expect(origins.View).toEqual(expect.arrayContaining([expect.objectContaining({ moduleId: '@nativescript/core/ui', mode: 'named', importedName: 'View', canonicalSubpath: 'ui/index.js' })]));
	});
});

describe('normalizeCoreExportOriginsForRuntime', () => {
	it('upgrades generic index.js core origins to platform-resolved runtime files', async () => {
		const rootModulePath = path.resolve(process.cwd(), 'packages/core/index.js');
		const normalized = await normalizeCoreExportOriginsForRuntime(
			{
				ApplicationSettings: [{ moduleId: '@nativescript/core/application-settings', mode: 'module', canonicalSubpath: 'application-settings/index.js' }],
				Frame: [{ moduleId: '@nativescript/core/ui/frame', mode: 'named', importedName: 'Frame', canonicalSubpath: 'ui/frame/index.js' }],
			},
			async (moduleId: string) => {
				if (moduleId === '@nativescript/core/application-settings') {
					return path.resolve(process.cwd(), 'packages/core/application-settings/index.ios.js');
				}
				if (moduleId === '@nativescript/core/ui/frame') {
					return path.resolve(process.cwd(), 'packages/core/ui/frame/index.ios.js');
				}
				return null;
			},
			rootModulePath,
		);

		expect(normalized.ApplicationSettings).toEqual([expect.objectContaining({ canonicalSubpath: 'application-settings/index.ios.js' })]);
		expect(normalized.Frame).toEqual([expect.objectContaining({ canonicalSubpath: 'ui/frame/index.ios.js' })]);
	});
});
