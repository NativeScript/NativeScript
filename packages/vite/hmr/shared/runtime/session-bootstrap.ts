import { assertNsDevSessionDescriptor, readNsRuntimeDevHostApi, type NsDevSessionDescriptor, type NsRuntimeDevHostApi } from './browser-runtime-contract.js';
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

function getRuntimeConfigUrl(session: NsDevSessionDescriptor) {
	if (typeof session.runtimeConfigUrl === 'string' && session.runtimeConfigUrl) {
		return session.runtimeConfigUrl;
	}

	return `${session.origin.replace(/\/$/, '')}/ns/import-map.json`;
}

function isNativeRuntimeConfigDelegationEnabled() {
	try {
		return (globalThis as any).__NS_EXPERIMENTAL_NATIVE_RUNTIME_CONFIG_URL__ === true;
	} catch {
		return false;
	}
}

async function configureRuntimeImportMap(runtimeConfigUrl: string, runtimeApi: NsRuntimeDevHostApi, verbose?: boolean) {
	if (typeof runtimeApi.configureRuntime !== 'function') {
		if (verbose) {
			console.info('[ns-entry] runtime configure hook unavailable; skipping import map bootstrap');
		}
		return;
	}

	setHmrBootStage('configuring-import-map', {
		detail: runtimeConfigUrl,
	});

	const response = await fetch(runtimeConfigUrl);
	if (!response.ok) {
		throw new Error(`NativeScript import map fetch failed: ${response.status}`);
	}

	const config = await response.json();
	if (!config || typeof config !== 'object' || !config.importMap || typeof config.importMap !== 'object') {
		throw new Error('Invalid NativeScript import map payload');
	}

	runtimeApi.configureRuntime({
		importMap: config.importMap,
		volatilePatterns: Array.isArray(config.volatilePatterns) ? config.volatilePatterns : [],
	});

	if (verbose) {
		console.info('[ns-entry] import map configured', {
			entries: Object.keys(config.importMap?.imports || {}).length,
			importMapUrl: runtimeConfigUrl,
		});
	}
}

async function prepareRuntimeForSession(session: NsDevSessionDescriptor, runtimeApi: NsRuntimeDevHostApi, verbose?: boolean) {
	if (session.runtimeConfigUrl && runtimeApi.supportsRuntimeConfigUrl && isNativeRuntimeConfigDelegationEnabled()) {
		if (verbose) {
			console.info('[ns-entry] runtime config delegated to native session start', {
				runtimeConfigUrl: session.runtimeConfigUrl,
			});
		}
		return;
	}

	await configureRuntimeImportMap(getRuntimeConfigUrl(session), runtimeApi, verbose);
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
		assertNsDevSessionDescriptor(session);

		if (verbose) {
			console.info('[ns-entry] browser runtime session descriptor received', {
				sessionId: session.sessionId,
				origin: session.origin,
				clientUrl: session.clientUrl,
				entryUrl: session.entryUrl,
				wsUrl: session.wsUrl,
			});
		}

		const runtimeApi = readNsRuntimeDevHostApi(globalThis);
		if (typeof runtimeApi.startDevSession !== 'function') {
			throw new Error('__nsStartDevSession is unavailable in the NativeScript runtime');
		}

		await prepareRuntimeForSession(session, runtimeApi, verbose);

		setHmrBootStage('loading-entry-runtime', {
			detail: session.clientUrl,
		});

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
		await runtimeApi.startDevSession(session);
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
