// Entry runtime executed on device via HTTP ESM.

type EntryOpts = {
	origin: string;
	main: string; // project-relative, e.g. "/src/app.ts"
	ver: string | number;
	verbose?: boolean;
};

declare const __NS_APP_ROOT_VIRTUAL__: string;

function parseStackUrlLineCol(err: any): { url?: string; line?: number; column?: number } {
	try {
		const stack = (err && (err.stack || err.message)) || '';
		const m = stack.match(/(https?:[^\s)]+):(\d+):(\d+)/);
		if (m) return { url: m[1], line: Number(m[2] || 0), column: Number(m[3] || 0) };
	} catch {}
	return {};
}

async function fetchCodeframe(u: string, line?: number) {
	try {
		const res = await fetch(u);
		const text = await res.text();
		const hash = res.headers && (res.headers as any).get ? (res.headers as any).get('X-NS-Source-Hash') || '' : '';
		const lines = String(text || '').split('\n');
		const L = line && line > 0 ? line : 1;
		const start = Math.max(1, L - 4),
			end = Math.min(lines.length, L + 3);
		let context = '';
		for (let i = start; i <= end; i++) {
			const mark = i === L ? '>' : ' ';
			const num = String(i).padStart(4, ' ');
			context += `${mark}${num}: ${lines[i - 1]}\n`;
		}
		console.warn('[ns-entry][diag]', u === (globalThis as any).__NS_ENTRY_LAST_TARGET__ ? 'sanitized' : 'raw', hash ? `(hash ${hash})` : '', '\n' + context);
	} catch (fe: any) {
		try {
			console.warn('[ns-entry][diag] fetch failed', u, fe && (fe.message || fe));
		} catch {}
	}
}

export default async function startEntry(opts: EntryOpts) {
	const ORIGIN = String(opts.origin || '');
	const MAIN = String(opts.main || `${__NS_APP_ROOT_VIRTUAL__}/app.ts`);
	const VER = String(opts.ver || '0');
	const VERBOSE = !!opts.verbose;
	// Announce chosen origin globally for any consumers (e.g., HMR client or helpers)
	try {
		(globalThis as any).__NS_HTTP_ORIGIN__ = ORIGIN;
	} catch {}

	// Module-local trace snapshot
	const TRACE: any = { version: VER, origin: ORIGIN, mainPath: MAIN, t0: Date.now(), preload: { rt: {}, core: {} }, main: {} };

	// Native HTTP ESM import only.
	// Ensure a single canonical module realm.
	const importHttp = async (u: string) => {
		return await import(/* @vite-ignore */ u);
	};

	try {
		// Preload runtime bridge and core bridge
		const t_rt = Date.now();
		try {
			await importHttp(ORIGIN + '/ns/rt/' + VER);
			TRACE.preload.rt = { ok: true, ms: Date.now() - t_rt, url: ORIGIN + '/ns/rt/' + VER };
		} catch (e_rt: any) {
			TRACE.preload.rt = { ok: false, ms: Date.now() - t_rt, url: ORIGIN + '/ns/rt/' + VER, err: String(e_rt && (e_rt.message || e_rt)) };
		}
		const t_core = Date.now();
		try {
			await importHttp(ORIGIN + '/ns/core/' + VER);
			TRACE.preload.core = { ok: true, ms: Date.now() - t_core, url: ORIGIN + '/ns/core/' + VER };
		} catch (e_core: any) {
			TRACE.preload.core = { ok: false, ms: Date.now() - t_core, url: ORIGIN + '/ns/core/' + VER, err: String(e_core && (e_core.message || e_core)) };
		}

		const MAIN_URL = ORIGIN + '/ns/m' + MAIN + '?v=' + VER;
		if (VERBOSE) console.info('[ns-entry] entry importing', MAIN_URL);
		(globalThis as any).__NS_ENTRY_LAST_TARGET__ = MAIN_URL; // used by fetchCodeframe sanitized-vs-raw tag
		const t_main = Date.now();
		let lastMainErr: any = null;
		for (let attempt = 0; attempt < 6; attempt++) {
			try {
				const url = attempt === 0 ? MAIN_URL : MAIN_URL + '&r=' + String(Date.now());
				await importHttp(url);
				lastMainErr = null;
				break;
			} catch (e_main: any) {
				lastMainErr = e_main;
				// brief backoff; allows dev server and device network to settle
				await new Promise((r) => setTimeout(r, 150 + attempt * 150));
			}
		}
		if (lastMainErr) throw lastMainErr;
		TRACE.main = { ok: true, ms: Date.now() - t_main, url: MAIN_URL };
		(globalThis as any).__NS_ENTRY_OK__ = true;

		// Detect whether the early placeholder was installed; defer restoration until after a safe reset
		let hadPlaceholder = false;
		try {
			const g: any = globalThis as any;
			hadPlaceholder = !!(g && g.__NS_DEV_PLACEHOLDER_ROOT_EARLY__);
		} catch {}

		// Placeholder detected: delegate root replacement to the HMR client.
		// Keep entry-runtime hands-off to avoid contention and duplicated logic.
		if (!hadPlaceholder) {
			if (VERBOSE) console.info('[ns-entry] no placeholder root detected; nothing to handoff');
		} else {
			if (VERBOSE) console.info('[ns-entry] placeholder present; delegating root reset to HMR client');
		}
	} catch (e: any) {
		const errInfo = { message: String(e && (e.message || e)), stack: e && e.stack ? String(e.stack) : '' };
		const loc = parseStackUrlLineCol(e);
		const TARGET = loc.url || (globalThis as any).__NS_ENTRY_LAST_TARGET__;
		(errInfo as any).url = loc.url;
		(errInfo as any).line = loc.line;
		(errInfo as any).column = loc.column;
		(globalThis as any).__NS_ENTRY_ERROR__ = errInfo;
		TRACE.error = errInfo;
		try {
			console.error('[ns-entry] failed to import main via HTTP', errInfo.message);
			if (errInfo.stack && VERBOSE) console.error(errInfo.stack);
		} catch {}
		// Always provide minimal diagnostics on error, even if verbose=false
		try {
			const urls: string[] = [TARGET];
			if (typeof TARGET === 'string' && /\/ns\/(asm|sfc|m)/.test(TARGET)) {
				urls.push(TARGET + (TARGET.includes('?') ? '&' : '?') + 'raw=1');
			}
			for (const u of urls) await fetchCodeframe(u, loc.line);
			if (VERBOSE) console.info('[ns-entry][diag] Tip: append ?raw=1 to /ns/m, /ns/sfc, or /ns/asm URLs to compare raw vs sanitized output.');
		} catch {}
		(globalThis as any).__NS_ENTRY_OK__ = false;
		// Re-throw so the HTTP bootloader can try other origin candidates.
		throw e;
	} finally {
		try {
			TRACE.t1 = Date.now();
			(globalThis as any).__NS_ENTRY_TRACE__ = TRACE;
			if (VERBOSE) console.info('[ns-entry][trace]', JSON.stringify(TRACE));
		} catch {}
	}
}
