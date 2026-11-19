/**
 * NativeScript implementation of the `/@vite/client` surface that Vite's
 * client-environment import analysis injects into served modules
 * (`createHotContext`, `updateStyle`, `removeStyle`, `injectQuery`), plus
 * `registerEntryBoundary` for the code the server injects into the app entry.
 * Served at `/ns/v/@vite/client`.
 *
 * Holds no state: this file is reachable at two URLs (`/@vite/client` and its
 * own path), and the hot contexts must live in one module instance.
 */
import { addTaggedAdditionalCSS, removeTaggedAdditionalCSS } from '@nativescript/core';

export { createHotContext, registerEntryBoundary } from './hot-state.js';

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
