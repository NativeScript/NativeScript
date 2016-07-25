import common = require("./connectivity-common");

global.moduleMerge(common, exports);

// Get Connection Type
declare var sockaddr;
function _createReachability(host?: string): any {
    if (host) {
        return SCNetworkReachabilityCreateWithName(null, host);
    }
    else {
        var zeroAddress = new interop.Reference<sockaddr>(sockaddr, {
            sa_len: 16,
            sa_family: 2
        });
        return SCNetworkReachabilityCreateWithAddress(null, zeroAddress);
    }
}

function _getReachabilityFlags(host?: string): number {
    var reachability = _createReachability(host);
    var flagsRef = new interop.Reference<number>();
    var gotFlags = SCNetworkReachabilityGetFlags(reachability, flagsRef);
    if (!gotFlags) {
        return null;
    }
    return flagsRef.value;
}

function _getConnectionType(host?: string): number {
    var flags = _getReachabilityFlags(host);
    return _getConnectionTypeFromFlags(flags);
}

function _getConnectionTypeFromFlags(flags: number): number {
    if (!flags) {
        return common.connectionType.none;
    }

    var isReachable = flags & SCNetworkReachabilityFlags.kSCNetworkReachabilityFlagsReachable;
    var connectionRequired = flags & SCNetworkReachabilityFlags.kSCNetworkReachabilityFlagsConnectionRequired;
    if (!isReachable || connectionRequired) {
        return common.connectionType.none;
    }

    var isWWAN = flags & SCNetworkReachabilityFlags.kSCNetworkReachabilityFlagsIsWWAN;
    if (isWWAN) {
        return common.connectionType.mobile;
    }

    return common.connectionType.wifi;
}

export function getConnectionType(): number {
    return _getConnectionType();
}

// Start/Stop Monitoring
function _reachabilityCallback(target: any, flags: number, info: any) {
    if (_connectionTypeChangedCallback) {
        var newConnectionType = _getConnectionTypeFromFlags(flags);
        _connectionTypeChangedCallback(newConnectionType);
    }
}
var _reachabilityCallbackFunctionRef = new interop.FunctionReference(_reachabilityCallback)

var _monitorReachabilityRef: any;
var _connectionTypeChangedCallback: (newConnectionType: number) => void;

export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
    if (!_monitorReachabilityRef) {
        _monitorReachabilityRef = _createReachability();
        _connectionTypeChangedCallback = connectionTypeChangedCallback;
        SCNetworkReachabilitySetCallback(_monitorReachabilityRef, _reachabilityCallbackFunctionRef, null);
        SCNetworkReachabilityScheduleWithRunLoop(_monitorReachabilityRef, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode);
    }
}

export function stopMonitoring(): void {
    if (_monitorReachabilityRef) {
        SCNetworkReachabilityUnscheduleFromRunLoop(_monitorReachabilityRef, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode);
        _monitorReachabilityRef = undefined;
        _connectionTypeChangedCallback = undefined;;
    }
}
