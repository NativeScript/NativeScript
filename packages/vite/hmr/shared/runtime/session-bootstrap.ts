import { Application } from '@nativescript/core/application';
import { assertNsDevSessionDescriptor, type NsDevSessionDescriptor, type NsRuntimeConfigurePayload, type NsRuntimeDevHostApi } from './browser-runtime-contract.js';
import { loadNsRuntimeDevHostApi } from './runtime-host.js';
import { ensureHmrDevOverlayRuntimeInstalled } from './dev-overlay.js';
import { formatBootTimeline, type BootTrace } from './boot-timeline.js';
import { nsDev } from './dev-globals.js';

/** Where the dev boot module loads the session from; both are served as modules. */
export interface DevSessionUrls {
	sessionUrl: string;
	importMapUrl: string;
}

/** Why the dev boot failed before the app entry launched the app; `bundle.mjs` shows it. */
export interface DevBootFailure {
	message: string;
	stack?: string;
}

export interface BrowserRuntimeSessionDeps {
	importModule?: (url: string) => Promise<unknown>;
}

function describeError(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

function configureLoaderImportMap(config: NsRuntimeConfigurePayload, runtimeApi: NsRuntimeDevHostApi) {
	const configureLoader = runtimeApi.configureLoader;
	if (typeof configureLoader !== 'function') {
		// Not verbose-gated: without the import map every bare specifier the
		// device resolves at runtime fails, far from this cause.
		console.error('[ns-entry] ns:module configureLoader is unavailable — the import map cannot be installed and bare-specifier imports WILL fail. Update @nativescript/ios to a runtime that provides the ns:module builtin module.');
		return;
	}
	if (!config || typeof config !== 'object' || !config.importMap || typeof config.importMap !== 'object') {
		throw new Error('Invalid NativeScript import map payload');
	}
	configureLoader({
		importMap: config.importMap,
		volatilePatterns: Array.isArray(config.volatilePatterns) ? config.volatilePatterns : [],
		// The canonicalization vocabulary is server policy; runtimes that
		// predate the field ignore it.
		...(config.canonicalization && typeof config.canonicalization === 'object' ? { canonicalization: config.canonicalization } : {}),
	});
}

function stamp(verbose: boolean | undefined, phase: string): void {
	if (verbose) console.info(`[ns-entry] ${phase} t=${Date.now()}`);
}

// Boot completes once the app has launched. On iOS that is after
// `UIApplicationMain` took over, on Android `run` returns first: neither
// ordering is assumed. Returns a function that cancels it.
function completeBootOnLaunch(verbose?: boolean): () => void {
	const app: any = Application;
	let done = false;
	const complete = () => {
		if (done) return;
		done = true;
		setTimeout(() => {
			nsDev().bootComplete = true;
		}, 0);
	};
	if (typeof app.hasLaunched === 'function' && app.hasLaunched()) {
		complete();
		return () => {};
	}
	const onLaunch = () => {
		stamp(verbose, 'launch event');
		app.off(app.launchEvent, onLaunch);
		complete();
	};
	app.on(app.launchEvent, onLaunch);
	return () => app.off(app.launchEvent, onLaunch);
}

/**
 * Boots the dev session: loads the session descriptor and the loader config,
 * installs the import map, imports the dev client, then the app entry, whose
 * own `Application.run` launches the app as in release.
 *
 * Never rejects: a rejected main module is fatal on iOS, even after `run`.
 * Resolves the failure when the boot failed before the entry called `run`,
 * so the caller can launch something that shows it.
 */
export async function startBrowserRuntimeSession(urls: DevSessionUrls, verbose?: boolean, deps: BrowserRuntimeSessionDeps = {}): Promise<DevBootFailure | undefined> {
	const importModule = deps.importModule ?? ((url: string) => import(/* @vite-ignore */ url));
	ensureHmrDevOverlayRuntimeInstalled(verbose);
	const trace: BootTrace = { t0: Date.now() };
	stamp(verbose, 'session start');
	let cancelBootComplete = () => {};
	try {
		// Modules, not `fetch`: the local main module's settle window services
		// module fetches but not the run loop `fetch` completes on.
		const [sessionModule, configModule] = (await Promise.all([importModule(urls.sessionUrl), importModule(urls.importMapUrl)])) as [{ default: NsDevSessionDescriptor }, { default: NsRuntimeConfigurePayload }];
		const session = sessionModule.default;
		assertNsDevSessionDescriptor(session);
		trace.session = { ok: true, ms: Date.now() - trace.t0, meta: { sessionId: session.sessionId } };

		const tImap = Date.now();
		configureLoaderImportMap(configModule.default, await loadNsRuntimeDevHostApi());
		trace.importMap = { ok: true, ms: Date.now() - tImap };
		nsDev().httpOrigin = session.origin;
		stamp(verbose, 'session ready');

		const tBoot = Date.now();
		// The dev client goes first: it schedules the HMR client for after launch.
		await importModule(session.clientUrl);
		cancelBootComplete = completeBootOnLaunch(verbose);
		stamp(verbose, 'importing entry');
		await importModule(session.entryUrl);
		trace.entry = { ok: true, ms: Date.now() - tBoot };
		stamp(verbose, 'entry evaluated');
		return undefined;
	} catch (error) {
		trace.error = { message: describeError(error) };
		console.error('[ns-entry] dev boot failed', error instanceof Error && error.stack ? error.stack : error);
		// The entry already launched the app; it reports its own errors from here.
		if ((Application as any).started) return undefined;
		// The fallback screen launches the app without the entry: core's launch
		// event still fires, and an HMR client started then would apply updates
		// to an app that never booted.
		cancelBootComplete();
		return { message: describeError(error), stack: error instanceof Error ? error.stack : undefined };
	} finally {
		trace.t1 = Date.now();
		if (verbose) console.info(formatBootTimeline(trace));
	}
}
