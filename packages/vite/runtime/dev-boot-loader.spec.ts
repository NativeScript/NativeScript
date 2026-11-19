import { afterEach, describe, expect, it, vi } from 'vitest';
import { bootFromDevServer } from './dev-boot-loader.js';

const OPTIONS = { origin: 'http://192.168.1.5:5173', bootUrl: 'http://192.168.1.5:5173/@id/__x00__virtual:ns-dev-boot' };

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	vi.useRealTimers();
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
		vi.stubGlobal('UIApplicationMain', UIApplicationMain);
		vi.stubGlobal(
			'UIResponder',
			Object.assign(function UIResponder() {}, { extend }),
		);
		vi.stubGlobal('UIWindowSceneDelegate', {});
		vi.stubGlobal('UIApplicationDelegate', {});
		vi.stubGlobal('NSBundle', { mainBundle: { objectForInfoDictionaryKey: () => null } });
		vi.stubGlobal('NSURLSessionConfiguration', { ephemeralSessionConfiguration: {} });
		vi.stubGlobal('NSURLSession', { sessionWithConfigurationDelegateDelegateQueue: () => ({ dataTaskWithURLCompletionHandler: () => ({ resume: taskResume }) }) });
		vi.stubGlobal('NSOperationQueue', { mainQueue: {} });
		vi.stubGlobal('NSURL', { URLWithString: (url: string) => url });

		await bootFromDevServer(OPTIONS, async (url) => (url === OPTIONS.bootUrl ? { bootFailure: { message: 'entry threw' } } : {}));

		expect(UIApplicationMain).toHaveBeenCalledWith(0, null, null, 'NSDevBootFallbackAppDelegate');
		expect(extend.mock.calls.map((c: any[]) => c[1].name)).toEqual(['NSDevBootFallbackSceneDelegate', 'NSDevBootFallbackAppDelegate']);
		// The failure is reported, so the dev server restarts the app on the fixing edit.
		expect(taskResume).toHaveBeenCalledOnce();
	});
});
