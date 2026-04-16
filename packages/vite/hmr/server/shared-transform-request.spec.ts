import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSharedTransformRequestRunner } from './websocket.js';

describe('createSharedTransformRequestRunner', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('deduplicates concurrent requests for the same url', async () => {
		let resolveTransform: ((value: { code: string } | null) => void) | null = null;
		const transformRequest = vi.fn(
			() =>
				new Promise<{ code: string } | null>((resolve) => {
					resolveTransform = resolve;
				}),
		);
		const runTransform = createSharedTransformRequestRunner(transformRequest);

		const first = runTransform('/src/main.ts');
		const second = runTransform('/src/main.ts');

		expect(transformRequest).toHaveBeenCalledTimes(1);
		resolveTransform?.({ code: 'export const ready = true;' });

		await expect(first).resolves.toEqual({ code: 'export const ready = true;' });
		await expect(second).resolves.toEqual({ code: 'export const ready = true;' });
	});

	it('allows a new request after the previous one settles', async () => {
		const transformRequest = vi.fn(async (url: string) => ({ code: `export const id = ${JSON.stringify(url)};` }));
		const runTransform = createSharedTransformRequestRunner(transformRequest);

		await runTransform('/src/main.ts');
		await runTransform('/src/main.ts');

		expect(transformRequest).toHaveBeenCalledTimes(2);
	});

	it('serializes different urls through one transform queue', async () => {
		const started: string[] = [];
		const resolvers = new Map<string, (value: { code: string } | null) => void>();
		const transformRequest = vi.fn(
			(url: string) =>
				new Promise<{ code: string } | null>((resolve) => {
					started.push(url);
					resolvers.set(url, resolve);
				}),
		);
		const runTransform = createSharedTransformRequestRunner(transformRequest);

		const first = runTransform('/src/main.ts');
		const second = runTransform('/src/app.component.ts');

		expect(transformRequest).toHaveBeenCalledTimes(1);
		expect(started).toEqual(['/src/main.ts']);

		resolvers.get('/src/main.ts')?.({ code: 'export const main = true;' });
		await expect(first).resolves.toEqual({ code: 'export const main = true;' });

		expect(transformRequest).toHaveBeenCalledTimes(2);
		expect(started).toEqual(['/src/main.ts', '/src/app.component.ts']);

		resolvers.get('/src/app.component.ts')?.({ code: 'export const component = true;' });
		await expect(second).resolves.toEqual({ code: 'export const component = true;' });
	});

	it('reuses recent successful results by cache key', async () => {
		const transformRequest = vi.fn(async (url: string) => ({ code: `export const id = ${JSON.stringify(url)};` }));
		const runTransform = createSharedTransformRequestRunner(transformRequest, undefined, {
			resultCacheTtlMs: 1_000,
			getResultCacheKey: (url) => url.replace('/@fs/Users/example/app', ''),
		});

		await expect(runTransform('/src/main.ts')).resolves.toEqual({ code: 'export const id = "/src/main.ts";' });
		await expect(runTransform('/@fs/Users/example/app/src/main.ts')).resolves.toEqual({ code: 'export const id = "/src/main.ts";' });

		expect(transformRequest).toHaveBeenCalledTimes(1);
	});

	it('allows multiple transforms in parallel when configured', async () => {
		const started: string[] = [];
		const resolvers = new Map<string, (value: { code: string } | null) => void>();
		const transformRequest = vi.fn(
			(url: string) =>
				new Promise<{ code: string } | null>((resolve) => {
					started.push(url);
					resolvers.set(url, resolve);
				}),
		);
		const runTransform = createSharedTransformRequestRunner(transformRequest, undefined, { maxConcurrent: 2 });

		const first = runTransform('/src/main.ts');
		const second = runTransform('/src/app.component.ts');

		expect(transformRequest).toHaveBeenCalledTimes(2);
		expect(started).toEqual(['/src/main.ts', '/src/app.component.ts']);

		resolvers.get('/src/main.ts')?.({ code: 'export const main = true;' });
		resolvers.get('/src/app.component.ts')?.({ code: 'export const component = true;' });

		await expect(first).resolves.toEqual({ code: 'export const main = true;' });
		await expect(second).resolves.toEqual({ code: 'export const component = true;' });
	});

	it('emits a slow-transform warning without releasing the concurrency slot or failing the request', async () => {
		vi.useFakeTimers();

		const started: string[] = [];
		const resolvers = new Map<string, (value: { code: string } | null) => void>();
		const transformRequest = vi.fn(
			(url: string) =>
				new Promise<{ code: string } | null>((resolve) => {
					started.push(url);
					resolvers.set(url, resolve);
				}),
		);
		const onTimeout = vi.fn();
		const runTransform = createSharedTransformRequestRunner(transformRequest, onTimeout, { maxConcurrent: 1 });

		const first = runTransform('/src/main.ts', 100);
		const second = runTransform('/src/app.component.ts', 1_000);
		let firstSettled = false;
		void first.then(() => {
			firstSettled = true;
		});

		expect(transformRequest).toHaveBeenCalledTimes(1);
		expect(started).toEqual(['/src/main.ts']);

		await vi.advanceTimersByTimeAsync(100);

		expect(onTimeout).toHaveBeenCalledWith('/src/main.ts', 100);
		expect(firstSettled).toBe(false);
		expect(transformRequest).toHaveBeenCalledTimes(1);
		expect(started).toEqual(['/src/main.ts']);

		resolvers.get('/src/main.ts')?.({ code: 'export const main = true;' });
		await expect(first).resolves.toEqual({ code: 'export const main = true;' });

		expect(transformRequest).toHaveBeenCalledTimes(2);
		expect(started).toEqual(['/src/main.ts', '/src/app.component.ts']);

		resolvers.get('/src/app.component.ts')?.({ code: 'export const component = true;' });
		await expect(second).resolves.toEqual({ code: 'export const component = true;' });
	});

	it('does not start timeout countdown while a request is still waiting in the queue', async () => {
		vi.useFakeTimers();

		const resolvers = new Map<string, (value: { code: string } | null) => void>();
		const transformRequest = vi.fn(
			(url: string) =>
				new Promise<{ code: string } | null>((resolve) => {
					resolvers.set(url, resolve);
				}),
		);
		const onTimeout = vi.fn();
		const runTransform = createSharedTransformRequestRunner(transformRequest, onTimeout, { maxConcurrent: 1 });

		const first = runTransform('/src/main.ts', 1_000);
		const second = runTransform('/src/app.component.ts', 100);

		await vi.advanceTimersByTimeAsync(500);

		expect(onTimeout).not.toHaveBeenCalled();
		expect(transformRequest).toHaveBeenCalledTimes(1);

		resolvers.get('/src/main.ts')?.({ code: 'export const main = true;' });
		await expect(first).resolves.toEqual({ code: 'export const main = true;' });

		await vi.advanceTimersByTimeAsync(99);
		expect(onTimeout).not.toHaveBeenCalled();

		resolvers.get('/src/app.component.ts')?.({ code: 'export const component = true;' });
		await expect(second).resolves.toEqual({ code: 'export const component = true;' });
		expect(transformRequest).toHaveBeenCalledTimes(2);
	});

	it('keeps slow executions deduplicated until the underlying transform settles', async () => {
		vi.useFakeTimers();

		let resolveTransform: ((value: { code: string } | null) => void) | null = null;
		const transformRequest = vi.fn(
			() =>
				new Promise<{ code: string } | null>((resolve) => {
					resolveTransform = resolve;
				}),
		);
		const onTimeout = vi.fn();
		const runTransform = createSharedTransformRequestRunner(transformRequest, onTimeout);

		const first = runTransform('/src/main.ts', 100);
		await vi.advanceTimersByTimeAsync(100);
		expect(onTimeout).toHaveBeenCalledWith('/src/main.ts', 100);

		const second = runTransform('/src/main.ts', 100);
		expect(transformRequest).toHaveBeenCalledTimes(1);

		resolveTransform?.({ code: 'export const ready = true;' });
		await expect(first).resolves.toEqual({ code: 'export const ready = true;' });
		await expect(second).resolves.toEqual({ code: 'export const ready = true;' });
	});

	it('caches the eventual successful result even when the first caller triggered a slow warning', async () => {
		vi.useFakeTimers();

		let resolveTransform: ((value: { code: string } | null) => void) | null = null;
		const transformRequest = vi.fn(
			() =>
				new Promise<{ code: string } | null>((resolve) => {
					resolveTransform = resolve;
				}),
		);
		const onTimeout = vi.fn();
		const runTransform = createSharedTransformRequestRunner(transformRequest, onTimeout, { resultCacheTtlMs: 1_000 });

		const first = runTransform('/src/main.ts', 100);
		await vi.advanceTimersByTimeAsync(100);
		expect(onTimeout).toHaveBeenCalledWith('/src/main.ts', 100);

		resolveTransform?.({ code: 'export const ready = true;' });
		await expect(first).resolves.toEqual({ code: 'export const ready = true;' });

		await expect(runTransform('/src/main.ts', 100)).resolves.toEqual({ code: 'export const ready = true;' });
		expect(transformRequest).toHaveBeenCalledTimes(1);
	});

	it('drops a recent cached result after explicit invalidation', async () => {
		const transformRequest = vi
			.fn<(_: string) => Promise<{ code: string } | null>>()
			.mockImplementationOnce(async () => ({ code: 'export const version = 1;' }))
			.mockImplementationOnce(async () => ({ code: 'export const version = 2;' }));
		const runTransform = createSharedTransformRequestRunner(transformRequest, undefined, { resultCacheTtlMs: 1_000 });

		await expect(runTransform('/src/main.ts')).resolves.toEqual({ code: 'export const version = 1;' });
		runTransform.invalidate('/src/main.ts');
		await expect(runTransform('/src/main.ts')).resolves.toEqual({ code: 'export const version = 2;' });

		expect(transformRequest).toHaveBeenCalledTimes(2);
	});

	it('ignores a pre-invalidation in-flight result and starts a fresh transform generation', async () => {
		let resolveFirst: ((value: { code: string } | null) => void) | null = null;
		let resolveSecond: ((value: { code: string } | null) => void) | null = null;
		const transformRequest = vi.fn((url: string) => {
			if (transformRequest.mock.calls.length === 1) {
				return new Promise<{ code: string } | null>((resolve) => {
					resolveFirst = resolve;
				});
			}

			return new Promise<{ code: string } | null>((resolve) => {
				resolveSecond = resolve;
			});
		});
		const runTransform = createSharedTransformRequestRunner(transformRequest, undefined, {
			resultCacheTtlMs: 1_000,
			maxConcurrent: 2,
		});

		const first = runTransform('/src/main.ts');
		runTransform.invalidate('/src/main.ts');
		const second = runTransform('/src/main.ts');

		expect(transformRequest).toHaveBeenCalledTimes(2);

		resolveFirst?.({ code: 'export const version = 1;' });
		resolveSecond?.({ code: 'export const version = 2;' });

		await expect(first).resolves.toEqual({ code: 'export const version = 1;' });
		await expect(second).resolves.toEqual({ code: 'export const version = 2;' });
		await expect(runTransform('/src/main.ts')).resolves.toEqual({ code: 'export const version = 2;' });

		expect(transformRequest).toHaveBeenCalledTimes(2);
	});
});
