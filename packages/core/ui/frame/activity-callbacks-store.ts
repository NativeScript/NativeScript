import type { AndroidActivityCallbacks } from './frame-interfaces';

// Keyed by the activity because embedded hosts are plain Java objects without a JS owner.
const callbacksByActivity = new WeakMap<object, AndroidActivityCallbacks>();
const activitiesWithBackPressedCallback = new WeakSet<object>();

export function getActivityCallbacks(activity: object): AndroidActivityCallbacks | undefined {
	return activity ? callbacksByActivity.get(activity) : undefined;
}

export function isNativeScriptActivity(activity: object): boolean {
	return !!activity && callbacksByActivity.has(activity);
}

export function _registerActivityCallbacks(activity: object, callbacks: AndroidActivityCallbacks): void {
	callbacksByActivity.set(activity, callbacks);
}

export function _hasBackPressedCallback(activity: object): boolean {
	return activitiesWithBackPressedCallback.has(activity);
}

export function _markBackPressedCallback(activity: object): void {
	activitiesWithBackPressedCallback.add(activity);
}
