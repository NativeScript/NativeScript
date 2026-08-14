export type NsDevPlatform = 'ios' | 'android' | 'visionos';

export type NsHostModuleId = `ns-host://${string}`;

export const NS_HOST_RUNTIME_MODULE_ID = 'ns-host://runtime' as const;
export const NS_HOST_STYLE_ADAPTER_MODULE_ID = 'ns-host://style-adapter' as const;
export const NS_DEFAULT_HOST_MODULES = [NS_HOST_RUNTIME_MODULE_ID, NS_HOST_STYLE_ADAPTER_MODULE_ID] as const satisfies readonly NsHostModuleId[];

export const NS_DEV_SESSION_REQUIRED_FIELDS = ['sessionId', 'origin', 'entryUrl', 'clientUrl', 'wsUrl', 'platform'] as const;

export interface NsDevFeatureFlags {
	fullReload?: boolean;
	cssHmr?: boolean;
	errorOverlay?: boolean;
	styleScopeHmr?: boolean;
}

export const NS_DEFAULT_DEV_FEATURE_FLAGS: Readonly<Required<Pick<NsDevFeatureFlags, 'fullReload' | 'cssHmr'>>> = {
	fullReload: true,
	cssHmr: true,
};

export interface NsDevSessionDescriptor {
	sessionId: string;
	origin: string;
	entryUrl: string;
	clientUrl: string;
	wsUrl: string;
	platform: NsDevPlatform;
	runtimeConfigUrl?: string;
	hostModules?: NsHostModuleId[];
	features?: NsDevFeatureFlags;
}

export interface NsRuntimeImportMap {
	imports: Record<string, string>;
}

/**
 * The URL vocabulary the runtime's canonical-key function applies when
 * keying its module registry. The *mechanism* (fragment strip, cache-buster
 * param drop, param sort) is native because it runs inside the engine's
 * synchronous resolve walk; this vocabulary is server policy and lives here,
 * next to the server code that defines the routes it names.
 */
export interface NsRuntimeCanonicalizationConfig {
	/** Query param names that are pure cache busters and are dropped for dev endpoints (e.g. `t`, `v`, `import`). */
	stripParams?: string[];
	/** Path prefixes (StartsWith) identifying dev endpoints whose query may be normalized (e.g. `/ns/`, `/@id/`). */
	forPathPrefixes?: string[];
	/** Path substrings whose query IS the module identity and must be preserved verbatim (e.g. `/@ng/component`). */
	preserveQueryFor?: string[];
}

export interface NsRuntimeConfigurePayload {
	importMap: NsRuntimeImportMap;
	volatilePatterns?: string[];
	canonicalization?: NsRuntimeCanonicalizationConfig;
}

/**
 * The native dev-host contract — mechanism only. The runtime exposes its
 * mechanism primitives as the `ns:module` builtin module (reachable via
 * `require("ns:module")`, `import ... from "ns:module"` and
 * `import("ns:module")` — see the iOS runtime's docs/ns-builtin-modules.md);
 * every policy concern (boot orchestration, import.meta.hot, full reload,
 * CSS apply, worker teardown, WebSocket protocol) lives in JS inside
 * @nativescript/vite. Worker teardown in particular is fully userland: the
 * session bootstrap intercepts the global `Worker` constructor and the
 * client sweeps tracked instances before framework reboots
 * (`worker.terminate()` cascades to nested workers natively).
 *
 * Every member is optional: a non-dev environment (or a test) may expose
 * none or only some of them, and callers degrade gracefully. Missing
 * members are absent — never present-but-throwing — so feature checks work.
 */
export interface NsRuntimeDevHostApi {
	/** `configureLoader` — import map + volatile URL patterns + canonicalization vocabulary for the sync resolver. */
	configureLoader?: (config: NsRuntimeConfigurePayload) => void;
	/** `invalidateModules` — registry eviction + bust-next-fetch nonce. */
	invalidateModules?: (urls: string[]) => void;
	/** `getLoadedModuleUrls` — registry introspection for JS-driven full reload. */
	getLoadedModuleUrls?: () => string[];
	/** `setDevBootComplete` — flips the native cold-boot gate + `__NS_HMR_BOOT_COMPLETE__`. */
	setDevBootComplete?: (value?: boolean) => void;
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}

export function isNsDevPlatform(value: unknown): value is NsDevPlatform {
	return value === 'ios' || value === 'android' || value === 'visionos';
}

export function assertNsDevSessionDescriptor(session: unknown): asserts session is NsDevSessionDescriptor {
	if (!session || typeof session !== 'object') {
		throw new Error('Invalid NativeScript dev session descriptor');
	}

	const candidate = session as Record<string, unknown>;
	for (const key of NS_DEV_SESSION_REQUIRED_FIELDS) {
		if (!isNonEmptyString(candidate[key])) {
			throw new Error(`Missing dev session field: ${key}`);
		}
	}

	if (!isNsDevPlatform(candidate.platform)) {
		throw new Error(`Invalid dev session platform: ${String(candidate.platform)}`);
	}

	if (candidate.hostModules != null) {
		if (!Array.isArray(candidate.hostModules) || candidate.hostModules.some((value) => !isNonEmptyString(value) || !String(value).startsWith('ns-host://'))) {
			throw new Error('Invalid dev session hostModules');
		}
	}

	if (candidate.runtimeConfigUrl != null && !isNonEmptyString(candidate.runtimeConfigUrl)) {
		throw new Error('Invalid dev session runtimeConfigUrl');
	}

	if (candidate.features != null) {
		if (typeof candidate.features !== 'object') {
			throw new Error('Invalid dev session features');
		}
	}
}

/**
 * Resolve the dev host API from the `ns:module` builtin module via the
 * runtime's global CJS `require` (installed on the global object by
 * ModuleInternal). Always read through this function rather than requiring
 * the builtin directly so every consumer resolves the contract identically —
 * and degrades to an empty surface off-device (tests, non-NativeScript
 * environments, runtimes without the builtin).
 */
export function readNsRuntimeDevHostApi(target: Partial<typeof globalThis> = globalThis): NsRuntimeDevHostApi {
	const requireFn = (target as { require?: (specifier: string) => unknown }).require;
	if (typeof requireFn !== 'function') {
		return {};
	}
	try {
		const api = requireFn('ns:module');
		return api && typeof api === 'object' ? (api as NsRuntimeDevHostApi) : {};
	} catch {
		// No such built-in module — a runtime predating ns:module or a
		// host whose require doesn't know the scheme.
		return {};
	}
}

export {};
