export type NsDevPlatform = 'ios' | 'android' | 'visionos';

export type NsHostModuleId = `ns-host://${string}`;

export interface NsDevFeatureFlags {
	fullReload?: boolean;
	cssHmr?: boolean;
	errorOverlay?: boolean;
	styleScopeHmr?: boolean;
}

export interface NsDevSessionDescriptor {
	sessionId: string;
	origin: string;
	entryUrl: string;
	clientUrl: string;
	wsUrl: string;
	platform: NsDevPlatform;
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

declare global {
	var __nsStartDevSession: ((config: NsRuntimeDevSessionConfig) => Promise<void>) | undefined;
	var __nsInvalidateModules: ((urls: string[]) => void) | undefined;
	var __nsReloadDevApp: (() => Promise<void>) | undefined;
	var __nsApplyStyleUpdate: ((payload: NsStyleUpdatePayload) => void) | undefined;
	var __nsGetLoadedModuleUrls: (() => string[]) | undefined;
}

export {};
