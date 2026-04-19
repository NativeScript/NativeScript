import type { NsDevSessionDescriptor } from './browser-runtime-contract.js';
import { ensureHmrDevOverlayRuntimeInstalled, setHmrBootStage } from './dev-overlay.js';

function describeError(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}

function getSessionUrl(defaultSessionUrl: string) {
	try {
		const origin = (globalThis as any).__NS_HTTP_ORIGIN__;
		if (typeof origin === 'string' && /^https?:\/\//.test(origin)) {
			return `${origin.replace(/\/$/, '')}/__ns_dev__/session`;
		}
	} catch {}

	return defaultSessionUrl;
}

function assertSessionDescriptor(session: any): asserts session is NsDevSessionDescriptor {
	if (!session || typeof session !== 'object') {
		throw new Error('Invalid NativeScript dev session descriptor');
	}

	const requiredKeys = ['sessionId', 'origin', 'entryUrl', 'clientUrl', 'wsUrl', 'platform'];
	for (const key of requiredKeys) {
		if (typeof session[key] !== 'string' || !session[key]) {
			throw new Error(`Missing dev session field: ${key}`);
		}
	}
}

async function configureRuntimeImportMap(origin: string, verbose?: boolean) {
	const configureRuntime = (globalThis as any).__nsConfigureRuntime;
	if (typeof configureRuntime !== 'function') {
		if (verbose) {
			console.info('[ns-entry] __nsConfigureRuntime unavailable; skipping import map bootstrap');
		}
		return;
	}

	const importMapUrl = `${origin.replace(/\/$/, '')}/ns/import-map.json`;
	setHmrBootStage('configuring-import-map', {
		detail: importMapUrl,
	});

	const response = await fetch(importMapUrl);
	if (!response.ok) {
		throw new Error(`NativeScript import map fetch failed: ${response.status}`);
	}

	const config = await response.json();
	if (!config || typeof config !== 'object' || !config.importMap || typeof config.importMap !== 'object') {
		throw new Error('Invalid NativeScript import map payload');
	}

	configureRuntime({
		importMap: config.importMap,
		volatilePatterns: Array.isArray(config.volatilePatterns) ? config.volatilePatterns : [],
	});

	if (verbose) {
		console.info('[ns-entry] import map configured', {
			entries: Object.keys(config.importMap?.imports || {}).length,
			importMapUrl,
		});
	}
}

export async function startBrowserRuntimeSession(defaultSessionUrl: string, verbose?: boolean) {
	ensureHmrDevOverlayRuntimeInstalled(verbose);
	const sessionUrl = getSessionUrl(defaultSessionUrl);
	setHmrBootStage('probing-origin', {
		detail: sessionUrl,
	});

	if (verbose) {
		console.info('[ns-entry] starting browser runtime session', { sessionUrl });
	}

	try {
		const response = await fetch(sessionUrl);
		if (!response.ok) {
			throw new Error(`NativeScript dev session fetch failed: ${response.status}`);
		}

		const session = (await response.json()) as NsDevSessionDescriptor;
		assertSessionDescriptor(session);

		if (verbose) {
			console.info('[ns-entry] browser runtime session descriptor received', {
				sessionId: session.sessionId,
				origin: session.origin,
				clientUrl: session.clientUrl,
				entryUrl: session.entryUrl,
				wsUrl: session.wsUrl,
			});
		}

		(globalThis as any).__NS_HTTP_ORIGIN__ = session.origin;
		(globalThis as any).__NS_HMR_WS_URL__ = session.wsUrl;
		(globalThis as any).__NS_HMR_BOOT_COMPLETE__ = false;

		await configureRuntimeImportMap(session.origin, verbose);

		setHmrBootStage('loading-entry-runtime', {
			detail: session.clientUrl,
		});

		const startDevSession = (globalThis as any).__nsStartDevSession;
		if (typeof startDevSession !== 'function') {
			throw new Error('__nsStartDevSession is unavailable in the NativeScript runtime');
		}

		setHmrBootStage('importing-main', {
			detail: session.entryUrl,
		});
		if (verbose) {
			console.info('[ns-entry] invoking __nsStartDevSession', {
				sessionId: session.sessionId,
				clientUrl: session.clientUrl,
				entryUrl: session.entryUrl,
			});
		}
		await startDevSession(session);
		setHmrBootStage('waiting-for-app', {
			detail: 'The deterministic NativeScript dev session is active. Waiting for the real app root to replace the boot placeholder.',
		});
		try {
			const restorePlaceholder = (globalThis as any).__NS_DEV_RESTORE_PLACEHOLDER__;
			if (typeof restorePlaceholder === 'function') {
				restorePlaceholder('session-active');
			}
		} catch {}
		if (verbose) {
			console.info('[ns-entry] browser runtime session active; waiting for real app root commit', {
				sessionId: session.sessionId,
				origin: session.origin,
				clientUrl: session.clientUrl,
				entryUrl: session.entryUrl,
			});
		}
	} catch (error) {
		setHmrBootStage('error', {
			detail: describeError(error),
		});
		if (verbose) {
			console.error('[ns-entry] browser runtime session failed', error instanceof Error && error.stack ? error.stack : error);
		}
		throw error;
	}
}
