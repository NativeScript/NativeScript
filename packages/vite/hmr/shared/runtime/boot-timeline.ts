// Boot timeline instrumentation for the NativeScript dev session.
//
// `session-bootstrap.ts` is the real boot path on modern runtimes (JS
// boot orchestration). We record how long each segment takes and turn
// the result into a single-line, human-readable log (verbose sessions
// only) showing the shape of a cold boot.

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
	// Client + entry dynamic-import walk (the `import(clientUrl)` +
	// `import(entryUrl)` phase the session bootstrap drives).
	entry?: BootTraceSegment;
	error?: { message: string };
};

// Pure formatter so we can unit-test the exact string shape without
// touching `console.info` or `Date.now()`.
//
// Format:
//   [ns-boot] ok total=1234ms session=45ms importMap=67ms entry=1100ms
//   [ns-boot] FAILED total=230ms session=45ms ...: <message>
//
// Segment entries are only included when a numeric `ms` was recorded —
// this keeps the log compact when a particular phase was skipped (e.g.
// the import map was already configured) or never reached (early error).
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
	push('entry', trace.entry);

	const suffix = trace.error?.message ? `: ${trace.error.message}` : '';

	return `[ns-boot] ${status} ${parts.join(' ')}${suffix}`.replace(/\s+$/, '');
}
