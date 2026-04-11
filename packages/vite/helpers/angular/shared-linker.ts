import { createRequire } from 'node:module';

let sharedBabel: typeof import('@babel/core') | null = null;
let sharedLinkerPlugin: any | null = null;

/**
 * Resolve the Angular NodeJSFileSystem from the project or fallback locations.
 * Angular 21+ requires a `fileSystem` option for the linker plugin — without it
 * the Babel transform throws "Cannot read properties of undefined (reading 'resolve')".
 */
async function resolveAngularFileSystem(projectRoot?: string): Promise<any> {
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
	// Fallback: build a minimal fileSystem that satisfies the linker's requirements
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

export { resolveAngularFileSystem };

export async function ensureSharedAngularLinker(projectRoot?: string) {
	if (sharedBabel && sharedLinkerPlugin) {
		return { babel: sharedBabel, linkerPlugin: sharedLinkerPlugin };
	}

	const req = createRequire(projectRoot ? projectRoot + '/package.json' : import.meta.url);
	let localBabel: typeof import('@babel/core') | null = null;
	let createLinker: any = null;

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

	if (!localBabel || !createLinker) {
		return { babel: null as any, linkerPlugin: null as any };
	}

	sharedBabel = localBabel;
	const fileSystem = await resolveAngularFileSystem(projectRoot);
	sharedLinkerPlugin = createLinker({
		sourceMapping: false,
		fileSystem,
	} as any);

	return { babel: sharedBabel, linkerPlugin: sharedLinkerPlugin };
}
