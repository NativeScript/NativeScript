export function installPolyfillsFromModule(module: Partial<Record<keyof typeof global, any>>, polyfills: (keyof typeof global)[]) {
	for (const polyfill of polyfills) {
		if (!(polyfill in global)) {
			global[polyfill as any] = module[polyfill];
		}
	}
}
