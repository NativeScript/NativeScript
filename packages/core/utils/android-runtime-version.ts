const semverPattern = /^(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

/**
 * Whether a `major.minor.patch[-prerelease]` version string is at or above the given release.
 * Prereleases of the release itself are lower than it, as in semver.
 * @param version Version to test; anything that is not a parsable version string yields false.
 * @returns True only for a parsable version at or above `major.minor.patch`.
 */
export function isVersionAtLeast(version: unknown, major: number, minor: number, patch: number): boolean {
	if (typeof version !== 'string') {
		return false;
	}
	const match = semverPattern.exec(version);
	if (!match) {
		return false;
	}
	const parts = [Number(match[1]), Number(match[2]), Number(match[3])];
	const target = [major, minor, patch];
	for (let i = 0; i < parts.length; i++) {
		if (parts[i] !== target[i]) {
			return parts[i] > target[i];
		}
	}

	return match[4] === undefined;
}

let typedArrayToByteArray: boolean | undefined;

/**
 * Whether the Android runtime copies a typed array passed to a Java `byte[]` parameter.
 * Older runtimes mis-pass it, so this is gated on the version rather than probed.
 */
export function runtimeCopiesTypedArraysToByteArrays(): boolean {
	if (typedArrayToByteArray === undefined) {
		typedArrayToByteArray = isVersionAtLeast((global as any).__runtimeVersion, 9, 1, 2);
	}

	return typedArrayToByteArray;
}
