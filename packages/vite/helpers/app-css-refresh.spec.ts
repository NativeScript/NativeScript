import { describe, expect, it, vi } from 'vitest';

import { createAppCssRefresher } from './app-css-refresh.js';

describe('createAppCssRefresher', () => {
	it('reports changed on the first successful generation and unchanged when output is stable', async () => {
		const refresh = createAppCssRefresher({ generate: vi.fn(async () => '.a{}') });

		expect(await refresh()).toEqual({ changed: true, changedSinceStartup: false });
		expect(await refresh()).toEqual({ changed: false, changedSinceStartup: false });
	});

	it('detects drift from the startup baseline and its reversal', async () => {
		let css = '.a{}';
		const refresh = createAppCssRefresher({ generate: async () => css });

		await refresh(); // baseline = .a{}

		css = '.a{}.b{}';
		expect(await refresh()).toEqual({ changed: true, changedSinceStartup: true });

		// Reverting the edit returns the output to the startup baseline.
		css = '.a{}';
		expect(await refresh()).toEqual({ changed: true, changedSinceStartup: false });
	});

	it('never rejects: generation failure reports conservative changed flags', async () => {
		const refresh = createAppCssRefresher({
			generate: async () => {
				throw new Error('postcss exploded');
			},
		});

		await expect(refresh()).resolves.toEqual({ changed: true, changedSinceStartup: true });
	});

	it('captures the baseline from the first SUCCESSFUL generation, not a failed one', async () => {
		let fail = true;
		const refresh = createAppCssRefresher({
			generate: async () => {
				if (fail) throw new Error('transient startup failure');
				return '.a{}';
			},
		});

		expect(await refresh()).toEqual({ changed: true, changedSinceStartup: true });

		fail = false;
		// First success establishes the baseline — no drift reported against it.
		expect(await refresh()).toEqual({ changed: true, changedSinceStartup: false });
		expect(await refresh()).toEqual({ changed: false, changedSinceStartup: false });
	});

	it('serializes concurrent refreshes through the queue (no overlapping generations)', async () => {
		let running = 0;
		let maxConcurrent = 0;
		const refresh = createAppCssRefresher({
			generate: async () => {
				running += 1;
				maxConcurrent = Math.max(maxConcurrent, running);
				await new Promise((resolve) => setTimeout(resolve, 5));
				running -= 1;
				return '.a{}';
			},
		});

		const [first, second, third] = await Promise.all([refresh(), refresh(), refresh()]);

		expect(maxConcurrent).toBe(1);
		expect(first.changed).toBe(true);
		expect(second.changed).toBe(false);
		expect(third.changed).toBe(false);
	});

	it('keeps the queue alive after a failure (later calls still run)', async () => {
		let fail = true;
		const refresh = createAppCssRefresher({
			generate: async () => {
				if (fail) throw new Error('boom');
				return '.ok{}';
			},
		});

		await refresh();
		fail = false;
		expect(await refresh()).toEqual({ changed: true, changedSinceStartup: false });
	});
});
