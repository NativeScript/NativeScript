export enum connectionType {
	none = 0,
	wifi = 1,
	mobile = 2,
	ethernet = 3,
	bluetooth = 4,
	vpn = 5,
}

function parseConnectionProfile(profile?: Windows.Networking.Connectivity.ConnectionProfile) {
	if (!profile) return connectionType.none;

	const adapter = profile.NetworkAdapter;
	if (!adapter) return connectionType.none;

	const type = adapter.IanaInterfaceType;

	switch (type) {
		case 71:
			return connectionType.wifi;
		case 6:
			return connectionType.ethernet;
	}

	if (profile.IsWwanConnectionProfile) {
		return connectionType.mobile;
	}

	if (profile.IsWlanConnectionProfile && profile.GetNetworkConnectivityLevel?.() === 3) {
		return connectionType.vpn;
	}

	return connectionType.none;
}

export function getConnectionType(): number {
	const profile = Windows.Networking.Connectivity.NetworkInformation.GetInternetConnectionProfile();
	return parseConnectionProfile(profile);
}

let callback;
let delegate;

export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
	const zoneCallback = zonedCallback(connectionTypeChangedCallback);
	delegate = NSWinRT.asDelegate(() => {
		const newConnectionType = getConnectionType();
		zoneCallback(newConnectionType);
	});

	Windows.Networking.Connectivity.NetworkInformation.NetworkStatusChanged = delegate;
}

export function stopMonitoring(): void {
	Windows.Networking.Connectivity.NetworkInformation.NetworkStatusChanged = null as never;
	delegate = null;
	callback = null;
}
