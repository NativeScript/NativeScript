import { describe, expect, it, vi } from 'vitest';

import { installWorkerConstructorTracking, sweepTrackedWorkers } from './worker-tracking.js';

// The dev session's userland worker teardown: a global `Worker`
// constructor interception records every main-realm spawn in
// `__NS_HMR_WORKERS__`, and the HMR clients sweep the set before
// framework reboots. These specs pin the interception's transparency
// (instanceof, prototype methods, subclassing) and the sweep's
// fault-tolerance — the runtime exposes no native fallback anymore, so a
// regression here silently leaks one worker generation per HMR cycle.
describe('installWorkerConstructorTracking', () => {
	// A stand-in for the runtime's Worker constructor. Kept deliberately
	// plain (no DOM lib types) — the interception must not depend on any
	// member beyond constructability and a prototype.
	class FakeNativeWorker {
		script: string;
		terminated = false;
		constructor(script: string) {
			this.script = script;
		}
		terminate(): void {
			this.terminated = true;
		}
	}

	function makeScope(): any {
		return { Worker: FakeNativeWorker };
	}

	it('records every construction in __NS_HMR_WORKERS__', () => {
		const g = makeScope();

		expect(installWorkerConstructorTracking(g)).toBe(true);

		const a = new g.Worker('~/a.js');
		const b = new g.Worker('~/b.js');

		expect(g.__NS_HMR_WORKERS__.size).toBe(2);
		expect(g.__NS_HMR_WORKERS__.has(a)).toBe(true);
		expect(g.__NS_HMR_WORKERS__.has(b)).toBe(true);
	});

	it('is transparent: constructor args, prototype methods, and instanceof all keep working', () => {
		const g = makeScope();
		installWorkerConstructorTracking(g);

		const worker = new g.Worker('~/a.js');

		expect(worker.script).toBe('~/a.js');
		expect(worker instanceof FakeNativeWorker).toBe(true);
		expect(worker instanceof g.Worker).toBe(true);
		worker.terminate();
		expect(worker.terminated).toBe(true);
	});

	it('keeps subclassing working via new.target', () => {
		const g = makeScope();
		installWorkerConstructorTracking(g);

		class MyWorker extends g.Worker {
			extra = 'x';
		}
		const worker = new MyWorker('~/sub.js');

		expect(worker.script).toBe('~/sub.js');
		expect(worker.extra).toBe('x');
		expect(worker instanceof MyWorker).toBe(true);
		expect(worker instanceof FakeNativeWorker).toBe(true);
		expect(g.__NS_HMR_WORKERS__.has(worker)).toBe(true);
	});

	it('is idempotent — a second install does not re-wrap (no double-tracking)', () => {
		const g = makeScope();

		expect(installWorkerConstructorTracking(g)).toBe(true);
		const firstPatched = g.Worker;
		expect(installWorkerConstructorTracking(g)).toBe(true);

		expect(g.Worker).toBe(firstPatched);
		new g.Worker('~/a.js');
		expect(g.__NS_HMR_WORKERS__.size).toBe(1);
	});

	it('reuses a pre-existing __NS_HMR_WORKERS__ Set instead of replacing it', () => {
		const g = makeScope();
		const preExisting = { terminate: vi.fn() };
		g.__NS_HMR_WORKERS__ = new Set([preExisting]);

		installWorkerConstructorTracking(g);
		const worker = new g.Worker('~/a.js');

		expect(g.__NS_HMR_WORKERS__.has(preExisting)).toBe(true);
		expect(g.__NS_HMR_WORKERS__.has(worker)).toBe(true);
	});

	it('returns false when the realm has no Worker constructor', () => {
		expect(installWorkerConstructorTracking({})).toBe(false);
		expect(installWorkerConstructorTracking({ Worker: 'not-a-function' })).toBe(false);
	});
});

describe('sweepTrackedWorkers', () => {
	it('terminates every tracked worker and clears the set', () => {
		const workerA = { terminate: vi.fn() };
		const workerB = { terminate: vi.fn() };
		const g: any = { __NS_HMR_WORKERS__: new Set([workerA, workerB]) };

		const result = sweepTrackedWorkers(g);

		expect(workerA.terminate).toHaveBeenCalledTimes(1);
		expect(workerB.terminate).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ terminated: 2, failed: 0, total: 2 });
		expect(g.__NS_HMR_WORKERS__.size).toBe(0);
	});

	it('counts per-worker terminate() failures without aborting the sweep', () => {
		const badWorker = {
			terminate: vi.fn(() => {
				throw new Error('already dead');
			}),
		};
		const goodWorker = { terminate: vi.fn() };
		// Insertion order: bad first, to confirm no short-circuit.
		const g: any = { __NS_HMR_WORKERS__: new Set([badWorker, goodWorker]) };

		const result = sweepTrackedWorkers(g);

		expect(goodWorker.terminate).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ terminated: 1, failed: 1, total: 2 });
		expect(g.__NS_HMR_WORKERS__.size).toBe(0);
	});

	it('no-ops when the tracked set is absent (non-worker apps)', () => {
		expect(sweepTrackedWorkers({})).toEqual({ terminated: 0, failed: 0, total: 0 });
		expect(sweepTrackedWorkers(undefined)).toEqual({ terminated: 0, failed: 0, total: 0 });
	});

	it('end-to-end with the interception: constructed workers are swept', () => {
		class FakeNativeWorker {
			terminate = vi.fn();
		}
		const g: any = { Worker: FakeNativeWorker };
		installWorkerConstructorTracking(g);

		const worker = new g.Worker();
		const result = sweepTrackedWorkers(g);

		expect(worker.terminate).toHaveBeenCalledTimes(1);
		expect(result.terminated).toBe(1);
		expect(g.__NS_HMR_WORKERS__.size).toBe(0);
	});
});
