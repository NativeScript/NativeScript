import { createHash } from 'crypto';
import { readdirSync, statSync } from 'fs';
import * as path from 'path';
import * as PAT from '../../../server/constants.js';
import { rewriteVendorVueSpec } from '../../../helpers/vendor-rewrite.js';
import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import { getProjectAppPath } from '../../../../helpers/utils.js';

const VENDOR_MJS = '/@nativescript/vendor.mjs';
const VUE_HTTP_SFC_DIR = `${getProjectAppPath()}/sfc`;
const VUE_IMPORTS_TO_VENDOR: RegExp[] = [/(from\s+["'])vue(?:\/[A-Za-z0-9_\-\/]+)?(["'])/g, /(from\s+["'])nativescript-vue(?:\/[A-Za-z0-9_\-\/]+)?(["'])/g];

function stripVueHmrNoise(code: string): string {
	return code
		.replace(/__VUE_HMR_RUNTIME__\.(?:createRecord|reload|rerender)\s*\([\s\S]*?\);\s*/g, '')
		.replace(/\}\s*else\s*\{\s*__VUE_HMR_RUNTIME__\.(?:reload|rerender)\s*\([\s\S]*?\);\s*\}\s*/g, '')
		.replace(/(?:^|\n)\s*else\s*\{\s*__VUE_HMR_RUNTIME__\.(?:reload|rerender)\s*\([\s\S]*?\);\s*\}\s*/g, '\n')
		.replace(/\}\s*else\s*\{\s*\}\s*/g, '}\n');
}

function stripVueHmrTail(code: string): string {
	return code.replace(/\n[^\n]*__hmrId\s*=\s*['"][^'"]+['"];[\s\S]*?(?=\n\s*export\s+default)/g, '\n').replace(/^[^\n]*typeof\s+__VUE_HMR_RUNTIME__[^\n]*$/gm, '');
}

function ensureVersionedSfcImports(code: string, origin: string, ver: number): string {
	if (!code || !origin || !Number.isFinite(ver)) return code;
	code = code.replace(/(from\s+["'])(?:https?:\/\/[^"']+)?(\/ns\/sfc)(?:\/[\d]+)?(\/[^"']*)(["'])/g, (_m, p1, _p2, p3, p4) => `${p1}/ns/sfc/${ver}${p3}${p4}`);
	code = code.replace(/(import\(\s*["'])(?:https?:\/\/[^"']+)?(\/ns\/sfc)(?:\/[\d]+)?(\/[^"']*)(["']\s*\))/g, (_m, p1, _p2, p3, p4) => `${p1}/ns/sfc/${ver}${p3}${p4}`);
	return code;
}

function shortHash(value: string, helpers?: FrameworkProcessFileContext['helpers']): string {
	const fromHelper = helpers?.createHash?.(value);
	const base = fromHelper || createHash('md5').update(value).digest('hex');
	return base.slice(0, 8);
}

function normalizeDep(dep: string): string {
	return dep.replace(PAT.QUERY_PATTERN, '');
}

function isCoreGlobals(dep: string, helpers?: FrameworkProcessFileContext['helpers']): boolean {
	return !!helpers?.isCoreGlobalsReference?.(dep);
}

function isNativeScriptCore(dep: string, helpers?: FrameworkProcessFileContext['helpers']): boolean {
	return !!helpers?.isNativeScriptCoreModule?.(dep);
}

function isNativeScriptPlugin(dep: string, helpers?: FrameworkProcessFileContext['helpers']): boolean {
	return !!helpers?.isNativeScriptPluginModule?.(dep);
}

function isVendor(dep: string, helpers?: FrameworkProcessFileContext['helpers']): boolean {
	return !!helpers?.resolveVendorFromCandidate?.(dep);
}

async function processVueSfc(ctx: FrameworkProcessFileContext): Promise<void> {
	const { filePath, server, sfcFileMap, depFileMap, visitedPaths, wss, verbose, helpers } = ctx;

	if (visitedPaths.has(filePath)) {
		return;
	}
	visitedPaths.add(filePath);

	try {
		const transformed = await server.transformRequest(filePath);
		if (!transformed?.code) {
			if (verbose) {
				console.log(`[vue-sfc] Could not transform: ${filePath}`);
			}
			return;
		}

		const clean = helpers?.cleanCode ?? ((code: string) => code);
		let code = clean(transformed.code);

		const collectDeps = helpers?.collectImportDependencies;
		const deps = collectDeps ? collectDeps(code, filePath) : new Set<string>();

		for (const dep of deps) {
			const cleanDep = normalizeDep(dep);
			if (isCoreGlobals(dep, helpers)) continue;
			if (isNativeScriptCore(dep, helpers)) continue;
			if (isNativeScriptPlugin(dep, helpers)) continue;
			if (isVendor(cleanDep, helpers)) continue;
			if (!PAT.VUE_FILE_PATTERN.test(dep)) continue;

			if (!sfcFileMap.has(dep)) {
				const hash = shortHash(dep, helpers);
				sfcFileMap.set(dep, `sfc-${hash}.mjs`);
				if (verbose) {
					console.log(`[vue-sfc] Registered nested .vue: ${dep} → sfc-${hash}.mjs`);
				}
			}
		}

		for (const dep of deps) {
			if (dep === filePath) continue;
			const cleanDep = normalizeDep(dep);
			if (isCoreGlobals(dep, helpers)) {
				if (verbose) {
					console.log(`[vue-sfc] Skipping core globals dependency ${dep}`);
				}
				continue;
			}
			if (isNativeScriptCore(dep, helpers)) {
				if (verbose) {
					console.log(`[vue-sfc] Skipping NativeScript core dependency ${dep}`);
				}
				continue;
			}
			if (isNativeScriptPlugin(dep, helpers)) {
				if (verbose) {
					console.log(`[vue-sfc] Skipping NativeScript plugin dependency ${dep}`);
				}
				continue;
			}
			if (isVendor(cleanDep, helpers)) {
				if (verbose) {
					console.log(`[vue-sfc] Skipping vendor dependency ${dep}`);
				}
				continue;
			}
			if (PAT.VUE_FILE_PATTERN.test(dep)) {
				await processVueSfc({
					filePath: dep,
					server,
					sfcFileMap,
					depFileMap,
					visitedPaths,
					wss,
					verbose,
					helpers,
				});
			}
		}

		const fileName = sfcFileMap.get(filePath);
		if (!fileName) {
			console.warn(`[vue-sfc] No filename mapping for: ${filePath}`);
			return;
		}
	} catch (error) {
		console.warn(`[vue-sfc] Error processing ${filePath}:`, error);
	}
}

function findVueFiles(dir: string, root: string, result: string[] = []): string[] {
	const skipDirs = ['package.json', 'package-lock.json', 'node_modules', '.git', 'dist', '.ns-vite-build', '.DS_Store', 'hooks', 'platforms', 'App_Resources'];

	for (const name of readdirSync(dir)) {
		if (skipDirs.includes(name)) continue;

		const full = path.join(dir, name);
		const stat = statSync(full);

		if (stat.isDirectory()) {
			findVueFiles(full, root, result);
		} else if (stat.isFile() && name.endsWith('.vue')) {
			const rel = '/' + path.relative(root, full).split(path.sep).join('/');
			result.push(rel);
		}
	}

	return result;
}

async function buildAndSendRegistry(ctx: FrameworkRegistryContext): Promise<void> {
	const { server, sfcFileMap, depFileMap, wss, verbose, helpers } = ctx;
	const root = server.config.root || process.cwd();
	const vueFiles = findVueFiles(root, root);

	if (!vueFiles.length) {
		return;
	}

	for (const rel of vueFiles) {
		const hash = shortHash(rel, helpers as FrameworkProcessFileContext['helpers']);
		sfcFileMap.set(rel, `sfc-${hash}.mjs`);
	}

	const entries: Array<{
		path: string;
		fileName: string;
		hmrId: string;
		code: string;
	}> = [];
	const visitedPaths = new Set<string>();

	for (const rel of vueFiles) {
		try {
			const transformed = await server.transformRequest(rel);
			if (!transformed?.code) continue;

			const clean = helpers?.cleanCode ?? ((code: string) => code);
			let code = clean(transformed.code);

			const collectDeps = helpers?.collectImportDependencies;
			const deps = collectDeps ? collectDeps(code, rel) : new Set<string>();

			for (const dep of deps) {
				if (!PAT.VUE_FILE_PATTERN.test(dep)) continue;
				await processVueSfc({
					filePath: dep,
					server,
					sfcFileMap,
					depFileMap,
					visitedPaths,
					wss,
					verbose,
					helpers: helpers as FrameworkProcessFileContext['helpers'],
				});
			}

			if (helpers?.processSfcCode) {
				code = helpers.processSfcCode(code);
			}

			if (helpers?.rewriteImports) {
				const projectRoot = server.config.root || process.cwd();
				code = helpers.rewriteImports(code, rel, sfcFileMap, depFileMap, projectRoot, verbose, VUE_HTTP_SFC_DIR);
			}

			const fileName = sfcFileMap.get(rel);
			if (!fileName) {
				if (verbose) {
					console.warn(`[registry] Missing filename for ${rel}`);
				}
				continue;
			}

			const hash = shortHash(rel, helpers as FrameworkProcessFileContext['helpers']);
			entries.push({
				path: rel,
				fileName,
				hmrId: hash,
				code: '',
			});
		} catch (error) {
			console.warn(`[registry] Failed to process ${rel}:`, error);
		}
	}

	if (!entries.length) {
		return;
	}

	const msg = {
		type: 'ns:vue-sfc-registry',
		entries,
		ts: Date.now(),
	};

	if (!wss) {
		return;
	}

	wss.clients.forEach((client) => {
		if (client.readyState === client.OPEN) {
			client.send(JSON.stringify(msg));
		}
	});

	if (verbose) {
		console.log(`[registry] Sent ${entries.length} SFC entries`);
	}
}

export const vueServerStrategy: FrameworkServerStrategy = {
	flavor: 'vue',
	matchesFile(id: string) {
		return PAT.VUE_FILE_PATTERN.test(id);
	},
	preClean(code: string) {
		let result = code;
		result = result.replace(PAT.VUE_STYLE_IMPORTS, '');
		result = result.replace(PAT.VUE_EXPORT_SFC_IMPORT, '');
		result = result.replace(PAT.VUE_VIRTUAL_ID_IMPORT, '');
		return result;
	},
	rewriteFrameworkImports(code: string) {
		let result = code;
		for (const pattern of VUE_IMPORTS_TO_VENDOR) {
			result = result.replace(pattern, `from "${VENDOR_MJS}"`);
		}
		return result;
	},
	postClean(code: string) {
		let result = stripVueHmrNoise(code);
		result = stripVueHmrTail(result);
		return result;
	},
	ensureVersionedImports(code: string, origin: string, version: number) {
		return ensureVersionedSfcImports(code, origin, version);
	},
	rewriteVendorSpec(code: string, origin: string, version: number) {
		return rewriteVendorVueSpec(code, origin, version);
	},
	async processFile(ctx: FrameworkProcessFileContext) {
		await processVueSfc(ctx);
	},
	async buildRegistry(ctx: FrameworkRegistryContext) {
		await buildAndSendRegistry(ctx);
	},
};
