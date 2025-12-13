// HTTP-only dev boot routine
export async function startHttpOnlyBoot(platform: 'ios' | 'android' | 'visionos', mainEntryRelPosix: string, defaultHost: string, verbose?: boolean) {
	if (verbose) console.info('[ns-entry] HMR enabled: attempting HTTP-only boot');

	async function __ns_import_http(u: string): Promise<any> {
		try {
			if (verbose) console.info('[ns-entry][http-import] native import', u);
			return await import(/* @vite-ignore */ u);
		} catch (e1: any) {
			try {
				if (verbose) console.warn('[ns-entry][http-import] native failed:', e1 && (e1.message || e1));
				const r = await fetch(u);
				const t = await r.text();
				if (verbose) console.info('[ns-entry][http-import] fetched bytes', (t && (t as any).length) || 0, 'for', u);
				if (typeof Blob !== 'undefined' && typeof URL !== 'undefined' && (URL as any).createObjectURL) {
					const b = new Blob([t], { type: 'application/javascript' });
					const url = (URL as any).createObjectURL(b);
					try {
						if (verbose) console.info('[ns-entry][http-import] importing blob url');
						return await import(/* @vite-ignore */ url);
					} finally {
						try {
							(URL as any).revokeObjectURL(url);
						} catch {}
					}
				}
				try {
					const enc = typeof (globalThis as any).btoa === 'function' ? (globalThis as any).btoa(unescape(encodeURIComponent(t))) : '';
					if (enc) {
						if (verbose) console.info('[ns-entry][http-import] importing data url');
						return await import(/* @vite-ignore */ 'data:application/javascript;base64,' + enc);
					}
				} catch {}
				throw e1;
			} catch (e2) {
				if (verbose) console.error('[ns-entry][http-import] all strategies failed for', u, (e2 && (e2 as any).message) || e2);
				throw e2;
			}
		}
	}

	const port = 5173;
	const host = (globalThis as any)['__NS_HMR_HOST'] || defaultHost;
	const protoCandidates = (globalThis as any)['__NS_HTTPS__'] ? ['https', 'http'] : ['http', 'https'];

	const buildOrigins = () => {
		const origins: string[] = [];
		if ((globalThis as any)['__NS_HTTP_ORIGIN__']) origins.push((globalThis as any)['__NS_HTTP_ORIGIN__']);
		const hostCandidates: string[] = [];
		// Only accept a concrete host string from the default; ignore wildcard bind addresses.
		try {
			const h = String(host || '');
			if (h && h !== '0.0.0.0' && h !== '::' && h !== 'true') hostCandidates.push(h);
		} catch {}
		// Always try loopback variants
		hostCandidates.push('localhost');
		if (platform === 'android') {
			// Physical device via `adb reverse` often works best with 127.0.0.1
			hostCandidates.push('127.0.0.1');
			// Stock Android emulator host loopback
			hostCandidates.push('10.0.2.2');
			// Genymotion host loopback
			hostCandidates.push('10.0.3.2');
		}
		const dedupedHosts = Array.from(new Set(hostCandidates));
		for (const p of protoCandidates) {
			for (const h of dedupedHosts) origins.push(p + '://' + h + ':' + port);
		}
		return Array.from(new Set(origins));
	};

	let originCandidates = buildOrigins();
	let loaded = false;
	let lastErr: any = null;

	const tryLoad = async () => {
		for (const origin of originCandidates) {
			try {
				const __rtUrl = origin + '/ns/entry-rt';
				if (verbose) console.info('[ns-entry] trying', __rtUrl);
				const __mod = await import(/* @vite-ignore */ __rtUrl);
				const __start = __mod && (__mod.default || __mod);
				if (typeof __start !== 'function') {
					throw new Error('entry-rt missing default export');
				}
				await __start({ origin, main: mainEntryRelPosix, ver: String(Date.now()), verbose: !!verbose });
				loaded = true;
				break;
			} catch (e) {
				lastErr = e;
			}
		}
	};

	await tryLoad();
	if (!loaded) {
		for (let i = 0; i < 12 && !loaded; i++) {
			await new Promise((r) => setTimeout(r, 150));
			originCandidates = buildOrigins();
			await tryLoad();
		}
	}

	if (!loaded) {
		console.error('[ns-entry] HTTP entry load failed after initial retries; holding on temporary root and continuing to retry…', lastErr && ((lastErr as any).message || lastErr));
		while (!loaded) {
			await new Promise((r) => setTimeout(r, 1000));
			originCandidates = buildOrigins();
			await tryLoad();
		}
	}
}
