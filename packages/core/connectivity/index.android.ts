import { android as androidApp, getNativeApplication } from '../application';
export enum connectionType {
	none = 0,
	wifi = 1,
	mobile = 2,
	ethernet = 3,
	bluetooth = 4,
	vpn = 5,
}

const wifi = 'wifi';
const mobile = 'mobile';
const ethernet = 'ethernet';
const bluetooth = 'bluetooth';
const vpn = 'vpn';

// Get Connection Type
function getConnectivityManager(): android.net.ConnectivityManager {
	return getNativeApplication().getApplicationContext().getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
}

function getActiveNetworkInfo(): android.net.NetworkInfo {
	let connectivityManager = getConnectivityManager();
	if (!connectivityManager) {
		return null;
	}

	return connectivityManager.getActiveNetworkInfo();
}

function getNetworkCapabilities() {
	const connectivityManager = getConnectivityManager() as any;
	const network = connectivityManager.getActiveNetwork();
	const capabilities = connectivityManager.getNetworkCapabilities(network);
	if (capabilities == null) {
		return connectionType.none;
	}

	const NetworkCapabilities = (android as any).net.NetworkCapabilities;

	if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
		return connectionType.wifi;
	}

	if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) {
		return connectionType.mobile;
	}

	if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) {
		return connectionType.ethernet;
	}

	if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_BLUETOOTH)) {
		return connectionType.bluetooth;
	}

	if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) {
		return connectionType.vpn;
	}

	return connectionType.none;
}

export function getConnectionType(): number {
	if (android.os.Build.VERSION.SDK_INT >= 28) {
		return getNetworkCapabilities();
	} else {
		let activeNetworkInfo = getActiveNetworkInfo();
		if (!activeNetworkInfo || !activeNetworkInfo.isConnected()) {
			return connectionType.none;
		}

		let type = activeNetworkInfo.getTypeName().toLowerCase();
		if (type.indexOf(wifi) !== -1) {
			return connectionType.wifi;
		}

		if (type.indexOf(mobile) !== -1) {
			return connectionType.mobile;
		}

		if (type.indexOf(ethernet) !== -1) {
			return connectionType.ethernet;
		}

		if (type.indexOf(bluetooth) !== -1) {
			return connectionType.bluetooth;
		}

		if (type.indexOf(vpn) !== -1) {
			return connectionType.vpn;
		}
	}

	return connectionType.none;
}

function startMonitoringLegacy(connectionTypeChangedCallback) {
	let onReceiveCallback = function onReceiveCallback(context: android.content.Context, intent: android.content.Intent) {
		let newConnectionType = getConnectionType();
		connectionTypeChangedCallback(newConnectionType);
	};
	let zoneCallback = <any>zonedCallback(onReceiveCallback);
	androidApp.registerBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION, zoneCallback);
}

let callback;
let networkCallback;
let notifyCallback;
export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
	if (android.os.Build.VERSION.SDK_INT >= 28) {
		const manager = getConnectivityManager() as any;
		if (manager) {
			notifyCallback = () => {
				let newConnectionType = getConnectionType();
				let zoneCallback = <any>zonedCallback(connectionTypeChangedCallback);
				zoneCallback(newConnectionType);
			};
			const ConnectivityManager = (android as any).net.ConnectivityManager;
			if (!networkCallback) {
				networkCallback = ConnectivityManager.NetworkCallback.extend({
					onAvailable(network) {
						notifyCallback();
					},
					onCapabilitiesChanged(network, networkCapabilities) {
						notifyCallback();
					},
					onLost(network) {
						notifyCallback();
					},
					onUnavailable() {
						notifyCallback();
					},
				});
			}
			callback = new networkCallback();
			manager.registerDefaultNetworkCallback(callback);
		}
	} else {
		startMonitoringLegacy(connectionTypeChangedCallback);
	}
}

export function stopMonitoring(): void {
	if (android.os.Build.VERSION.SDK_INT >= 28) {
		const manager = getConnectivityManager() as any;
		if (manager && callback) {
			manager.unregisterNetworkCallback(callback);
			notifyCallback = null;
			callback = null;
		}
	} else {
		androidApp.unregisterBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION);
	}
}
