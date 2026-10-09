import Foundation
import SystemConfiguration

/// Core's connectivity (`connectivity/index.ios.ts`) where it reaches SystemConfiguration through pointers and a C
/// callback; the rest of the module (the connection type a set of flags means) is compiled from core.
enum CoreConnectivity {
    static func createReachability(_ host: String?) -> Any? {
        if let host, !host.isEmpty { return SCNetworkReachabilityCreateWithName(nil, host) }
        var zeroAddress = sockaddr()
        zeroAddress.sa_len = 16
        zeroAddress.sa_family = 2
        return SCNetworkReachabilityCreateWithAddress(nil, &zeroAddress)
    }

    /// The reachability flags, or NaN where they cannot be read (core's null, falsy as it is).
    static func reachabilityFlags(_ host: String?) -> Double {
        guard let reachability = createReachability(host) else { return .nan }
        var flags = SCNetworkReachabilityFlags()
        guard SCNetworkReachabilityGetFlags(reachability as! SCNetworkReachability, &flags) else { return .nan }
        return Double(flags.rawValue)
    }

    private static var monitored: SCNetworkReachability?
    private static var changed: ((Double) throws -> Void)?

    static func startMonitoring(_ callback: ((Double) throws -> Void)?) throws {
        guard monitored == nil, let reachability = createReachability(nil) as! SCNetworkReachability? else { return }
        monitored = reachability
        changed = callback
        SCNetworkReachabilitySetCallback(reachability, { _, flags, _ in CoreConnectivity.flagsChanged(flags) }, nil)
        SCNetworkReachabilityScheduleWithRunLoop(reachability, CFRunLoopGetCurrent(), CFRunLoopMode.defaultMode.rawValue)
        try callback?(Connectivity.getConnectionType())
    }

    static func stopMonitoring() {
        guard let reachability = monitored else { return }
        SCNetworkReachabilityUnscheduleFromRunLoop(reachability, CFRunLoopGetCurrent(), CFRunLoopMode.defaultMode.rawValue)
        monitored = nil
        changed = nil
    }

    private static func flagsChanged(_ flags: SCNetworkReachabilityFlags) {
        guard let changed else { return }
        jsReport { try changed(Connectivity._getConnectionTypeFromFlags(Double(flags.rawValue))) }
    }
}
