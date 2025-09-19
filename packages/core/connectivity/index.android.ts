import { getNativeApp } from '../application/helpers-common';
import { androidRegisterBroadcastReceiver, androidUnregisterBroadcastReceiver } from '../application/helpers';
import { SDK_VERSION } from '../utils/constants';

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
	return getNativeApp<android.app.Application>().getApplicationContext().getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
}

function getActiveNetworkInfo(): android.net.NetworkInfo {
	const connectivityManager = getConnectivityManager();
	if (!connectivityManager) {
		return null;
	}

	return connectivityManager.getActiveNetworkInfo();
}

function getNetworkCapabilities() {
	// @ts-ignore
	const connectivityManager: any = getConnectivityManager();
	const networkToCheck = connectivityManager.getActiveNetwork();
	const capabilities = connectivityManager.getNetworkCapabilities(networkToCheck);
	return parseNetworkCapabilities(capabilities);
}

function parseNetworkCapabilities(capabilities?: android.net.NetworkCapabilities) {
	if (capabilities == null) {
		return connectionType.none;
	}

	// @ts-ignore
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
	if (SDK_VERSION >= 28) {
		return getNetworkCapabilities();
	} else {
		const activeNetworkInfo = getActiveNetworkInfo();
		if (!activeNetworkInfo || !activeNetworkInfo.isConnected()) {
			return connectionType.none;
		}

		const type = activeNetworkInfo.getTypeName().toLowerCase();
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
	const onReceiveCallback = function onReceiveCallback(context: android.content.Context, intent: android.content.Intent) {
		const newConnectionType = getConnectionType();
		connectionTypeChangedCallback(newConnectionType);
	};
	const zoneCallback = zonedCallback(onReceiveCallback);
	androidRegisterBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION, zoneCallback);
}

let callback;
let networkCallback;
let notifyCallback;

export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
	if (SDK_VERSION >= 28) {
		const manager = getConnectivityManager();
		if (manager) {
			notifyCallback = (network: android.net.Network, networkCapabilities: android.net.NetworkCapabilities) => {
				let newConnectionType = connectionType.none;
				if (network && networkCapabilities) {
					newConnectionType = parseNetworkCapabilities(networkCapabilities);
				}
				const zoneCallback = zonedCallback(connectionTypeChangedCallback);
				zoneCallback(newConnectionType);
			};
			if (!networkCallback) {
				@NativeClass
				class NetworkCallbackImpl extends android.net.ConnectivityManager.NetworkCallback {
					onCapabilitiesChanged(network: android.net.Network, networkCapabilities: android.net.NetworkCapabilities) {
						if (notifyCallback) {
							notifyCallback(network, networkCapabilities);
						}
					}

					onLost(network) {
						if (notifyCallback) {
							notifyCallback();
						}
					}

					onUnavailable() {
						if (notifyCallback) {
							notifyCallback();
						}
					}
				}

				networkCallback = NetworkCallbackImpl;
			}
			callback = new networkCallback();
			manager.registerDefaultNetworkCallback(callback);
		}
	} else {
		startMonitoringLegacy(connectionTypeChangedCallback);
	}
}

export function stopMonitoring(): void {
	if (SDK_VERSION >= 28) {
		// @ts-ignore
		const manager = getConnectivityManager();
		if (manager && callback) {
			manager.unregisterNetworkCallback(callback);
			notifyCallback = null;
			callback = null;
		}
	} else {
		androidUnregisterBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION);
	}
}
