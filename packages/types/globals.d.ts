/**
 * Ambient declarations for JavaScript globals provided natively by the
 * iOS and Android runtimes (ada-url based, see the runtime URLImpl and
 * URLSearchParamsImpl sources), so they resolve in projects compiled
 * without the DOM lib.
 *
 * Follows the approach @types/node uses for web globals
 * (types/node/web-globals/url.d.ts): the shapes are declared at module
 * scope and bound inside `declare global`, so the global interfaces merge
 * with — and the `var` declarations adopt the type of — any existing
 * global definitions of URL/URLSearchParams (e.g. from lib.dom) instead
 * of conflicting with them.
 *
 * Members that the runtimes do not implement (URL#toJSON, URL.parse,
 * webkitURL, ...) are omitted; the URL constructor requires a string
 * first argument because the runtimes throw a TypeError for anything
 * else.
 */
export {};

declare namespace url {
	export interface URL {
		hash: string;
		host: string;
		hostname: string;
		href: string;
		readonly origin: string;
		password: string;
		pathname: string;
		port: string;
		protocol: string;
		search: string;
		readonly searchParams: URLSearchParams;
		username: string;
		toString(): string;
	}

	export interface URLConstructor {
		new (url: string, base?: string | URL): URL;
		prototype: URL;
		canParse(url: string | URL, base?: string | URL): boolean;
		/**
		 * Returns a `blob:nativescript/<uuid>` URL for a Blob/File, or null
		 * when the value is not a Blob/File instance.
		 */
		createObjectURL(object: any, options?: { ext?: string } | null): string | null;
		revokeObjectURL(url: string): void;
	}

	export interface URLSearchParams {
		readonly size: number;
		append(name: string, value: string): void;
		delete(name: string, value?: string): void;
		get(name: string): string | null;
		getAll(name: string): string[];
		has(name: string, value?: string): boolean;
		set(name: string, value: string): void;
		sort(): void;
		toString(): string;
		forEach(callbackfn: (value: string, key: string, parent: URLSearchParams) => void, thisArg?: any): void;
		entries(): IterableIterator<[string, string]>;
		keys(): IterableIterator<string>;
		values(): IterableIterator<string>;
		[Symbol.iterator](): IterableIterator<[string, string]>;
	}

	export interface URLSearchParamsConstructor {
		new (init?: string | string[][] | Record<string, string> | URLSearchParams | Iterable<readonly [string, string]>): URLSearchParams;
		prototype: URLSearchParams;
	}
}

declare global {
	interface URL extends url.URL {}
	var URL: typeof globalThis extends { onmessage: any; URL: infer T } ? T : url.URLConstructor;

	interface URLSearchParams extends url.URLSearchParams {}
	var URLSearchParams: typeof globalThis extends { onmessage: any; URLSearchParams: infer T } ? T : url.URLSearchParamsConstructor;
}
