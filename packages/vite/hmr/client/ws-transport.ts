/**
 * WebSocket transport — connect/reconnect candidate loop plus the connection
 * overlay state machine ('connecting' / 'reconnecting' / 'synchronizing' /
 * 'offline').
 *
 * Protocol handling is injected via `setHmrMessageHandler` (wired by the
 * client entry) so this module knows nothing about message shapes; it only
 * owns socket lifecycle and the "is the connection healthy" UX.
 */

import { getHMRWsUrl, deriveHttpOrigin, setHttpOriginForVite, normalizeSpec, requestModuleFromServer, hmrMetrics, emitHmrModeBannerOnce, ENV_VERBOSE } from './utils.js';
import { getGlobalScope } from '../shared/runtime/global-scope.js';
import { getOverlayApi } from './overlay-driver.js';
import { getNsHotRegistry } from './hot-context.js';

const VERBOSE = ENV_VERBOSE;

type HmrConnectionOverlayStage = 'connecting' | 'reconnecting' | 'synchronizing' | 'offline';

function setConnectionOverlayStage(stage: HmrConnectionOverlayStage, detail?: string) {
	try {
		const api = getOverlayApi();
		if (api && typeof api.setConnectionStage === 'function') {
			api.setConnectionStage(stage, { detail });
		}
	} catch {}
}

function hideConnectionOverlay() {
	try {
		const api = getOverlayApi();
		if (api && typeof api.hide === 'function') {
			api.hide('healthy');
		}
	} catch {}
}

let connectionOverlayTimer: any = null;
let connectionOverlayVisible = false;
let hasOpenedHmrSocket = false;
let awaitingHealthyHmrMessage = false;
let pendingConnectionOverlayStage: HmrConnectionOverlayStage = 'connecting';
let pendingConnectionOverlayDetail = '';
// The stage currently PAINTED on screen (set only when we actually show
// the overlay, not when we merely schedule it). Used to suppress the
// sub-perceptible offline↔reconnecting flicker during the reconnect
// retry loop — see the deferral in `connectHmr`/`tryNext`.
let shownConnectionOverlayStage: HmrConnectionOverlayStage | null = null;

// While the terminal 'offline' frame is showing, a fresh reconnect
// attempt that is refused near-instantly (the norm when the dev server
// is down — especially on the Android emulator, where connection-refused
// returns in ~1ms) would flip the overlay to 'reconnecting' and straight
// back to 'offline', producing a jarring 1-frame flicker. We defer the
// 'reconnecting' frame by this much so an instant failure (→ back to
// 'offline') or a success (→ 'synchronizing') cancels it before it ever
// paints; only a genuinely in-flight attempt surfaces 'reconnecting'.
// On iOS real connect attempts exceed this threshold, so the behaviour
// there is unchanged.
const RECONNECTING_OVER_OFFLINE_DELAY_MS = 500;

function clearConnectionOverlayTimer() {
	if (connectionOverlayTimer) {
		clearTimeout(connectionOverlayTimer);
		connectionOverlayTimer = null;
	}
}

function showConnectionOverlayNow(stage: HmrConnectionOverlayStage, detail?: string) {
	// Painting a stage now supersedes any scheduled (deferred) stage, so
	// cancel the pending timer — otherwise a deferred 'reconnecting' could
	// fire moments after we settle back on 'offline' and revive the flicker.
	clearConnectionOverlayTimer();
	pendingConnectionOverlayStage = stage;
	pendingConnectionOverlayDetail = detail || '';
	connectionOverlayVisible = true;
	shownConnectionOverlayStage = stage;
	setConnectionOverlayStage(stage, detail);
}

function scheduleConnectionOverlay(stage: HmrConnectionOverlayStage, detail?: string, delayMs = 1200) {
	pendingConnectionOverlayStage = stage;
	pendingConnectionOverlayDetail = detail || '';
	clearConnectionOverlayTimer();
	connectionOverlayTimer = setTimeout(() => {
		showConnectionOverlayNow(pendingConnectionOverlayStage, pendingConnectionOverlayDetail);
	}, delayMs);
}

function updateConnectionOverlay(stage: HmrConnectionOverlayStage, detail?: string) {
	pendingConnectionOverlayStage = stage;
	pendingConnectionOverlayDetail = detail || '';
	if (connectionOverlayVisible) {
		showConnectionOverlayNow(stage, detail);
	}
}

function markHmrConnectionHealthy() {
	awaitingHealthyHmrMessage = false;
	clearConnectionOverlayTimer();
	shownConnectionOverlayStage = null;
	if (connectionOverlayVisible) {
		connectionOverlayVisible = false;
		hideConnectionOverlay();
	}
}

