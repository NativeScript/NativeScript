import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import * as path from 'path';
import { readFileSync, readdirSync, statSync } from 'fs';

// Very lightweight candidate scanner: watches for @Component and templateUrl usage
// and registers external templates for the watcher by sending no-op registry (future use).
// This primes the pipeline for template-only updates.

// Minimal Angular server strategy: Angular doesn't use .vue SFCs, so most
// Vue-specific transformations are no-ops here. This stub enables the HMR
// server to select a framework without attempting Vue SFC logic.

export const angularServerStrategy: FrameworkServerStrategy = {
	flavor: 'angular',
	matchesFile(id: string) {
		// Treat only application TS/JS as candidates for ordering/graph purposes
		return /\.(ts|js|tsx|jsx|mjs)$/i.test(id) && id.startsWith('/src/');
	},
	preClean(code: string) {
		return code;
	},
	rewriteFrameworkImports(code: string) {
		return code;
	},
	postClean(code: string) {
		return code;
	},
	ensureVersionedImports(code: string) {
		return code;
	},
	async processFile(_ctx: FrameworkProcessFileContext) {
		// No special processing required for Angular at server side for now
		return;
	},
	async buildRegistry(ctx: FrameworkRegistryContext) {
		const { server, verbose } = ctx;
		const root = server.config.root || process.cwd();
		const srcDir = path.join(root, 'src');
		const templateFiles: string[] = [];

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
						// Also detect styleUrls and watch those files, too
						const styleArrayMatch = code.match(/styleUrls\s*:\s*\[([\s\S]*?)\]/);
						if (styleArrayMatch && styleArrayMatch[1]) {
							const entries = styleArrayMatch[1]
								.split(',')
								.map((s) => s.trim().replace(/^['"`]|['"`]$/g, ''))
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

		walk(srcDir);
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
	},
};
