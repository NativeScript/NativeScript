import type { TransformResult } from 'vite';

export type SharedTransformRequestRunnerOptions = {
	maxConcurrent?: number;
	resultCacheTtlMs?: number;
	getResultCacheKey?: (url: string) => string;
};

export type SharedTransformRequestRunner = ((url: string, timeoutMs?: number) => Promise<TransformResult | null>) & {
	invalidate: (url: string) => void;
	invalidateMany: (urls: Iterable<string>) => void;
	clear: () => void;
};

export function createSharedTransformRequestRunner(transformRequest: (url: string) => Promise<TransformResult | null>, onTimeout?: (url: string, timeoutMs: number) => void, options: SharedTransformRequestRunnerOptions = {}): SharedTransformRequestRunner {
	const inFlight = new Map<string, { execution: Promise<TransformResult | null>; started: Promise<void>; cacheKey: string; generation: number }>();
	const recentResults = new Map<string, { expiresAt: number; result: TransformResult }>();
	const cacheGenerations = new Map<string, number>();
	const queue: Array<() => void> = [];
	const maxConcurrent = Math.max(1, Math.floor(options.maxConcurrent ?? 1));
	const resultCacheTtlMs = Math.max(0, Math.floor(options.resultCacheTtlMs ?? 0));
	const getResultCacheKey = options.getResultCacheKey ?? ((url: string) => url);
	let activeCount = 0;

	const getCacheGeneration = (cacheKey: string) => cacheGenerations.get(cacheKey) ?? 0;
	const invalidateCacheKey = (cacheKey: string) => {
		cacheGenerations.set(cacheKey, getCacheGeneration(cacheKey) + 1);
		recentResults.delete(cacheKey);
	};

	const pruneRecentResults = () => {
		if (!recentResults.size) {
			return;
		}

		const now = Date.now();
		for (const [key, entry] of recentResults) {
			if (entry.expiresAt <= now) {
				recentResults.delete(key);
			}
		}
	};

	const rememberRecentResult = (url: string, result: TransformResult | null, generation: number) => {
		if (!result || resultCacheTtlMs <= 0) {
			return;
		}

		const cacheKey = getResultCacheKey(url);
		if (getCacheGeneration(cacheKey) !== generation) {
			return;
		}
		recentResults.delete(cacheKey);
		recentResults.set(cacheKey, {
			expiresAt: Date.now() + resultCacheTtlMs,
			result,
		});

		if (recentResults.size > 512) {
			const oldestKey = recentResults.keys().next().value;
			if (oldestKey) {
				recentResults.delete(oldestKey);
			}
		}
	};

	const runNext = () => {
		while (activeCount < maxConcurrent) {
			const next = queue.shift();
			if (!next) {
				return;
			}

			activeCount += 1;
			next();
		}
	};

	const schedule = <T>(task: () => Promise<T>): { execution: Promise<T>; started: Promise<void> } => {
		let resolveStarted: (() => void) | null = null;
		const started = new Promise<void>((resolve) => {
			resolveStarted = resolve;
		});

		const execution = new Promise<T>((resolve, reject) => {
			queue.push(() => {
				let started: Promise<T>;
				resolveStarted?.();
				try {
					started = Promise.resolve(task());
				} catch (error) {
					started = Promise.reject(error);
				}

				started.then(resolve, reject).finally(() => {
					activeCount = Math.max(0, activeCount - 1);
					runNext();
				});
			});

			runNext();
		});

		return { execution, started };
	};

	const withTimeout = (entry: { execution: Promise<TransformResult | null>; started: Promise<void> }, url: string, timeoutMs: number) => {
		if (!(timeoutMs > 0)) {
			return entry.execution;
		}

		return entry.started.then(
			() =>
				new Promise<TransformResult | null>((resolve, reject) => {
					const timer = setTimeout(() => {
						try {
							onTimeout?.(url, timeoutMs);
						} catch {}
					}, timeoutMs);

					entry.execution.then(resolve, reject).finally(() => {
						clearTimeout(timer);
					});
				}),
		);
	};

	const runner = ((url: string, timeoutMs = 120000) => {
		pruneRecentResults();
		const cacheKey = getResultCacheKey(url);
		const generation = getCacheGeneration(cacheKey);
		const recent = recentResults.get(cacheKey);
		if (recent && recent.expiresAt > Date.now()) {
			return Promise.resolve(recent.result);
		}

		// Key the in-flight map on the canonical `cacheKey`, not the raw URL,
		// so two concurrent calls for `/foo.ts?t=1` and `/foo.ts?t=2` share a
		// single transform rather than doing the same work twice. The cache
		// key already strips `?t=` and `?v=` cache-busters and sorts the
		// remaining query — see `canonicalizeTransformRequestCacheKey`. This
		// pairs with `rememberRecentResult`, which was always keyed by
		// cacheKey.
		const existingExecution = inFlight.get(cacheKey);
		if (existingExecution && existingExecution.generation === generation) {
			return withTimeout(existingExecution, url, timeoutMs);
		}

		const scheduled = schedule(async () => {
			const result = await Promise.resolve(transformRequest(url));
			rememberRecentResult(url, result, generation);
			return result;
		});
		let execution: Promise<TransformResult | null>;
		execution = scheduled.execution.finally(() => {
			if (inFlight.get(cacheKey)?.execution === execution) {
				inFlight.delete(cacheKey);
			}
		});

		const entry = { execution, started: scheduled.started, cacheKey, generation };
		inFlight.set(cacheKey, entry);

		return withTimeout(entry, url, timeoutMs);
	}) as SharedTransformRequestRunner;

	runner.invalidate = (url: string) => {
		invalidateCacheKey(getResultCacheKey(url));
	};

	runner.invalidateMany = (urls: Iterable<string>) => {
		for (const url of urls || []) {
			runner.invalidate(url);
		}
	};

	runner.clear = () => {
		recentResults.clear();
		cacheGenerations.clear();
	};

	return runner;
}
