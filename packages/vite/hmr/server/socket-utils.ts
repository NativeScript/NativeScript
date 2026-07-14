/**
 * Canonical "is this /ns-hmr socket writable" check, shared by the WebSocket
 * plugin's broadcast loops and the connect-time CSS sync. Tolerates minimal
 * socket shapes (tests, wrapped clients): a missing `OPEN` constant falls back
 * to the ws library's numeric OPEN state (1).
 */
export function isSocketClientOpen(client: { readyState?: number; OPEN?: number } | null | undefined): boolean {
	if (!client) {
		return false;
	}
	const openState = typeof client.OPEN === 'number' ? client.OPEN : 1;
	return client.readyState === openState;
}
