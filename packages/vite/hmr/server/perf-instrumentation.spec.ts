import { describe, expect, it, vi } from 'vitest';
import { classifyBootRoute, classifyHmrUpdateKind, createColdBootRequestCounter, formatHmrUpdateSummary, formatPopulateInitialGraphSummary, formatServerStartupBanner } from './perf-instrumentation.js';

describe('perf-instrumentation', () => {
	describe('formatServerStartupBanner', () => {
		it('renders the canonical single line banner', () => {
			const line = formatServerStartupBanner({
				version: '8.0.0-alpha.49',
				transformConcurrency: 8,
				transformCacheMs: 60000,
				lazyInitialGraph: true,
				graphVersion: 1,
			});

			expect(line).toBe('[hmr-ws] @nativescript/vite@8.0.0-alpha.49 — transformConcurrency=8 transformCacheMs=60000ms lazyInitialGraph=on graphVersion=1');
		});

		it('reports lazyInitialGraph=off when disabled', () => {
			const line = formatServerStartupBanner({
				version: '0.0.0',
				transformConcurrency: 1,
				transformCacheMs: 0,
				lazyInitialGraph: false,
				graphVersion: 0,
			});

			expect(line).toContain('lazyInitialGraph=off');
			expect(line).toContain('transformConcurrency=1');
			expect(line).toContain('transformCacheMs=0ms');
			expect(line).toContain('graphVersion=0');
		});

		it('clamps negative/fractional numeric knobs defensively', () => {
			const line = formatServerStartupBanner({
				version: 'test',
				transformConcurrency: -3.7,
				transformCacheMs: -10,
				lazyInitialGraph: true,
				graphVersion: 4.9,
			});

			expect(line).toContain('transformConcurrency=1');
			expect(line).toContain('transformCacheMs=0ms');
			expect(line).toContain('graphVersion=4');
		});
	});

	describe('classifyBootRoute', () => {
		it('classifies every known NS dev route', () => {
			expect(classifyBootRoute('/ns/import-map.json')).toBe('ns/import-map');
			expect(classifyBootRoute('/@nativescript/vendor.mjs')).toBe('ns/vendor');
			expect(classifyBootRoute('/@nativescript/vite-plugin-runtime.js')).toBe('ns/vendor');
			expect(classifyBootRoute('/ns/m/src/main.ts')).toBe('ns/m');
			expect(classifyBootRoute('/ns/rt/407')).toBe('ns/rt');
			expect(classifyBootRoute('/ns/core/407')).toBe('ns/core');
			expect(classifyBootRoute('/__ns_boot__/abc/index.js')).toBe('ns/boot');
			expect(classifyBootRoute('/__ns_hmr__/abc/index.js')).toBe('ns/hmr');
			expect(classifyBootRoute('/ns/unknown-route')).toBe('ns/other');
			expect(classifyBootRoute('/src/app.html')).toBe('other');
		});

		it('returns other for bogus input', () => {
			expect(classifyBootRoute('')).toBe('other');
			// @ts-expect-error intentional nullish
			expect(classifyBootRoute(null)).toBe('other');
			// @ts-expect-error intentional non-string
			expect(classifyBootRoute(123)).toBe('other');
		});
	});

	describe('createColdBootRequestCounter', () => {
		it('records requests and logs a rolling progress line every N with concurrency snapshot', () => {
			const logs: string[] = [];
			let nowValue = 1000;
			const counter = createColdBootRequestCounter({
				summaryEvery: 3,
				idleWindowMs: 2000,
				now: () => nowValue,
				setTimer: () => 'timer',
				clearTimer: () => undefined,
				log: (line) => logs.push(line),
			});

			const h1 = counter.record('/ns/m/a');
			nowValue += 10;
			counter.record('/ns/m/b');
			nowValue += 10;
			counter.record('/ns/m/c'); // triggers progress (3 % 3 === 0)

			expect(logs).toEqual(['[hmr-ws][cold-boot] progress modules=3 ms=20 inFlight=3 maxConcurrent=3']);
			h1.finish();
			expect(counter.getState()).toMatchObject({ active: true, count: 3, inFlight: 2, maxConcurrent: 3, firstRequestUrl: '/ns/m/a' });
		});

		it('emits a final window-closed summary on finalize() with per-route breakdown', () => {
			const logs: string[] = [];
			let nowValue = 2000;
			const counter = createColdBootRequestCounter({
				summaryEvery: 100,
				idleWindowMs: 1000,
				now: () => nowValue,
				setTimer: () => 'timer',
				clearTimer: () => undefined,
				log: (line) => logs.push(line),
			});

			counter.record('/ns/m/first').finish();
			nowValue += 500;
			counter.record('/ns/m/second').finish();
			nowValue += 20;
			counter.record('/ns/rt/407').finish();
			nowValue += 5;
			counter.record('/ns/core/407').finish();
			nowValue += 5;
			counter.finalize();

			expect(logs).toEqual(['[hmr-ws][cold-boot] window closed modules=4 ms=530 maxConcurrent=1 routes=ns/m=2,ns/rt=1,ns/core=1']);
			expect(counter.getState().active).toBe(false);
		});

		it('omits the routes= suffix when no requests were recorded', () => {
			const logs: string[] = [];
			const counter = createColdBootRequestCounter({
				summaryEvery: 0,
				idleWindowMs: 1000,
				now: () => 0,
				setTimer: () => 'timer',
				clearTimer: () => undefined,
				log: (line) => logs.push(line),
			});

			counter.finalize();
			expect(logs).toEqual(['[hmr-ws][cold-boot] window closed modules=0 ms=0 maxConcurrent=0']);
		});

		it('tracks peak in-flight as maxConcurrent even after requests finish', () => {
			const logs: string[] = [];
			const counter = createColdBootRequestCounter({
				summaryEvery: 0,
				idleWindowMs: 10000,
				now: () => 100,
				setTimer: () => 'timer',
				clearTimer: () => undefined,
				log: (line) => logs.push(line),
			});

			const h1 = counter.record('/ns/m/a');
			const h2 = counter.record('/ns/m/b');
			const h3 = counter.record('/ns/m/c');
			expect(counter.getState().maxConcurrent).toBe(3);
			h1.finish();
			h2.finish();
			h3.finish();
			counter.record('/ns/m/d').finish();
			expect(counter.getState().maxConcurrent).toBe(3);
			expect(counter.getState().inFlight).toBe(0);
		});

		it('does not double-decrement inFlight if finish() is called twice', () => {
			const counter = createColdBootRequestCounter({
				summaryEvery: 0,
				idleWindowMs: 1000,
				now: () => 0,
				setTimer: () => 'timer',
				clearTimer: () => undefined,
				log: () => {},
			});

			const h = counter.record('/ns/m/a');
			h.finish();
			h.finish();
			expect(counter.getState().inFlight).toBe(0);
		});

		it('does not emit rolling summaries when summaryEvery=0 but still emits the final summary', () => {
			const logs: string[] = [];
			let nowValue = 5000;
			const counter = createColdBootRequestCounter({
				summaryEvery: 0,
				idleWindowMs: 1000,
				now: () => nowValue,
				setTimer: () => 'timer',
				clearTimer: () => undefined,
				log: (line) => logs.push(line),
			});

			for (let i = 0; i < 5; i++) {
				counter.record('/ns/m/item-' + i).finish();
				nowValue += 10;
			}

			expect(logs).toHaveLength(0);

			counter.finalize();
			expect(logs).toHaveLength(1);
			expect(logs[0]).toMatch(/^\[hmr-ws\]\[cold-boot\] window closed modules=5 ms=\d+ maxConcurrent=1 routes=ns\/m=5$/);
		});

		it('ignores records after the window is closed and returns a no-op handle', () => {
			const logs: string[] = [];
			const counter = createColdBootRequestCounter({
				summaryEvery: 100,
				idleWindowMs: 1000,
				now: () => 100,
				setTimer: () => 'timer',
				clearTimer: () => undefined,
				log: (line) => logs.push(line),
			});

			counter.record('/ns/m/first');
			counter.finalize();
			expect(counter.getState().active).toBe(false);

			const handle = counter.record('/ns/m/ignored');
			expect(() => handle.finish()).not.toThrow();
			expect(counter.getState().count).toBe(1);
		});

		it('fires the final summary via the scheduled idle timer', () => {
			const logs: string[] = [];
			let nowValue = 0;
			let pendingTimer: (() => void) | null = null;
			const counter = createColdBootRequestCounter({
				summaryEvery: 100,
				idleWindowMs: 1500,
				now: () => nowValue,
				setTimer: (handler) => {
					pendingTimer = handler;
					return 'handle';
				},
				clearTimer: () => {
					pendingTimer = null;
				},
				log: (line) => logs.push(line),
			});

			counter.record('/ns/m/alpha');
			nowValue += 1500;
			expect(pendingTimer).toBeTypeOf('function');
			pendingTimer!();

			expect(logs[0]).toBe('[hmr-ws][cold-boot] window closed modules=1 ms=1500 maxConcurrent=1 routes=ns/m=1');
			expect(counter.getState().active).toBe(false);
		});

		it('cancels the pending idle timer when finalize() is called', () => {
			const logs: string[] = [];
			const clearTimer = vi.fn();
			const counter = createColdBootRequestCounter({
				summaryEvery: 100,
				idleWindowMs: 1500,
				now: () => 42,
				setTimer: () => 'handle',
				clearTimer,
				log: (line) => logs.push(line),
			});

			counter.record('/ns/m/x');
			counter.finalize();

			expect(clearTimer).toHaveBeenCalledWith('handle');
			expect(logs).toHaveLength(1);
		});

		it('defaults idleWindowMs to 5000 when unspecified', () => {
			let scheduledMs = 0;
			const counter = createColdBootRequestCounter({
				summaryEvery: 0,
				now: () => 0,
				setTimer: (_handler, ms) => {
					scheduledMs = ms;
					return 'handle';
				},
				clearTimer: () => undefined,
				log: () => {},
			});

			counter.record('/ns/m/x');
			expect(scheduledMs).toBe(5000);
		});

		it('clamps a too-low idleWindowMs to 100', () => {
			let scheduledMs = 0;
			const counter = createColdBootRequestCounter({
				summaryEvery: 0,
				idleWindowMs: 10,
				now: () => 0,
				setTimer: (_handler, ms) => {
					scheduledMs = ms;
					return 'handle';
				},
				clearTimer: () => undefined,
				log: () => {},
			});

			counter.record('/ns/m/x');
			expect(scheduledMs).toBe(100);
		});
	});

	describe('formatPopulateInitialGraphSummary', () => {
		it('renders a stable single line summary', () => {
			const line = formatPopulateInitialGraphSummary({
				moduleCount: 500,
				durationMs: 2400,
				graphVersion: 1,
				bumpedVersion: false,
			});

			expect(line).toBe('[hmr-ws][populate] modules=500 ms=2400 graphVersion=1 bumpedVersion=no');
		});

		it('marks bumpedVersion=yes when a serve-time walk bumped the version (should not happen on cold boot)', () => {
			const line = formatPopulateInitialGraphSummary({
				moduleCount: 10,
				durationMs: 50,
				graphVersion: 2,
				bumpedVersion: true,
			});

			expect(line).toContain('bumpedVersion=yes');
		});

		it('clamps negatives defensively', () => {
			const line = formatPopulateInitialGraphSummary({
				moduleCount: -5,
				durationMs: -100,
				graphVersion: -2,
				bumpedVersion: false,
			});

			expect(line).toBe('[hmr-ws][populate] modules=0 ms=0 graphVersion=0 bumpedVersion=no');
		});
	});

	describe('classifyHmrUpdateKind', () => {
		it('classifies TypeScript file extensions', () => {
			expect(classifyHmrUpdateKind('/src/foo.ts')).toBe('ts');
			expect(classifyHmrUpdateKind('/SRC/Foo.TS')).toBe('ts');
			expect(classifyHmrUpdateKind('/src/foo.tsx')).toBe('tsx');
		});

		it('classifies JavaScript file extensions', () => {
			expect(classifyHmrUpdateKind('/src/foo.js')).toBe('js');
			expect(classifyHmrUpdateKind('/src/foo.jsx')).toBe('jsx');
			expect(classifyHmrUpdateKind('/src/foo.mjs')).toBe('mjs');
		});

		it('classifies HTML file extensions', () => {
			expect(classifyHmrUpdateKind('/src/foo.html')).toBe('html');
			expect(classifyHmrUpdateKind('/src/foo.htm')).toBe('html');
			expect(classifyHmrUpdateKind('/SRC/Foo.HTML')).toBe('html');
		});

		it('classifies CSS-family file extensions', () => {
			expect(classifyHmrUpdateKind('/src/foo.css')).toBe('css');
			expect(classifyHmrUpdateKind('/src/foo.scss')).toBe('css');
			expect(classifyHmrUpdateKind('/src/foo.sass')).toBe('css');
			expect(classifyHmrUpdateKind('/src/foo.less')).toBe('css');
		});

		it('classifies Vue files', () => {
			expect(classifyHmrUpdateKind('/src/Foo.vue')).toBe('vue');
		});

		it('returns "unknown" for unrecognized or empty input', () => {
			expect(classifyHmrUpdateKind('')).toBe('unknown');
			expect(classifyHmrUpdateKind('/src/foo')).toBe('unknown');
			expect(classifyHmrUpdateKind('/src/foo.svg')).toBe('unknown');
			expect(classifyHmrUpdateKind('/src/foo.json')).toBe('unknown');
			expect(classifyHmrUpdateKind(null as unknown as string)).toBe('unknown');
			expect(classifyHmrUpdateKind(undefined as unknown as string)).toBe('unknown');
		});
	});

	describe('formatHmrUpdateSummary', () => {
		it('renders the canonical single-line summary for an Angular .ts hot update', () => {
			const line = formatHmrUpdateSummary({
				file: '/src/app/common/constants/app-resources.constants.ts',
				kind: 'ts',
				awaitMs: 5,
				frameworkMs: 180,
				broadcastMs: 2,
				totalMs: 187,
				invalidated: 23,
				recipients: 1,
			});

			expect(line).toBe('[hmr-ws][update] kind=ts file=/src/app/common/constants/app-resources.constants.ts await=5ms framework=180ms broadcast=2ms total=187ms invalidated=23 recipients=1');
		});

		it('renders for CSS updates with zero invalidations', () => {
			const line = formatHmrUpdateSummary({
				file: '/src/styles.css',
				kind: 'css',
				awaitMs: 0,
				frameworkMs: 0,
				broadcastMs: 1,
				totalMs: 1,
				invalidated: 0,
				recipients: 2,
			});

			expect(line).toBe('[hmr-ws][update] kind=css file=/src/styles.css await=0ms framework=0ms broadcast=1ms total=1ms invalidated=0 recipients=2');
		});

		it('clamps negative numbers defensively (clock skew)', () => {
			const line = formatHmrUpdateSummary({
				file: '/src/foo.ts',
				kind: 'ts',
				awaitMs: -10,
				frameworkMs: -1,
				broadcastMs: -100,
				totalMs: -50,
				invalidated: -5,
				recipients: -1,
			});

			expect(line).toBe('[hmr-ws][update] kind=ts file=/src/foo.ts await=0ms framework=0ms broadcast=0ms total=0ms invalidated=0 recipients=0');
		});

		it('falls back to placeholders for missing fields', () => {
			const line = formatHmrUpdateSummary({
				file: '',
				kind: '' as 'unknown',
				awaitMs: 0,
				frameworkMs: 0,
				broadcastMs: 0,
				totalMs: 0,
				invalidated: 0,
				recipients: 0,
			});

			expect(line).toContain('kind=unknown');
			expect(line).toContain('file=<unknown>');
		});

		it('floors fractional millisecond values', () => {
			const line = formatHmrUpdateSummary({
				file: '/src/foo.ts',
				kind: 'ts',
				awaitMs: 1.9,
				frameworkMs: 99.999,
				broadcastMs: 0.5,
				totalMs: 102.4,
				invalidated: 7.7,
				recipients: 1.2,
			});

			expect(line).toBe('[hmr-ws][update] kind=ts file=/src/foo.ts await=1ms framework=99ms broadcast=0ms total=102ms invalidated=7 recipients=1');
		});

		it('produces a stable shape that downstream tooling can grep', () => {
			const line = formatHmrUpdateSummary({
				file: '/src/main.ts',
				kind: 'ts',
				awaitMs: 0,
				frameworkMs: 50,
				broadcastMs: 1,
				totalMs: 51,
				invalidated: 1,
				recipients: 1,
			});

			expect(line.startsWith('[hmr-ws][update] ')).toBe(true);
			// Ordered fields so external dashboards can rely on shape.
			const fieldOrder = ['kind=', 'file=', 'await=', 'framework=', 'broadcast=', 'total=', 'invalidated=', 'recipients='];
			let lastIdx = -1;
			for (const field of fieldOrder) {
				const idx = line.indexOf(field);
				expect(idx, `missing field ${field}`).toBeGreaterThanOrEqual(0);
				expect(idx, `unexpected order at ${field}`).toBeGreaterThan(lastIdx);
				lastIdx = idx;
			}
		});

		describe('round-eight: surfaces narrowing decision when applicable', () => {
			it('appends `narrowed=yes` when Round-Seven narrowed the update', () => {
				const line = formatHmrUpdateSummary({
					file: '/src/app/common/constants/app-resources.constants.ts',
					kind: 'ts',
					awaitMs: 0,
					frameworkMs: 12,
					broadcastMs: 1,
					totalMs: 13,
					invalidated: 1,
					recipients: 1,
					narrowed: true,
				});

				expect(line).toBe('[hmr-ws][update] kind=ts file=/src/app/common/constants/app-resources.constants.ts await=0ms framework=12ms broadcast=1ms total=13ms invalidated=1 recipients=1 narrowed=yes');
			});

			it('appends `narrowed=no` when Round-Seven fell back to broad invalidation (e.g. @Component edit)', () => {
				const line = formatHmrUpdateSummary({
					file: '/src/app/components/foo.component.ts',
					kind: 'ts',
					awaitMs: 0,
					frameworkMs: 200,
					broadcastMs: 2,
					totalMs: 202,
					invalidated: 132,
					recipients: 1,
					narrowed: false,
				});

				expect(line).toBe('[hmr-ws][update] kind=ts file=/src/app/components/foo.component.ts await=0ms framework=200ms broadcast=2ms total=202ms invalidated=132 recipients=1 narrowed=no');
			});

			it('omits the `narrowed` field for non-Angular updates (e.g. CSS, HTML)', () => {
				const cssLine = formatHmrUpdateSummary({
					file: '/src/styles.css',
					kind: 'css',
					awaitMs: 0,
					frameworkMs: 0,
					broadcastMs: 1,
					totalMs: 1,
					invalidated: 0,
					recipients: 1,
				});
				expect(cssLine).not.toContain('narrowed=');

				const htmlLine = formatHmrUpdateSummary({
					file: '/src/app/foo.component.html',
					kind: 'html',
					awaitMs: 0,
					frameworkMs: 50,
					broadcastMs: 2,
					totalMs: 52,
					invalidated: 132,
					recipients: 1,
				});
				expect(htmlLine).not.toContain('narrowed=');
			});

			it('omits the `narrowed` field when explicitly null/undefined (back-compat)', () => {
				const nullLine = formatHmrUpdateSummary({
					file: '/src/foo.ts',
					kind: 'ts',
					awaitMs: 0,
					frameworkMs: 50,
					broadcastMs: 1,
					totalMs: 51,
					invalidated: 1,
					recipients: 1,
					narrowed: null,
				});
				expect(nullLine).not.toContain('narrowed=');

				const undefLine = formatHmrUpdateSummary({
					file: '/src/foo.ts',
					kind: 'ts',
					awaitMs: 0,
					frameworkMs: 50,
					broadcastMs: 1,
					totalMs: 51,
					invalidated: 1,
					recipients: 1,
					narrowed: undefined,
				});
				expect(undefLine).not.toContain('narrowed=');
			});

			it('places `narrowed=yes/no` after `recipients=` for grep-stable parsing', () => {
				const line = formatHmrUpdateSummary({
					file: '/src/foo.ts',
					kind: 'ts',
					awaitMs: 0,
					frameworkMs: 1,
					broadcastMs: 0,
					totalMs: 1,
					invalidated: 1,
					recipients: 1,
					narrowed: true,
				});

				expect(line.indexOf('recipients=')).toBeLessThan(line.indexOf('narrowed='));
			});
		});
	});
});
