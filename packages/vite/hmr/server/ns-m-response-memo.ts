import { createHash } from 'node:crypto';

// Final-response memo for the `/ns/m` device module server.
//
// The `/ns/m` post-processing pipeline (cleanCode → processCodeForDevice →
// import rewrites → star-export expansion → babel link-check → CJS wrap) is
// deterministic for a given (request spec, Vite transform output, serving
// context) but runs on EVERY request — during an app restart that is ~1000
// modules' worth of repeated babel/regex work even though Vite's own
// transform cache already returns the identical input code. Memoizing the
// final served body keyed by a hash of that input makes restart boots (and
// the boot-archive build, which self-fetches this route) serve at memory
// speed.
//
// Invalidation is free by construction. An HMR edit to a module invalidates
// Vite's transform result, so the next request carries different input code
// and therefore a different key. The context string covers the inputs that
// influence the output but are NOT part of the transformed code: strategy
// flavor, server origin, resolved id, and the HMR graph version — the
// post-processing pipeline reads OTHER modules too (star-export expansion,
// link-check), and any live edit bumps the graph version, conservatively
// flushing every entry. Serve-time warm-up upserts don't bump it, so restart
// boots keep their hits. Stale keys age out of the LRU.

export type NsMResponseMemo = {
	buildKey(spec: string, inputCode: string, context: string): string;
	get(key: string): string | undefined;
	set(key: string, body: string): void;
	size(): number;
	clear(): void;
};

export function createNsMResponseMemo(options?: { maxEntries?: number }): NsMResponseMemo {
	const maxEntries = Math.max(1, Math.floor(options?.maxEntries ?? 2000));
	const entries = new Map<string, string>();
	return {
		buildKey(spec: string, inputCode: string, context: string): string {
			const inputHash = createHash('sha1').update(inputCode).digest('hex');
			return `${spec}\u0000${context}\u0000${inputHash}`;
		},
		get(key: string): string | undefined {
			const value = entries.get(key);
			if (value !== undefined) {
				// LRU touch: re-insert so iteration order tracks recency.
				entries.delete(key);
				entries.set(key, value);
			}
			return value;
		},
		set(key: string, body: string): void {
			if (entries.has(key)) entries.delete(key);
			entries.set(key, body);
			if (entries.size > maxEntries) {
				const oldest = entries.keys().next().value;
				if (oldest !== undefined) entries.delete(oldest);
			}
		},
		size: () => entries.size,
		clear: () => entries.clear(),
	};
}
