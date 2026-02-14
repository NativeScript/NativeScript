const version = NSProcessInfo.processInfo.operatingSystemVersion;

export const SDK_VERSION = parseFloat(`${version.majorVersion}.${version.minorVersion}`);

export function supportsGlass(): boolean {
	return __APPLE__ && SDK_VERSION >= 26;
}
