
declare function CNCopyCurrentNetworkInfo(interfaceName: string): NSDictionary<any, any>;

declare function CNCopySupportedInterfaces(): NSArray<any>;

declare function CNMarkPortalOffline(interfaceName: string): boolean;

declare function CNMarkPortalOnline(interfaceName: string): boolean;

declare function CNSetSupportedSSIDs(ssidArray: NSArray<any> | any[]): boolean;

declare function SCCopyLastError(): NSError;

interface SCDynamicStoreContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var SCDynamicStoreContext: interop.StructType<SCDynamicStoreContext>;

declare function SCError(): number;

declare function SCErrorString(status: number): string;

interface SCNetworkConnectionContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var SCNetworkConnectionContext: interop.StructType<SCNetworkConnectionContext>;

declare const enum SCNetworkConnectionPPPStatus {

	kSCNetworkConnectionPPPDisconnected = 0,

	kSCNetworkConnectionPPPInitializing = 1,

	kSCNetworkConnectionPPPConnectingLink = 2,

	kSCNetworkConnectionPPPDialOnTraffic = 3,

	kSCNetworkConnectionPPPNegotiatingLink = 4,

	kSCNetworkConnectionPPPAuthenticating = 5,

	kSCNetworkConnectionPPPWaitingForCallBack = 6,

	kSCNetworkConnectionPPPNegotiatingNetwork = 7,

	kSCNetworkConnectionPPPConnected = 8,

	kSCNetworkConnectionPPPTerminating = 9,

	kSCNetworkConnectionPPPDisconnectingLink = 10,

	kSCNetworkConnectionPPPHoldingLinkOff = 11,

	kSCNetworkConnectionPPPSuspended = 12,

	kSCNetworkConnectionPPPWaitingForRedial = 13
}

declare const enum SCNetworkConnectionStatus {

	kSCNetworkConnectionInvalid = -1,

	kSCNetworkConnectionDisconnected = 0,

	kSCNetworkConnectionConnecting = 1,

	kSCNetworkConnectionConnected = 2,

	kSCNetworkConnectionDisconnecting = 3
}

interface SCNetworkReachabilityContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var SCNetworkReachabilityContext: interop.StructType<SCNetworkReachabilityContext>;

declare function SCNetworkReachabilityCreateWithAddress(allocator: any, address: interop.Pointer | interop.Reference<sockaddr>): any;

declare function SCNetworkReachabilityCreateWithAddressPair(allocator: any, localAddress: interop.Pointer | interop.Reference<sockaddr>, remoteAddress: interop.Pointer | interop.Reference<sockaddr>): any;

declare function SCNetworkReachabilityCreateWithName(allocator: any, nodename: string | interop.Pointer | interop.Reference<any>): any;

declare const enum SCNetworkReachabilityFlags {

	kSCNetworkReachabilityFlagsTransientConnection = 1,

	kSCNetworkReachabilityFlagsReachable = 2,

	kSCNetworkReachabilityFlagsConnectionRequired = 4,

	kSCNetworkReachabilityFlagsConnectionOnTraffic = 8,

	kSCNetworkReachabilityFlagsInterventionRequired = 16,

	kSCNetworkReachabilityFlagsConnectionOnDemand = 32,

	kSCNetworkReachabilityFlagsIsLocalAddress = 65536,

	kSCNetworkReachabilityFlagsIsDirect = 131072,

	kSCNetworkReachabilityFlagsIsWWAN = 262144,

	kSCNetworkReachabilityFlagsConnectionAutomatic = 8
}

declare function SCNetworkReachabilityGetFlags(target: any, flags: interop.Pointer | interop.Reference<SCNetworkReachabilityFlags>): boolean;

declare function SCNetworkReachabilityGetTypeID(): number;

declare function SCNetworkReachabilityScheduleWithRunLoop(target: any, runLoop: any, runLoopMode: string): boolean;

declare function SCNetworkReachabilitySetCallback(target: any, callout: interop.FunctionReference<(p1: any, p2: SCNetworkReachabilityFlags, p3: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<SCNetworkReachabilityContext>): boolean;

declare function SCNetworkReachabilitySetDispatchQueue(target: any, queue: NSObject): boolean;

declare function SCNetworkReachabilityUnscheduleFromRunLoop(target: any, runLoop: any, runLoopMode: string): boolean;

interface SCPreferencesContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var SCPreferencesContext: interop.StructType<SCPreferencesContext>;

declare const enum SCPreferencesNotification {

	kSCPreferencesNotificationCommit = 1,

	kSCPreferencesNotificationApply = 2
}

declare var kCFErrorDomainSystemConfiguration: string;

declare var kCNNetworkInfoKeyBSSID: string;

declare var kCNNetworkInfoKeySSID: string;

declare var kCNNetworkInfoKeySSIDData: string;

declare const kSCBondStatusLinkInvalid: number;

declare const kSCBondStatusNoPartner: number;

declare const kSCBondStatusNotInActiveGroup: number;

declare const kSCBondStatusOK: number;

declare const kSCBondStatusUnknown: number;

declare const kSCNetworkFlagsConnectionAutomatic: number;

declare const kSCNetworkFlagsConnectionRequired: number;

declare const kSCNetworkFlagsInterventionRequired: number;

declare const kSCNetworkFlagsIsDirect: number;

declare const kSCNetworkFlagsIsLocalAddress: number;

declare const kSCNetworkFlagsReachable: number;

declare const kSCNetworkFlagsTransientConnection: number;

declare const kSCStatusAccessError: number;

declare const kSCStatusFailed: number;

declare const kSCStatusInvalidArgument: number;

declare const kSCStatusKeyExists: number;

declare const kSCStatusLocked: number;

declare const kSCStatusMaxLink: number;

declare const kSCStatusNeedLock: number;

declare const kSCStatusNoConfigFile: number;

declare const kSCStatusNoKey: number;

declare const kSCStatusNoLink: number;

declare const kSCStatusNoPrefsSession: number;

declare const kSCStatusNoStoreServer: number;

declare const kSCStatusNoStoreSession: number;

declare const kSCStatusNotifierActive: number;

declare const kSCStatusOK: number;

declare const kSCStatusPrefsBusy: number;

declare const kSCStatusReachabilityUnknown: number;

declare const kSCStatusStale: number;
