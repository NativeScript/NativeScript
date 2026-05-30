import { createRequire } from 'node:module';

type BabelCore = typeof import('@babel/core');
type LinkerFactory = (options?: Record<string, unknown>) => any;

let sharedBabel: BabelCore | null = null;
let sharedFactory: LinkerFactory | null = null;
let sharedPlugin: any | null = null;

/**
 * Resolve the Angular NodeJSFileSystem from the project or fallback locations.
 * Angular 21+ requires a `fileSystem` option for the linker plugin — without it
 * the Babel transform throws "Cannot read properties of undefined (reading 'resolve')".
 */
export async function resolveAngularFileSystem(projectRoot?: string): Promise<any> {
	const req = createRequire(projectRoot ? projectRoot + '/package.json' : import.meta.url);
	try {
		const cliPath = req.resolve('@angular/compiler-cli');
		const cliMod: any = await import(cliPath);
		if (cliMod.NodeJSFileSystem) {
			return new cliMod.NodeJSFileSystem();
		}
	} catch {}
	try {
		const cliMod: any = await import('@angular/compiler-cli');
		if (cliMod.NodeJSFileSystem) {
			return new cliMod.NodeJSFileSystem();
		}
	} catch {}
	const path = await import('node:path');
	const fs = await import('node:fs');
	return {
		resolve: (...paths: string[]) => path.resolve(...paths),
		dirname: (p: string) => path.dirname(p),
		join: (...paths: string[]) => path.join(...paths),
		isRooted: (p: string) => path.isAbsolute(p),
		exists: (p: string) => fs.existsSync(p),
		readFile: (p: string) => fs.readFileSync(p, 'utf8'),
	};
}

/**
 * Load `@babel/core` + the Angular linker factory (cached on success, retried
 * until both resolve). Returns nulls when the toolchain isn't installed so
 * callers can soft-skip.
 */
export async function getAngularLinkerFactory(projectRoot?: string): Promise<{ babel: BabelCore | null; createLinker: LinkerFactory | null }> {
	if (sharedBabel && sharedFactory) {
		return { babel: sharedBabel, createLinker: sharedFactory };
	}

	const req = createRequire(projectRoot ? projectRoot + '/package.json' : import.meta.url);
	let localBabel: BabelCore | null = null;
	let createLinker: LinkerFactory | null = null;

	try {
		const babelPath = req.resolve('@babel/core');
		const linkerPath = req.resolve('@angular/compiler-cli/linker/babel');
		localBabel = (await import(babelPath)) as any;
		const linkerMod: any = await import(linkerPath);
		createLinker = linkerMod.createLinkerPlugin || linkerMod.createEs2015LinkerPlugin || null;
	} catch {
		try {
			localBabel = (await import('@babel/core')) as any;
		} catch {}
		try {
			const linkerMod: any = await import('@angular/compiler-cli/linker/babel');
			createLinker = linkerMod.createLinkerPlugin || linkerMod.createEs2015LinkerPlugin || null;
		} catch {}
	}

	if (localBabel && createLinker) {
		sharedBabel = localBabel;
		sharedFactory = createLinker;
	}
	return { babel: localBabel, createLinker };
}

/**
 * Babel + a single shared linker plugin instance (cached). Most callers reuse
 * this; chunk-level linkers that need fresh per-call state should instead use
 * `runAngularLinker(code, { freshPlugin: true })`.
 */
export async function ensureSharedAngularLinker(projectRoot?: string): Promise<{ babel: BabelCore | null; linkerPlugin: any }> {
	const { babel, createLinker } = await getAngularLinkerFactory(projectRoot);
	if (!babel || !createLinker) {
		return { babel: null as any, linkerPlugin: null as any };
	}
	if (!sharedPlugin) {
		const fileSystem = await resolveAngularFileSystem(projectRoot);
		sharedPlugin = createLinker({ sourceMapping: false, fileSystem });
	}
	return { babel, linkerPlugin: sharedPlugin };
}

export interface RunAngularLinkerOptions {
	filename: string;
	projectRoot?: string;
	/** Create a new plugin instance instead of reusing the shared one (chunk linkers avoid stale watch-mode state). */
	freshPlugin?: boolean;
}

/**
 * Run the Angular Babel linker over `code` (rewrites ɵɵngDeclare* partials to
 * ɵɵdefine*). Returns the linked code, or null when the toolchain is
 * unavailable or the code was left unchanged.
 */
export async function runAngularLinker(code: string, opts: RunAngularLinkerOptions): Promise<string | null> {
	if (!code) {
		return null;
	}

	let babel: BabelCore | null;
	let plugin: any;
	if (opts.freshPlugin) {
		const factory = await getAngularLinkerFactory(opts.projectRoot);
		babel = factory.babel;
		if (!babel || !factory.createLinker) {
			return null;
		}
		const fileSystem = await resolveAngularFileSystem(opts.projectRoot);
		plugin = factory.createLinker({ sourceMapping: false, fileSystem });
	} else {
		const shared = await ensureSharedAngularLinker(opts.projectRoot);
		babel = shared.babel;
		plugin = shared.linkerPlugin;
		if (!babel || !plugin) {
			return null;
		}
	}

	const result = await (babel as any).transformAsync(code, {
		filename: opts.filename,
		configFile: false,
		babelrc: false,
		sourceMaps: false,
		compact: false,
		plugins: [plugin],
	});
	return result?.code && result.code !== code ? result.code : null;
}