/**
 * Called by the protocol dispatcher for every parsed message. The first
 * message after a (re)connect proves the pipe is healthy end-to-end, which is
 * what dismisses the connection overlay — `onopen` alone doesn't (the server
 * may accept the socket and still be mid-restart).
 */
export function noteHealthyHmrMessage(): void {
	if (awaitingHealthyHmrMessage) {
		markHmrConnectionHealthy();
	}
}

let hmrSocket: WebSocket | null = null;
let messageHandler: ((ev: any) => void) | null = null;

/** Wire the protocol dispatcher. Must be set before `connectHmr()` runs. */
export function setHmrMessageHandler(handler: (ev: any) => void): void {
	messageHandler = handler;
}

/** Best-effort send; silently drops when the socket isn't open. */
export function sendHmrMessage(payload: unknown): void {
	try {
		hmrSocket?.send(JSON.stringify(payload));
	} catch {}
}

// Single reconnect timer. Overlapping close/timeout events used to each schedule
// their own `setTimeout(connectHmr, …)`, stacking multiple pending reconnects
// that could spawn (and leak) duplicate sockets/listeners. Route all reconnect
// scheduling through here so only one is ever pending.
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleReconnect(delayMs: number) {
	if (reconnectTimer) clearTimeout(reconnectTimer);
	reconnectTimer = setTimeout(() => {
		reconnectTimer = null;
		connectHmr();
	}, delayMs);
}

// Public hook for NativeScript runtime to call from ImportModuleDynamicallyCallback later.
globalThis.__nsHmrRequestModule = async function (spec: string): Promise<string> {
	let normalized = normalizeSpec(spec);
	// Remove extension for transform lookup variants (server will try .ts/.js/.mjs)
	normalized = normalized.replace(/\.(ts|js|tsx|jsx|mjs)$/i, '');
	if (!normalized.startsWith('/')) normalized = '/' + normalized;
	if (normalized === '@') {
		// Soft-handle instead of throwing to avoid breaking evaluation paths: return a safe empty module stub.
		try {
			const err = new Error('[hmr-fetch] anomalous @ spec');
			const stack = (err as any).stack || '';
			hmrMetrics.invalidAtSpec = (hmrMetrics.invalidAtSpec || 0) + 1;
			console.warn('[hmr-fetch] refusing to fetch bare @ spec; returning stub; original=', spec, 'stack=\n' + stack);
		} catch {}
		return '/__invalid_at__.mjs';
	}
	const url = await requestModuleFromServer(normalized);
	return url;
};

