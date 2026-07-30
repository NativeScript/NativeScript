import path from 'path';
import { readdirSync, statSync, existsSync, mkdirSync } from 'fs';

let isInitialBuild = true;

// NativeScript CLI integration for live reloads, non-HMR rebuilds
export function cliPlugin(opts: { distOutputFolder: string; isDevMode: boolean; verbose: boolean; hmrActive: boolean }) {
	// Capture emitted files directly from Rollup hooks to avoid relying on FS state
	const lastBundleFiles = new Set<string>();
	let lastOutDir: string | undefined;
	// This plugin should not trigger NativeScript CLI rebuild/refresh cycles when HMR is active
	return {
		name: 'nativescript-cli-integration',
		apply: 'build',
		// Ensure we run after other plugins (like vite-plugin-static-copy)
		enforce: 'post' as const,
		// Resolve build outDir so we can read final outputs after all plugins finish
		configResolved(config) {
			// Under HMR, when not initial build; skip - HMR client handles everything
			if (opts.hmrActive && !isInitialBuild) return;
		},
		// Use Rollup hook to record emitted file names (relative to output dir)
		generateBundle(options, bundle) {
			// Under HMR, still capture files on initial build
			if (opts.hmrActive && !isInitialBuild) return;
			try {
				const keys = Object.keys(bundle);
				for (const k of keys) lastBundleFiles.add(k);
				// Remember outDir/file from Rollup options if provided
				lastOutDir = (options as any).dir || ((options as any).file && path.dirname((options as any).file)) || undefined;
				if (opts.verbose) {
					console.log(`[cliPlugin] generateBundle: files=${keys.length}, dir=${lastOutDir ?? '(unknown)'}`);
					if (keys.length) {
						console.log('[cliPlugin] bundle keys:', keys);
					}
				}
			} catch {
				// noop
			}
		},
		// called only when writing to disk
		writeBundle(options, bundle) {
			// Under HMR, still capture files on initial build
			if (opts.hmrActive && !isInitialBuild) return;
			try {
				const keys = Object.keys(bundle);
				for (const k of keys) lastBundleFiles.add(k);
				lastOutDir = (options as any).dir || ((options as any).file && path.dirname((options as any).file)) || lastOutDir;
				if (opts.verbose) {
					console.log(`[cliPlugin] writeBundle: files=${keys.length}, dir=${lastOutDir ?? '(unknown)'}`);
				}
			} catch {
				// noop
			}
		},
		// Defer CLI notification until after all plugins (including static copy) are done.
		closeBundle() {
			if (opts.hmrActive && !isInitialBuild) {
				// Reset trackers to avoid leaking state between builds even if no-op
				lastBundleFiles.clear();
				lastOutDir = undefined;
				return;
			}
			if (!opts.isDevMode) return;

			const buildType = isInitialBuild ? 'initial' : 'incremental';
			if (opts.verbose) {
				console.log(`NativeScript: ${buildType} build completed.`);
			}

			// Determine outDir and ensure it exists in dev for a clean start
			const distDir = (lastOutDir as string) || opts.distOutputFolder;
			if (!existsSync(distDir)) {
				try {
					mkdirSync(distDir, { recursive: true });
				} catch {
					// ignore; listing will just return []
				}
			}

			// Prefer Rollup-reported bundle files; fall back to FS scan
			const emittedFiles = lastBundleFiles.size ? Array.from(lastBundleFiles) : listFilesFlat(distDir);
			if (opts.verbose) {
				console.log(`[cliPlugin] closeBundle: distDir=${distDir}, captured=${lastBundleFiles.size}, fsScan=${emittedFiles.length}`);
			}

			if (opts.verbose) {
				console.log(`Emitted ${emittedFiles.length} files in ${buildType} build.`);
			}

			if (process.send) {
				const sendMessage = (files: string[]) => {
					const message = {
						emittedFiles: files,
						chunkFiles: files.filter((f) => f.includes('chunk') || f.includes('vendor')),
						hash: Date.now().toString(),
						isHMR: false,
						buildType,
						timestamp: Date.now(),
					} as const;
					if (opts.verbose) {
						console.log(`Sending ${buildType} build notification to CLI.`);
					}
					process.send(message as any);
				};
				if (emittedFiles.length === 0) {
					// Allow a short delay for any late FS writes by other post plugins
					setTimeout(() => {
						const rescanned = listFilesFlat(distDir);
						if (opts.verbose) {
							console.log(`[cliPlugin] delayed rescan found ${rescanned.length} files in ${distDir}`);
						}
						sendMessage(rescanned);
					}, 50);
				} else {
					sendMessage(emittedFiles);
				}
			}

			if (isInitialBuild) {
				isInitialBuild = false;
				if (opts.verbose) {
					console.log('Initial build complete - subsequent changes will trigger fast rebuilds');
				}
			}
			lastBundleFiles.clear();
			lastOutDir = undefined;
		},
	};
}

// Recursively list files under a directory and return relative paths
function listFilesFlat(rootDir: string): string[] {
	const results: string[] = [];
	function walk(dir: string, relBase = '') {
		let entries: string[] = [];
		try {
			entries = readdirSync(dir);
		} catch {
			return;
		}
		for (const name of entries) {
			const abs = path.join(dir, name);
			const rel = path.join(relBase, name);
			let s;
			try {
				s = statSync(abs);
			} catch {
				continue;
			}
			if (s.isDirectory()) {
				walk(abs, rel);
			} else if (s.isFile()) {
				results.push(rel);
			}
		}
	}
	walk(rootDir);
	return results;
}
