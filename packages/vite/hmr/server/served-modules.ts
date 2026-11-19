import type { ViteDevServer } from 'vite';

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