export function connectHmr() {
	if (hmrSocket?.readyState === WebSocket.OPEN) return;
	if (hmrSocket?.readyState === WebSocket.CONNECTING) {
		if (VERBOSE) console.log('[hmr-client] Already connecting to HMR WebSocket, skipping');
		return;
	}
	// A reconnect fired (or a manual connect raced one) — cancel any other pending
	// reconnect so we don't end up with overlapping connect attempts.
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	try {
		globalThis.__NS_HMR_CLIENT_SOCKET_READY__ = false;
	} catch {}
	const overlayStage: HmrConnectionOverlayStage = hasOpenedHmrSocket ? 'reconnecting' : 'connecting';
	const baseUrl = getHMRWsUrl() || 'ws://localhost:5173/ns-hmr';
	const buildCandidates = (url: string): string[] => {
		const candidates: string[] = [];
		try {
			const u = new URL(url);
			const proto = u.protocol === 'wss:' ? ['wss'] : ['ws'];
			const defaultPort = u.port || '5173';

			// Build ordered host candidates with preference to the active HTTP origin
			const orderedHosts: Array<{ host: string; port?: string }> = [];
			try {
				const g: any = getGlobalScope();
				const httpOrigin: string | undefined = g && typeof g.__NS_HTTP_ORIGIN__ === 'string' ? g.__NS_HTTP_ORIGIN__ : undefined;
				if (httpOrigin) {
					try {
						const ho = new URL(httpOrigin);
						orderedHosts.push({
							host: ho.hostname,
							port: ho.port || defaultPort,
						});
					} catch {}
				}
			} catch {}

			// From provided URL
			orderedHosts.push({ host: u.hostname, port: defaultPort });
			// Explicit override
			try {
				const h = globalThis.__NS_HMR_HOST;
				if (h) orderedHosts.push({ host: String(h), port: defaultPort });
			} catch {}
			// Common fallbacks
			orderedHosts.push({ host: '10.0.2.2', port: defaultPort });
			orderedHosts.push({ host: 'localhost', port: defaultPort });

			const seen = new Set<string>();
			for (const p of proto) {
				for (const { host, port } of orderedHosts) {
					const key = `${host}:${port}`;
					if (seen.has(key)) continue;
					seen.add(key);
					const cand = `${p}://${host}:${port}${u.pathname || '/ns-hmr'}${u.search || ''}`;
					candidates.push(cand);
				}
			}
		} catch {
			candidates.push(url);
		}
		// Deduplicate while preserving order
		const seen = new Set<string>();
		return candidates.filter((c) => (seen.has(c) ? false : (seen.add(c), true)));
	};

	const candidates = buildCandidates(baseUrl);
	let idx = 0;

	const tryNext = () => {
		if (idx >= candidates.length) {
			showConnectionOverlayNow('offline', 'Waiting for the Vite websocket to come back.');
			console.warn('[hmr-client] All WS candidates failed:', candidates.join(', '));
			scheduleReconnect(1500);
			return;
		}
		const url = candidates[idx++];
		const connectionDetail = `${overlayStage === 'reconnecting' ? 'Retrying' : 'Opening'} ${url}`;
		if (overlayStage === 'reconnecting' && shownConnectionOverlayStage === 'offline') {
			// Don't flip the visible 'offline' frame to 'reconnecting' for an
			// attempt that may fail instantly — defer it so only a genuinely
			// in-flight attempt surfaces. The deferred show is cancelled by
			// showConnectionOverlayNow (offline re-show / synchronizing) the
			// moment this attempt resolves. Keeps 'offline' stable instead of
			// flickering once per retry. (Checking the PAINTED stage, not the
			// pending one, so every candidate in the loop keeps deferring.)
			scheduleConnectionOverlay(overlayStage, connectionDetail, RECONNECTING_OVER_OFFLINE_DELAY_MS);
		} else if (connectionOverlayVisible) {
			updateConnectionOverlay(overlayStage, connectionDetail);
		} else {
			scheduleConnectionOverlay(overlayStage, connectionDetail);
		}
		try {
			if (VERBOSE) console.log('[hmr-client] Connecting to HMR WebSocket:', url);
			const sock = new WebSocket(url);
			hmrSocket = sock;
			setHttpOriginForVite(deriveHttpOrigin(url));

			let opened = false;
			const timeout = setTimeout(() => {
				if (!opened && sock.readyState !== WebSocket.OPEN) {
					try {
						sock.close();
					} catch {}
					if (VERBOSE) console.warn('[hmr-client] WS connect timeout, trying next…');
					tryNext();
				}
			}, 3500);

			sock.onopen = () => {
				opened = true;
				clearTimeout(timeout);
				clearConnectionOverlayTimer();
				hasOpenedHmrSocket = true;
				awaitingHealthyHmrMessage = true;
				try {
					globalThis.__NS_HMR_CLIENT_SOCKET_READY__ = true;
				} catch {}
				// Wire the JS hot registry's server channel to this socket so
				// `import.meta.hot.send(event, data)` reaches Vite plugins as
				// `{ type: 'custom', event, data }` (Vite wire protocol).
				try {
					getNsHotRegistry().setSendToServer((event: string, data?: unknown) => {
						try {
							if (sock.readyState === WebSocket.OPEN) {
								sock.send(JSON.stringify({ type: 'custom', event, data }));
							}
						} catch {}
					});
				} catch {}
				if (connectionOverlayVisible) {
					showConnectionOverlayNow('synchronizing', 'Connected. Synchronizing the HMR graph.');
				}
				if (VERBOSE) console.log('[hmr-client] Connected to HMR WebSocket');
				// Print the active module reload mode once on first
				// successful connect so the user can correlate HMR latency
				// with runtime capability without grepping for protocol
				// details. The banner is verbose-gated.
				try {
					emitHmrModeBannerOnce();
				} catch {}
			};
			sock.onmessage = (ev: any) => messageHandler?.(ev);
			sock.onerror = (error: any) => {
				clearTimeout(timeout);
				console.warn('[hmr-client] WebSocket error:', (error && (error.message || error)) || error);
			};
			sock.onclose = (ev: any) => {
				clearTimeout(timeout);
				try {
					globalThis.__NS_HMR_CLIENT_SOCKET_READY__ = false;
				} catch {}
				if (!opened) {
					// immediate failure during connect → try another candidate
					if (VERBOSE) console.warn('[hmr-client] WS close before open (code', ev?.code, '), trying next…');
					tryNext();
				} else {
					if (VERBOSE) console.log('[hmr-client] WebSocket closed (code', ev?.code, '), will reconnect…');
					scheduleConnectionOverlay('reconnecting', 'The websocket closed. Waiting to reconnect.', 700);
					// try to reconnect with full candidate list again
					scheduleReconnect(1000);
				}
			};
		} catch (e) {
			console.warn('[hmr-client] Failed to connect WebSocket', e);
			tryNext();
		}
	};

	tryNext();
}
