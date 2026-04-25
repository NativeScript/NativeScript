/**
 * alpha.62 follow-up — early "pending" notification.
 *
 * When `handleHotUpdate(ctx)` first fires for a save event, the server
 * spends 7–200ms doing graph upserts, transforms and dependency
 * analysis BEFORE broadcasting `ns:angular-update` (or
 * `ns:css-updates`). During that window the client has no idea a
 * change is in flight, so the HMR-applying overlay only appears at
 * the tail end of the cycle and the user perceives the dev loop as
 * laggy.
 *
 * `ns:hmr-pending` is broadcast at the very start of `handleHotUpdate`
 * with just the file path + classified kind. The client reacts by
 * showing the 'received' overlay frame immediately. The authoritative
 * payload (`ns:angular-update` / `ns:css-updates`) follows once the
 * server is ready and walks the rest of the stage progression.
 *
 * This module is intentionally a pure helper so the message shape and
 * narrowing rules can be verified without spinning up a Vite dev
 * server.
 */

export type HmrPendingKind = 'ts' | 'css' | 'html' | 'unknown';

export type HmrPendingMessage = {
	type: 'ns:hmr-pending';
	origin: string;
	path: string;
	kind: HmrPendingKind;
	timestamp: number;
};

export function createHmrPendingMessage(input: { origin: string; path: string; kind: string; timestamp: number }): HmrPendingMessage {
	const allowed: HmrPendingKind[] = ['ts', 'css', 'html', 'unknown'];
	const kind = (allowed as readonly string[]).includes(input.kind || '') ? (input.kind as HmrPendingKind) : 'unknown';
	return {
		type: 'ns:hmr-pending',
		origin: typeof input.origin === 'string' ? input.origin : '',
		path: typeof input.path === 'string' ? input.path : '',
		kind,
		timestamp: typeof input.timestamp === 'number' && Number.isFinite(input.timestamp) ? input.timestamp : 0,
	};
}

/**
 * Parser used by the client to identify a pending message regardless of
 * which framework is active. We accept the message only when every
 * expected field is present and well-formed — this guards against
 * accidental matches on legacy server payloads or developer-written
 * mocks during tests.
 */
export function isHmrPendingMessage(value: unknown): value is HmrPendingMessage {
	if (!value || typeof value !== 'object') return false;
	const v = value as Partial<HmrPendingMessage>;
	if (v.type !== 'ns:hmr-pending') return false;
	if (typeof v.path !== 'string' || !v.path) return false;
	if (typeof v.timestamp !== 'number' || !Number.isFinite(v.timestamp)) return false;
	const allowed: HmrPendingKind[] = ['ts', 'css', 'html', 'unknown'];
	if (!(allowed as readonly string[]).includes(v.kind || '')) return false;
	return true;
}
