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

export interface NsRuntimeDevSessionConfig extends NsDevSessionDescriptor {}

export interface NsStyleUpdatePayload {
	url: string;
	cssText: string;
}

export interface NsHotUpdateInvalidatePayload {
	urls: string[];
	updatedAt?: number;
}

export interface NsRuntimeImportMap {
	imports: Record<string, string>;
}

export interface NsRuntimeConfigurePayload {
	importMap: NsRuntimeImportMap;
	volatilePatterns?: string[];
}

export interface NsRuntimeDevHostApi {
	configureRuntime?: (config: NsRuntimeConfigurePayload) => void;
	supportsRuntimeConfigUrl: boolean;
	startDevSession: (config: NsRuntimeDevSessionConfig) => Promise<void>;
	invalidateModules?: (urls: string[]) => void;
	reloadDevApp?: () => Promise<void>;
	applyStyleUpdate?: (payload: NsStyleUpdatePayload) => void;
	getLoadedModuleUrls?: () => string[];
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

export function readNsRuntimeDevHostApi(target: Partial<typeof globalThis> = globalThis): NsRuntimeDevHostApi {
	return {
		configureRuntime: target.__nsConfigureDevRuntime ?? target.__nsConfigureRuntime,
		supportsRuntimeConfigUrl: target.__nsSupportsRuntimeConfigUrl === true,
		startDevSession: target.__nsStartDevSession,
		invalidateModules: target.__nsInvalidateModules,
		reloadDevApp: target.__nsReloadDevApp,
		applyStyleUpdate: target.__nsApplyStyleUpdate,
		getLoadedModuleUrls: target.__nsGetLoadedModuleUrls,
	};
}

declare global {
	var __nsConfigureDevRuntime: ((config: NsRuntimeConfigurePayload) => void) | undefined;
	var __nsConfigureRuntime: ((config: NsRuntimeConfigurePayload) => void) | undefined;
	var __nsSupportsRuntimeConfigUrl: boolean | undefined;
	var __nsStartDevSession: ((config: NsRuntimeDevSessionConfig) => Promise<void>) | undefined;
	var __nsInvalidateModules: ((urls: string[]) => void) | undefined;
	var __nsReloadDevApp: (() => Promise<void>) | undefined;
	var __nsApplyStyleUpdate: ((payload: NsStyleUpdatePayload) => void) | undefined;
	var __nsGetLoadedModuleUrls: (() => string[]) | undefined;
}

export {};
