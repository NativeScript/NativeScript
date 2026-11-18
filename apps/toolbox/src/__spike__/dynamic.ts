export async function load(name: string) {
	const fixed = await import('./helper');
	const variable = await import(`./${name}.ts`);
	const core = await import('@nativescript/core');
	return [fixed, variable, core];
}
