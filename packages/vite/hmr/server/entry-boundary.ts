import type { Plugin } from 'vite';
import path from 'path';
import { getFrameworkServerStrategy } from '../framework-flavors.js';
import type { FrameworkEntryBoundary } from './framework-strategy.js';
import { resolveProjectMainEntryPath } from './vite-plugin.js';

/**
 * Code prepended to the app entry. `import.meta.hot.accept()` makes the entry
 * the HMR boundary for everything below it: Vite then answers an edit with a
 * `js-update` of the entry and `?t=`-stamps only the changed import chain, and
 * the device disposes the running app and re-evaluates the entry.
 *
 * Placed first so the boundary is registered even when the entry body throws;
 * the framework's exports are read through a namespace so an older framework
 * build without them still links.
 */
export function createEntryBoundaryCode(boundary: FrameworkEntryBoundary): string {
	const call = (name: string | undefined) => (name ? `(typeof __nsFramework[${JSON.stringify(name)}] === 'function' ? __nsFramework[${JSON.stringify(name)}]() : undefined)` : 'undefined');
	return [`import { registerEntryBoundary as __nsRegisterEntryBoundary } from '/@vite/client';`, `import * as __nsFramework from ${JSON.stringify(boundary.module)};`, `if (import.meta.hot) {`, `\timport.meta.hot.accept();`, `\timport.meta.hot.dispose(() => ${call(boundary.dispose)});`, `\t__nsRegisterEntryBoundary(() => ${call(boundary.settled)});`, `}`, ''].join('\n');
}

/**
 * Makes the app entry the HMR boundary of a flavor that declares one: the
 * device then reboots the app in place for any edit below the entry.
 */
export function nsEntryBoundaryPlugin(opts: { flavor: string }): Plugin | undefined {
	const boundary = getFrameworkServerStrategy(opts.flavor)?.entryBoundary;
	if (!boundary) return undefined;
	const code = createEntryBoundaryCode(boundary);
	let entryFile: string | undefined;

	return {
		name: 'nativescript-entry-boundary',
		apply: 'serve',
		// After the framework's own compile (Analog replaces the source it is
		// given), before Vite's import analysis, which must see the `accept()`.
		enforce: 'post',
		configResolved(config) {
			entryFile = path.join(config.root, resolveProjectMainEntryPath(config.root));
		},
		transform(source, id) {
			if (this.environment?.name !== 'client' || !entryFile) return null;
			if (path.resolve(id.split('?', 1)[0]) !== path.resolve(entryFile)) return null;
			return { code: code + source, map: null };
		},
	};
}
