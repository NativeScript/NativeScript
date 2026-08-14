import { describe, expect, it, vi } from 'vitest';
import { createSharedTransformRequestRunner } from './shared-transform-request.js';

const okResult = (code: string) => ({ code, map: null, deps: [], dynamicDeps: [] }) as any;

describe('createSharedTransformRequestRunner', () => {
	it('coalesces concurrent requests with the same canonical cache key into a single transform', async () => {
		const transform = vi.fn().mockImplementation(async () => okResult('transformed'));
		const runner = createSharedTransformRequestRunner(transform, undefined, {
			maxConcurrent: 4,
			resultCacheTtlMs: 5000,
			// Collapse `?t=<n>` cache busters so two concurrent urls share a key.
			getResultCacheKey: (url) => url.replace(/([?&])t=\d+(&|$)/g, '$1').replace(/[?&]$/, ''),
		});

		const [a, b] = await Promise.all([runner('/src/main.ts?t=1'), runner('/src/main.ts?t=2')]);

		expect(transform).toHaveBeenCalledTimes(1);
		expect(a?.code).toBe('transformed');
		expect(b?.code).toBe('transformed');
	});

	it('still runs separate transforms for different canonical cache keys', async () => {
		const transform = vi.fn().mockImplementation(async (url: string) => okResult(`code:${url}`));
		const runner = createSharedTransformRequestRunner(transform, undefined, {
			maxConcurrent: 4,
			resultCacheTtlMs: 5000,
			// Different `?import` flag → different cache key.
			getResultCacheKey: (url) => url,
		});

		const [a, b] = await Promise.all([runner('/src/main.ts'), runner('/src/main.ts?import')]);

		expect(transform).toHaveBeenCalledTimes(2);
		expect(a?.code).toBe('code:/src/main.ts');
		expect(b?.code).toBe('code:/src/main.ts?import');
	});

	it('serves the TTL cache on a sequential repeat after the first transform settles', async () => {
		const transform = vi.fn().mockImplementation(async () => okResult('v1'));
		const runner = createSharedTransformRequestRunner(transform, undefined, {
			maxConcurrent: 4,
			resultCacheTtlMs: 5000,
		});

		const first = await runner('/a.ts');
		const second = await runner('/a.ts');

		expect(transform).toHaveBeenCalledTimes(1);
		expect(first?.code).toBe('v1');
		expect(second?.code).toBe('v1');
	});

	it('does not cache falsy (null) transform results', async () => {
		const transform = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(okResult('retry'));
		const runner = createSharedTransformRequestRunner(transform, undefined, {
			maxConcurrent: 4,
			resultCacheTtlMs: 5000,
		});

		const first = await runner('/missing.ts');
		const second = await runner('/missing.ts');

		expect(transform).toHaveBeenCalledTimes(2);
		expect(first).toBeNull();
		expect(second?.code).toBe('retry');
	});

	it('respects maxConcurrent', async () => {
		let concurrent = 0;
		let maxObserved = 0;
		const transform = vi.fn().mockImplementation(async () => {
			concurrent += 1;
			maxObserved = Math.max(maxObserved, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 5));
			concurrent -= 1;
			return okResult('ok');
		});
		const runner = createSharedTransformRequestRunner(transform, undefined, {
			maxConcurrent: 2,
			resultCacheTtlMs: 0,
		});

		await Promise.all(Array.from({ length: 6 }, (_, i) => runner(`/item-${i}.ts`)));

		expect(maxObserved).toBeLessThanOrEqual(2);
		expect(transform).toHaveBeenCalledTimes(6);
	});

	it('invalidate() forces a fresh transform even within TTL', async () => {
		const transform = vi.fn().mockResolvedValueOnce(okResult('v1')).mockResolvedValueOnce(okResult('v2'));
		const runner = createSharedTransformRequestRunner(transform, undefined, {
			maxConcurrent: 4,
			resultCacheTtlMs: 5000,
		});

		const first = await runner('/a.ts');
		runner.invalidate('/a.ts');
		const second = await runner('/a.ts');

		expect(first?.code).toBe('v1');
		expect(second?.code).toBe('v2');
		expect(transform).toHaveBeenCalledTimes(2);
	});
});
