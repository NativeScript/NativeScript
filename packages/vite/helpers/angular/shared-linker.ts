import { createRequire } from 'node:module';

let sharedBabel: typeof import('@babel/core') | null = null;
let sharedLinkerPlugin: any | null = null;

export async function ensureSharedAngularLinker(projectRoot?: string) {
	if (sharedBabel && sharedLinkerPlugin) {
		return { babel: sharedBabel, linkerPlugin: sharedLinkerPlugin };
	}

	const req = createRequire(projectRoot ? projectRoot + '/package.json' : import.meta.url);
	let localBabel: typeof import('@babel/core') | null = null;
	let linkerPlugin: any = null;

	try {
		const babelPath = req.resolve('@babel/core');
		const linkerPath = req.resolve('@angular/compiler-cli/linker/babel');
		localBabel = (await import(babelPath)) as any;
		const linkerMod: any = await import(linkerPath);
		// Use the default linker plugin which includes fileSystem and logger
		linkerPlugin = linkerMod.default;
	} catch {
		try {
			localBabel = (await import('@babel/core')) as any;
		} catch {}
		try {
			const linkerMod: any = await import('@angular/compiler-cli/linker/babel');
			linkerPlugin = linkerMod.default;
		} catch {}
	}

	if (!localBabel || !linkerPlugin) {
		return { babel: null as any, linkerPlugin: null as any };
	}

	sharedBabel = localBabel;
	sharedLinkerPlugin = linkerPlugin;

	return { babel: sharedBabel, linkerPlugin: sharedLinkerPlugin };
}
