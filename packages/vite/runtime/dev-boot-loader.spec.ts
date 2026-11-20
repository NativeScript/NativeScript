import fs from 'node:fs';
import { transformSync } from 'esbuild';
import { init, parse } from 'es-module-lexer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BOOT_FAILED_PATH, RESTART_PATH, bootFromDevServer } from './dev-boot-loader.js';
import { NS_DEV_BOOT_FAILED_PATH, NS_DEV_RESTART_PATH } from '../hmr/server/dev-routes.js';

const OPTIONS = { origin: 'http://192.168.1.5:5173', bootUrl: 'http://192.168.1.5:5173/@id/__x00__virtual:ns-dev-boot', token: 'a+b' };

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe('dev boot loader module', () => {
	it('imports nothing, so its compiled output is bundle.mjs without bundling', async () => {
		await init;
		const { code } = transformSync(fs.readFileSync(new URL('./dev-boot-loader.ts', import.meta.url), 'utf8'), { loader: 'ts', format: 'esm' });
		const [imports] = parse(code);
		expect(imports.filter((entry) => entry.d === -1)).toEqual([]);
	});

	it("names the dev server's routes", () => {
		expect(RESTART_PATH).toBe(NS_DEV_RESTART_PATH);
		expect(BOOT_FAILED_PATH).toBe(NS_DEV_BOOT_FAILED_PATH);
	});
});

