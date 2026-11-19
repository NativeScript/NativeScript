import path from 'node:path';
import { normalizePath, type Plugin } from 'vite';
import { resolveProjectGlobalCssPath } from '../../helpers/utils.js';
import { resolveProjectMainEntryPath } from './vite-plugin.js';
import { viteUrlForFile } from './vite-url.js';

/**
 * Imports the global stylesheet (`app.css`, or `styles.css`) from the app
 * entry. Vite serves it as a CSS-as-JS module that applies itself through
 * `/@vite/client`'s `updateStyle` and accepts its own updates, so an edit of
 * it, of an `@import`ed partial or of a PostCSS dependency replaces the
 * stylesheet in place.
 *
 * Two plugins: the transform must run with the `post` plugins (after the
 * framework's compile, before Vite's import analysis), while the hot-update
 * hook must run ahead of the update gate's, which an `enforce: 'post'` plugin
 * never does.
 */
export function nsAppCssModulePlugins(opts: { resolveStylesheet?: (root: string) => string | null } = {}): Plugin[] {
	let entryFile: string | undefined;
	let stylesheet: string | null = null;
	let importCode = '';

	return [
		{
			name: 'nativescript-app-css-module',
			apply: 'serve',
			enforce: 'post',
			configResolved(config) {
				entryFile = path.join(config.root, resolveProjectMainEntryPath(config.root));
				stylesheet = (opts.resolveStylesheet ?? resolveProjectGlobalCssPath)(config.root);
				// No newline: the entry's line numbers stay those of its source.
				importCode = stylesheet ? `import ${JSON.stringify(viteUrlForFile(stylesheet, config.root))};` : '';
			},
			transform(source, id) {
				if (!importCode || this.environment?.name !== 'client' || !entryFile) return null;
				if (path.resolve(id.split('?', 1)[0]) !== path.resolve(entryFile)) return null;
				return { code: importCode + source, map: null };
			},
		},
		{
			name: 'nativescript-app-css-module-hot-update',
			apply: 'serve',
			hotUpdate: {
				order: 'post',
				handler(ctx) {
					if (this.environment.name !== 'client' || !stylesheet) return;
					const graph = this.environment.moduleGraph;
					if (path.resolve(ctx.file) !== path.resolve(stylesheet)) {
						// A PostCSS `dependency`/`dir-dependency` (Tailwind's content files) is a
						// file-only node the stylesheet imports. Vite full-reloads an `.html` edit
						// whose modules are all non-JS, and a framework hook may drop that node.
						const sheet = [...(graph.getModulesByFile(normalizePath(stylesheet)) ?? [])].find((mod) => mod.id === mod.file);
						if (!sheet || ctx.modules.includes(sheet) || ![...(graph.getModulesByFile(ctx.file) ?? [])].some((mod) => mod.importers.has(sheet))) return;
						return [...ctx.modules, sheet];
					}
					// Analog's `handleHotUpdate` takes any edited `.css` for a component
					// resource and swaps its modules for their importers, here the app
					// entry: the edit would reboot the app and leave the stylesheet stale.
					if (!ctx.modules.length) return;
					const own = [...(graph.getModulesByFile(ctx.file) ?? [])];
					if (!own.length || (ctx.modules.length === own.length && ctx.modules.every((mod) => own.includes(mod)))) return;
					return own;
				},
			},
		},
	];
}
