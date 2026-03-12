import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import * as path from 'path';
import { readFileSync, readdirSync, statSync } from 'fs';
import * as PAT from '../../../server/constants.js';
import { linkAngularPartialsIfNeeded } from './linker.js';
import { getProjectAppPath, getProjectAppVirtualPath } from '../../../../helpers/utils.js';

// Angular server strategy for NativeScript HMR.
//
// Responsibilities:
// - Identify Angular app entry modules under /src.
// - Use Vite dev server to transform HTTP-served Angular modules.
// - Run resulting code through the Angular linker helper so no ɵɵngDeclare
//   partial declarations reach the device, even in strict mode.
// - Register external templates/styles with the watcher for live updates.

const ANGULAR_APP_DIR = getProjectAppPath();
const ANGULAR_APP_VIRTUAL_WITH_SLASH = `${getProjectAppVirtualPath()}/`;

function findAngularEntryFiles(root: string): string[] {
	const srcDir = path.join(root, ANGULAR_APP_DIR);
	const results: string[] = [];

	function walk(dir: string) {
		let entries: string[] = [];
		try {
			entries = readdirSync(dir);
		} catch {
			return;
		}
		for (const name of entries) {
			if (name === 'node_modules' || name === '.ns-vite-build' || name === 'dist') continue;
			const full = path.join(dir, name);
			let st: any;
			try {
				st = statSync(full);
			} catch {
				continue;
			}
			if (st.isDirectory()) {
				walk(full);
			} else if (st.isFile() && (name.endsWith('.ts') || name.endsWith('.js'))) {
				try {
					const code = readFileSync(full, 'utf8');
					// Heuristic: treat files that bootstrap Angular (platformNativeScript, bootstrapApplication, etc.)
					// as HMR-relevant roots.
					if (/bootstrapApplication\s*\(|platformNativeScript/i.test(code) || /@NgModule\s*\(/.test(code)) {
						const rel = '/' + path.relative(root, full).split(path.sep).join('/');
						results.push(rel);
					}
				} catch {}
			}
		}
	}

	walk(srcDir);
	return results;
}

export const angularServerStrategy: FrameworkServerStrategy = {
	flavor: 'angular',
	matchesFile(id: string) {
		// Treat only application TS/JS as candidates for ordering/graph purposes
		return /\.(ts|js|tsx|jsx|mjs)$/i.test(id) && id.startsWith(ANGULAR_APP_VIRTUAL_WITH_SLASH);
	},
	preClean(code: string) {
		return code;
	},
	rewriteFrameworkImports(code: string) {
		// Angular runtime imports are handled via the vendor bridge; no extra rewrite.
		return code;
	},
	postClean(code: string) {
		return code;
	},
	ensureVersionedImports(code: string, _origin: string, _version: number) {
		// No Angular-specific HTTP endpoints yet; leave imports as-is.
		return code;
	},
	async processFile(ctx: FrameworkProcessFileContext) {
		// Ensure any Angular code the HMR server assembles for HTTP consumption is fully linked.
		const { filePath, server, verbose } = ctx;
		try {
			const transformed = await server.transformRequest(filePath);
			if (!transformed?.code) return;
			let code = transformed.code;
			// Sanitize Angular partial declarations inline before device evaluation.
			code = linkAngularPartialsIfNeeded(code, filePath);
			// No additional per-file registry at the moment; core HMR loader will fetch via HTTP.
			if (verbose) {
				console.log(`[angular-hmr] processed ${filePath}`);
			}
		} catch (err) {
			if (verbose) {
				console.warn('[angular-hmr] processFile error for', filePath, err);
			}
		}
	},
	async buildRegistry(ctx: FrameworkRegistryContext) {
		const { server, verbose } = ctx;
		const root = server.config.root || process.cwd();
		const entries = findAngularEntryFiles(root);
		const templateFiles: string[] = [];

		// Maintain existing behavior: watch external templates and styles referenced via templateUrl/styleUrls.
		function walkForTemplates(dir: string) {
			let list: string[] = [];
			try {
				list = readdirSync(dir);
			} catch {
				return;
			}
			for (const name of list) {
				if (name === 'node_modules' || name === '.ns-vite-build' || name === 'dist') continue;
				const full = path.join(dir, name);
				let st: any;
				try {
					st = statSync(full);
				} catch {
					continue;
				}
				if (st.isDirectory()) {
					walkForTemplates(full);
				} else if (st.isFile() && name.endsWith('.ts')) {
					try {
						const code = readFileSync(full, 'utf8');
						if (/\@Component\s*\(/.test(code) && /templateUrl\s*:\s*["']\.\//.test(code)) {
							const m = code.match(/templateUrl\s*:\s*["']\.\/(.*?\.html)["']/);
							if (m && m[1]) {
								const htmlAbs = path.join(path.dirname(full), m[1]);
								templateFiles.push(htmlAbs);
							}
						}
						const styleArrayMatch = code.match(/styleUrls\s*:\s*\[([\s\S]*?)\]/);
						if (styleArrayMatch && styleArrayMatch[1]) {
							const entries = styleArrayMatch[1]
								.split(',')
								.map((s) => s.trim().replace(/^["'`]|["'`]$/g, ''))
								.filter((s) => s.startsWith('./') && (s.endsWith('.css') || s.endsWith('.scss')));
							for (const rel of entries) {
								const cssAbs = path.join(path.dirname(full), rel);
								templateFiles.push(cssAbs);
							}
						}
					} catch {}
				}
			}
		}

		walkForTemplates(path.join(root, 'src'));
		try {
			for (const abs of templateFiles) {
				try {
					server.watcher.add(abs);
				} catch {}
				if (verbose) {
					const rel = '/' + path.relative(root, abs).split(path.sep).join('/');
					console.log(`[angular-registry] watching template: ${rel}`);
				}
			}
		} catch {}

		// At this stage, we only need to ensure Angular HMR roots are transformed and linked at least once.
		for (const rel of entries) {
			try {
				const transformed = await server.transformRequest(rel);
				if (!transformed?.code) continue;
				let code = transformed.code;
				code = linkAngularPartialsIfNeeded(code, rel);
				if (verbose) {
					console.log(`[angular-registry] primed entry: ${rel}`);
				}
			} catch (err) {
				if (verbose) {
					console.warn('[angular-registry] failed to prime entry', rel, err);
				}
			}
		}
	},
};
