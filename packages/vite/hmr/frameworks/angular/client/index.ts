declare const __NS_ENV_VERBOSE__: boolean | undefined;

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

export function handleAngularHotUpdateMessage(msg: any, options: AngularUpdateOptions): boolean {
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
			try {
				g.__NS_DEV_RESET_IN_PROGRESS__ = true;
			} catch {}
			try {
				reboot(false);
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
