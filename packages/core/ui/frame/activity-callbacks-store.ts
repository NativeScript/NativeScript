import type { AndroidActivityCallbacks } from './frame-interfaces';

// Embedded host activities are plain Java objects with no JS owner.
const callbacksByActivity = new WeakMap<object, AndroidActivityCallbacks>();
const activitiesWithBackPressedCallback = new WeakSet<object>();
// Keeps a plain activity's wrapper, and so its entries, alive until onDestroy.
const pinnedActivities = new Set<object>();

export function getActivityCallbacks(activity: object): AndroidActivityCallbacks | undefined {
	return activity ? callbacksByActivity.get(activity) : undefined;
}

export function isNativeScriptActivity(activity: object): boolean {
	return !!activity && callbacksByActivity.has(activity);
}

export function _registerActivityCallbacks(activity: object, callbacks: AndroidActivityCallbacks): void {
	callbacksByActivity.set(activity, callbacks);
}

export function _pinActivity(activity: object): void {
	pinnedActivities.add(activity);
}

export function _unpinActivity(activity: object): void {
	pinnedActivities.delete(activity);
}

export function _hasBackPressedCallback(activity: object): boolean {
	return activitiesWithBackPressedCallback.has(activity);
}

export function _markBackPressedCallback(activity: object): void {
	activitiesWithBackPressedCallback.add(activity);
}
