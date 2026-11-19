import path from 'path';
import { createHash } from 'crypto';
import { readdirSync, statSync, existsSync, mkdirSync } from 'fs';

let isInitialBuild = true;

/** The boot bundle the CLI copies into the app; the HMR dev server serves everything else. */
export const BOOT_BUNDLE_FILE = 'bundle.mjs';

/** Content hash of the boot bundle in a Rollup output bundle, or undefined when it isn't part of it. */
export function hashBootBundle(bundle: Record<string, { type: string; code?: string; source?: string | Uint8Array }>): string | undefined {
	const output = bundle[BOOT_BUNDLE_FILE];
	if (!output) return undefined;
	const content = output.type === 'chunk' ? output.code : output.source;
	if (content == null) return undefined;
	return createHash('sha1').update(content).digest('hex');
}

// NativeScript CLI integration for live reloads, non-HMR rebuilds
export function cliPlugin(opts: { distOutputFolder: string; isDevMode: boolean; verbose: boolean; hmrActive: boolean }) {
	// Capture emitted files directly from Rollup hooks to avoid relying on FS state
	const lastBundleFiles = new Set<string>();
	let lastOutDir: string | undefined;
	// Under HMR the device fetches app code from the dev server, so a rebuild
	// only matters to the CLI when the boot bundle it copies into the app
	// changed: the CLI then restarts the app with the new one.
	let lastBootBundleHash: string | undefined;
	let bootBundleChanged = false;
	return {
		name: 'nativescript-cli-integration',
		apply: 'build',
		// Ensure we run after other plugins (like vite-plugin-static-copy)
		enforce: 'post' as const,
		// Use Rollup hook to record emitted file names (relative to output dir)
		generateBundle(options, bundle) {
			const hash = hashBootBundle(bundle as any);
			if (hash !== undefined) {
				bootBundleChanged = lastBootBundleHash !== undefined && hash !== lastBootBundleHash;
				lastBootBundleHash = hash;
			}
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
			const skipUnderHmr = opts.hmrActive && !isInitialBuild && !bootBundleChanged;
			bootBundleChanged = false;
			if (skipUnderHmr) {
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
