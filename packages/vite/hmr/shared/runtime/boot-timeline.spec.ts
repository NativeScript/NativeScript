import { afterEach, describe, expect, it } from 'vitest';
import { formatBootTimeline, publishBootTrace, type BootTrace } from './boot-timeline.js';

describe('boot-timeline', () => {
	afterEach(() => {
		delete (globalThis as any).__NS_BOOT_TRACE__;
	});

	describe('formatBootTimeline', () => {
		it('renders an ok status with all segments present', () => {
			const trace: BootTrace = {
				t0: 1000,
				t1: 2345,
				session: { ok: true, ms: 42 },
				importMap: { ok: true, ms: 77 },
				native: { ok: true, ms: 1200 },
			};

			const line = formatBootTimeline(trace);

			expect(line).toBe('[ns-boot] ok total=1345ms session=42ms importMap=77ms native=1200ms');
		});

		it('omits segments whose ms is missing', () => {
			const trace: BootTrace = {
				t0: 1000,
				t1: 1100,
				session: { ok: true, ms: 42 },
				// No importMap — for example, dedup kicked in.
				native: { ok: true, ms: 50 },
			};

			const line = formatBootTimeline(trace);

			expect(line).toBe('[ns-boot] ok total=100ms session=42ms native=50ms');
			expect(line).not.toContain('importMap=');
		});

		it('emits FAILED and appends the error message when an error is present', () => {
			const trace: BootTrace = {
				t0: 1000,
				t1: 1250,
				session: { ok: true, ms: 45 },
				error: { message: '__nsStartDevSession is unavailable in the NativeScript runtime' },
			};

			const line = formatBootTimeline(trace);

			expect(line.startsWith('[ns-boot] FAILED')).toBe(true);
			expect(line).toContain('total=250ms session=45ms');
			expect(line).toContain(': __nsStartDevSession is unavailable in the NativeScript runtime');
		});

		it('skips total when t1 was never recorded', () => {
			const trace: BootTrace = {
				t0: 1000,
				session: { ok: true, ms: 42 },
			};

			const line = formatBootTimeline(trace);

			expect(line).toBe('[ns-boot] ok session=42ms');
			expect(line).not.toContain('total=');
		});

		it('rounds and clamps nonsensical negatives to zero', () => {
			const trace: BootTrace = {
				t0: 2000,
				t1: 1000, // clock went backwards — clamp, don't crash
				session: { ok: true, ms: -5 },
				importMap: { ok: true, ms: 3.7 },
			};

			const line = formatBootTimeline(trace);

			// Total is negative → clamped to 0. Segment -5 → clamped. Non-integer → rounded.
			expect(line).toBe('[ns-boot] ok total=0ms session=0ms importMap=4ms');
		});

		it('tolerates NaN and Infinity without polluting the output', () => {
			const trace: BootTrace = {
				t0: 1000,
				t1: 1100,
				session: { ok: true, ms: Number.NaN },
				importMap: { ok: true, ms: Number.POSITIVE_INFINITY },
				native: { ok: true, ms: 10 },
			};

			const line = formatBootTimeline(trace);

			expect(line).toBe('[ns-boot] ok total=100ms native=10ms');
			expect(line).not.toContain('NaN');
			expect(line).not.toContain('Infinity');
		});

		it('includes status even when no segments were recorded', () => {
			const trace: BootTrace = { t0: 1000, t1: 1000 };
			const line = formatBootTimeline(trace);
			expect(line).toBe('[ns-boot] ok total=0ms');
		});
	});

	describe('publishBootTrace', () => {
		it('writes the trace onto globalThis.__NS_BOOT_TRACE__', () => {
			const trace: BootTrace = {
				t0: 1000,
				t1: 1234,
				session: { ok: true, ms: 50 },
			};

			publishBootTrace(trace);

			expect((globalThis as any).__NS_BOOT_TRACE__).toBe(trace);
		});

		it('never throws when globalThis is frozen', () => {
			// Freezing globalThis is extreme, but we simulate by defining the
			// target property as read-only and ensuring publishBootTrace
			// swallows the resulting TypeError.
			Object.defineProperty(globalThis, '__NS_BOOT_TRACE__', {
				value: 'locked',
				writable: false,
				configurable: true,
			});

			expect(() => publishBootTrace({ t0: 1 })).not.toThrow();

			// Clean up the non-writable property so other tests aren't affected.
			Object.defineProperty(globalThis, '__NS_BOOT_TRACE__', {
				value: undefined,
				writable: true,
				configurable: true,
			});
		});
	});
});
