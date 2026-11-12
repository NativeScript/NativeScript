import { connect } from '../utils/gtk.linux';

export enum connectionType {
	none = 0,
	wifi = 1,
	mobile = 2,
	ethernet = 3,
	bluetooth = 4,
	vpn = 5,
}

// GNetworkMonitor reports reachability, not the link type
function current(): number {
	const monitor = g_network_monitor_get_default();
	return monitor && g_network_monitor_get_network_available(monitor) ? connectionType.ethernet : connectionType.none;
}

export function getConnectionType(): number {
	return current();
}

let disconnect: (() => void) | null = null;

export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
	stopMonitoring();
	disconnect = connect(g_network_monitor_get_default(), 'network-changed', () => connectionTypeChangedCallback(current()), { args: 1 });
}

export function stopMonitoring(): void {
	disconnect?.();
	disconnect = null;
}
