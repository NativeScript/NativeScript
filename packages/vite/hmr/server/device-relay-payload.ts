/**
 * Picks what of a `server.ws.send(...)` payload is relayed to `/ns-hmr` clients.
 *
 * Custom events go through unchanged. Stock `update` payloads keep only their
 * `css-update` entries: Analog emits them for stylesheets a component loads at
 * runtime (`?direct&ngcomp=`), and the device swaps those itself the way Vite's
 * client swaps a `<link>`. `js-update` entries and every other payload type are
 * owned by the device's own `ns:hmr-delta`/`ns:angular-update` pipeline.
 */
export function toDeviceRelayPayload(payload: any): any | null {
	if (!payload || typeof payload !== 'object') return null;
	if (payload.type === 'custom') return payload;
	if (payload.type !== 'update' || !Array.isArray(payload.updates)) return null;
	const updates = payload.updates.filter((u: any) => u?.type === 'css-update');
	return updates.length ? { type: 'update', updates } : null;
}
