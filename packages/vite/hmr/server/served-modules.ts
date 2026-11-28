import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ViteDevServer } from 'vite';
import { transformIdForViteUrl } from './vite-url.js';

/**
 * Which module instances the device has loaded: each Vite URL with the `?t=`
 * stamps it was served under (0 for none). On the device a module's identity
 * is its URL including `t`, so a module whose current stamp was never served
 * evaluates anew on its next import.
 *
 * One set per dev server and shared by every device: a module counts as
 * loaded once any device fetched it.
 */
export class ServedModules {
	private readonly stamps = new Map<string, Set<number>>();
	private readonly lastServedAt = new Map<string, number>();

	record(viteUrl: string, timestamp: number, at = Date.now()): void {
		let set = this.stamps.get(viteUrl);
		if (!set) {
			set = new Set();
			this.stamps.set(viteUrl, set);
		}
		set.add(timestamp);
		this.lastServedAt.set(viteUrl, at);
	}

	has(viteUrl: string, timestamp: number): boolean {
		return this.stamps.get(viteUrl)?.has(timestamp) ?? false;
	}

	/** True once the device fetched `viteUrl` under any stamp. */
	isServed(viteUrl: string): boolean {
		return this.stamps.has(viteUrl);
	}

	/**
	 * When each module was last served, in `Date.now()` ms, comparable to Vite's
	 * `lastHMRTimestamp`. The stamp alone can't tell whether a fetch came after
	 * an edit: the entry and import-map modules are requested without `?t=`.
	 */
	servedAt(): IterableIterator<[string, number]> {
		return this.lastServedAt.entries();
	}
}

const timestampParamRE = /[?&]t=(\d+)(?:&|$)/;

/** The `t` stamp of a device-requested Vite URL, 0 when it has none. */
export function servedTimestamp(viteUrl: string): number {
	const match = timestampParamRE.exec(viteUrl);
	return match ? Number(match[1]) : 0;
}

// Keyed by the resolved config: hooks receive wrapper server objects, the config is shared.
const servedByConfig = new WeakMap<object, ServedModules>();

export function getServedModules(server: Pick<ViteDevServer, 'config'>): ServedModules {
	let served = servedByConfig.get(server.config);
	if (!served) {
		served = new ServedModules();
		servedByConfig.set(server.config, served);
	}
	return served;
}

const jsContentTypeRE = /\bjavascript\b/i;
const directRequestRE = /[?&]direct(?:[=&]|$)/;

function isModuleResponse(req: IncomingMessage, res: ServerResponse, url: string): boolean {
	if (res.statusCode >= 200 && res.statusCode < 300) return jsContentTypeRE.test(String(res.getHeader('content-type') ?? ''));
	// A 304 carries no content type: a stylesheet is told apart by its request.
	return res.statusCode === 304 && !directRequestRE.test(url) && !req.headers.accept?.includes('text/css');
}

/**
 * Records the module a device request loads once its response finishes: a
 * 2xx JavaScript body, or a 304 for one the device has cached. The served
 * time is when the request arrived, so an edit that lands while Vite
 * transforms it counts as after the fetch. Only URLs naming a node of the
 * client module graph are recorded, under that node's URL (Vite drops `t` and
 * `import` and may append the resolved file's extension).
 */
export function recordServedModuleOnFinish(server: Pick<ViteDevServer, 'config' | 'environments'>, req: IncomingMessage, res: ServerResponse): void {
	const url = req.url;
	if (!url || req.method !== 'GET') return;
	const requestedAt = Date.now();
	res.once('finish', () => {
		if (!isModuleResponse(req, res, url)) return;
		let id: string;
		try {
			id = transformIdForViteUrl(decodeURI(url));
		} catch {
			return;
		}
		void server.environments.client.moduleGraph
			.getModuleByUrl(id)
			.then((mod) => {
				if (mod) getServedModules(server).record(mod.url, servedTimestamp(url), requestedAt);
			})
			.catch(() => {});
	});
}
