declare const __NS_ENV_VERBOSE__: boolean | undefined;
declare const __NS_APP_ROOT_VIRTUAL__: string | undefined;

type GetCoreFn = (name: string) => any;

export function installAngularHmrClientHooks(): void {
	const g: any = globalThis;
	if (g.__NS_ANGULAR_HMR_CLIENT_INSTALLED__) {
		return;
	}
	try {
		g.__NS_ANGULAR_HMR_CLIENT_INSTALLED__ = true;
		if (__NS_ENV_VERBOSE__) {
			console.log('[hmr-angular] client hooks installed');
		}
	} catch {}
}

interface AngularUpdateOptions {
	getCore: GetCoreFn;
	verbose: boolean;
}

function getAngularBootstrapEntryCandidates(msg: any): string[] {
	const root = typeof __NS_APP_ROOT_VIRTUAL__ === 'string' && __NS_APP_ROOT_VIRTUAL__ ? __NS_APP_ROOT_VIRTUAL__ : '/src';
	const rawCandidates = Array.isArray(msg?.entryCandidates) && msg.entryCandidates.length ? msg.entryCandidates : [`${root}/main.ts`, `${root}/app.ts`];
	return rawCandidates.filter((entry): entry is string => typeof entry === 'string' && entry.startsWith('/'));
}

async function importAngularBootstrapEntry(url: string): Promise<unknown> {
	const g: any = globalThis;
	if (typeof g.__NS_HMR_IMPORT__ === 'function') {
		return g.__NS_HMR_IMPORT__(url);
	}
	return import(/* @vite-ignore */ url);
}

export async function refreshAngularBootstrapOptions(msg: any, options: AngularUpdateOptions): Promise<void> {
	const g: any = globalThis;
	if (typeof g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ !== 'function') {
		return;
	}

	const version = typeof msg?.version === 'number' ? msg.version : 0;
	if (!version) {
		return;
	}

	const originSource = typeof msg?.origin === 'string' && /^https?:\/\//.test(msg.origin) ? msg.origin : g.__NS_HTTP_ORIGIN__;
	if (typeof originSource !== 'string' || !/^https?:\/\//.test(originSource)) {
		return;
	}

	const origin = originSource.replace(/\/$/, '');
	let lastError: unknown;

	for (const entry of getAngularBootstrapEntryCandidates(msg)) {
		const url = `${origin}/ns/m/__ns_hmr__/v${version}${entry}`;
		try {
			g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = true;
			await importAngularBootstrapEntry(url);
			return;
		} catch (error) {
			lastError = error;
		} finally {
			g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = false;
		}
	}

	if (options.verbose && __NS_ENV_VERBOSE__ && lastError) {
		try {
			console.warn('[hmr-angular] failed to refresh Angular bootstrap entry', (lastError as any)?.message || lastError);
		} catch {}
	}
}

export async function handleAngularHotUpdateMessage(msg: any, options: AngularUpdateOptions): Promise<boolean> {
	if (!msg || msg.type !== 'ns:angular-update') {
		return false;
	}
	try {
		const g: any = globalThis;

		// Prefer __reboot_ng_modules__ — it properly disposes existing modules,
		// re-bootstraps Angular inside NgZone, and sets the root view internally.
		// __NS_ANGULAR_BOOTSTRAP__ is exposed as a secondary signal that the
		// Angular HMR system is ready, but __reboot_ng_modules__ is the
		// canonical reboot entry point.
		const reboot = g.__reboot_ng_modules__;
		if (typeof reboot === 'function') {
			if (options.verbose && __NS_ENV_VERBOSE__) {
				console.log('[hmr-angular] rebooting Angular modules via __reboot_ng_modules__');
			}
			await refreshAngularBootstrapOptions(msg, options);
			try {
				g.__NS_HMR_IMPORT_NONCE__ = (typeof g.__NS_HMR_IMPORT_NONCE__ === 'number' ? g.__NS_HMR_IMPORT_NONCE__ : 0) + 1;
			} catch {}
			try {
				g.__NS_DEV_RESET_IN_PROGRESS__ = true;
			} catch {}
			try {
				reboot(true);
			} finally {
				try {
					g.__NS_DEV_RESET_IN_PROGRESS__ = false;
				} catch {}
			}
			return true;
		}

		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.warn('[hmr-angular] No Angular HMR handler found. Ensure runNativeScriptAngularApp() has been called.');
		}
	} catch (error) {
		if (options.verbose) {
			try {
				console.warn('[hmr-angular] failed to handle update', (error && (error as any).message) || error);
			} catch {}
		}
	}
	return true;
}
