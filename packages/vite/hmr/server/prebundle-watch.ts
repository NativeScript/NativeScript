import fs from 'node:fs';
import path from 'node:path';
import type { DepOptimizationMetadata, DevEnvironment, OptimizedDepInfo, Plugin, ViteDevServer } from 'vite';
import { requestAppRestart, restartServerBeforeAppRestart } from './app-restart.js';

/** The installed package directory holding `file`, through its last `node_modules` segment. */
export function installedPackageDir(file: string, sep: string = path.sep): string | undefined {
	const marker = `${sep}node_modules${sep}`;
	const at = file.lastIndexOf(marker);
	if (at < 0) return undefined;
	const segments = file.slice(at + marker.length).split(sep);
	const depth = segments[0].startsWith('@') ? 2 : 1;
	if (segments.length <= depth || !segments[depth - 1]) return undefined;
	return file.slice(0, at + marker.length) + segments.slice(0, depth).join(sep);
}

/** The files a pre-bundle's sourcemap lists, resolved against the map file; virtual modules are dropped. */
export function preBundleSourceFiles(map: { sources?: readonly (string | null)[]; sourceRoot?: string }, mapFile: string): string[] {
	const base = path.resolve(path.dirname(mapFile), map.sourceRoot ?? '');
	return (map.sources ?? []).filter((source): source is string => !!source && !source.includes('\0') && !/^[a-z][a-z0-9+.-]+:/i.test(source)).map((source) => path.resolve(base, source));
}

/**
 * True for a pre-bundle source inside an installed package. A linked
 * package's files resolve outside `node_modules`: Vite's watcher sees those,
 * and never anything under `node_modules`.
 */
export function isInstalledPackageFile(file: string, realpath: (file: string) => string): boolean {
	if (!installedPackageDir(file)) return false;
	try {
		return !!installedPackageDir(realpath(file));
	} catch {
		return false;
	}
}

export interface PreBundleSourceWatchOptions {
	onChange(file: string): void;
	realpath?: (file: string) => string;
	watchDir?: (dir: string, listener: (filename: string | null) => void) => { close(): void };
}

export interface PreBundleSourceWatch {
	/** Watches the installed package files among `files`. */
	track(files: readonly string[]): void;
	close(): void;
}

function watchDirectory(dir: string, listener: (filename: string | null) => void): { close(): void } {
	const watcher = fs.watch(dir, { persistent: false }, (_event, filename) => listener(filename ? String(filename) : null));
	watcher.on('error', () => watcher.close());
	return watcher;
}

/**
 * Watches the source files of Vite's dependency pre-bundles. Directories, not
 * files: an editor's atomic save replaces the file a file watcher holds.
 */
export function createPreBundleSourceWatch(options: PreBundleSourceWatchOptions): PreBundleSourceWatch {
	const realpath = options.realpath ?? fs.realpathSync;
	const watchDir = options.watchDir ?? watchDirectory;
	const sources = new Set<string>();
	const watchers = new Map<string, { close(): void }>();

	return {
		track(files) {
			for (const file of files) {
				if (sources.has(file) || !isInstalledPackageFile(file, realpath)) continue;
				sources.add(file);
				const dir = path.dirname(file);
				if (watchers.has(dir)) continue;
				try {
					watchers.set(
						dir,
						watchDir(dir, (filename) => {
							const changed = filename && path.join(dir, filename);
							if (changed && sources.has(changed)) options.onChange(changed);
						}),
					);
				} catch {
					// Unwatchable directory: its edits wait for the next forced re-optimization.
				}
			}
		},
		close() {
			for (const watcher of watchers.values()) watcher.close();
			watchers.clear();
			sources.clear();
		},
	};
}

function relativeToRoot(file: string, root: string): string {
	const rel = path.relative(root, file).split(path.sep).join('/');
	return rel && !rel.startsWith('..') ? rel : file;
}

// Module state, not plugin state: an edit that lands while the server
// restarts must still be seen, and `server.restart()` builds new plugins.
let currentServer: ViteDevServer | undefined;
let restarting: Promise<void> | undefined;
let debounce: ReturnType<typeof setTimeout> | undefined;
let lastRestartAt = 0;
const changedFiles = new Set<string>();

