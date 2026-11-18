import { describe, expect, it, vi } from 'vitest';
import { classifyHmrUpdateKind, formatHmrUpdateSummary, formatPopulateInitialGraphSummary } from './perf-instrumentation.js';

describe('perf-instrumentation', () => {
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

		describe('surfaces narrowing decision when applicable', () => {
			it('appends `narrowed=yes` when narrowing is applied to the update', () => {
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

			it('appends `narrowed=no` when narrowing falls back to broad invalidation (e.g. @Component edit)', () => {
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
