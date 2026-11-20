import type { ViteDevServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { composeDevBootBundle, devBootLoaderOptions } from '../../helpers/dev-boot-bundle.js';
import { BOOT_BUNDLE_FILE, cliBuildMessage, type CliBuildMessage } from '../../helpers/ns-cli-plugins.js';
import { nsConfigToJson } from '../../helpers/utils.js';
import { WARM_WAIT_CAP_MS } from './dev-boot-routes.js';
import { getServerOrigin } from './server-origin.js';

/** Set to `1` by the NativeScript CLI on a `vite serve` it runs without a `vite build --watch`. */
export const SINGLE_PROCESS_DEV_ENV = 'NS_VITE_SINGLE_PROCESS';

/**
 * Platforms whose dev output `vite serve` writes itself. The CLI reads the
 * same list from this package's `package.json` (`nativescriptCli.singleProcessDev`)
 * to decide whether to ask for it. Android keeps the HMR build: its app
 * components must be on disk for the static binding generator.
 */
export const SINGLE_PROCESS_DEV_PLATFORMS: readonly string[] = ['ios', 'visionos'];

export function isSingleProcessDev(platform: string, env: NodeJS.ProcessEnv = process.env): boolean {
	return env[SINGLE_PROCESS_DEV_ENV] === '1' && SINGLE_PROCESS_DEV_PLATFORMS.includes(platform);
}

export interface DevOutputCopyDir {
	/** Absolute source directory; it may not exist yet. */
	dir: string;
	/** Output-relative destination directory. */
	dest: string;
}

export interface DevOutputOptions {
	/** The directory the CLI copies into the app (`build.outDir`). */
	outDir: string;
	copyDirs: DevOutputCopyDir[];
}

export interface DevOutputWriterOptions extends DevOutputOptions {
	root: string;
	/** Generated files by output-relative path, read on every sync. */
	files: () => Record<string, string>;
	send?: (message: CliBuildMessage) => void;
	warn: (message: string) => void;
	debounceMs?: number;
	state?: DevOutputProcessState;
}

export interface DevOutputProcessState {
	initialSent: boolean;
}

// Module state outlives `server.restart()`, which builds a new writer: the
// CLI takes the first message as the initial build and launches the app on it.
const processState: DevOutputProcessState = { initialSent: false };

export interface DevOutputWriter {
	/**
	 * Makes the output directory match the generated files and the copy
	 * sources, and tells the CLI: everything the first time in this process,
	 * afterwards only what changed.
	 */
	sync(): void;
	/** A watcher event; ignored until the first {@link DevOutputWriter.sync}. */
	onFileEvent(event: 'add' | 'change' | 'unlink', file: string): void;
}

const toPosix = (value: string) => value.split(path.sep).join('/');

function isInside(parent: string, child: string): boolean {
	const relative = path.relative(parent, child);
	return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

/** Output-relative posix paths of the files under `dir`, without dot-named entries unless `dot`. */
function listFiles(dir: string, dot = false): string[] {
	const out: string[] = [];
	const walk = (current: string, relative: string) => {
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(current, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			if (!dot && entry.name.startsWith('.')) continue;
			const rel = relative ? `${relative}/${entry.name}` : entry.name;
			if (entry.isDirectory()) walk(path.join(current, entry.name), rel);
			else out.push(rel);
		}
	};
	walk(dir, '');
	return out;
}

/** Writes `content` to `file` unless it already holds it; true when written. */
function writeIfChanged(file: string, content: string | Buffer): boolean {
	const next = typeof content === 'string' ? Buffer.from(content) : content;
	try {
		if (fs.readFileSync(file).equals(next)) return false;
	} catch {}
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, next);
	return true;
}

export function createDevOutputWriter(options: DevOutputWriterOptions): DevOutputWriter {
	const state = options.state ?? processState;
	const debounceMs = options.debounceMs ?? 100;
	// Deleting files the sources no longer have is only safe in a directory
	// this project owns, as Vite's `emptyOutDir` decides for builds.
	const mayDelete = isInside(options.root, options.outDir);
	let ready = false;
	const pending = new Set<string>();
	let flushTimer: ReturnType<typeof setTimeout> | undefined;

	const send = (message: CliBuildMessage) => options.send?.(message);

	const copyTarget = (file: string): string | undefined => {
		for (const { dir, dest } of options.copyDirs) {
			if (!isInside(dir, file)) continue;
			const relative = toPosix(path.relative(dir, file));
			if (relative.split('/').some((segment) => segment.startsWith('.'))) return undefined;
			return path.posix.join(dest, relative);
		}
		return undefined;
	};

	const flush = () => {
		flushTimer = undefined;
		const emitted: string[] = [];
		const removed: string[] = [];
		for (const rel of pending) (fs.existsSync(path.join(options.outDir, rel)) ? emitted : removed).push(rel);
		pending.clear();
		if (emitted.length || removed.length) send(cliBuildMessage(emitted, 'incremental', removed));
	};

	return {
		sync() {
			const desired = new Set<string>();
			const changed: string[] = [];
			for (const [rel, content] of Object.entries(options.files())) {
				desired.add(rel);
				if (writeIfChanged(path.join(options.outDir, rel), content)) changed.push(rel);
			}
			for (const { dir, dest } of options.copyDirs) {
				for (const rel of listFiles(dir)) {
					const outRel = path.posix.join(dest, rel);
					desired.add(outRel);
					if (writeIfChanged(path.join(options.outDir, outRel), fs.readFileSync(path.join(dir, rel)))) changed.push(outRel);
				}
			}
			const removed: string[] = [];
			if (mayDelete) {
				for (const rel of listFiles(options.outDir, true)) {
					if (desired.has(rel)) continue;
					fs.rmSync(path.join(options.outDir, rel), { force: true });
					removed.push(rel);
				}
			}
			ready = true;
			if (!state.initialSent) {
				state.initialSent = true;
				send(cliBuildMessage([...desired], 'initial'));
			} else if (changed.length || removed.length) {
				send(cliBuildMessage(changed, 'incremental', removed));
			}
		},
		onFileEvent(event, file) {
			if (!ready) return;
			const rel = copyTarget(file);
			if (!rel) return;
			const target = path.join(options.outDir, rel);
			try {
				if (event === 'unlink') {
					if (!fs.existsSync(target)) return;
					fs.rmSync(target, { force: true });
				} else if (!writeIfChanged(target, fs.readFileSync(file))) {
					return;
				}
			} catch (error: any) {
				options.warn(`[NativeScript] could not update ${rel} in ${options.outDir}: ${error?.message ?? error}`);
				return;
			}
			pending.add(rel);
			clearTimeout(flushTimer);
			flushTimer = setTimeout(flush, debounceMs);
		},
	};
}

const DEV_BOOT_LOADER_FILE = fileURLToPath(new URL('../../runtime/dev-boot-loader.js', import.meta.url));

/**
 * Writes what the HMR build writes for the CLI (`bundle.mjs`, `package.json`,
 * the app's static directories) once the server listens and its boot graph is
 * warm, keeps the copies current from Vite's watcher, and sends the CLI the
 * build's messages, so `vite serve` alone runs a dev session.
 */
export function startDevOutput(server: ViteDevServer, options: DevOutputOptions & { verbose?: boolean }, warmedUp: Promise<void>): void {
	const logger = server.config.logger;
	const writer = createDevOutputWriter({
		...options,
		root: server.config.root,
		files: () => ({
			[BOOT_BUNDLE_FILE]: composeDevBootBundle(fs.readFileSync(DEV_BOOT_LOADER_FILE, 'utf8'), devBootLoaderOptions(getServerOrigin(server), server.config.webSocketToken, !!options.verbose)),
			'package.json': JSON.stringify(nsConfigToJson(), null, 2),
		}),
		send: typeof process.send === 'function' ? (message) => process.send!(message) : undefined,
		warn: (message) => logger.warn(message, { timestamp: true }),
	});
	for (const event of ['add', 'change', 'unlink'] as const) {
		server.watcher.on(event, (file: string) => writer.onFileEvent(event, file));
	}
	let capTimer: ReturnType<typeof setTimeout> | undefined;
	const capped = new Promise<void>((resolve) => {
		capTimer = setTimeout(resolve, WARM_WAIT_CAP_MS);
		capTimer.unref?.();
	});
	void Promise.race([warmedUp, capped]).then(() => {
		clearTimeout(capTimer);
		const firstSync = !processState.initialSent;
		try {
			writer.sync();
		} catch (error: any) {
			logger.error(`[NativeScript] could not write the dev output to ${options.outDir}: ${error?.stack ?? error}`, { timestamp: true });
			// The CLI launches the app on the first sync's message; without it the session never starts.
			if (firstSync) process.exit(1);
			return;
		}
		if (firstSync) logger.info(`[NativeScript] wrote ${BOOT_BUNDLE_FILE} and the app's static files to ${path.relative(server.config.root, options.outDir) || '.'}`, { timestamp: true });
	});
}
