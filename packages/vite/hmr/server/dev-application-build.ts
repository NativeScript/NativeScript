import { build, normalizePath, type Plugin, type ViteDevServer } from 'vite';
import path from 'node:path';

export interface AppComponent {
	absolutePath: string;
	outputName: string;
}

export interface DevApplicationOutput {
	/** Output-relative files: the component's chunks and their source maps. */
	files: Record<string, string | Uint8Array>;
	/** Absolute paths of the files the build loaded, those it tree-shook or inlined away included. */
	sources: string[];
}

interface OutputItem {
	type: 'chunk' | 'asset';
	fileName: string;
	code?: string;
	source?: string | Uint8Array;
	moduleIds?: string[];
}

/**
 * Restricts a build of the app's own config to `component`, in memory and once. `onModuleIds` gets
 * every module the build loaded: a chunk's `moduleIds` leave out the ones
 * that render no code (an unused import, constants inlined into importers).
 */
export function devApplicationBuildPlugin(component: AppComponent, onModuleIds?: (ids: string[]) => void): Plugin {
	return {
		name: 'ns-dev-application-build',
		enforce: 'post',
		config(config) {
			// Mutated, not returned: `mergeConfig` skips `null`, and HMR configs set `build.watch`.
			config.build ??= {};
			config.build.watch = null;
			config.build.write = false;
			config.build.emptyOutDir = false;
			config.build.copyPublicDir = false;
		},
		options(inputOptions) {
			return { ...inputOptions, input: { [component.outputName]: component.absolutePath } };
		},
		buildEnd(error) {
			if (!error) onModuleIds?.([...this.getModuleIds()]);
		},
	};
}

/** The files and watched sources of a build's output and of the modules it loaded. */
export function collectDevApplicationOutput(items: readonly OutputItem[], moduleIds: readonly string[] = []): DevApplicationOutput {
	const files: Record<string, string | Uint8Array> = {};
	const sources = new Set<string>();
	const addSource = (id: string) => {
		const file = id.split('?')[0];
		if (!file.startsWith('\0') && path.isAbsolute(file)) sources.add(normalizePath(file));
	};
	moduleIds.forEach(addSource);
	for (const item of items) {
		if (item.type === 'chunk') {
			files[item.fileName] = item.code ?? '';
			item.moduleIds?.forEach(addSource);
		} else if (item.fileName.endsWith('.map')) {
			files[item.fileName] = item.source ?? '';
		}
	}
	return { files, sources: [...sources] };
}

/**
 * Builds the custom `Application` component the way the HMR build of the
 * app's own config does, as its only input: the chunk the static binding
 * generator reads and the runtime evaluates from disk before `bundle.mjs`.
 * Self-contained: it runs before the dev server is reachable.
 */
export async function buildDevApplication(server: ViteDevServer, component: AppComponent): Promise<DevApplicationOutput> {
	let moduleIds: string[] = [];
	const result = await build({
		configFile: server.config.configFile ?? false,
		root: server.config.root,
		mode: server.config.mode,
		logLevel: 'warn',
		clearScreen: false,
		plugins: [devApplicationBuildPlugin(component, (ids) => (moduleIds = ids))],
	});
	const outputs = (Array.isArray(result) ? result : [result]) as Array<{ output?: OutputItem[] }>;
	return collectDevApplicationOutput(
		outputs.flatMap((output) => output.output ?? []),
		moduleIds,
	);
}

export interface DevApplicationState {
	output?: DevApplicationOutput;
}

// Outlives `server.restart()`: a failed rebuild after it keeps the last good chunk.
const processState: DevApplicationState = {};

export interface DevApplicationChunkOptions {
	component: AppComponent;
	build: (component: AppComponent) => Promise<DevApplicationOutput>;
	/** After a rebuild that changes to `files` triggered succeeded, with those changes and any a failed rebuild left. */
	onRebuilt: (files: string[]) => void;
	error: (message: string) => void;
	/** Sources of the last build, for the watcher. */
	watch?: (files: string[]) => void;
	debounceMs?: number;
	state?: DevApplicationState;
}

export interface DevApplicationChunk {
	/** The last successful build's files; none before one succeeded. */
	files(): Record<string, string | Uint8Array>;
	/** Builds now, after any build in flight; resolves whether it succeeded. */
	build(): Promise<boolean>;
	/** True when `file` is one of the chunk's sources, which a change of rebuilds. */
	isSource(file: string): boolean;
	/** A watcher event: rebuilds when `file` is one of the chunk's sources. */
	onFileEvent(file: string): void;
}

/** Keeps the custom `Application` chunk built: on demand, and again when one of its sources changes. */
export function createDevApplicationChunk(options: DevApplicationChunkOptions): DevApplicationChunk {
	const state = options.state ?? processState;
	const debounceMs = options.debounceMs ?? 100;
	const key = (file: string) => normalizePath(path.resolve(file));
	let sources = new Set([options.component.absolutePath, ...(state.output?.sources ?? [])].map(key));
	let queue: Promise<unknown> = Promise.resolve();
	let timer: ReturnType<typeof setTimeout> | undefined;
	const changed = new Set<string>();

	const run = async (): Promise<boolean> => {
		try {
			const output = await options.build(options.component);
			state.output = output;
			sources = new Set([options.component.absolutePath, ...output.sources].map(key));
			options.watch?.(output.sources);
			return true;
		} catch (error: any) {
			options.error(`[NativeScript] could not build the custom Application ${options.component.absolutePath}: ${error?.message ?? error}`);
			return false;
		}
	};
	const build = () => {
		const next = queue.then(run);
		queue = next;
		return next;
	};

	return {
		files: () => state.output?.files ?? {},
		build,
		isSource: (file) => sources.has(key(file)),
		onFileEvent(file) {
			if (!sources.has(key(file))) return;
			changed.add(file);
			clearTimeout(timer);
			timer = setTimeout(() => {
				const files = [...changed];
				changed.clear();
				void build().then((ok) => {
					if (ok) options.onRebuilt(files);
					else files.forEach((file) => changed.add(file));
				});
			}, debounceMs);
		},
	};
}
