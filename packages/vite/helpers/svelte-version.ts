import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getProjectRootPath } from './project.js';

/**
 * Version of the `svelte` package the project itself resolves.
 * @param projectRoot Directory resolution starts from; hoisted workspace copies are found too.
 * @returns The installed version string, or null when svelte is not installed.
 */
export function getProjectSvelteVersion(projectRoot: string = getProjectRootPath()): string | null {
	let manifestPath: string;
	try {
		manifestPath = createRequire(path.join(projectRoot, 'package.json')).resolve('svelte/package.json');
	} catch {
		return null;
	}
	try {
		const version = JSON.parse(readFileSync(manifestPath, 'utf8'))?.version;
		return typeof version === 'string' && version ? version : null;
	} catch {
		return null;
	}
}

/**
 * Major version number of a semver string.
 * @param version A version such as `5.59.0` or `4.2.19`.
 * @returns The major number, or null when it cannot be parsed.
 */
export function getMajorVersion(version: string): number | null {
	const major = Number.parseInt(version, 10);
	return Number.isFinite(major) ? major : null;
}
