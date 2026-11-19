import type { Plugin } from 'vite';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import type { Platform } from './platform-types.js';
import { resolveProjectMainEntryPath } from '../hmr/server/vite-plugin.js';

export type BundlerPlatform = Platform | undefined;

export const BUNDLER_CONTEXT_VIRTUAL_ID = 'virtual:ns-bundler-context';

/** Recursively collect every file under `dir` (posix paths), tolerating unreadable entries. */
export function walkAppFiles(dir: string, out: string[] = []): string[] {
	let entries: string[] = [];
	try {
		entries = readdirSync(dir);
	} catch {
		return out;
	}
	for (const entry of entries) {
		const full = path.posix.join(dir, entry);
		let st: ReturnType<typeof statSync> | undefined;
		try {
			st = statSync(full);
		} catch {
			continue;
		}
		if (st.isDirectory()) walkAppFiles(full, out);
		else out.push(full);
	}
	return out;
}

/** Skip partials (`_`-prefixed), `.d.ts`, worker modules, and platform-mismatched files. */
export function shouldExcludePlatformFile(p: string, platform: BundlerPlatform): boolean {
	const file = p.split('/').pop() || '';
	if (file.startsWith('_')) return true;
	if (/\.d\.ts$/.test(p)) return true;
	if (/([.-]worker)\.(ts|js)$/.test(file)) return true;
	const isAndroidTagged = /\.android\./.test(p);
	const isIosTagged = /\.ios\./.test(p) || /\.visionos\./.test(p);
	if (platform === 'android' && isIosTagged) return true;
	if ((platform === 'ios' || platform === 'visionos') && isAndroidTagged) return true;
	return false;
}

/**
 * The code files the bundler context imports from `files` (an app walk,
 * already platform-filtered): every `.js` file for JavaScript apps, each XML
 * file's code-behind (`.ts`, else `.js`) for TypeScript apps. `entryFile` is
 * left out: the entry would become its own importer.
 */
export function listBundlerContextCodeFiles(flavor: 'typescript' | 'javascript', files: string[], entryFile?: string): string[] {
	const isEntry = (f: string) => !!entryFile && path.resolve(f) === path.resolve(entryFile);
	if (flavor === 'javascript') {
		return files.filter((f) => f.endsWith('.js') && !isEntry(f));
	}
	const all = new Set(files);
	const codeFiles: string[] = [];
	for (const xml of files) {
		if (!xml.endsWith('.xml')) continue;
		const base = xml.slice(0, -'.xml'.length);
		const code = [`${base}.ts`, `${base}.js`].find((candidate) => all.has(candidate) && !isEntry(candidate));
		if (code) codeFiles.push(code);
	}
	return codeFiles.sort((a, b) => a.localeCompare(b));
}

/** Absolute app path → root-anchored import specifier the dev server can serve. */
export function toContextImportSpecifier(abs: string): string {
	return '/' + abs.replace(/^\/+/, '');
}

/** Loads `.xml` files as default-exported strings (shared by the JS and TS configs). */
export function createXmlLoaderPlugin(name: string): Plugin {
	return {
		name,
		enforce: 'pre',
		load(id) {
			if (!id.endsWith('.xml')) return null;
			try {
				const src = readFileSync(id, 'utf-8');
				const xml = JSON.stringify(src)
					.replace(/\u2028/g, '\\u2028')
					.replace(/\u2029/g, '\\u2029');
				const code = `const ___XML___ = ${xml};\nexport default ___XML___;`;
				return { code, map: null } as any;
			} catch {
				return null;
			}
		},
	};
}

/**
 * Serve only: the app entry imports the bundler context, so every XML file,
 * stylesheet and code-behind it registers sits below the entry in Vite's
 * graph and an edit of one reaches the entry boundary.
 */
export function createEntryBundlerContextImportPlugin(name: string): Plugin {
	let entryFile: string | undefined;
	// No newline: the entry's line numbers stay those of its source.
	const importCode = `import ${JSON.stringify(BUNDLER_CONTEXT_VIRTUAL_ID)};`;
	return {
		name,
		apply: 'serve',
		enforce: 'post',
		configResolved(config) {
			entryFile = path.join(config.root, resolveProjectMainEntryPath(config.root));
		},
		transform(source, id) {
			if (this.environment?.name !== 'client' || !entryFile) return null;
			if (path.resolve(id.split('?', 1)[0]) !== path.resolve(entryFile)) return null;
			return { code: importCode + source, map: null };
		},
	};
}

/**
 * A generated statement that drops every registry name core's
 * `registerBundlerModules` derives from the keys of `contextExpr`. Core keeps
 * an existing `.xml`, `.css` or plain `.js` registration, whose loader closes
 * over the context that registered it, so a re-evaluated context has to clear
 * them before registering again or the XML builder keeps loading old content.
 * The extension map is the union of core's default and the TS context's.
 */
export function createContextUnregisterCode(contextExpr: string): string {
	return `(function(ctx){ const g = globalThis; if (typeof g._unregisterModule !== 'function') return; const ext = { '.ts': '.js', '.kt': '.js', '.scss': '.css', '.sass': '.css', '.less': '.css' }; ctx.keys().forEach(function(key){ const dot = key.lastIndexOf('.'); const name = key.substring(0, dot) + (ext[key.substring(dot)] || key.substring(dot)); const names = [name]; if (name.startsWith('./')) { names.push(name.substring(2)); if (name.endsWith('.js')) names.push(name.substring(2, name.length - 3), name.substring(0, name.length - 3)); } names.forEach(function(n){ g._unregisterModule(n); }); }); })(${contextExpr});`;
}
