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
	const connectivityManager = getConnectivityManager();
	if (!connectivityManager) {
		return null;
	}

	return connectivityManager.getActiveNetworkInfo();
}

function getNetworkCapabilities() {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const connectivityManager: any = getConnectivityManager();
	const network = connectivityManager.getActiveNetwork();
	const capabilities = connectivityManager.getNetworkCapabilities(network);
	if (capabilities == null) {
		return connectionType.none;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
	if (android.os.Build.VERSION.SDK_INT >= 28) {
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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onReceiveCallback = function onReceiveCallback(context: android.content.Context, intent: android.content.Intent) {
		const newConnectionType = getConnectionType();
		connectionTypeChangedCallback(newConnectionType);
	};
	const zoneCallback = zonedCallback(onReceiveCallback);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	androidApp.registerBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION, zoneCallback);
}

let callback;
let networkCallback;
let notifyCallback;

export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
	if (android.os.Build.VERSION.SDK_INT >= 28) {
		const manager = getConnectivityManager();
		if (manager) {
			notifyCallback = () => {
				const newConnectionType = getConnectionType();
				const zoneCallback = zonedCallback(connectionTypeChangedCallback);
				zoneCallback(newConnectionType);
			};
			const ConnectivityManager = android.net.ConnectivityManager;
			if (!networkCallback) {
				@NativeClass
				class NetworkCallbackImpl extends ConnectivityManager.NetworkCallback {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					onAvailable(network: android.net.Network) {
						if (notifyCallback) {
							notifyCallback();
						}
					}

					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					onCapabilitiesChanged(network: android.net.Network, networkCapabilities: android.net.NetworkCapabilities) {
						if (notifyCallback) {
							notifyCallback();
						}
					}

					// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
	if (android.os.Build.VERSION.SDK_INT >= 28) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const manager = getConnectivityManager();
		if (manager && callback) {
			manager.unregisterNetworkCallback(callback);
			notifyCallback = null;
			callback = null;
		}
	} else {
		androidApp.unregisterBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION);
	}
}
