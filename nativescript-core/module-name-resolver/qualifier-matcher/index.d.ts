/**
 * Provides ModuleNameResolver class used for loading files based on device capabilities.
 */

/**
 * Used with qualifier matchers and module resolution
 */
export interface PlatformContext {
	width: number;
	height: number;
	os: string;
	deviceType: string;
}

export function findMatch(path: string, ext: string, candidates: Array<string>, context: PlatformContext): string;

export function stripQualifiers(path: string): string;