function modifiedAt(file: string): number {
	try {
		return fs.statSync(file).mtimeMs;
	} catch {
		return Infinity;
	}
}

const sourceWatch = createPreBundleSourceWatch({
	onChange(file) {
		// A late or repeated event for a write that a restarted optimizer has already read.
		if (modifiedAt(file) < lastRestartAt) return;
		changedFiles.add(file);
		if (debounce) clearTimeout(debounce);
		debounce = setTimeout(() => void restartForChangedSources(), 100);
	},
});
const trackedMetadata = new WeakSet<DepOptimizationMetadata>();

// The device client pings a lost server every second. An app that has not
// reconnected by then is presumed gone, such as crashed by the edit.
const DEVICE_RECONNECT_GRACE_MS = 2500;

function waitForDeviceConnection(server: ViteDevServer, timeoutMs: number): Promise<void> {
	return new Promise((resolve) => {
		const done = () => {
			clearTimeout(timer);
			server.ws.off('vite:client:connect', done);
			resolve();
		};
		const timer = setTimeout(done, timeoutMs);
		server.ws.on('vite:client:connect', done);
	});
}

async function restartForChangedSources(): Promise<void> {
	debounce = undefined;
	if (restarting) return;
	restarting = (async () => {
		const reasons: string[] = [];
		while (changedFiles.size && currentServer) {
			while (changedFiles.size && currentServer) {
				const server = currentServer;
				const reason = `${[...changedFiles].map((file) => relativeToRoot(file, server.config.root)).join(', ')} changed`;
				changedFiles.clear();
				reasons.push(reason);
				server.config.logger.info(`[NativeScript] ${reason}, part of a dependency pre-bundle: restarting the dev server to rebuild it`, { timestamp: true });
				// Vite's browser hash covers the lockfile, the config and the dependency list,
				// not dependency sources: only a forced re-optimization in a new session changes it.
				lastRestartAt = Date.now();
				await restartServerBeforeAppRestart(server, true);
			}
			// The restart notice reaches only connected devices, and the running app
			// must hear it before the CLI replaces it.
			if (currentServer) await waitForDeviceConnection(currentServer, DEVICE_RECONNECT_GRACE_MS);
		}
		if (reasons.length) requestAppRestart(reasons.join('; '));
	})()
		.catch((error) => (currentServer?.config.logger ?? console).error(`[NativeScript] dev server restart failed: ${error instanceof Error ? error.message : String(error)}`))
		.finally(() => {
			restarting = undefined;
		});
}

function trackPreBundle(info: OptimizedDepInfo): void {
	fs.promises
		.readFile(`${info.file}.map`, 'utf-8')
		.then((text) => preBundleSourceFiles(JSON.parse(text), `${info.file}.map`))
		.catch(() => (info.src ? [info.src] : []))
		.then((files) => sourceWatch.track(files));
}

/**
 * Rebuilds a dependency pre-bundle when one of its source files changes, and
 * restarts the app so it boots against the new pre-bundle URLs. Vite neither
 * watches `node_modules` nor keeps pre-bundled files in the module graph.
 */
export function nsPreBundleWatchPlugin(): Plugin {
	return {
		name: 'nativescript-prebundle-watch',
		apply: 'serve',
		configureServer(server) {
			currentServer = server;
		},
		transform(_code, id) {
			const optimizer = (this.environment as DevEnvironment).depsOptimizer;
			if (this.environment.name !== 'client' || !optimizer?.isOptimizedDepFile(id) || trackedMetadata.has(optimizer.metadata)) return;
			// Serving a pre-bundle waits for its commit, so every file this metadata lists is on disk.
			trackedMetadata.add(optimizer.metadata);
			for (const info of optimizer.metadata.depInfoList) trackPreBundle(info);
		},
		closeBundle() {
			// A restart configures the next server before closing this one's environments.
			if (currentServer?.environments.client !== this.environment) return;
			currentServer = undefined;
			sourceWatch.close();
			changedFiles.clear();
		},
	};
}
