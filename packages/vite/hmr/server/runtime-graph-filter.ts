export function normalizeRuntimeGraphPath(value: string): string {
	return String(value || '')
		.replace(/\\/g, '/')
		.replace(/[?#].*$/, '');
}

export function isRuntimeGraphExcludedPath(value: string): boolean {
	const normalized = normalizeRuntimeGraphPath(value);
	return /(?:^|\/)(?:__tests__|__mocks__)(?:\/|$)|(?:^|\/)[^/]+\.(?:spec|test)\.[^/]+$/i.test(normalized);
}

export function shouldSkipRuntimeGraphDirectoryName(name: string): boolean {
	return name === '__tests__' || name === '__mocks__';
}

export function shouldIncludeRuntimeGraphFile(value: string, filePattern: RegExp): boolean {
	const normalized = normalizeRuntimeGraphPath(value);
	return filePattern.test(normalized) && !isRuntimeGraphExcludedPath(normalized);
}

export function matchesRuntimeGraphModuleId(value: string, appPrefix: string, filePattern: RegExp): boolean {
	const normalized = normalizeRuntimeGraphPath(value);
	return normalized.startsWith(appPrefix) && filePattern.test(normalized) && !isRuntimeGraphExcludedPath(normalized);
}
