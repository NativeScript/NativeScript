import fs from 'node:fs';
import path from 'node:path';
import type { DepOptimizationMetadata, DevEnvironment, HotUpdateOptions, Plugin, ViteDevServer } from 'vite';
import { requestAppRestart, restartServerBeforeAppRestart } from './app-restart.js';

const toPosix = (file: string) => file.replace(/\\/g, '/');

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

/** Pre-bundle inputs, as POSIX paths (Vite's watcher and module graph use them on every OS). */
export interface PreBundleSources {
	files: Set<string>;
	/** The installed packages the files belong to. */
	packageDirs: Set<string>;
}

export function collectPreBundleSources(files: Iterable<string>): PreBundleSources {
	const sources: PreBundleSources = { files: new Set(), packageDirs: new Set() };
	for (const file of files) {
		const posix = toPosix(file);
		sources.files.add(posix);
		const dir = installedPackageDir(posix, '/');
		if (dir) sources.packageDirs.add(dir);
	}
	return sources;
}

const CODE_FILE_RE = /\.(?:[cm]?[jt]sx?|json)$/;

/**
 * True when an edit to `file` can change a pre-bundle: a file its sourcemap
 * lists, or any code file of a package it bundles. A module the bundler
 * folded away entirely (a re-exported constant) leaves no trace in the map.
 */
export function isPreBundleSource(file: string, sources: PreBundleSources): boolean {
	const posix = toPosix(file);
	if (sources.files.has(posix)) return true;
	const dir = installedPackageDir(posix, '/');
	return !!dir && sources.packageDirs.has(dir) && CODE_FILE_RE.test(posix);
}

function readPreBundleSources(metadata: DepOptimizationMetadata): Promise<PreBundleSources> {
	return Promise.all(
		metadata.depInfoList.map((info) =>
			fs.promises
				.readFile(`${info.file}.map`, 'utf-8')
				.then((text) => preBundleSourceFiles(JSON.parse(text), `${info.file}.map`))
				.catch(() => (info.src ? [info.src] : [])),
		),
	).then((lists) => collectPreBundleSources(lists.flat()));
}

// Vite replaces the metadata object on every optimizer commit.
const sourcesByMetadata = new WeakMap<DepOptimizationMetadata, Promise<PreBundleSources>>();

function preBundleSources(metadata: DepOptimizationMetadata): Promise<PreBundleSources> {
	let sources = sourcesByMetadata.get(metadata);
	if (!sources) {
		sources = readPreBundleSources(metadata);
		sourcesByMetadata.set(metadata, sources);
	}
	return sources;
}

/**
 * Vite's watcher walks only the root and the module graph's files, and a
 * pre-bundle's inputs are never graph files. A package hoisted above the root
 * is added explicitly; `server.watch.ignored` still decides whether its
 * events are reported.
 */
function watchPackagesOutsideRoot(server: ViteDevServer, sources: PreBundleSources): void {
	const root = `${toPosix(server.config.root).replace(/\/+$/, '')}/`;
	for (const dir of sources.packageDirs) {
		if (!dir.startsWith(root)) server.watcher.add(dir);
	}
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
const watchedMetadata = new WeakSet<DepOptimizationMetadata>();

function modifiedAt(file: string): number {
	try {
		return fs.statSync(file).mtimeMs;
	} catch {
		return Infinity;
	}
}

function onPreBundleSourceChange(file: string): void {
	// A late or repeated event for a write that a restarted optimizer has already read.
	if (modifiedAt(file) < lastRestartAt) return;
	changedFiles.add(file);
	if (debounce) clearTimeout(debounce);
	debounce = setTimeout(() => void restartForChangedSources(), 100);
}

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

const NODE_MODULES_RE = /[\\/]node_modules[\\/]/;

/**
 * Rebuilds the dependency pre-bundles when Vite's watcher reports an edit to
 * one of their inputs, and restarts the app so it boots against the new
 * pre-bundle URLs. Vite itself ignores such an edit: pre-bundle inputs are not
 * in the module graph. Inert while `server.watch.ignored` keeps ignoring
 * `node_modules`, as it does by default.
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
			if (this.environment.name !== 'client' || !optimizer?.isOptimizedDepFile(id) || watchedMetadata.has(optimizer.metadata)) return;
			// Serving a pre-bundle waits for its commit, so every map this metadata lists is on disk.
			watchedMetadata.add(optimizer.metadata);
			const server = currentServer;
			void preBundleSources(optimizer.metadata).then((sources) => server && watchPackagesOutsideRoot(server, sources));
		},
		hotUpdate: {
			// Ahead of `nsAppRestartPlugin`: a rebuilt pre-bundle supersedes an update of the same file.
			order: 'pre',
			async handler(ctx: HotUpdateOptions) {
				const environment = this.environment as DevEnvironment;
				if (environment.name !== 'client' || !environment.depsOptimizer) return;
				// An app file in the graph is never a pre-bundle input: skip reading the maps.
				if (!NODE_MODULES_RE.test(ctx.file) && environment.moduleGraph.getModulesByFile(ctx.file)?.size) return;
				if (!isPreBundleSource(ctx.file, await preBundleSources(environment.depsOptimizer.metadata))) return;
				onPreBundleSourceChange(ctx.file);
				return [];
			},
		},
		closeBundle() {
			// A restart configures the next server before closing this one's environments.
			if (currentServer?.environments.client !== this.environment) return;
			currentServer = undefined;
			changedFiles.clear();
		},
	};
}
