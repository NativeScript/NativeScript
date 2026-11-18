// Server-side perf instrumentation helpers.
//
// All exports are pure so they can be unit-tested without spinning up
// Vite. The websocket plugin and the hot-update prologue wire them in with
// their own logger:
//   - `formatPopulateInitialGraphSummary` — the single line printed when
//     `populateInitialGraph` finishes (module count and duration).
//   - `classifyHmrUpdateKind` / `formatHmrUpdateSummary` — the per-update
//     timing line.

export type PopulateInitialGraphSummary = {
	moduleCount: number;
	durationMs: number;
	graphVersion: number;
	bumpedVersion: boolean;
};

// Summary line for `populateInitialGraph`. Stable shape so CI greps or
// external dashboards can pick it up without fragile regexes.
export function formatPopulateInitialGraphSummary(input: PopulateInitialGraphSummary): string {
	return `[hmr-ws][populate] modules=${Math.max(0, Math.floor(input.moduleCount))} ms=${Math.max(0, Math.floor(input.durationMs))} graphVersion=${Math.max(0, Math.floor(input.graphVersion))} bumpedVersion=${input.bumpedVersion ? 'yes' : 'no'}`;
}

export type HmrUpdateKind = 'ts' | 'html' | 'css' | 'vue' | 'tsx' | 'jsx' | 'js' | 'mjs' | 'xml' | 'unknown';

/**
 * Classify a file's HMR update kind by extension. Used by the server-side
 * update summary so a quick log line tells us which pipeline ran. Returns
 * `'unknown'` for anything that doesn't match a known dev-time extension —
 * the caller decides whether to log it or skip it entirely.
 */
export function classifyHmrUpdateKind(file: string): HmrUpdateKind {
	if (!file || typeof file !== 'string') return 'unknown';
	const lower = file.toLowerCase();
	if (lower.endsWith('.ts')) return 'ts';
	if (lower.endsWith('.tsx')) return 'tsx';
	if (lower.endsWith('.jsx')) return 'jsx';
	if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
	if (lower.endsWith('.xml')) return 'xml';
	if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.sass') || lower.endsWith('.less')) return 'css';
	if (lower.endsWith('.vue')) return 'vue';
	if (lower.endsWith('.mjs')) return 'mjs';
	if (lower.endsWith('.js')) return 'js';
	return 'unknown';
}

export type HmrUpdateSummary = {
	/** Project-relative or absolute path of the file that triggered HMR. */
	file: string;
	/** File classification. */
	kind: HmrUpdateKind;
	/** Time spent waiting for `populateInitialGraph` to complete (ms). */
	awaitMs: number;
	/** Time spent in framework-specific work (graph updates, invalidation). */
	frameworkMs: number;
	/** Time spent broadcasting the WebSocket message. */
	broadcastMs: number;
	/** End-to-end handler time. */
	totalMs: number;
	/** Number of modules invalidated by the update. */
	invalidated: number;
	/** Number of HMR clients the message was sent to. */
	recipients: number;
	/**
	 * Angular-only narrowing decision: whether transitive-importer
	 * invalidation was narrowed because the changed file lacks Angular
	 * semantic decorators (`@Component`/`@Directive`/`@Pipe`/`@Injectable`/
	 * `@NgModule`). `true` means narrow (importers preserved, ESM live
	 * bindings carry the change). `false` means broad (importers also
	 * invalidated). `null`/`undefined` means the field is not applicable
	 * to this update (e.g. CSS, non-Angular flavor) and the field is
	 * omitted from the summary line entirely.
	 */
	narrowed?: boolean | null;
};

/**
 * Single-line summary for the server side of an HMR update. Always-on so
 * a 6-second `.ts` save is immediately visible without flipping verbose.
 * Format:
 *   [hmr-ws][update] kind=ts file=/src/foo.ts await=12ms framework=180ms broadcast=2ms total=194ms invalidated=23 recipients=1
 *
 * For Angular `.ts` updates, `narrowed=yes|no` is appended so the
 * narrowing decision is immediately visible without flipping verbose:
 *   [hmr-ws][update] kind=ts file=/src/app/foo.constants.ts ... invalidated=1 recipients=1 narrowed=yes
 *   [hmr-ws][update] kind=ts file=/src/app/foo.component.ts ... invalidated=132 recipients=1 narrowed=no
 */
export function formatHmrUpdateSummary(input: HmrUpdateSummary): string {
	const parts = [`kind=${input.kind || 'unknown'}`, `file=${input.file || '<unknown>'}`, `await=${Math.max(0, Math.floor(input.awaitMs))}ms`, `framework=${Math.max(0, Math.floor(input.frameworkMs))}ms`, `broadcast=${Math.max(0, Math.floor(input.broadcastMs))}ms`, `total=${Math.max(0, Math.floor(input.totalMs))}ms`, `invalidated=${Math.max(0, Math.floor(input.invalidated))}`, `recipients=${Math.max(0, Math.floor(input.recipients))}`];
	if (input.narrowed === true) {
		parts.push('narrowed=yes');
	} else if (input.narrowed === false) {
		parts.push('narrowed=no');
	}
	return `[hmr-ws][update] ${parts.join(' ')}`;
}
