// Vendor bootstrap runtime installer. This runs on device (virtual entry) and must avoid
// define-transform pitfalls (no dot-notation writes on globalThis; use defineProperty or bracket form).
export function installVendorBootstrap(vendorManifest: any, __nsVendorModuleMap: Record<string, any>, verbose?: boolean) {
	const g: any = globalThis as any;
	const setGlobal = (k: string, v: any) => {
		try {
			Object.defineProperty(g, k, { value: v, configurable: true, writable: true });
		} catch {
			try {
				g[k] = v;
			} catch {}
		}
	};

	const manifest = vendorManifest ?? {};
	let registry: Map<string, any> = g['__nsVendorRegistry'];
	if (!registry) setGlobal('__nsVendorRegistry', (registry = new Map()));

	const aliases = new Map<string, string>(Object.entries(manifest.aliases ?? {}));
	const modules = __nsVendorModuleMap ?? {};
	const previousHash = g['__nsVendorHash'];
	if (previousHash === manifest.hash && registry.size > 0) {
		return;
	}
	registry.clear();
	try {
		setGlobal('__nsVendorHash', manifest.hash);
	} catch {}
	try {
		setGlobal('__nsVendorManifest', manifest);
	} catch {}

	for (const id of Object.keys(modules)) {
		if (!aliases.has(id)) aliases.set(id, id);
	}
	for (const [id, mod] of Object.entries(modules)) {
		registry.set(id, mod);
	}

	const baseRequire = typeof g.require === 'function' ? g.require.bind(g) : undefined;
	if (!g['__nsBaseRequire'] && baseRequire) {
		try {
			setGlobal('__nsBaseRequire', baseRequire);
		} catch {}
	}

	const resolve = (id: string) => {
		const normalized = String(id ?? '').replace(/[?#].*$/, '');
		if (registry.has(normalized)) return normalized;
		if ((modules as any)[normalized]) return normalized;
		// direct alias
		const direct = aliases.get(normalized);
		if (direct) return direct;
		// normalize slashes for alias lookups
		const slashNorm = normalized.replace(/\\/g, '/');
		const aliasNormalized = aliases.get(slashNorm) || aliases.get(slashNorm);
		if (aliasNormalized) return aliasNormalized;
		return normalized;
	};
	try {
		setGlobal('__nsResolveVendor', resolve);
	} catch {}

	const ensureModule = (id: string) => {
		const canonical = resolve(id);
		if (registry.has(canonical)) return registry.get(canonical);
		if ((modules as any)[canonical]) {
			const mod = (modules as any)[canonical];
			registry.set(canonical, mod);
			return mod;
		}
		const late = typeof g['__nsBaseRequire'] === 'function' ? g['__nsBaseRequire'] : typeof g.require === 'function' ? g.require.bind(g) : undefined;
		if (late) return late(id);
		throw new Error('[ns-vendor] Module not available: ' + id + ' (canonical: ' + canonical + ')');
	};

	const existingNsRequire = g['__nsRequire'];
	try {
		setGlobal(
			'__nsRequire',
			typeof existingNsRequire === 'function'
				? (id: string) => {
						try {
							return ensureModule(id);
						} catch (error) {
							try {
								return existingNsRequire(id);
							} catch {
								const late = typeof g['__nsBaseRequire'] === 'function' ? g['__nsBaseRequire'] : typeof g.require === 'function' ? g.require.bind(g) : undefined;
								if (late) return late(id);
								throw error;
							}
						}
					}
				: ensureModule,
		);
	} catch {}

	try {
		setGlobal('__nsVendorAliases', aliases);
	} catch {}
	try {
		setGlobal('require', g['__nsRequire']);
	} catch {}
	try {
		setGlobal('__nsRequireIsShim', true);
	} catch {}
	try {
		setGlobal('__nsVendorRequire', g['__nsRequire']);
	} catch {}

	if (verbose) {
		try {
			console.info('[ns-entry] vendor manifest applied', (g['__nsVendorManifest'] || {}).hash);
		} catch {
			try {
				console.info('[ns-entry] vendor manifest applied');
			} catch {}
		}
	}
}