describe('bootFromDevServer', () => {
	it('evaluates /@vite/env before the dev boot module', async () => {
		const imported: string[] = [];
		await bootFromDevServer(OPTIONS, async (url) => {
			imported.push(url);
			return {};
		});
		expect(imported).toEqual([`${OPTIONS.origin}/@vite/env`, OPTIONS.bootUrl]);
	});

	it('rethrows where it cannot launch a fallback screen (no UIKit)', async () => {
		await expect(bootFromDevServer(OPTIONS, async () => Promise.reject(new Error('HTTP import failed')))).rejects.toThrow('HTTP import failed');
		await expect(bootFromDevServer(OPTIONS, async (url) => (url === OPTIONS.bootUrl ? { bootFailure: { message: 'entry threw' } } : {}))).rejects.toThrow('entry threw');
	});

	it('launches the fallback app when the dev server is unreachable or the boot failed', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const UIApplicationMain = vi.fn();
		const extend = vi.fn(() => ({}));
		const taskResume = vi.fn();
		const requested: string[] = [];
		vi.stubGlobal('UIApplicationMain', UIApplicationMain);
		vi.stubGlobal(
			'UIResponder',
			Object.assign(function UIResponder() {}, { extend }),
		);
		vi.stubGlobal('UIWindowSceneDelegate', {});
		vi.stubGlobal('UIApplicationDelegate', {});
		vi.stubGlobal('NSBundle', { mainBundle: { objectForInfoDictionaryKey: () => null } });
		vi.stubGlobal('NSURLSessionConfiguration', { ephemeralSessionConfiguration: {} });
		vi.stubGlobal('NSURLSession', { sessionWithConfigurationDelegateDelegateQueue: () => ({ dataTaskWithURLCompletionHandler: (url: string) => (requested.push(url), { resume: taskResume }) }) });
		vi.stubGlobal('NSOperationQueue', { mainQueue: {} });
		vi.stubGlobal('NSURL', { URLWithString: (url: string) => url });

		await bootFromDevServer(OPTIONS, async (url) => (url === OPTIONS.bootUrl ? { bootFailure: { message: 'entry threw' } } : {}));

		expect(UIApplicationMain).toHaveBeenCalledWith(0, null, null, 'NSDevBootFallbackAppDelegate');
		expect(extend.mock.calls.map((c: any[]) => c[1].name)).toEqual(['NSDevBootFallbackSceneDelegate', 'NSDevBootFallbackAppDelegate']);
		// The failure is reported, so the dev server restarts the app on the fixing edit.
		expect(taskResume).toHaveBeenCalledOnce();
		expect(requested).toEqual([`${OPTIONS.origin}/__ns_dev__/boot-failed?reason=entry%20threw&token=a%2Bb`]);
	});

	it("polls the restart route with the loader's age and the token while the dev server is unreachable", async () => {
		vi.useFakeTimers({ now: 10_000 });
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const requested: string[] = [];
		vi.stubGlobal('UIApplicationMain', vi.fn());
		vi.stubGlobal(
			'UIResponder',
			Object.assign(function UIResponder() {}, { extend: vi.fn(() => ({})) }),
		);
		vi.stubGlobal('UIWindowSceneDelegate', {});
		vi.stubGlobal('UIApplicationDelegate', {});
		vi.stubGlobal('NSBundle', { mainBundle: { objectForInfoDictionaryKey: () => null } });
		vi.stubGlobal('NSURLSessionConfiguration', { ephemeralSessionConfiguration: {} });
		vi.stubGlobal('NSURLSession', { sessionWithConfigurationDelegateDelegateQueue: () => ({ dataTaskWithURLCompletionHandler: (url: string) => (requested.push(url), { resume: () => {} }) }) });
		vi.stubGlobal('NSOperationQueue', { mainQueue: {} });
		vi.stubGlobal('NSURL', { URLWithString: (url: string) => url });

		const boot = bootFromDevServer(OPTIONS, () => new Promise(() => {}));
		await vi.advanceTimersByTimeAsync(6000);
		await boot;
		await vi.advanceTimersByTimeAsync(2000);

		expect(requested).toEqual([`${OPTIONS.origin}/__ns_dev__/restart?reason=the%20dev%20server%20is%20reachable%20again&age=8000&token=a%2Bb`]);
	});

	describe('on Android', () => {
		function stubAndroid(connect: () => void) {
			const extend = vi.fn(() => ({}));
			const registerActivityLifecycleCallbacks = vi.fn();
			const Builder = function (this: any) {
				this.permitNetwork = () => this;
				this.build = () => ({});
			};
			vi.stubGlobal('android', {
				os: { StrictMode: { getThreadPolicy: () => ({}), setThreadPolicy: vi.fn(), ThreadPolicy: { Builder } } },
				app: {
					Application: {
						ActivityLifecycleCallbacks: function (impl: unknown) {
							return impl;
						},
					},
				},
			});
			vi.stubGlobal('androidx', { appcompat: { app: { AppCompatActivity: { prototype: { onCreate() {} }, extend } } } });
			vi.stubGlobal('java', {
				net: {
					Socket: function (this: any) {
						this.connect = connect;
						this.close = () => {};
					},
					InetSocketAddress: function () {},
				},
			});
			const app = {
				registerActivityLifecycleCallbacks,
				getPackageName: () => 'org.example',
				getPackageManager: () => ({ getLaunchIntentForPackage: () => ({ getComponent: () => ({ getClassName: () => 'org.example.MainActivity' }) }) }),
			};
			vi.stubGlobal('com', { tns: { NativeScriptApplication: { getInstance: () => app } } });
			return { extend, registerActivityLifecycleCallbacks };
		}

		// A fresh module: the fallback launches once per process.
		async function freshLoader(): Promise<typeof bootFromDevServer> {
			vi.resetModules();
			return (await import('./dev-boot-loader.js')).bootFromDevServer;
		}

		it('registers the launcher activities and reports the failure through the module loader instead of rethrowing', async () => {
			vi.spyOn(console, 'error').mockImplementation(() => {});
			const { extend, registerActivityLifecycleCallbacks } = stubAndroid(() => {});
			const imported: string[] = [];
			await (
				await freshLoader()
			)(OPTIONS, async (url) => {
				imported.push(url);
				return url === OPTIONS.bootUrl ? { bootFailure: { message: 'entry threw' } } : { default: { status: 200 } };
			});
			expect(extend.mock.calls.map((call: any[]) => call[0])).toEqual(['org.example.MainActivity', 'com.tns.NativeScriptActivity']);
			expect(registerActivityLifecycleCallbacks).toHaveBeenCalledOnce();
			expect(imported[2]).toMatch(new RegExp(`^${OPTIONS.origin}/__ns_dev__/boot-failed\\?reason=entry%20threw&token=a%2Bb&module=1&n=\\d+$`));
		});

		it('shows the unreachable screen without fetching when the port does not connect', async () => {
			vi.spyOn(console, 'error').mockImplementation(() => {});
			const { extend } = stubAndroid(() => {
				throw new Error('connect timed out');
			});
			const importModule = vi.fn(async () => ({}));
			await (
				await freshLoader()
			)(OPTIONS, importModule);
			expect(importModule).not.toHaveBeenCalled();
			expect(extend).toHaveBeenCalledTimes(2);
		});
	});
});
