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
		const App = options.getCore('Application') || g.Application;
		const bootstrap = g.__NS_ANGULAR_BOOTSTRAP__;
		if (typeof App?.resetRootView === 'function' && typeof bootstrap === 'function') {
			if (options.verbose && __NS_ENV_VERBOSE__) {
				console.log('[hmr-angular] resetting root view via captured bootstrap');
			}
			try {
				g.__NS_DEV_RESET_IN_PROGRESS__ = true;
			} catch {}
			App.resetRootView({
				create: () => {
					try {
						return bootstrap();
					} finally {
						try {
							g.__NS_DEV_RESET_IN_PROGRESS__ = false;
						} catch {}
					}
				},
			});
			return true;
		}
		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.warn('[hmr-angular] Missing global __NS_ANGULAR_BOOTSTRAP__ factory. Set it in your main.ts to enable HMR resets.');
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
