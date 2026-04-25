// Boot timeline instrumentation for the NativeScript dev session.
//
// `session-bootstrap.ts` is the real boot path on modern runtimes with
// `__nsStartDevSession`. We record how long each segment takes and turn
// the result into a single-line, human-readable log that is always on
// (not behind the verbose flag) so anyone chasing regressions can see
// the shape of a cold boot without having to flip any switches.
//
// The trace is also mirrored onto `globalThis.__NS_BOOT_TRACE__` so a
// developer can `console.log(globalThis.__NS_BOOT_TRACE__)` from the
// device or pick it up via `js:evaluate` in test harnesses.

export type BootTraceSegment = {
	ok?: boolean;
	ms?: number;
	meta?: Record<string, unknown>;
};

export type BootTrace = {
	t0: number;
	t1?: number;
	session?: BootTraceSegment;
	importMap?: BootTraceSegment;
	native?: BootTraceSegment;
	error?: { message: string };
};

// Pure formatter so we can unit-test the exact string shape without
// touching `console.info` or `Date.now()`.
//
// Format:
//   [ns-boot] ok total=1234ms session=45ms importMap=67ms native=1100ms
//   [ns-boot] FAILED total=230ms session=45ms ...: <message>
//
// Segment entries are only included when a numeric `ms` was recorded —
// this keeps the log compact when a particular phase was skipped (e.g.
// `__NS_IMPORT_MAP_CONFIGURED__` dedup) or never reached (early error).
export function formatBootTimeline(trace: BootTrace): string {
	const status = trace.error ? 'FAILED' : 'ok';
	const parts: string[] = [];

	const push = (label: string, seg: BootTraceSegment | undefined) => {
		if (seg && typeof seg.ms === 'number' && Number.isFinite(seg.ms)) {
			parts.push(`${label}=${Math.max(0, Math.round(seg.ms))}ms`);
		}
	};

	const total = typeof trace.t0 === 'number' && typeof trace.t1 === 'number' ? trace.t1 - trace.t0 : undefined;

	if (typeof total === 'number' && Number.isFinite(total)) {
		parts.push(`total=${Math.max(0, Math.round(total))}ms`);
	}

	push('session', trace.session);
	push('importMap', trace.importMap);
	push('native', trace.native);

	const suffix = trace.error?.message ? `: ${trace.error.message}` : '';

	return `[ns-boot] ${status} ${parts.join(' ')}${suffix}`.replace(/\s+$/, '');
}

// Install the trace on `globalThis` so diagnostics can pick it up. We
// use a distinct key from the legacy entry-runtime trace so existing
// readers that expect `__NS_ENTRY_TRACE__` keep working. Exported for
// tests; the runtime path calls this from the session-bootstrap finally
// block.
export function publishBootTrace(trace: BootTrace): void {
	try {
		(globalThis as any).__NS_BOOT_TRACE__ = trace;
	} catch {}
}
