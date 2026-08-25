export function installPolyfillsFromModule(module: Partial<Record<keyof typeof global, any>>, polyfills: (keyof typeof global)[]) {
	for (const polyfill of polyfills) {
		// `in` checks presence without reading the property — reading would force
		// runtime-provided lazy globals (e.g. TextDecoder) to materialize eagerly.
		if (!(polyfill in global)) {
			global[polyfill as any] = module[polyfill];
		}
	}
}
