/**
 * NativeScript implementation of the `/@vite/client` surface that Vite's
 * client-environment import analysis injects into served modules
 * (`createHotContext`, `updateStyle`, `removeStyle`, `injectQuery`). Served at
 * `/ns/v/@vite/client` in the experimental thin device mode.
 */
import { addTaggedAdditionalCSS, removeTaggedAdditionalCSS } from '@nativescript/core';

type HotCallback = (...args: any[]) => void;

// Vite's CSS modules call `import.meta.hot.accept()` / `.prune()` unguarded,
// so a context must exist even before the HMR registry is installed.
function createDetachedHotContext() {
	const noop = () => {};
	return {
		data: {} as Record<string, unknown>,
		accept: noop as (...args: any[]) => void,
		acceptExports: noop as (...args: any[]) => void,
		dispose: noop as (cb: HotCallback) => void,
		prune: noop as (cb: HotCallback) => void,
		decline: noop,
		invalidate: noop as (message?: string) => void,
		on: noop as (event: string, cb: HotCallback) => void,
		off: noop as (event: string, cb: HotCallback) => void,
		send: noop as (event: string, data?: unknown) => void,
	};
}

export function createHotContext(ownerPath: string) {
	const registry = (globalThis as any).__NS_HOT_REGISTRY__;
	if (registry && typeof registry.createHotContext === 'function') {
		return registry.createHotContext(ownerPath);
	}
	return createDetachedHotContext();
}

export function updateStyle(id: string, css: string): void {
	removeTaggedAdditionalCSS(id);
	addTaggedAdditionalCSS(css, id);
}

export function removeStyle(id: string): void {
	removeTaggedAdditionalCSS(id);
}

export function injectQuery(url: string, queryToInject: string): string {
	if (url[0] !== '.' && url[0] !== '/') {
		return url;
	}
	const pathname = url.replace(/[?#].*$/, '');
	const { search, hash } = new URL(url, 'http://vite.dev');
	return `${pathname}?${queryToInject}${search ? `&${search.slice(1)}` : ''}${hash || ''}`;
}
