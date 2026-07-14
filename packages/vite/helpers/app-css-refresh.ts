/** Result of regenerating the fully transformed app stylesheet. */
export interface AppCssRefreshResult {
	/** True when the output changed relative to the previous successful generation. */
	changed: boolean;
	/**
	 * True when the output differs from the baseline captured by the first
	 * successful generation at dev-server startup. Drives the connect-time
	 * stylesheet sync — see hmr/server/css-connect-sync.ts for the rationale.
	 */
	changedSinceStartup: boolean;
}

/**
 * The refresh state machine for the app stylesheet: serialized generation,
 * previous-output comparison, and the startup baseline.
 *
 * Contract: the returned function NEVER rejects. Generation failure reports
 * `{ changed: true, changedSinceStartup: true }` — conservatism lives here, in
 * exactly one place, because a missed CSS refresh (stale styles for the rest
 * of the session) is worse than a redundant idempotent one. Callers must not
 * re-wrap it in their own fallbacks.
 *
 * Calls are serialized through an internal promise queue: a content edit can
 * arrive while the startup scan is still running, and queueing gives that edit
 * a real baseline instead of racing two Tailwind compilations. The baseline is
 * captured from the first SUCCESSFUL generation, so a transient startup
 * failure cannot poison drift detection for the whole session.
 */
export function createAppCssRefresher(options: { generate: () => Promise<string>; verbose?: boolean }): () => Promise<AppCssRefreshResult> {
	let lastGeneratedCss: string | undefined;
	let startupGeneratedCss: string | undefined;
	let queue: Promise<unknown> = Promise.resolve();

	const runRefresh = async (): Promise<AppCssRefreshResult> => {
		try {
			const generatedCss = await options.generate();
			const changed = lastGeneratedCss === undefined || generatedCss !== lastGeneratedCss;
			lastGeneratedCss = generatedCss;
			if (startupGeneratedCss === undefined) {
				startupGeneratedCss = generatedCss;
			}
			return { changed, changedSinceStartup: generatedCss !== startupGeneratedCss };
		} catch (error) {
			if (options.verbose) console.warn('[ns-entry] app.css refresh failed; reporting changed (conservative)', error);
			return { changed: true, changedSinceStartup: true };
		}
	};

	return () => {
		const next = queue.then(runRefresh, runRefresh);
		queue = next;
		return next;
	};
}
