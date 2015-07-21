import common = require("connectivity/connectivity-common");

declare var exports;
require("utils/module-merge").merge(common, exports);

declare var sockaddr;

function getNetworkReachability(host?: string): any {
    if (host) {
        return SCNetworkReachabilityCreateWithName(null, host);
    }
    else {
        var zeroAddress = new interop.Reference(sockaddr, {
            sa_len: 16,
            sa_family: 2
        });
        return SCNetworkReachabilityCreateWithAddress(null, zeroAddress);
    }
}

function getReachabilityFlags(host?: string): number {
    var reachability = getNetworkReachability(host);
    var flagsRef = new interop.Reference<number>();
    var gotFlags = SCNetworkReachabilityGetFlags(reachability, flagsRef);
    CFRelease(reachability);
    if (!gotFlags) {
        return null;
    }
    return flagsRef.value;
}

function getConnectionTypeToHost(host?: string): number {
    var flags = getReachabilityFlags(host);
    if (!flags) {
        return common.connectionType.none;
    }

    var isReachable = flags & kSCNetworkReachabilityFlagsReachable;
    var connectionRequired = flags & kSCNetworkReachabilityFlagsConnectionRequired;
    if (!isReachable || connectionRequired) {
        return common.connectionType.none;
    }

    var isWWAN = flags & kSCNetworkReachabilityFlagsIsWWAN;
    if (isWWAN) {
        return common.connectionType.mobile;
    }

    return common.connectionType.wifi;
}

export function getConnectionType(): number {
    return getConnectionTypeToHost();
}