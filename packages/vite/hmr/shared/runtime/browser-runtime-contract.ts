/* eslint-disable no-var -- ambient global declarations below must use `var`: only `var`
   in `declare global` registers the property on `typeof globalThis`. */
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

export interface NsRuntimeConfigurePayload {
	importMap: NsRuntimeImportMap;
	volatilePatterns?: string[];
}

export interface NsKickstartPrefetchOptions {
	maxConcurrent?: number;
	timeoutMs?: number;
}

export interface NsKickstartPrefetchResult {
	ok: boolean;
	fetched: number;
	ms: number;
}

/**
 * The native dev-host contract — mechanism only. The runtime exposes six
 * primitives on the single `globalThis.__NS_DEV__` namespace object; every
 * policy concern (boot orchestration, import.meta.hot, full reload, CSS
 * apply, WebSocket protocol) lives in JS inside @nativescript/vite.
 *
 * Every member is optional: a non-dev environment (or a test) may expose
 * none or only some of them, and callers degrade gracefully.
 */
export interface NsRuntimeDevHostApi {
	/** `__NS_DEV__.configureRuntime` — import map + volatile URL patterns for the sync resolver. */
	configureRuntime?: (config: NsRuntimeConfigurePayload) => void;
	/** `__NS_DEV__.invalidateModules` — dual-cache eviction (V8 registry + prefetch cache + bust-next-fetch nonce). */
	invalidateModules?: (urls: string[]) => void;
	/** `__NS_DEV__.getLoadedModuleUrls` — registry introspection for JS-driven full reload. */
	getLoadedModuleUrls?: () => string[];
	/** `__NS_DEV__.kickstartPrefetch(urls)` — parallel HTTP body prewarm for an explicit URL list. */
	kickstartPrefetch?: (urls: string[], options?: NsKickstartPrefetchOptions) => NsKickstartPrefetchResult | null;
	/** `__NS_DEV__.setDevBootComplete` — flips the native cold-boot gate + `__NS_HMR_BOOT_COMPLETE__`. */
	setDevBootComplete?: (value?: boolean) => void;
	/** `__NS_DEV__.terminateAllWorkers` — drains `Caches::Workers`; returns the count terminated (main isolate only). */
	terminateAllWorkers?: () => number;
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
 * Resolve the dev host API from `globalThis.__NS_DEV__` — the one namespace
 * object the runtime installs. Always read through this function rather than
 * poking at the global so every consumer resolves the contract identically.
 */
export function readNsRuntimeDevHostApi(target: Partial<typeof globalThis> = globalThis): NsRuntimeDevHostApi {
	return target.__NS_DEV__ ?? {};
}

declare global {
	/** The dev host namespace object the runtime installs (see NsRuntimeDevHostApi). */
	var __NS_DEV__: NsRuntimeDevHostApi | undefined;
}

export {};
