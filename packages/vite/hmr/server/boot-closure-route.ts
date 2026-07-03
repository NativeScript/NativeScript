import type { ViteDevServer } from 'vite';
import { resolveProjectMainEntryPath } from './vite-plugin.js';
import { CORE_BUNDLE_PATH, isCorePerModuleServingEnabled } from './core-bundle.js';
import { getServerOrigin } from './server-origin.js';

// `/__ns_dev__/boot-closure` — the server-computed cold-boot module closure.
//
// The device bootstrap (`session-bootstrap.ts`) fetches this list and hands
// it to `__NS_DEV__.kickstartPrefetch(urls)` so the runtime can pre-fill its HTTP
// body cache in ONE parallel wave before V8's synchronous
// `ResolveModuleCallback` walks the entry graph. The server owns the module
// graph, so closure computation lives here — the runtime performs no import
// scanning of its own; it fetches exactly this list.
//
// Watchdog note: the response must come back fast even on a cold Vite
// process. `populateInitialGraph` starts at `configureServer` time (see
// websocket.ts) and we only wait for it up to `maxWaitMs`; a PARTIAL list is
// fine — the kickstart tolerates partial pre-fill and V8 falls back to
// per-module fetches for anything missing.

const SCRIPT_EXT_RE = /\.(ts|tsx|js|jsx|mjs|mts|cts)$/i;

export interface BootClosureGraphSource {
	/** Normalized project-relative graph module ids (e.g. `/src/app.ts`). */
	getGraphModuleIds(): string[];
	/** Kick off (or join) the background initial graph population. */
	ensureInitialGraphPopulationStarted(server: ViteDevServer): Promise<void>;
}

// Pure helper (unit-testable): graph ids → ordered, deduped absolute URL list.
// The entry goes first so the deepest chain starts fetching immediately; the
// /ns/rt and /ns/core bridges ride along since every app module imports them.
// In core-bundle mode the single-eval `/ns/core-bundle.mjs` payload is the
// biggest body in the boot closure, so it goes right after the entry — the
// kickstart prewarm then downloads it in parallel with everything else
// instead of V8 discovering it mid-walk through the /ns/core shim.
export function buildBootClosureUrls(options: { origin: string; entryPathname: string; graphModuleIds: readonly string[]; includeCoreBundle?: boolean }): string[] {
	const origin = options.origin.replace(/\/$/, '');
	const urls: string[] = [];
	const seen = new Set<string>();
	const add = (url: string) => {
		if (!seen.has(url)) {
			seen.add(url);
			urls.push(url);
		}
	};
	const entryPath = options.entryPathname.startsWith('/') ? options.entryPathname : `/${options.entryPathname}`;
	add(`${origin}/ns/m${entryPath.replace(SCRIPT_EXT_RE, '')}`);
	if (options.includeCoreBundle) {
		add(`${origin}${CORE_BUNDLE_PATH}`);
	}
	add(`${origin}/ns/rt`);
	add(`${origin}/ns/core`);
	for (const id of options.graphModuleIds) {
		if (typeof id !== 'string' || !id.startsWith('/')) continue;
		// Vue SFCs and other non-script assets are served through their own
		// routes with their own identity; the /ns/m closure is script-only.
		if (!SCRIPT_EXT_RE.test(id)) continue;
		add(`${origin}/ns/m${id.replace(SCRIPT_EXT_RE, '')}`);
	}
	return urls;
}

export function registerBootClosureRoute(server: ViteDevServer, source: BootClosureGraphSource, options?: { maxWaitMs?: number }): void {
	const maxWaitMs = options?.maxWaitMs ?? 3000;
	server.middlewares.use(async (req, res, next) => {
		try {
			const url = new URL(req.url || '', 'http://localhost');
			if (url.pathname !== '/__ns_dev__/boot-closure') return next();

			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
			if (req.method === 'OPTIONS') {
				res.statusCode = 204;
				res.end();
				return;
			}

			// Wait for the background graph walk, but never past the budget —
			// partial closures are acceptable by contract.
			await Promise.race([source.ensureInitialGraphPopulationStarted(server), new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs))]);

			// Use the single trusted origin resolver — never the client-supplied
			// `Host` header (see the import-map route and CLAUDE.md invariant 6:
			// every device-reachable URL must be byte-identical to the origin
			// baked into bundle.mjs).
			const origin = getServerOrigin(server);
			const projectRoot = server.config?.root || process.cwd();
			const payload = {
				urls: buildBootClosureUrls({
					origin,
					entryPathname: resolveProjectMainEntryPath(projectRoot),
					graphModuleIds: source.getGraphModuleIds(),
					// If the bundle build later fails, the kickstart prefetch of this
					// URL just gets a 503 body — prewarm tolerates failures, and the
					// /ns/core shims never reference the bundle in that case.
					includeCoreBundle: !isCorePerModuleServingEnabled(),
				}),
			};

			res.setHeader('Content-Type', 'application/json');
			res.statusCode = 200;
			res.end(JSON.stringify(payload));
		} catch (error: any) {
			res.statusCode = 500;
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify({ error: error?.message || 'Failed to compute NativeScript boot closure', urls: [] }));
		}
	});
}
