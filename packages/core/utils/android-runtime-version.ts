const semverPattern = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

/**
 * Whether a `major.minor.patch[-prerelease]` version string is strictly greater than the given release.
 * @param version Version to test; anything that is not a parsable version string yields false.
 * @returns True only for a parsable version above `major.minor.patch`.
 */
export function isVersionGreaterThan(version: unknown, major: number, minor: number, patch: number): boolean {
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

	// Equal core version: the release is not greater, and its prereleases are lower.
	return false;
}

let typedArrayToByteArray: boolean | undefined;

/**
 * Whether the Android runtime copies a typed array passed to a Java `byte[]` parameter.
 * Older runtimes mis-pass it, so this is gated on the version rather than probed.
 */
export function runtimeCopiesTypedArraysToByteArrays(): boolean {
	if (typedArrayToByteArray === undefined) {
		typedArrayToByteArray = isVersionGreaterThan((global as any).__runtimeVersion, 9, 1, 2);
	}

	return typedArrayToByteArray;
}
