export const SDK_VERSION = parseFloat(UIDevice.currentDevice.systemVersion);
export function supportsGlass(): boolean {
	return __APPLE__ && SDK_VERSION >= 26;
}
