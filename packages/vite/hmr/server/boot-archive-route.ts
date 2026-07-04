import type { ViteDevServer } from 'vite';
import * as http from 'node:http';
import * as https from 'node:https';
import { resolveBootClosureUrls, type BootClosureGraphSource } from './boot-closure-route.js';
import { BOOT_ARCHIVE_PATH, serializeBootArchiveLine, type BootArchiveLine } from '../shared/runtime/boot-archive-format.js';

// `/__ns_dev__/boot-archive` — the batch cold-boot payload.
//
// Streams every boot-closure body as ONE NDJSON payload: each body is
// fetched server-side through the exact same middleware pipeline the device
// would hit (self-loopback requests, so `/ns/m` post-processing, shims, and
// headers are byte-identical), one `{"kind":"mod","url":...,"body":...}`
// line per module. The device bootstrap hands the parsed entries to
// `__NS_DEV__.seedModuleBodies(entries)`, which fills the prewarm cache
// consumed by V8's synchronous module walk.
//
// Failure model mirrors the kickstart: any body that fails to self-fetch is
// simply omitted (the device falls back to a per-URL network fetch for it),
// and a runtime without `seedModuleBodies` never calls this route.

export { BOOT_ARCHIVE_PATH };

export type BootArchiveEntry = Extract<BootArchiveLine, { kind: 'mod' }>;

/**
 * Marks loopback self-fetches so the boot-recording middleware can exclude
 * them — archive-delivered bodies reach the recorder solely through
 * `onArchiveServed`, keeping one writer per data source.
 */
export const NS_INTERNAL_HEADER = 'x-ns-internal';

type LocalFetchResult = { status: number; body: string };
type LocalFetcher = (pathWithSearch: string) => Promise<LocalFetchResult>;

function createSelfLoopbackFetcher(server: ViteDevServer, timeoutMs: number): LocalFetcher | null {
	const address = server.httpServer?.address();
	if (!address || typeof address === 'string') return null;
	const port = address.port;
	const secure = !!server.config?.server?.https;
	const mod = secure ? https : http;
	// Keep-alive agent so the archive build reuses a handful of sockets
	// instead of opening one connection per module body.
	const agent = secure ? new https.Agent({ keepAlive: true, maxSockets: 8, rejectUnauthorized: false }) : new http.Agent({ keepAlive: true, maxSockets: 8 });
	return (pathWithSearch: string) =>
		new Promise<LocalFetchResult>((resolve) => {
			try {
				const req = mod.request(
					{
						host: '127.0.0.1',
						port,
						path: pathWithSearch,
						method: 'GET',
						agent,
						headers: { [NS_INTERNAL_HEADER]: 'boot-archive' },
						// Dev-only loopback against our own (possibly self-signed) server.
						...(secure ? { rejectUnauthorized: false } : {}),
					},
					(res) => {
						const chunks: Buffer[] = [];
						res.on('data', (chunk) => chunks.push(chunk));
						res.on('end', () => resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks).toString('utf8') }));
						res.on('error', () => resolve({ status: 0, body: '' }));
					},
				);
				req.setTimeout(timeoutMs, () => {
					req.destroy();
					resolve({ status: 0, body: '' });
				});
				req.on('error', () => resolve({ status: 0, body: '' }));
				req.end();
			} catch {
				resolve({ status: 0, body: '' });
			}
		});
}

/**
 * Fetch every closure URL through the fetcher with bounded concurrency,
 * invoking `onEntry` in completion order for each 2xx non-empty body.
 * Returns the device-URL list of successfully archived entries.
 */
export async function buildBootArchive(urls: readonly string[], fetchLocal: LocalFetcher, onEntry: (entry: BootArchiveEntry) => void, maxConcurrent = 8): Promise<string[]> {
	const served: string[] = [];
	let next = 0;
	const worker = async () => {
		while (next < urls.length) {
			const index = next++;
			const url = urls[index];
			let pathWithSearch: string;
			try {
				const parsed = new URL(url);
				pathWithSearch = `${parsed.pathname}${parsed.search || ''}`;
			} catch {
				continue;
			}
			const result = await fetchLocal(pathWithSearch);
			if (result.status >= 200 && result.status < 300 && result.body) {
				onEntry({ kind: 'mod', url, body: result.body });
				served.push(url);
			}
		}
	};
	const workers: Promise<void>[] = [];
	for (let i = 0; i < Math.max(1, Math.min(maxConcurrent, urls.length)); i++) {
		workers.push(worker());
	}
	await Promise.all(workers);
	return served;
}

export interface RegisterBootArchiveRouteOptions {
	/** Budget for the graph walk on a cold server (matches boot-closure). */
	maxWaitMs?: number;
	/** Per-body self-fetch timeout (default 120s — first-boot transforms can be slow). */
	fetchTimeoutMs?: number;
	maxConcurrent?: number;
	verbose?: boolean;
	/**
	 * Called with the device-URL paths that were successfully archived. This
	 * is the recorder's only source for archive-delivered bodies: the
	 * loopback self-fetches carry `NS_INTERNAL_HEADER` and are excluded from
	 * organic recording, and seeded devices issue no per-URL requests.
	 */
	onArchiveServed?(paths: string[]): void;
}

export function registerBootArchiveRoute(server: ViteDevServer, source: BootClosureGraphSource, options?: RegisterBootArchiveRouteOptions): void {
	const maxWaitMs = options?.maxWaitMs ?? 3000;
	const fetchTimeoutMs = options?.fetchTimeoutMs ?? 120000;
	const maxConcurrent = options?.maxConcurrent ?? 8;
	server.middlewares.use(async (req, res, next) => {
		try {
			const url = new URL(req.url || '', 'http://localhost');
			if (url.pathname !== BOOT_ARCHIVE_PATH) return next();

			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
			if (req.method === 'OPTIONS') {
				res.statusCode = 204;
				res.end();
				return;
			}

			const fetchLocal = createSelfLoopbackFetcher(server, fetchTimeoutMs);
			if (!fetchLocal) {
				res.statusCode = 503;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ error: 'boot archive unavailable (no bound http server address)' }));
				return;
			}

			const t0 = Date.now();
			const resolved = await resolveBootClosureUrls(server, source, maxWaitMs);

			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/x-ndjson');
			res.write(serializeBootArchiveLine({ kind: 'meta', version: 1, source: resolved.source, urls: resolved.urls.length }));

			let bytes = 0;
			const servedUrls = await buildBootArchive(
				resolved.urls,
				fetchLocal,
				(entry) => {
					bytes += entry.body.length;
					res.write(serializeBootArchiveLine(entry));
				},
				maxConcurrent,
			);
			res.end();

			// Every URL in servedUrls already round-tripped through `new URL`
			// inside buildBootArchive, so re-parsing cannot throw.
			options?.onArchiveServed?.(
				servedUrls.map((u) => {
					const parsed = new URL(u);
					return `${parsed.pathname}${parsed.search || ''}`;
				}),
			);

			if (options?.verbose) {
				console.info(`[hmr-ws][boot-archive] served ${servedUrls.length}/${resolved.urls.length} bodies (${(bytes / 1024).toFixed(0)}kb) from ${resolved.source} closure in ${Date.now() - t0}ms`);
			}
		} catch (error: any) {
			if (!res.headersSent) {
				res.statusCode = 500;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ error: error?.message || 'Failed to build NativeScript boot archive' }));
			} else {
				res.end();
			}
		}
	});
}
