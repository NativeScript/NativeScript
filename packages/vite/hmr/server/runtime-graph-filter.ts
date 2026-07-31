export function normalizeRuntimeGraphPath(value: string): string {
	return String(value || '')
		.replace(/\\/g, '/')
		.replace(/[?#].*$/, '');
}

export function isRuntimeGraphExcludedPath(value: string): boolean {
	const normalized = normalizeRuntimeGraphPath(value);
	// Tests/mocks, and TypeScript declaration files (`.d.ts`/`.d.mts`/`.d.cts`):
	// declarations are types-only and transpile to nothing, but they match the
	// `.ts` runtime file patterns — letting one into the graph gets it served
	// and boot-prefetched as a phantom module, and any `export * from` inside
	// (common in hand-written ambient-module shims) sends the star-export
	// expander chasing types-only targets it can never resolve
	// (`[ns/m][export*] incomplete star-export expansion …`).
	return /(?:^|\/)(?:__tests__|__mocks__)(?:\/|$)|(?:^|\/)[^/]+\.(?:spec|test)\.[^/]+$|\.d\.(?:ts|mts|cts)$/i.test(normalized);
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
