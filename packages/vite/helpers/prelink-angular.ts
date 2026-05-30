import path from 'node:path';
import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';
import { getAngularLinkerFactory, runAngularLinker } from './angular/shared-linker.js';

async function pathExists(p: string): Promise<boolean> {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

async function ensureDir(p: string) {
	await fs.mkdir(p, { recursive: true });
}

async function linkFile(src: string, projectRoot?: string): Promise<string | null> {
	const code = await fs.readFile(src, 'utf8');
	if (!code) return null;
	// Quick check to skip non-partial files
	if (code.indexOf('\u0275\u0275ngDeclare') === -1 && code.indexOf('ɵɵngDeclare') === -1 && code.indexOf('ngDeclare') === -1) return null;
	return runAngularLinker(code, { filename: src, projectRoot, freshPlugin: true });
}

async function copyOrLinkInto(srcFile: string, cacheFile: string, projectRoot?: string) {
	const dir = path.dirname(cacheFile);
	await ensureDir(dir);
	const linked = await linkFile(srcFile, projectRoot);
	if (linked) {
		await fs.writeFile(cacheFile, linked, 'utf8');
	} else {
		await fs.copyFile(srcFile, cacheFile);
	}
}

async function prelinkPackage(req: NodeRequire, pkgName: string, cacheRoot: string, debug: boolean, projectRoot?: string) {
	const pkgEntry = req.resolve(path.join(pkgName, 'package.json'));
	const pkgDir = path.dirname(pkgEntry);
	const fesmDir = path.join(pkgDir, 'fesm2022');
	if (!(await pathExists(fesmDir))) return;
	const { babel, createLinker } = await getAngularLinkerFactory(projectRoot);
	if (!babel || !createLinker) return; // Can't link without deps; skip quietly
	const destDir = path.join(cacheRoot, pkgName, 'fesm2022');
	await ensureDir(destDir);
	const files = (await fs.readdir(fesmDir)).filter((f) => f.endsWith('.mjs'));
	for (const file of files) {
		const srcFile = path.join(fesmDir, file);
		const cacheFile = path.join(destDir, file);
		await copyOrLinkInto(srcFile, cacheFile, projectRoot);
		if (debug) {
			console.log(`[ns-angular-prelink] cached`, `${pkgName}/fesm2022/${file}`);
		}
	}
}

export function createAngularPrelinkPlugin(projectRoot?: string): Plugin {
	const req = createRequire(projectRoot ? projectRoot + '/package.json' : import.meta.url);
	const cacheRoot = path.join(projectRoot || process.cwd(), 'node_modules', '.ns-linked');
	const pkgs = ['@angular/core', '@angular/common', '@angular/forms', '@angular/platform-browser', '@angular/router', '@nativescript/angular'];
	let done = false;
	return {
		name: 'ns-angular-prelink',
		enforce: 'pre',
		async config(_user, _env) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			const disabled = process.env.NS_PRELINK === '0' || process.env.NS_PRELINK === 'false';
			if (disabled) return {};
			// Prelink synchronously to ensure alias points to ready files.
			for (const pkg of pkgs) {
				await prelinkPackage(req, pkg, cacheRoot, !!debug, projectRoot);
			}
			done = true;
			const alias = [
				{ find: /^@angular\//, replacement: path.join(cacheRoot, '@angular') + '/' },
				{ find: /^@nativescript\/angular(\/.*)?$/, replacement: path.join(cacheRoot, '@nativescript', 'angular') + '$1' },
			] as any;
			return { resolve: { alias } };
		},
		async buildStart() {
			if (done) return;
			const disabled = process.env.NS_PRELINK === '0' || process.env.NS_PRELINK === 'false';
			if (disabled) return;
			// Fallback: in case config() path was skipped (edge), run once.
			for (const pkg of pkgs) {
				await prelinkPackage(req, pkg, cacheRoot, false, projectRoot);
			}
			done = true;
		},
	};
}
