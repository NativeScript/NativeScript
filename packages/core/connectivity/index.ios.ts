export enum connectionType {
	none = 0,
	wifi = 1,
	mobile = 2,
	ethernet = 3,
	bluetooth = 4,
	vpn = 5,
}

// Get Connection Type
declare const sockaddr;
function _createReachability(host?: string): any {
	if (host) {
		return SCNetworkReachabilityCreateWithName(null, host);
	} else {
		const zeroAddress = new interop.Reference<sockaddr>(sockaddr, {
			sa_len: 16,
			sa_family: 2,
		});

		return SCNetworkReachabilityCreateWithAddress(null, zeroAddress);
	}
}

function _getReachabilityFlags(host?: string): number {
	const reachability = _createReachability(host);
	const flagsRef = new interop.Reference<number>();
	const gotFlags = SCNetworkReachabilityGetFlags(reachability, flagsRef);
	if (!gotFlags) {
		return null;
	}

	return flagsRef.value;
}

function _getConnectionType(host?: string): number {
	const flags = _getReachabilityFlags(host);

	return _getConnectionTypeFromFlags(flags);
}

function _getConnectionTypeFromFlags(flags: number): number {
	if (!flags) {
		return connectionType.none;
	}

	const isReachable = flags & SCNetworkReachabilityFlags.kSCNetworkReachabilityFlagsReachable;
	const connectionRequired = flags & SCNetworkReachabilityFlags.kSCNetworkReachabilityFlagsConnectionRequired;
	if (!isReachable || connectionRequired) {
		return connectionType.none;
	}

	const isWWAN = flags & SCNetworkReachabilityFlags.kSCNetworkReachabilityFlagsIsWWAN;
	if (isWWAN) {
		return connectionType.mobile;
	}

	let keys: any;
	if (typeof CFNetworkCopySystemProxySettings !== 'undefined') {
		const cfDict = CFNetworkCopySystemProxySettings();
		// Only works on iOS device so guarded to help Simulator testing
		if (cfDict && cfDict.takeUnretainedValue) {
			const nsDict = cfDict.takeUnretainedValue();
			keys = nsDict.objectForKey('__SCOPED__');
		}
	}

	if (isVPNConnected(keys)) {
		return connectionType.vpn;
	}

	/*
    TODO try improving with CBCentralManager since toggling bluetooth
      with multiple connections fails to detect switch, require key added
      to Info.plist.
     */
	if (isBluetoothConnected(keys)) {
		return connectionType.bluetooth;
	}

	return connectionType.wifi;
}

function isBluetoothConnected(keys) {
	if (!keys) {
		return false;
	}
	const allKeys = keys.allKeys;
	const size = allKeys.count;
	let isBlueTooth = false;
	for (let i = 0; i < size; i++) {
		const key = allKeys.objectAtIndex(i);
		if (key === 'en4') {
			isBlueTooth = true;
			break;
		}
	}

	return isBlueTooth;
}

function isVPNConnected(keys) {
	if (!keys) {
		return false;
	}
	const allKeys = keys.allKeys;
	const size = allKeys.count;
	let isVPN = false;
	for (let i = 0; i < size; i++) {
		const key = allKeys.objectAtIndex(i);
		if (key === 'tap' || key === 'tun' || key === 'ppp' || key === 'ipsec' || key === 'ipsec0' || key === 'utun1') {
			isVPN = true;
			break;
		}
	}

	return isVPN;
}

export function getConnectionType(): number {
	return _getConnectionType();
}

// Start/Stop Monitoring
function _reachabilityCallback(target: any, flags: number, info: any) {
	if (_connectionTypeChangedCallback) {
		const newConnectionType = _getConnectionTypeFromFlags(flags);
		_connectionTypeChangedCallback(newConnectionType);
	}
}

const _reachabilityCallbackFunctionRef = new interop.FunctionReference(_reachabilityCallback);

let _monitorReachabilityRef: any;
let _connectionTypeChangedCallback: (newConnectionType: number) => void;

export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
	if (!_monitorReachabilityRef) {
		_monitorReachabilityRef = _createReachability();
		_connectionTypeChangedCallback = <any>zonedCallback(connectionTypeChangedCallback);
		SCNetworkReachabilitySetCallback(_monitorReachabilityRef, _reachabilityCallbackFunctionRef, null);
		SCNetworkReachabilityScheduleWithRunLoop(_monitorReachabilityRef, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode);
		_connectionTypeChangedCallback(_getConnectionType());
	}
}

export function stopMonitoring(): void {
	if (_monitorReachabilityRef) {
		SCNetworkReachabilityUnscheduleFromRunLoop(_monitorReachabilityRef, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode);
		_monitorReachabilityRef = undefined;
		_connectionTypeChangedCallback = undefined;
	}
}
