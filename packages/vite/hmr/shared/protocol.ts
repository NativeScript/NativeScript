/**
 * Wire protocol for the `ns:*` HMR messages exchanged over the dev-server
 * WebSocket between the Vite dev server and the on-device client.
 *
 * This is the single source of truth for message shapes. Server emit sites
 * annotate their payload objects with the matching interface here, so a field
 * rename or type drift becomes a compile error at the emit site instead of a
 * silent runtime mismatch the device only discovers at parse time. The client
 * dispatch (`switch (msg.type)`) consumes the `ServerToClientMessage` union and
 * uses {@link assertNeverNsMessage} for exhaustiveness.
 *
 * Pure types + one pure helper only — this module is in `hmr/shared` and must
 * not import from `hmr/server` or `hmr/client`.
 *
 * Direction is encoded by the two unions:
 *   - {@link ServerToClientMessage} — dev server → device (9 messages)
 *   - {@link ClientToServerMessage} — device → dev server (2 messages)
 */

/** Module entry as carried inside the graph payloads (`ns:hmr-full-graph`, `ns:hmr-delta`). */
export interface GraphModulePayload {
	id: string;
	deps: string[];
	hash: string;
}

/** A single CSS update item nested inside an `ns:css-updates` batch. */
export interface CssUpdateItem {
	type: 'css-update';
	path: string;
	acceptedPath: string;
	timestamp: number;
	/**
	 * Tag for the client's `addTaggedAdditionalCSS`/`removeTaggedAdditionalCSS`
	 * remove+add pair, scoping the replace so repeated edits of the SAME source
	 * swap cleanly instead of stacking. Omitted for the app entry CSS (the
	 * client defaults to the shared `app.css` tag). Set to the component style
	 * file's own path for `styleUrls` edits so a component's rules replace
	 * independently of `app.css`.
	 */
	tag?: string;
}

/** A single Vue SFC registry entry carried inside `ns:vue-sfc-registry`. */
export interface VueSfcRegistryEntry {
	path: string;
	fileName: string;
	hmrId: string;
	/** Always empty in HTTP-only mode (artifacts are fetched over HTTP, not pushed over WS). */
	code: string;
}

/** Classified kind of a pending HMR update (used by `ns:hmr-pending`). */
export type HmrPendingKind = 'ts' | 'css' | 'html' | 'unknown';

// ──────────────────────────────────────────────────────────────────────────
// Server → client
// ──────────────────────────────────────────────────────────────────────────

/** Angular hot-update broadcast: the device evicts `evictPaths` and re-fetches. */
export interface AngularUpdateMessage {
	type: 'ns:angular-update';
	origin: string;
	path: string;
	version: number;
	timestamp: number;
	evictPaths: string[];
	importerEntry: string;
	/** Legacy fallback the Angular client still reads; not emitted by the current server. */
	entryCandidates?: string[];
}

/** Batched CSS hot-update broadcast (direct `.css` saves and Tailwind/PostCSS content edits). */
export interface CssUpdatesMessage {
	type: 'ns:css-updates';
	origin: string;
	updates: CssUpdateItem[];
}

/** Incremental module-graph delta broadcast on every graph mutation. */
export interface HmrDeltaMessage {
	type: 'ns:hmr-delta';
	baseVersion: number;
	newVersion: number;
	changed: GraphModulePayload[];
	removed: string[];
}

/** Full module-graph snapshot sent on connect and in response to `ns:hmr-resync-request`. */
export interface HmrFullGraphMessage {
	type: 'ns:hmr-full-graph';
	version: number;
	modules: GraphModulePayload[];
}

/** Early "change in flight" notification sent at the very start of `handleHotUpdate`. */
export interface HmrPendingMessage {
	type: 'ns:hmr-pending';
	origin: string;
	path: string;
	kind: HmrPendingKind;
	timestamp: number;
}

/**
 * Response to a legacy on-demand module fetch (Option A).
 *
 * No server emit site currently exists — the live module-fetch path resolves
 * HTTP URLs directly — but the client still handles this shape, so it is part
 * of the union for completeness. Shape is inferred from the consumer.
 */
export interface ModuleResponseMessage {
	type: 'ns:module-response';
	requestId: number;
	error?: string;
}

/** TypeScript-flavor module registry primed on connect; coalesced into the graph client-side. */
export interface TsModuleRegistryMessage {
	type: 'ns:ts-module-registry';
	modules: string[];
	ts: number;
}

/** Vue SFC registry sent on connect and in response to `ns:hmr-sfc-registry-request`. */
export interface VueSfcRegistryMessage {
	type: 'ns:vue-sfc-registry';
	entries: VueSfcRegistryEntry[];
	ts: number;
}

/** Mapping-only Vue SFC registry update emitted ahead of the artifact for a changed `.vue` file. */
export interface VueSfcRegistryUpdateMessage {
	type: 'ns:vue-sfc-registry-update';
	path: string;
	fileName: string;
	ts: number;
	version: number;
}

// ──────────────────────────────────────────────────────────────────────────
// Client → server
// ──────────────────────────────────────────────────────────────────────────

/** Device asks for a fresh full graph when its delta base version drifts from the server's. */
export interface HmrResyncRequestMessage {
	type: 'ns:hmr-resync-request';
}

/** Device asks the server to rebuild and re-broadcast the SFC registry. */
export interface HmrSfcRegistryRequestMessage {
	type: 'ns:hmr-sfc-registry-request';
}

// ──────────────────────────────────────────────────────────────────────────
// Unions
// ──────────────────────────────────────────────────────────────────────────

/** Every `ns:*` message the dev server can send to the device. */
export type ServerToClientMessage = AngularUpdateMessage | CssUpdatesMessage | HmrDeltaMessage | HmrFullGraphMessage | HmrPendingMessage | ModuleResponseMessage | TsModuleRegistryMessage | VueSfcRegistryMessage | VueSfcRegistryUpdateMessage;

/** Every `ns:*` message the device can send back to the dev server. */
export type ClientToServerMessage = HmrResyncRequestMessage | HmrSfcRegistryRequestMessage;

/** Any `ns:*` HMR message, regardless of direction. */
export type NsHmrMessage = ServerToClientMessage | ClientToServerMessage;

/** The `type` discriminant of any `ns:*` HMR message. */
export type NsHmrMessageType = NsHmrMessage['type'];

/**
 * Exhaustiveness guard for `switch (msg.type)` dispatch over the message unions.
 * Reaching it means a new message type was added to the union but not handled;
 * TypeScript flags the unhandled branch at compile time and this throws if a
 * truly unexpected payload arrives at runtime.
 */
export function assertNeverNsMessage(message: never): never {
	throw new Error(`Unhandled ns:* HMR message: ${JSON.stringify(message)}`);
}
