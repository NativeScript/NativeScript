// Dev-session worker teardown — fully userland.
//
// The NativeScript runtime deliberately exposes no worker-teardown member on
// the `ns:module` builtin (see the iOS repo's
// WORKER_TERMINATION_USERLAND_REVIEW.md decision record). Instead the dev
// session patches the global `Worker` constructor BEFORE any app, framework,
// or vendor code evaluates, so every main-realm spawn — including plugin
// `dist` code and hand-written `new Worker(...)` calls the transform
// pipeline never saw — lands in the session-wide tracked set
// (`globalThis.__NS_HMR_WORKERS__`). The HMR client sweeps that set before
// framework reboots.
//
// Nested workers need no tracking here: `worker.terminate()` tears down the
// worker's native runtime, whose destructor terminates that realm's child
// workers, cascading down the worker tree. And the sweep can never run
// inside a worker realm — the dev client only evaluates on the main realm —
// so a stuck worker cannot take down its peers.

export interface WorkerSweepResult {
	/** Workers whose `terminate()` was called successfully. */
	terminated: number;
	/** Workers whose `terminate()` threw (already dead, native error, …). */
	failed: number;
	/** Size of the tracked set before the sweep. */
	total: number;
}

/**
 * Patch the global `Worker` constructor so every construction is recorded in
 * `g.__NS_HMR_WORKERS__`. Idempotent (safe to call from every boot path);
 * transparent to callers — `instanceof`, prototype methods and statics all
 * resolve through the native constructor, and subclassing keeps working via
 * `new.target`.
 *
 * Returns `false` when the realm has no `Worker` (tests, worker realms with
 * workers disabled) or the global scope rejects the patch.
 */
export function installWorkerConstructorTracking(g: any, options?: { verbose?: boolean }): boolean {
	let NativeWorker: any;
	try {
		NativeWorker = g && g.Worker;
	} catch {
		return false;
	}
	if (typeof NativeWorker !== 'function') {
		return false;
	}
	if (g.__NS_HMR_WORKER_TRACKING_INSTALLED__ === true) {
		return true;
	}

	let tracked: Set<any>;
	try {
		tracked = g.__NS_HMR_WORKERS__ instanceof Set ? g.__NS_HMR_WORKERS__ : (g.__NS_HMR_WORKERS__ = new Set());
	} catch {
		return false;
	}

	const TrackedWorker = function Worker(this: any, ...args: any[]) {
		const instance = Reflect.construct(NativeWorker, args, new.target || TrackedWorker);
		try {
			tracked.add(instance);
		} catch {}
		return instance;
	};
	TrackedWorker.prototype = NativeWorker.prototype;
	try {
		// Statics (if the host ever adds any) keep resolving through the
		// native constructor.
		Object.setPrototypeOf(TrackedWorker, NativeWorker);
	} catch {}

	try {
		g.Worker = TrackedWorker;
		g.__NS_HMR_WORKER_TRACKING_INSTALLED__ = true;
	} catch {
		return false;
	}

	if (options?.verbose) {
		console.info('[ns-hmr][workers] Worker constructor tracking installed');
	}
	return true;
}

/**
 * Terminate every worker in the tracked set and clear it. Per-worker
 * failures are counted, never thrown — a single misbehaving worker must not
 * abort the HMR cycle that triggered the sweep. Clearing unconditionally
 * keeps the set from growing unbounded across cycles.
 */
export function sweepTrackedWorkers(g: any): WorkerSweepResult {
	let tracked: Set<any> | undefined;
	try {
		tracked = g && g.__NS_HMR_WORKERS__;
	} catch {
		// fall through with `tracked === undefined`
	}

	const total = tracked && typeof tracked.size === 'number' ? tracked.size : 0;
	let terminated = 0;
	let failed = 0;
	if (tracked && total > 0) {
		for (const worker of tracked) {
			try {
				if (worker && typeof worker.terminate === 'function') {
					worker.terminate();
					terminated++;
				}
			} catch {
				failed++;
			}
		}
	}

	if (tracked) {
		try {
			tracked.clear();
		} catch {}
	}

	return { terminated, failed, total };
}
