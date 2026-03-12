import { createRequire } from 'node:module';

let sharedBabel: typeof import('@babel/core') | null = null;
let sharedLinkerPlugin: any | null = null;

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
	sharedLinkerPlugin = createLinker({
		sourceMapping: false,
		linkPartialDeclaration: true,
	} as any);

	return { babel: sharedBabel, linkerPlugin: sharedLinkerPlugin };
}
