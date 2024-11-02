
/**
 * @since 9.0
 */
declare var NEAppProxyErrorDomain: string;

/**
 * @since 9.0
 */
declare class NEAppProxyFlow extends NSObject {

	static alloc(): NEAppProxyFlow; // inherited from NSObject

	static new(): NEAppProxyFlow; // inherited from NSObject

	/**
	 * @since 14.3
	 */
	readonly isBound: boolean;

	/**
	 * @since 9.0
	 */
	readonly metaData: NEFlowMetaData;

	/**
	 * @since 13.4
	 */
	networkInterface: NSObject & OS_nw_interface;

	/**
	 * @since 14.2
	 */
	readonly remoteHostname: string;

	/**
	 * @since 9.0
	 */
	closeReadWithError(error: NSError): void;

	/**
	 * @since 9.0
	 */
	closeWriteWithError(error: NSError): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	openWithLocalEndpointCompletionHandler(localEndpoint: NWHostEndpoint, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 18.0
	 */
	openWithLocalFlowEndpointCompletionHandler(localEndpoint: NSObject & OS_nw_endpoint, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 9.0
 */
declare const enum NEAppProxyFlowError {

	NotConnected = 1,

	PeerReset = 2,

	HostUnreachable = 3,

	InvalidArgument = 4,

	Aborted = 5,

	Refused = 6,

	TimedOut = 7,

	Internal = 8,

	DatagramTooLarge = 9,

	ReadAlreadyPending = 10
}

/**
 * @since 9.0
 */
declare class NEAppProxyProvider extends NETunnelProvider {

	static alloc(): NEAppProxyProvider; // inherited from NSObject

	static new(): NEAppProxyProvider; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	cancelProxyWithError(error: NSError): void;

	/**
	 * @since 9.0
	 */
	handleNewFlow(flow: NEAppProxyFlow): boolean;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	handleNewUDPFlowInitialRemoteEndpoint(flow: NEAppProxyUDPFlow, remoteEndpoint: NWEndpoint): boolean;

	/**
	 * @since 18.0
	 */
	handleNewUDPFlowInitialRemoteFlowEndpoint(flow: NEAppProxyUDPFlow, remoteEndpoint: NSObject & OS_nw_endpoint): boolean;

	/**
	 * @since 9.0
	 */
	startProxyWithOptionsCompletionHandler(options: NSDictionary<string, any>, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	stopProxyWithReasonCompletionHandler(reason: NEProviderStopReason, completionHandler: () => void): void;
}

/**
 * @since 9.0
 */
declare class NEAppProxyProviderManager extends NETunnelProviderManager {

	static alloc(): NEAppProxyProviderManager; // inherited from NSObject

	static new(): NEAppProxyProviderManager; // inherited from NSObject
}

/**
 * @since 9.0
 */
declare class NEAppProxyTCPFlow extends NEAppProxyFlow {

	static alloc(): NEAppProxyTCPFlow; // inherited from NSObject

	static new(): NEAppProxyTCPFlow; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly remoteEndpoint: NWEndpoint;

	/**
	 * @since 18.0
	 */
	readonly remoteFlowEndpoint: NSObject & OS_nw_endpoint;

	/**
	 * @since 9.0
	 */
	readDataWithCompletionHandler(completionHandler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	writeDataWithCompletionHandler(data: NSData, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 9.0
 */
declare class NEAppProxyUDPFlow extends NEAppProxyFlow {

	static alloc(): NEAppProxyUDPFlow; // inherited from NSObject

	static new(): NEAppProxyUDPFlow; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly localEndpoint: NWEndpoint;

	/**
	 * @since 18.0
	 */
	readonly localFlowEndpoint: NSObject & OS_nw_endpoint;

	/**
	 * @since 18.0
	 */
	readDatagramsAndFlowEndpointsWithCompletionHandler(completionHandler: (p1: NSArray<NSData>, p2: NSArray<NSObject & OS_nw_endpoint>, p3: NSError) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readDatagramsWithCompletionHandler(completionHandler: (p1: NSArray<NSData>, p2: NSArray<NWEndpoint>, p3: NSError) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	writeDatagramsSentByEndpointsCompletionHandler(datagrams: NSArray<NSData> | NSData[], remoteEndpoints: NSArray<NWEndpoint> | NWEndpoint[], completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 18.0
	 */
	writeDatagramsSentByFlowEndpointsCompletionHandler(datagrams: NSArray<NSData> | NSData[], remoteEndpoints: NSArray<NSObject & OS_nw_endpoint> | NSObject & OS_nw_endpoint[], completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 14.0
 */
interface NEAppPushDelegate extends NSObjectProtocol {

	/**
	 * @since 14.0
	 */
	appPushManagerDidReceiveIncomingCallWithUserInfo(manager: NEAppPushManager, userInfo: NSDictionary<any, any>): void;
}
declare var NEAppPushDelegate: {

	prototype: NEAppPushDelegate;
};

/**
 * @since 14.0
 */
declare var NEAppPushErrorDomain: string;

/**
 * @since 14.0
 */
declare class NEAppPushManager extends NSObject {

	static alloc(): NEAppPushManager; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static loadAllFromPreferencesWithCompletionHandler(completionHandler: (p1: NSArray<NEAppPushManager>, p2: NSError) => void): void;

	static new(): NEAppPushManager; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly active: boolean;

	delegate: NEAppPushDelegate;

	/**
	 * @since 14.0
	 */
	enabled: boolean;

	/**
	 * @since 14.0
	 */
	localizedDescription: string;

	/**
	 * @since 15.0
	 */
	matchPrivateLTENetworks: NSArray<NEPrivateLTENetwork>;

	/**
	 * @since 14.0
	 */
	matchSSIDs: NSArray<string>;

	/**
	 * @since 14.0
	 */
	providerBundleIdentifier: string;

	/**
	 * @since 14.0
	 */
	providerConfiguration: NSDictionary<string, any>;

	/**
	 * @since 14.0
	 */
	loadFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	removeFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	saveToPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 14.0
 */
declare const enum NEAppPushManagerError {

	ConfigurationInvalid = 1,

	ConfigurationNotLoaded = 2,

	InternalError = 3,

	InactiveSession = 4
}

/**
 * @since 14.0
 */
declare class NEAppPushProvider extends NEProvider {

	static alloc(): NEAppPushProvider; // inherited from NSObject

	static new(): NEAppPushProvider; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly providerConfiguration: NSDictionary<string, any>;

	/**
	 * @since 14.0
	 */
	handleTimerEvent(): void;

	/**
	 * @since 14.0
	 */
	reportIncomingCallWithUserInfo(userInfo: NSDictionary<any, any>): void;

	/**
	 * @since 16.4
	 */
	reportPushToTalkMessageWithUserInfo(userInfo: NSDictionary<any, any>): void;

	/**
	 * @since 15.0
	 */
	start(): void;

	/**
	 * @since 14.0
	 * @deprecated 100000
	 */
	startWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	stopWithReasonCompletionHandler(reason: NEProviderStopReason, completionHandler: () => void): void;
}

/**
 * @since 9.0
 */
declare class NEAppRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEAppRule; // inherited from NSObject

	static new(): NEAppRule; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	matchDomains: NSArray<any>;

	/**
	 * @since 9.3
	 */
	matchPath: string;

	/**
	 * @since 9.0
	 */
	readonly matchSigningIdentifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 9.0
	 */
	constructor(o: { signingIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 9.0
	 */
	initWithSigningIdentifier(signingIdentifier: string): this;
}

/**
 * @since 14.0
 */
declare class NEDNSOverHTTPSSettings extends NEDNSSettings {

	static alloc(): NEDNSOverHTTPSSettings; // inherited from NSObject

	static new(): NEDNSOverHTTPSSettings; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	identityReference: NSData;

	/**
	 * @since 14.0
	 */
	serverURL: NSURL;
}

/**
 * @since 14.0
 */
declare class NEDNSOverTLSSettings extends NEDNSSettings {

	static alloc(): NEDNSOverTLSSettings; // inherited from NSObject

	static new(): NEDNSOverTLSSettings; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	identityReference: NSData;

	/**
	 * @since 14.0
	 */
	serverName: string;
}

/**
 * @since 14.0
 */
declare const enum NEDNSProtocol {

	Cleartext = 1,

	TLS = 2,

	HTTPS = 3
}

/**
 * @since 11.0
 */
declare var NEDNSProxyConfigurationDidChangeNotification: string;

/**
 * @since 11.0
 */
declare var NEDNSProxyErrorDomain: string;

/**
 * @since 11.0
 */
declare class NEDNSProxyManager extends NSObject {

	static alloc(): NEDNSProxyManager; // inherited from NSObject

	static new(): NEDNSProxyManager; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static sharedManager(): NEDNSProxyManager;

	/**
	 * @since 11.0
	 */
	enabled: boolean;

	/**
	 * @since 11.0
	 */
	localizedDescription: string;

	/**
	 * @since 11.0
	 */
	providerProtocol: NEDNSProxyProviderProtocol;

	/**
	 * @since 11.0
	 */
	loadFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	removeFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	saveToPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 11.0
 */
declare const enum NEDNSProxyManagerError {

	ConfigurationInvalid = 1,

	ConfigurationDisabled = 2,

	ConfigurationStale = 3,

	ConfigurationCannotBeRemoved = 4
}

/**
 * @since 11.0
 */
declare class NEDNSProxyProvider extends NEProvider {

	static alloc(): NEDNSProxyProvider; // inherited from NSObject

	static new(): NEDNSProxyProvider; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly systemDNSSettings: NSArray<NEDNSSettings>;

	/**
	 * @since 11.0
	 */
	cancelProxyWithError(error: NSError): void;

	/**
	 * @since 11.0
	 */
	handleNewFlow(flow: NEAppProxyFlow): boolean;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	handleNewUDPFlowInitialRemoteEndpoint(flow: NEAppProxyUDPFlow, remoteEndpoint: NWEndpoint): boolean;

	/**
	 * @since 18.0
	 */
	handleNewUDPFlowInitialRemoteFlowEndpoint(flow: NEAppProxyUDPFlow, remoteEndpoint: NSObject & OS_nw_endpoint): boolean;

	/**
	 * @since 11.0
	 */
	startProxyWithOptionsCompletionHandler(options: NSDictionary<string, any>, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	stopProxyWithReasonCompletionHandler(reason: NEProviderStopReason, completionHandler: () => void): void;
}

/**
 * @since 11.0
 */
declare class NEDNSProxyProviderProtocol extends NEVPNProtocol {

	static alloc(): NEDNSProxyProviderProtocol; // inherited from NSObject

	static new(): NEDNSProxyProviderProtocol; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	providerBundleIdentifier: string;

	/**
	 * @since 11.0
	 */
	providerConfiguration: NSDictionary<string, any>;
}

/**
 * @since 9.0
 */
declare class NEDNSSettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEDNSSettings; // inherited from NSObject

	static new(): NEDNSSettings; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly dnsProtocol: NEDNSProtocol;

	/**
	 * @since 9.0
	 */
	domainName: string;

	/**
	 * @since 9.0
	 */
	matchDomains: NSArray<string>;

	/**
	 * @since 9.0
	 */
	matchDomainsNoSearch: boolean;

	/**
	 * @since 9.0
	 */
	searchDomains: NSArray<string>;

	/**
	 * @since 9.0
	 */
	readonly servers: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 9.0
	 */
	constructor(o: { servers: NSArray<string> | string[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 9.0
	 */
	initWithServers(servers: NSArray<string> | string[]): this;
}

/**
 * @since 14.0
 */
declare var NEDNSSettingsConfigurationDidChangeNotification: string;

/**
 * @since 14.0
 */
declare var NEDNSSettingsErrorDomain: string;

/**
 * @since 14.0
 */
declare class NEDNSSettingsManager extends NSObject {

	static alloc(): NEDNSSettingsManager; // inherited from NSObject

	static new(): NEDNSSettingsManager; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static sharedManager(): NEDNSSettingsManager;

	/**
	 * @since 14.0
	 */
	dnsSettings: NEDNSSettings;

	/**
	 * @since 14.0
	 */
	readonly enabled: boolean;

	/**
	 * @since 14.0
	 */
	localizedDescription: string;

	/**
	 * @since 14.0
	 */
	onDemandRules: NSArray<NEOnDemandRule>;

	/**
	 * @since 14.0
	 */
	loadFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	removeFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	saveToPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 14.0
 */
declare const enum NEDNSSettingsManagerError {

	ConfigurationInvalid = 1,

	ConfigurationDisabled = 2,

	ConfigurationStale = 3,

	ConfigurationCannotBeRemoved = 4
}

/**
 * @since 8.0
 */
declare class NEEvaluateConnectionRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEEvaluateConnectionRule; // inherited from NSObject

	static new(): NEEvaluateConnectionRule; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	readonly action: NEEvaluateConnectionRuleAction;

	/**
	 * @since 8.0
	 */
	readonly matchDomains: NSArray<string>;

	/**
	 * @since 8.0
	 */
	probeURL: NSURL;

	/**
	 * @since 8.0
	 */
	useDNSServers: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 8.0
	 */
	constructor(o: { matchDomains: NSArray<string> | string[]; andAction: NEEvaluateConnectionRuleAction; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 */
	initWithMatchDomainsAndAction(domains: NSArray<string> | string[], action: NEEvaluateConnectionRuleAction): this;
}

/**
 * @since 8.0
 */
declare const enum NEEvaluateConnectionRuleAction {

	ConnectIfNeeded = 1,

	NeverConnect = 2
}

/**
 * @since 11.0
 */
declare const enum NEFilterAction {

	Invalid = 0,

	Allow = 1,

	Drop = 2,

	Remediate = 3,

	FilterData = 4
}

/**
 * @since 9.0
 */
declare class NEFilterBrowserFlow extends NEFilterFlow implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterBrowserFlow; // inherited from NSObject

	static new(): NEFilterBrowserFlow; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly parentURL: NSURL;

	/**
	 * @since 9.0
	 */
	readonly request: NSURLRequest;

	/**
	 * @since 9.0
	 */
	readonly response: NSURLResponse;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare var NEFilterConfigurationDidChangeNotification: string;

/**
 * @since 9.0
 */
declare class NEFilterControlProvider extends NEFilterProvider {

	static alloc(): NEFilterControlProvider; // inherited from NSObject

	static new(): NEFilterControlProvider; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	URLAppendStringMap: NSDictionary<string, string>;

	/**
	 * @since 9.0
	 */
	remediationMap: NSDictionary<string, NSDictionary<string, NSObject>>;

	/**
	 * @since 9.0
	 */
	handleNewFlowCompletionHandler(flow: NEFilterFlow, completionHandler: (p1: NEFilterControlVerdict) => void): void;

	/**
	 * @since 9.0
	 */
	handleRemediationForFlowCompletionHandler(flow: NEFilterFlow, completionHandler: (p1: NEFilterControlVerdict) => void): void;

	/**
	 * @since 9.0
	 */
	notifyRulesChanged(): void;
}

/**
 * @since 9.0
 */
declare class NEFilterControlVerdict extends NEFilterNewFlowVerdict implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterControlVerdict; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static allowVerdictWithUpdateRules(updateRules: boolean): NEFilterControlVerdict;

	/**
	 * @since 9.0
	 */
	static dropVerdictWithUpdateRules(updateRules: boolean): NEFilterControlVerdict;

	static new(): NEFilterControlVerdict; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static updateRules(): NEFilterControlVerdict;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare class NEFilterDataProvider extends NEFilterProvider {

	static alloc(): NEFilterDataProvider; // inherited from NSObject

	static new(): NEFilterDataProvider; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	handleInboundDataCompleteForFlow(flow: NEFilterFlow): NEFilterDataVerdict;

	/**
	 * @since 9.0
	 */
	handleInboundDataFromFlowReadBytesStartOffsetReadBytes(flow: NEFilterFlow, offset: number, readBytes: NSData): NEFilterDataVerdict;

	/**
	 * @since 9.0
	 */
	handleNewFlow(flow: NEFilterFlow): NEFilterNewFlowVerdict;

	/**
	 * @since 9.0
	 */
	handleOutboundDataCompleteForFlow(flow: NEFilterFlow): NEFilterDataVerdict;

	/**
	 * @since 9.0
	 */
	handleOutboundDataFromFlowReadBytesStartOffsetReadBytes(flow: NEFilterFlow, offset: number, readBytes: NSData): NEFilterDataVerdict;

	/**
	 * @since 9.0
	 */
	handleRemediationForFlow(flow: NEFilterFlow): NEFilterRemediationVerdict;

	/**
	 * @since 9.0
	 */
	handleRulesChanged(): void;
}

/**
 * @since 9.0
 */
declare class NEFilterDataVerdict extends NEFilterVerdict implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterDataVerdict; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static allowVerdict(): NEFilterDataVerdict;

	/**
	 * @since 9.0
	 */
	static dataVerdictWithPassBytesPeekBytes(passBytes: number, peekBytes: number): NEFilterDataVerdict;

	/**
	 * @since 9.0
	 */
	static dropVerdict(): NEFilterDataVerdict;

	/**
	 * @since 9.0
	 */
	static needRulesVerdict(): NEFilterDataVerdict;

	static new(): NEFilterDataVerdict; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static remediateVerdictWithRemediationURLMapKeyRemediationButtonTextMapKey(remediationURLMapKey: string, remediationButtonTextMapKey: string): NEFilterDataVerdict;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare var NEFilterErrorDomain: string;

/**
 * @since 9.0
 */
declare class NEFilterFlow extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterFlow; // inherited from NSObject

	static new(): NEFilterFlow; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly URL: NSURL;

	/**
	 * @since 13.0
	 */
	readonly direction: NETrafficDirection;

	/**
	 * @since 13.1
	 */
	readonly identifier: NSUUID;

	/**
	 * @since 11.0
	 */
	readonly sourceAppIdentifier: string;

	/**
	 * @since 11.0
	 */
	readonly sourceAppUniqueIdentifier: NSData;

	/**
	 * @since 11.0
	 */
	readonly sourceAppVersion: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class NEFilterManager extends NSObject {

	static alloc(): NEFilterManager; // inherited from NSObject

	static new(): NEFilterManager; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	static sharedManager(): NEFilterManager;

	/**
	 * @since 8.0
	 */
	enabled: boolean;

	/**
	 * @since 8.0
	 */
	localizedDescription: string;

	/**
	 * @since 9.0
	 */
	providerConfiguration: NEFilterProviderConfiguration;

	/**
	 * @since 8.0
	 */
	loadFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	removeFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	saveToPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 8.0
 */
declare const enum NEFilterManagerError {

	ConfigurationInvalid = 1,

	ConfigurationDisabled = 2,

	ConfigurationStale = 3,

	ConfigurationCannotBeRemoved = 4,

	ConfigurationPermissionDenied = 5,

	ConfigurationInternalError = 6
}

/**
 * @since 9.0
 */
declare class NEFilterNewFlowVerdict extends NEFilterVerdict implements NSCopying, NSSecureCoding {

	/**
	 * @since 9.0
	 */
	static URLAppendStringVerdictWithMapKey(urlAppendMapKey: string): NEFilterNewFlowVerdict;

	static alloc(): NEFilterNewFlowVerdict; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static allowVerdict(): NEFilterNewFlowVerdict;

	/**
	 * @since 9.0
	 */
	static dropVerdict(): NEFilterNewFlowVerdict;

	/**
	 * @since 9.0
	 */
	static filterDataVerdictWithFilterInboundPeekInboundBytesFilterOutboundPeekOutboundBytes(filterInbound: boolean, peekInboundBytes: number, filterOutbound: boolean, peekOutboundBytes: number): NEFilterNewFlowVerdict;

	/**
	 * @since 9.0
	 */
	static needRulesVerdict(): NEFilterNewFlowVerdict;

	static new(): NEFilterNewFlowVerdict; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static remediateVerdictWithRemediationURLMapKeyRemediationButtonTextMapKey(remediationURLMapKey: string, remediationButtonTextMapKey: string): NEFilterNewFlowVerdict;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare class NEFilterProvider extends NEProvider {

	static alloc(): NEFilterProvider; // inherited from NSObject

	static new(): NEFilterProvider; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly filterConfiguration: NEFilterProviderConfiguration;

	/**
	 * @since 11.0
	 */
	handleReport(report: NEFilterReport): void;

	/**
	 * @since 9.0
	 */
	startFilterWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	stopFilterWithReasonCompletionHandler(reason: NEProviderStopReason, completionHandler: () => void): void;
}

/**
 * @since 9.0
 */
declare class NEFilterProviderConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterProviderConfiguration; // inherited from NSObject

	static new(): NEFilterProviderConfiguration; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	filterBrowsers: boolean;

	/**
	 * @since 9.0
	 */
	filterSockets: boolean;

	/**
	 * @since 9.0
	 */
	identityReference: NSData;

	/**
	 * @since 9.0
	 */
	organization: string;

	/**
	 * @since 9.0
	 */
	passwordReference: NSData;

	/**
	 * @since 9.0
	 */
	serverAddress: string;

	/**
	 * @since 9.0
	 */
	username: string;

	/**
	 * @since 9.0
	 */
	vendorConfiguration: NSDictionary<string, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare var NEFilterProviderRemediationMapRemediationButtonTexts: string;

/**
 * @since 9.0
 */
declare var NEFilterProviderRemediationMapRemediationURLs: string;

/**
 * @since 9.0
 */
declare class NEFilterRemediationVerdict extends NEFilterVerdict implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterRemediationVerdict; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static allowVerdict(): NEFilterRemediationVerdict;

	/**
	 * @since 9.0
	 */
	static dropVerdict(): NEFilterRemediationVerdict;

	/**
	 * @since 9.0
	 */
	static needRulesVerdict(): NEFilterRemediationVerdict;

	static new(): NEFilterRemediationVerdict; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare class NEFilterReport extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterReport; // inherited from NSObject

	static new(): NEFilterReport; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly action: NEFilterAction;

	/**
	 * @since 13.0
	 */
	readonly bytesInboundCount: number;

	/**
	 * @since 13.0
	 */
	readonly bytesOutboundCount: number;

	/**
	 * @since 13.0
	 */
	readonly event: NEFilterReportEvent;

	/**
	 * @since 11.0
	 */
	readonly flow: NEFilterFlow;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare const enum NEFilterReportEvent {

	NewFlow = 1,

	DataDecision = 2,

	FlowClosed = 3,

	Statistics = 4
}

/**
 * @since 9.0
 */
declare class NEFilterSocketFlow extends NEFilterFlow implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterSocketFlow; // inherited from NSObject

	static new(): NEFilterSocketFlow; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly localEndpoint: NWEndpoint;

	/**
	 * @since 18.0
	 */
	readonly localFlowEndpoint: NSObject & OS_nw_endpoint;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly remoteEndpoint: NWEndpoint;

	/**
	 * @since 18.0
	 */
	readonly remoteFlowEndpoint: NSObject & OS_nw_endpoint;

	/**
	 * @since 14.0
	 */
	readonly remoteHostname: string;

	/**
	 * @since 9.0
	 */
	readonly socketFamily: number;

	/**
	 * @since 9.0
	 */
	readonly socketProtocol: number;

	/**
	 * @since 9.0
	 */
	readonly socketType: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare class NEFilterVerdict extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterVerdict; // inherited from NSObject

	static new(): NEFilterVerdict; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	shouldReport: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare class NEFlowMetaData extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFlowMetaData; // inherited from NSObject

	static new(): NEFlowMetaData; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly sourceAppSigningIdentifier: string;

	/**
	 * @since 9.0
	 */
	readonly sourceAppUniqueIdentifier: NSData;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare class NEHotspotConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEHotspotConfiguration; // inherited from NSObject

	static new(): NEHotspotConfiguration; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly SSID: string;

	/**
	 * @since 13.0
	 */
	readonly SSIDPrefix: string;

	/**
	 * @since 13.0
	 */
	hidden: boolean;

	/**
	 * @since 11.0
	 */
	joinOnce: boolean;

	/**
	 * @since 11.0
	 */
	lifeTimeInDays: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 11.0
	 */
	constructor(o: { HS20Settings: NEHotspotHS20Settings; eapSettings: NEHotspotEAPSettings; });

	/**
	 * @since 11.0
	 */
	constructor(o: { SSID: string; });

	/**
	 * @since 11.0
	 */
	constructor(o: { SSID: string; eapSettings: NEHotspotEAPSettings; });

	/**
	 * @since 11.0
	 */
	constructor(o: { SSID: string; passphrase: string; isWEP: boolean; });

	/**
	 * @since 13.0
	 */
	constructor(o: { SSIDPrefix: string; });

	/**
	 * @since 13.0
	 */
	constructor(o: { SSIDPrefix: string; passphrase: string; isWEP: boolean; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 11.0
	 */
	initWithHS20SettingsEapSettings(hs20Settings: NEHotspotHS20Settings, eapSettings: NEHotspotEAPSettings): this;

	/**
	 * @since 11.0
	 */
	initWithSSID(SSID: string): this;

	/**
	 * @since 11.0
	 */
	initWithSSIDEapSettings(SSID: string, eapSettings: NEHotspotEAPSettings): this;

	/**
	 * @since 11.0
	 */
	initWithSSIDPassphraseIsWEP(SSID: string, passphrase: string, isWEP: boolean): this;

	/**
	 * @since 13.0
	 */
	initWithSSIDPrefix(SSIDPrefix: string): this;

	/**
	 * @since 13.0
	 */
	initWithSSIDPrefixPassphraseIsWEP(SSIDPrefix: string, passphrase: string, isWEP: boolean): this;
}

/**
 * @since 11.0
 */
declare const enum NEHotspotConfigurationEAPTLSVersion {

	Version_1_0 = 0,

	Version_1_1 = 1,

	Version_1_2 = 2
}

/**
 * @since 11.0
 */
declare const enum NEHotspotConfigurationEAPType {

	EAPTLS = 13,

	EAPTTLS = 21,

	EAPPEAP = 25,

	EAPFAST = 43
}

/**
 * @since 11.0
 */
declare const enum NEHotspotConfigurationError {

	Invalid = 0,

	InvalidSSID = 1,

	InvalidWPAPassphrase = 2,

	InvalidWEPPassphrase = 3,

	InvalidEAPSettings = 4,

	InvalidHS20Settings = 5,

	InvalidHS20DomainName = 6,

	UserDenied = 7,

	Internal = 8,

	Pending = 9,

	SystemConfiguration = 10,

	Unknown = 11,

	JoinOnceNotSupported = 12,

	AlreadyAssociated = 13,

	ApplicationIsNotInForeground = 14,

	InvalidSSIDPrefix = 15,

	UserUnauthorized = 16,

	SystemDenied = 17
}

/**
 * @since 11.0
 */
declare var NEHotspotConfigurationErrorDomain: string;

/**
 * @since 11.0
 */
declare class NEHotspotConfigurationManager extends NSObject {

	static alloc(): NEHotspotConfigurationManager; // inherited from NSObject

	static new(): NEHotspotConfigurationManager; // inherited from NSObject

	static readonly sharedManager: NEHotspotConfigurationManager;

	/**
	 * @since 11.0
	 */
	applyConfigurationCompletionHandler(configuration: NEHotspotConfiguration, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	getConfiguredSSIDsWithCompletionHandler(completionHandler: (p1: NSArray<string>) => void): void;

	/**
	 * @since 18.0
	 */
	joinAccessoryHotspotPassphraseCompletionHandler(accessory: ASAccessory, passphrase: string, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 18.0
	 */
	joinAccessoryHotspotWithoutSecurityCompletionHandler(accessory: ASAccessory, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	removeConfigurationForHS20DomainName(domainName: string): void;

	/**
	 * @since 11.0
	 */
	removeConfigurationForSSID(SSID: string): void;
}

/**
 * @since 11.0
 */
declare const enum NEHotspotConfigurationTTLSInnerAuthenticationType {

	EAPTTLSInnerAuthenticationPAP = 0,

	EAPTTLSInnerAuthenticationCHAP = 1,

	EAPTTLSInnerAuthenticationMSCHAP = 2,

	EAPTTLSInnerAuthenticationMSCHAPv2 = 3,

	EAPTTLSInnerAuthenticationEAP = 4
}

/**
 * @since 11.0
 */
declare class NEHotspotEAPSettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEHotspotEAPSettings; // inherited from NSObject

	static new(): NEHotspotEAPSettings; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	outerIdentity: string;

	/**
	 * @since 11.0
	 */
	password: string;

	/**
	 * @since 11.0
	 */
	preferredTLSVersion: NEHotspotConfigurationEAPTLSVersion;

	/**
	 * @since 11.0
	 */
	supportedEAPTypes: NSArray<number>;

	/**
	 * @since 11.0
	 */
	tlsClientCertificateRequired: boolean;

	/**
	 * @since 11.0
	 */
	trustedServerNames: NSArray<string>;

	/**
	 * @since 11.0
	 */
	ttlsInnerAuthenticationType: NEHotspotConfigurationTTLSInnerAuthenticationType;

	/**
	 * @since 11.0
	 */
	username: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 11.0
	 */
	setIdentity(identity: any): boolean;

	/**
	 * @since 11.0
	 */
	setTrustedServerCertificates(certificates: NSArray<any> | any[]): boolean;
}

/**
 * @since 11.0
 */
declare class NEHotspotHS20Settings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEHotspotHS20Settings; // inherited from NSObject

	static new(): NEHotspotHS20Settings; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	MCCAndMNCs: NSArray<string>;

	/**
	 * @since 11.0
	 */
	readonly domainName: string;

	/**
	 * @since 11.0
	 */
	naiRealmNames: NSArray<string>;

	/**
	 * @since 11.0
	 */
	roamingConsortiumOIs: NSArray<string>;

	/**
	 * @since 11.0
	 */
	roamingEnabled: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 11.0
	 */
	constructor(o: { domainName: string; roamingEnabled: boolean; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 11.0
	 */
	initWithDomainNameRoamingEnabled(domainName: string, roamingEnabled: boolean): this;
}

/**
 * @since 9.0
 */
declare class NEHotspotHelper extends NSObject {

	static alloc(): NEHotspotHelper; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static logoff(network: NEHotspotNetwork): boolean;

	static new(): NEHotspotHelper; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static registerWithOptionsQueueHandler(options: NSDictionary<string, NSObject>, queue: NSObject & OS_dispatch_queue, handler: (p1: NEHotspotHelperCommand) => void): boolean;

	/**
	 * @since 9.0
	 */
	static supportedNetworkInterfaces(): NSArray<any>;
}

/**
 * @since 9.0
 */
declare class NEHotspotHelperCommand extends NSObject {

	static alloc(): NEHotspotHelperCommand; // inherited from NSObject

	static new(): NEHotspotHelperCommand; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly commandType: NEHotspotHelperCommandType;

	/**
	 * @since 18.0
	 */
	readonly interface: NSObject & OS_nw_interface;

	/**
	 * @since 9.0
	 */
	readonly network: NEHotspotNetwork;

	/**
	 * @since 9.0
	 */
	readonly networkList: NSArray<NEHotspotNetwork>;

	/**
	 * @since 9.0
	 */
	createResponse(result: NEHotspotHelperResult): NEHotspotHelperResponse;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	createTCPConnection(endpoint: NWEndpoint): NWTCPConnection;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	createUDPSession(endpoint: NWEndpoint): NWUDPSession;
}

/**
 * @since 9.0
 */
declare const enum NEHotspotHelperCommandType {

	kNEHotspotHelperCommandTypeNone = 0,

	kNEHotspotHelperCommandTypeFilterScanList = 1,

	kNEHotspotHelperCommandTypeEvaluate = 2,

	kNEHotspotHelperCommandTypeAuthenticate = 3,

	kNEHotspotHelperCommandTypePresentUI = 4,

	kNEHotspotHelperCommandTypeMaintain = 5,

	kNEHotspotHelperCommandTypeLogoff = 6
}

/**
 * @since 9.0
 */
declare const enum NEHotspotHelperConfidence {

	kNEHotspotHelperConfidenceNone = 0,

	kNEHotspotHelperConfidenceLow = 1,

	kNEHotspotHelperConfidenceHigh = 2
}

/**
 * @since 9.0
 */
declare class NEHotspotHelperResponse extends NSObject {

	static alloc(): NEHotspotHelperResponse; // inherited from NSObject

	static new(): NEHotspotHelperResponse; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	deliver(): void;

	/**
	 * @since 9.0
	 */
	setNetwork(network: NEHotspotNetwork): void;

	/**
	 * @since 9.0
	 */
	setNetworkList(networkList: NSArray<NEHotspotNetwork> | NEHotspotNetwork[]): void;
}

/**
 * @since 9.0
 */
declare const enum NEHotspotHelperResult {

	kNEHotspotHelperResultSuccess = 0,

	kNEHotspotHelperResultFailure = 1,

	kNEHotspotHelperResultUIRequired = 2,

	kNEHotspotHelperResultCommandNotRecognized = 3,

	kNEHotspotHelperResultAuthenticationRequired = 4,

	kNEHotspotHelperResultUnsupportedNetwork = 5,

	kNEHotspotHelperResultTemporaryFailure = 6
}

/**
 * @since 9.0
 */
declare class NEHotspotNetwork extends NSObject {

	static alloc(): NEHotspotNetwork; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static fetchCurrentWithCompletionHandler(completionHandler: (p1: NEHotspotNetwork) => void): void;

	static new(): NEHotspotNetwork; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly BSSID: string;

	/**
	 * @since 9.0
	 */
	readonly SSID: string;

	/**
	 * @since 9.0
	 */
	readonly autoJoined: boolean;

	/**
	 * @since 9.0
	 */
	readonly chosenHelper: boolean;

	/**
	 * @since 9.0
	 */
	readonly justJoined: boolean;

	/**
	 * @since 9.0
	 */
	readonly secure: boolean;

	/**
	 * @since 15.0
	 */
	readonly securityType: NEHotspotNetworkSecurityType;

	/**
	 * @since 9.0
	 */
	readonly signalStrength: number;

	/**
	 * @since 9.0
	 */
	setConfidence(confidence: NEHotspotHelperConfidence): void;

	/**
	 * @since 9.0
	 */
	setPassword(password: string): void;
}

/**
 * @since 15.0
 */
declare const enum NEHotspotNetworkSecurityType {

	Open = 0,

	WEP = 1,

	Personal = 2,

	Enterprise = 3,

	Unknown = 4
}

/**
 * @since 9.0
 */
declare class NEIPv4Route extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEIPv4Route; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static defaultRoute(): NEIPv4Route;

	static new(): NEIPv4Route; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly destinationAddress: string;

	/**
	 * @since 9.0
	 */
	readonly destinationSubnetMask: string;

	/**
	 * @since 9.0
	 */
	gatewayAddress: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 9.0
	 */
	constructor(o: { destinationAddress: string; subnetMask: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 9.0
	 */
	initWithDestinationAddressSubnetMask(address: string, subnetMask: string): this;
}

/**
 * @since 9.0
 */
declare class NEIPv4Settings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEIPv4Settings; // inherited from NSObject

	static new(): NEIPv4Settings; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly addresses: NSArray<string>;

	/**
	 * @since 9.0
	 */
	excludedRoutes: NSArray<NEIPv4Route>;

	/**
	 * @since 9.0
	 */
	includedRoutes: NSArray<NEIPv4Route>;

	/**
	 * @since 9.0
	 */
	readonly subnetMasks: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 9.0
	 */
	constructor(o: { addresses: NSArray<string> | string[]; subnetMasks: NSArray<string> | string[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 9.0
	 */
	initWithAddressesSubnetMasks(addresses: NSArray<string> | string[], subnetMasks: NSArray<string> | string[]): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare class NEIPv6Route extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEIPv6Route; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static defaultRoute(): NEIPv6Route;

	static new(): NEIPv6Route; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly destinationAddress: string;

	/**
	 * @since 9.0
	 */
	readonly destinationNetworkPrefixLength: number;

	/**
	 * @since 9.0
	 */
	gatewayAddress: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 9.0
	 */
	constructor(o: { destinationAddress: string; networkPrefixLength: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 9.0
	 */
	initWithDestinationAddressNetworkPrefixLength(address: string, networkPrefixLength: number): this;
}

/**
 * @since 9.0
 */
declare class NEIPv6Settings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEIPv6Settings; // inherited from NSObject

	static new(): NEIPv6Settings; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly addresses: NSArray<string>;

	/**
	 * @since 9.0
	 */
	excludedRoutes: NSArray<NEIPv6Route>;

	/**
	 * @since 9.0
	 */
	includedRoutes: NSArray<NEIPv6Route>;

	/**
	 * @since 9.0
	 */
	readonly networkPrefixLengths: NSArray<number>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 9.0
	 */
	constructor(o: { addresses: NSArray<string> | string[]; networkPrefixLengths: NSArray<number> | number[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 9.0
	 */
	initWithAddressesNetworkPrefixLengths(addresses: NSArray<string> | string[], networkPrefixLengths: NSArray<number> | number[]): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class NEOnDemandRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEOnDemandRule; // inherited from NSObject

	static new(): NEOnDemandRule; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	DNSSearchDomainMatch: NSArray<string>;

	/**
	 * @since 8.0
	 */
	DNSServerAddressMatch: NSArray<string>;

	/**
	 * @since 8.0
	 */
	SSIDMatch: NSArray<string>;

	/**
	 * @since 8.0
	 */
	readonly action: NEOnDemandRuleAction;

	/**
	 * @since 8.0
	 */
	interfaceTypeMatch: NEOnDemandRuleInterfaceType;

	/**
	 * @since 8.0
	 */
	probeURL: NSURL;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare const enum NEOnDemandRuleAction {

	Connect = 1,

	Disconnect = 2,

	EvaluateConnection = 3,

	Ignore = 4
}

/**
 * @since 8.0
 */
declare class NEOnDemandRuleConnect extends NEOnDemandRule {

	static alloc(): NEOnDemandRuleConnect; // inherited from NSObject

	static new(): NEOnDemandRuleConnect; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare class NEOnDemandRuleDisconnect extends NEOnDemandRule {

	static alloc(): NEOnDemandRuleDisconnect; // inherited from NSObject

	static new(): NEOnDemandRuleDisconnect; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare class NEOnDemandRuleEvaluateConnection extends NEOnDemandRule {

	static alloc(): NEOnDemandRuleEvaluateConnection; // inherited from NSObject

	static new(): NEOnDemandRuleEvaluateConnection; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	connectionRules: NSArray<NEEvaluateConnectionRule>;
}

/**
 * @since 8.0
 */
declare class NEOnDemandRuleIgnore extends NEOnDemandRule {

	static alloc(): NEOnDemandRuleIgnore; // inherited from NSObject

	static new(): NEOnDemandRuleIgnore; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare const enum NEOnDemandRuleInterfaceType {

	Any = 0,

	Ethernet = 1,

	WiFi = 2,

	Cellular = 3
}

/**
 * @since 10.0
 */
declare class NEPacket extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEPacket; // inherited from NSObject

	static new(): NEPacket; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readonly data: NSData;

	/**
	 * @since 10.0
	 */
	readonly metadata: NEFlowMetaData;

	/**
	 * @since 10.0
	 */
	readonly protocolFamily: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 10.0
	 */
	constructor(o: { data: NSData; protocolFamily: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 10.0
	 */
	initWithDataProtocolFamily(data: NSData, protocolFamily: number): this;
}

/**
 * @since 9.0
 */
declare class NEPacketTunnelFlow extends NSObject {

	static alloc(): NEPacketTunnelFlow; // inherited from NSObject

	static new(): NEPacketTunnelFlow; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readPacketObjectsWithCompletionHandler(completionHandler: (p1: NSArray<NEPacket>) => void): void;

	/**
	 * @since 9.0
	 */
	readPacketsWithCompletionHandler(completionHandler: (p1: NSArray<NSData>, p2: NSArray<number>) => void): void;

	/**
	 * @since 10.0
	 */
	writePacketObjects(packets: NSArray<NEPacket> | NEPacket[]): boolean;

	/**
	 * @since 9.0
	 */
	writePacketsWithProtocols(packets: NSArray<NSData> | NSData[], protocols: NSArray<number> | number[]): boolean;
}

/**
 * @since 9.0
 */
declare class NEPacketTunnelNetworkSettings extends NETunnelNetworkSettings {

	static alloc(): NEPacketTunnelNetworkSettings; // inherited from NSObject

	static new(): NEPacketTunnelNetworkSettings; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	IPv4Settings: NEIPv4Settings;

	/**
	 * @since 9.0
	 */
	IPv6Settings: NEIPv6Settings;

	/**
	 * @since 9.0
	 */
	MTU: number;

	/**
	 * @since 9.0
	 */
	tunnelOverheadBytes: number;
}

/**
 * @since 9.0
 */
declare class NEPacketTunnelProvider extends NETunnelProvider {

	static alloc(): NEPacketTunnelProvider; // inherited from NSObject

	static new(): NEPacketTunnelProvider; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly packetFlow: NEPacketTunnelFlow;

	/**
	 * @since 18.0
	 */
	readonly virtualInterface: NSObject & OS_nw_interface;

	/**
	 * @since 9.0
	 */
	cancelTunnelWithError(error: NSError): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	createTCPConnectionThroughTunnelToEndpointEnableTLSTLSParametersDelegate(remoteEndpoint: NWEndpoint, enableTLS: boolean, TLSParameters: NWTLSParameters, delegate: any): NWTCPConnection;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	createUDPSessionThroughTunnelToEndpointFromEndpoint(remoteEndpoint: NWEndpoint, localEndpoint: NWHostEndpoint): NWUDPSession;

	/**
	 * @since 9.0
	 */
	startTunnelWithOptionsCompletionHandler(options: NSDictionary<string, NSObject>, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	stopTunnelWithReasonCompletionHandler(reason: NEProviderStopReason, completionHandler: () => void): void;
}

/**
 * @since 15.0
 */
declare class NEPrivateLTENetwork extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEPrivateLTENetwork; // inherited from NSObject

	static new(): NEPrivateLTENetwork; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	mobileCountryCode: string;

	/**
	 * @since 15.0
	 */
	mobileNetworkCode: string;

	/**
	 * @since 15.0
	 */
	trackingAreaCode: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare class NEProvider extends NSObject {

	static alloc(): NEProvider; // inherited from NSObject

	static new(): NEProvider; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly defaultPath: NWPath;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	createTCPConnectionToEndpointEnableTLSTLSParametersDelegate(remoteEndpoint: NWEndpoint, enableTLS: boolean, TLSParameters: NWTLSParameters, delegate: any): NWTCPConnection;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	createUDPSessionToEndpointFromEndpoint(remoteEndpoint: NWEndpoint, localEndpoint: NWHostEndpoint): NWUDPSession;

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	displayMessageCompletionHandler(message: string, completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 9.0
	 */
	sleepWithCompletionHandler(completionHandler: () => void): void;

	/**
	 * @since 9.0
	 */
	wake(): void;
}

/**
 * @since 9.0
 */
declare const enum NEProviderStopReason {

	None = 0,

	UserInitiated = 1,

	ProviderFailed = 2,

	NoNetworkAvailable = 3,

	UnrecoverableNetworkChange = 4,

	ProviderDisabled = 5,

	AuthenticationCanceled = 6,

	ConfigurationFailed = 7,

	IdleTimeout = 8,

	ConfigurationDisabled = 9,

	ConfigurationRemoved = 10,

	Superceded = 11,

	UserLogout = 12,

	UserSwitch = 13,

	ConnectionFailed = 14,

	Sleep = 15,

	AppUpdate = 16,

	InternalError = 17
}

/**
 * @since 9.0
 */
declare class NEProxyServer extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEProxyServer; // inherited from NSObject

	static new(): NEProxyServer; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly address: string;

	/**
	 * @since 9.0
	 */
	authenticationRequired: boolean;

	/**
	 * @since 9.0
	 */
	password: string;

	/**
	 * @since 9.0
	 */
	readonly port: number;

	/**
	 * @since 9.0
	 */
	username: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 9.0
	 */
	constructor(o: { address: string; port: number; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 9.0
	 */
	initWithAddressPort(address: string, port: number): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare class NEProxySettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEProxySettings; // inherited from NSObject

	static new(): NEProxySettings; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	HTTPEnabled: boolean;

	/**
	 * @since 9.0
	 */
	HTTPSEnabled: boolean;

	/**
	 * @since 9.0
	 */
	HTTPSServer: NEProxyServer;

	/**
	 * @since 9.0
	 */
	HTTPServer: NEProxyServer;

	/**
	 * @since 9.0
	 */
	autoProxyConfigurationEnabled: boolean;

	/**
	 * @since 9.0
	 */
	exceptionList: NSArray<string>;

	/**
	 * @since 9.0
	 */
	excludeSimpleHostnames: boolean;

	/**
	 * @since 9.0
	 */
	matchDomains: NSArray<string>;

	/**
	 * @since 9.0
	 */
	proxyAutoConfigurationJavaScript: string;

	/**
	 * @since 9.0
	 */
	proxyAutoConfigurationURL: NSURL;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class NERelay extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NERelay; // inherited from NSObject

	static new(): NERelay; // inherited from NSObject

	HTTP2RelayURL: NSURL;

	HTTP3RelayURL: NSURL;

	additionalHTTPHeaderFields: NSDictionary<string, string>;

	dnsOverHTTPSURL: NSURL;

	identityData: NSData;

	identityDataPassword: string;

	rawPublicKeys: NSArray<NSData>;

	syntheticDNSAnswerIPv4Prefix: string;

	syntheticDNSAnswerIPv6Prefix: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare var NERelayClientErrorDomain: string;

/**
 * @since 17.0
 */
declare var NERelayConfigurationDidChangeNotification: string;

/**
 * @since 17.0
 */
declare var NERelayErrorDomain: string;

/**
 * @since 17.0
 */
declare class NERelayManager extends NSObject {

	static alloc(): NERelayManager; // inherited from NSObject

	static loadAllManagersFromPreferencesWithCompletionHandler(completionHandler: (p1: NSArray<NERelayManager>, p2: NSError) => void): void;

	static new(): NERelayManager; // inherited from NSObject

	static sharedManager(): NERelayManager;

	enabled: boolean;

	excludedDomains: NSArray<string>;

	localizedDescription: string;

	matchDomains: NSArray<string>;

	onDemandRules: NSArray<NEOnDemandRule>;

	relays: NSArray<NERelay>;

	/**
	 * @since 18.0
	 */
	getLastClientErrorsCompletionHandler(seconds: number, completionHandler: (p1: NSArray<NSError>) => void): void;

	loadFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	removeFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	saveToPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 18.0
 */
declare const enum NERelayManagerClientError {

	None = 1,

	DNSFailed = 2,

	ServerUnreachable = 3,

	ServerDisconnected = 4,

	CertificateMissing = 5,

	CertificateInvalid = 6,

	CertificateExpired = 7,

	ServerCertificateInvalid = 8,

	ServerCertificateExpired = 9,

	Other = 10
}

/**
 * @since 17.0
 */
declare const enum NERelayManagerError {

	ConfigurationInvalid = 1,

	ConfigurationDisabled = 2,

	ConfigurationStale = 3,

	ConfigurationCannotBeRemoved = 4
}

/**
 * @since 13.0
 */
declare const enum NETrafficDirection {

	Any = 0,

	Inbound = 1,

	Outbound = 2
}

/**
 * @since 9.0
 */
declare class NETunnelNetworkSettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NETunnelNetworkSettings; // inherited from NSObject

	static new(): NETunnelNetworkSettings; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	DNSSettings: NEDNSSettings;

	/**
	 * @since 9.0
	 */
	proxySettings: NEProxySettings;

	/**
	 * @since 9.0
	 */
	readonly tunnelRemoteAddress: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 9.0
	 */
	constructor(o: { tunnelRemoteAddress: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 9.0
	 */
	initWithTunnelRemoteAddress(address: string): this;
}

/**
 * @since 9.0
 */
declare class NETunnelProvider extends NEProvider {

	static alloc(): NETunnelProvider; // inherited from NSObject

	static new(): NETunnelProvider; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly appRules: NSArray<NEAppRule>;

	/**
	 * @since 9.0
	 */
	readonly protocolConfiguration: NEVPNProtocol;

	/**
	 * @since 9.0
	 */
	reasserting: boolean;

	/**
	 * @since 9.0
	 */
	readonly routingMethod: NETunnelProviderRoutingMethod;

	/**
	 * @since 9.0
	 */
	handleAppMessageCompletionHandler(messageData: NSData, completionHandler: (p1: NSData) => void): void;

	/**
	 * @since 9.0
	 */
	setTunnelNetworkSettingsCompletionHandler(tunnelNetworkSettings: NETunnelNetworkSettings, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 9.0
 */
declare const enum NETunnelProviderError {

	NetworkSettingsInvalid = 1,

	NetworkSettingsCanceled = 2,

	NetworkSettingsFailed = 3
}

/**
 * @since 9.0
 */
declare var NETunnelProviderErrorDomain: string;

/**
 * @since 9.0
 */
declare class NETunnelProviderManager extends NEVPNManager {

	static alloc(): NETunnelProviderManager; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static loadAllFromPreferencesWithCompletionHandler(completionHandler: (p1: NSArray<NETunnelProviderManager>, p2: NSError) => void): void;

	static new(): NETunnelProviderManager; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly routingMethod: NETunnelProviderRoutingMethod;

	/**
	 * @since 9.0
	 */
	copyAppRules(): NSArray<NEAppRule>;
}

/**
 * @since 9.0
 */
declare class NETunnelProviderProtocol extends NEVPNProtocol {

	static alloc(): NETunnelProviderProtocol; // inherited from NSObject

	static new(): NETunnelProviderProtocol; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	providerBundleIdentifier: string;

	/**
	 * @since 9.0
	 */
	providerConfiguration: NSDictionary<string, any>;
}

/**
 * @since 9.0
 */
declare const enum NETunnelProviderRoutingMethod {

	DestinationIP = 1,

	SourceApplication = 2,

	NetworkRule = 3
}

/**
 * @since 9.0
 */
declare class NETunnelProviderSession extends NEVPNConnection {

	static alloc(): NETunnelProviderSession; // inherited from NSObject

	static new(): NETunnelProviderSession; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	sendProviderMessageReturnErrorResponseHandler(messageData: NSData, error: interop.Pointer | interop.Reference<NSError>, responseHandler: (p1: NSData) => void): boolean;

	/**
	 * @since 9.0
	 */
	startTunnelWithOptionsAndReturnError(options: NSDictionary<string, any>): boolean;

	/**
	 * @since 9.0
	 */
	stopTunnel(): void;
}

/**
 * @since 8.0
 */
declare var NEVPNConfigurationChangeNotification: string;

/**
 * @since 8.0
 */
declare class NEVPNConnection extends NSObject {

	static alloc(): NEVPNConnection; // inherited from NSObject

	static new(): NEVPNConnection; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly connectedDate: Date;

	/**
	 * @since 10.0
	 */
	readonly manager: NEVPNManager;

	/**
	 * @since 8.0
	 */
	readonly status: NEVPNStatus;

	/**
	 * @since 16.0
	 */
	fetchLastDisconnectErrorWithCompletionHandler(handler: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	startVPNTunnelAndReturnError(): boolean;

	/**
	 * @since 9.0
	 */
	startVPNTunnelWithOptionsAndReturnError(options: NSDictionary<string, NSObject>): boolean;

	/**
	 * @since 8.0
	 */
	stopVPNTunnel(): void;
}

/**
 * @since 16.0
 */
declare const enum NEVPNConnectionError {

	Overslept = 1,

	NoNetworkAvailable = 2,

	UnrecoverableNetworkChange = 3,

	ConfigurationFailed = 4,

	ServerAddressResolutionFailed = 5,

	ServerNotResponding = 6,

	ServerDead = 7,

	AuthenticationFailed = 8,

	ClientCertificateInvalid = 9,

	ClientCertificateNotYetValid = 10,

	ClientCertificateExpired = 11,

	PluginFailed = 12,

	ConfigurationNotFound = 13,

	PluginDisabled = 14,

	NegotiationFailed = 15,

	ServerDisconnected = 16,

	ServerCertificateInvalid = 17,

	ServerCertificateNotYetValid = 18,

	ServerCertificateExpired = 19
}

/**
 * @since 16.0
 */
declare var NEVPNConnectionErrorDomain: string;

/**
 * @since 9.0
 */
declare var NEVPNConnectionStartOptionPassword: string;

/**
 * @since 9.0
 */
declare var NEVPNConnectionStartOptionUsername: string;

/**
 * @since 8.0
 */
declare const enum NEVPNError {

	ConfigurationInvalid = 1,

	ConfigurationDisabled = 2,

	ConnectionFailed = 3,

	ConfigurationStale = 4,

	ConfigurationReadWriteFailed = 5,

	ConfigurationUnknown = 6
}

/**
 * @since 8.0
 */
declare var NEVPNErrorDomain: string;

/**
 * @since 8.0
 */
declare const enum NEVPNIKEAuthenticationMethod {

	None = 0,

	Certificate = 1,

	SharedSecret = 2
}

/**
 * @since 8.3
 */
declare const enum NEVPNIKEv2CertificateType {

	RSA = 1,

	ECDSA256 = 2,

	ECDSA384 = 3,

	ECDSA521 = 4,

	Ed25519 = 5,

	RSAPSS = 6
}

/**
 * @since 8.0
 */
declare const enum NEVPNIKEv2DeadPeerDetectionRate {

	None = 0,

	Low = 1,

	Medium = 2,

	High = 3
}

/**
 * @since 8.0
 */
declare const enum NEVPNIKEv2DiffieHellmanGroup {

	GroupInvalid = 0,

	Group1 = 1,

	Group2 = 2,

	Group5 = 5,

	Group14 = 14,

	Group15 = 15,

	Group16 = 16,

	Group17 = 17,

	Group18 = 18,

	Group19 = 19,

	Group20 = 20,

	Group21 = 21,

	Group31 = 31,

	Group32 = 32
}

/**
 * @since 8.0
 */
declare const enum NEVPNIKEv2EncryptionAlgorithm {

	AlgorithmDES = 1,

	Algorithm3DES = 2,

	AlgorithmAES128 = 3,

	AlgorithmAES256 = 4,

	AlgorithmAES128GCM = 5,

	AlgorithmAES256GCM = 6,

	AlgorithmChaCha20Poly1305 = 7
}

/**
 * @since 8.0
 */
declare const enum NEVPNIKEv2IntegrityAlgorithm {

	SHA96 = 1,

	SHA160 = 2,

	SHA256 = 3,

	SHA384 = 4,

	SHA512 = 5
}

/**
 * @since 18.0
 */
declare class NEVPNIKEv2PPKConfiguration extends NSObject implements NSCopying {

	static alloc(): NEVPNIKEv2PPKConfiguration; // inherited from NSObject

	static new(): NEVPNIKEv2PPKConfiguration; // inherited from NSObject

	readonly identifier: string;

	isMandatory: boolean;

	readonly keychainReference: NSData;

	constructor(o: { identifier: string; keychainReference: NSData; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithIdentifierKeychainReference(identifier: string, keychainReference: NSData): this;
}

/**
 * @since 8.0
 */
declare class NEVPNIKEv2SecurityAssociationParameters extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEVPNIKEv2SecurityAssociationParameters; // inherited from NSObject

	static new(): NEVPNIKEv2SecurityAssociationParameters; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	diffieHellmanGroup: NEVPNIKEv2DiffieHellmanGroup;

	/**
	 * @since 8.0
	 */
	encryptionAlgorithm: NEVPNIKEv2EncryptionAlgorithm;

	/**
	 * @since 8.0
	 */
	integrityAlgorithm: NEVPNIKEv2IntegrityAlgorithm;

	/**
	 * @since 8.0
	 */
	lifetimeMinutes: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare const enum NEVPNIKEv2TLSVersion {

	VersionDefault = 0,

	Version1_0 = 1,

	Version1_1 = 2,

	Version1_2 = 3
}

/**
 * @since 8.0
 */
declare class NEVPNManager extends NSObject {

	static alloc(): NEVPNManager; // inherited from NSObject

	static new(): NEVPNManager; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	static sharedManager(): NEVPNManager;

	/**
	 * @since 8.0
	 */
	readonly connection: NEVPNConnection;

	/**
	 * @since 8.0
	 */
	enabled: boolean;

	/**
	 * @since 8.0
	 */
	localizedDescription: string;

	/**
	 * @since 8.0
	 */
	onDemandEnabled: boolean;

	/**
	 * @since 8.0
	 */
	onDemandRules: NSArray<NEOnDemandRule>;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	protocol: NEVPNProtocol;

	/**
	 * @since 9.0
	 */
	protocolConfiguration: NEVPNProtocol;

	/**
	 * @since 8.0
	 */
	loadFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	removeFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	saveToPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 8.0
 */
declare class NEVPNProtocol extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEVPNProtocol; // inherited from NSObject

	static new(): NEVPNProtocol; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	disconnectOnSleep: boolean;

	/**
	 * @since 14.2
	 */
	enforceRoutes: boolean;

	/**
	 * @since 16.4
	 */
	excludeAPNs: boolean;

	/**
	 * @since 16.4
	 */
	excludeCellularServices: boolean;

	/**
	 * @since 17.4
	 */
	excludeDeviceCommunication: boolean;

	/**
	 * @since 14.2
	 */
	excludeLocalNetworks: boolean;

	/**
	 * @since 8.0
	 */
	identityData: NSData;

	/**
	 * @since 8.0
	 */
	identityDataPassword: string;

	/**
	 * @since 9.0
	 */
	identityReference: NSData;

	/**
	 * @since 14.0
	 */
	includeAllNetworks: boolean;

	/**
	 * @since 8.0
	 */
	passwordReference: NSData;

	/**
	 * @since 9.0
	 */
	proxySettings: NEProxySettings;

	/**
	 * @since 8.0
	 */
	serverAddress: string;

	/**
	 * @since 18.0
	 */
	sliceUUID: string;

	/**
	 * @since 8.0
	 */
	username: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class NEVPNProtocolIKEv2 extends NEVPNProtocolIPSec {

	static alloc(): NEVPNProtocolIKEv2; // inherited from NSObject

	static new(): NEVPNProtocolIKEv2; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	readonly IKESecurityAssociationParameters: NEVPNIKEv2SecurityAssociationParameters;

	/**
	 * @since 8.3
	 */
	certificateType: NEVPNIKEv2CertificateType;

	/**
	 * @since 8.0
	 */
	readonly childSecurityAssociationParameters: NEVPNIKEv2SecurityAssociationParameters;

	/**
	 * @since 8.0
	 */
	deadPeerDetectionRate: NEVPNIKEv2DeadPeerDetectionRate;

	/**
	 * @since 9.0
	 */
	disableMOBIKE: boolean;

	/**
	 * @since 9.0
	 */
	disableRedirect: boolean;

	/**
	 * @since 13.0
	 */
	enableFallback: boolean;

	/**
	 * @since 9.0
	 */
	enablePFS: boolean;

	/**
	 * @since 9.0
	 */
	enableRevocationCheck: boolean;

	/**
	 * @since 11.0
	 */
	maximumTLSVersion: NEVPNIKEv2TLSVersion;

	/**
	 * @since 11.0
	 */
	minimumTLSVersion: NEVPNIKEv2TLSVersion;

	/**
	 * @since 14.0
	 */
	mtu: number;

	/**
	 * @since 18.0
	 */
	ppkConfiguration: NEVPNIKEv2PPKConfiguration;

	/**
	 * @since 8.0
	 */
	serverCertificateCommonName: string;

	/**
	 * @since 8.0
	 */
	serverCertificateIssuerCommonName: string;

	/**
	 * @since 9.0
	 */
	strictRevocationCheck: boolean;

	/**
	 * @since 9.0
	 */
	useConfigurationAttributeInternalIPSubnet: boolean;
}

/**
 * @since 8.0
 */
declare class NEVPNProtocolIPSec extends NEVPNProtocol {

	static alloc(): NEVPNProtocolIPSec; // inherited from NSObject

	static new(): NEVPNProtocolIPSec; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	authenticationMethod: NEVPNIKEAuthenticationMethod;

	/**
	 * @since 8.0
	 */
	localIdentifier: string;

	/**
	 * @since 8.0
	 */
	remoteIdentifier: string;

	/**
	 * @since 8.0
	 */
	sharedSecretReference: NSData;

	/**
	 * @since 8.0
	 */
	useExtendedAuthentication: boolean;
}

/**
 * @since 8.0
 */
declare const enum NEVPNStatus {

	Invalid = 0,

	Disconnected = 1,

	Connecting = 2,

	Connected = 3,

	Reasserting = 4,

	Disconnecting = 5
}

/**
 * @since 8.0
 */
declare var NEVPNStatusDidChangeNotification: string;

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare class NWBonjourServiceEndpoint extends NWEndpoint {

	static alloc(): NWBonjourServiceEndpoint; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	static endpointWithNameTypeDomain(name: string, type: string, domain: string): NWBonjourServiceEndpoint;

	static new(): NWBonjourServiceEndpoint; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly domain: string;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly name: string;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly type: string;
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare class NWEndpoint extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NWEndpoint; // inherited from NSObject

	static new(): NWEndpoint; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare class NWHostEndpoint extends NWEndpoint {

	static alloc(): NWHostEndpoint; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	static endpointWithHostnamePort(hostname: string, port: string): NWHostEndpoint;

	static new(): NWHostEndpoint; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly hostname: string;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly port: string;
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare class NWPath extends NSObject {

	static alloc(): NWPath; // inherited from NSObject

	static new(): NWPath; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly constrained: boolean;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly expensive: boolean;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly status: NWPathStatus;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	isEqualToPath(path: NWPath): boolean;
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare const enum NWPathStatus {

	Invalid = 0,

	Satisfied = 1,

	Unsatisfied = 2,

	Satisfiable = 3
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare class NWTCPConnection extends NSObject {

	static alloc(): NWTCPConnection; // inherited from NSObject

	static new(): NWTCPConnection; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly connectedPath: NWPath;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly endpoint: NWEndpoint;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly error: NSError;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly hasBetterPath: boolean;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly localAddress: NWEndpoint;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly remoteAddress: NWEndpoint;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly state: NWTCPConnectionState;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly txtRecord: NSData;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly viable: boolean;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	constructor(o: { upgradeForConnection: NWTCPConnection; });

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	cancel(): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	initWithUpgradeForConnection(connection: NWTCPConnection): this;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readLengthCompletionHandler(length: number, completion: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readMinimumLengthMaximumLengthCompletionHandler(minimum: number, maximum: number, completion: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	writeClose(): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	writeCompletionHandler(data: NSData, completion: (p1: NSError) => void): void;
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
interface NWTCPConnectionAuthenticationDelegate extends NSObjectProtocol {

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	evaluateTrustForConnectionPeerCertificateChainCompletionHandler?(connection: NWTCPConnection, peerCertificateChain: NSArray<any> | any[], completion: (p1: any) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	provideIdentityForConnectionCompletionHandler?(connection: NWTCPConnection, completion: (p1: any, p2: NSArray<any>) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	shouldEvaluateTrustForConnection?(connection: NWTCPConnection): boolean;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	shouldProvideIdentityForConnection?(connection: NWTCPConnection): boolean;
}
declare var NWTCPConnectionAuthenticationDelegate: {

	prototype: NWTCPConnectionAuthenticationDelegate;
};

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare const enum NWTCPConnectionState {

	Invalid = 0,

	Connecting = 1,

	Waiting = 2,

	Connected = 3,

	Disconnected = 4,

	Cancelled = 5
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare class NWTLSParameters extends NSObject {

	static alloc(): NWTLSParameters; // inherited from NSObject

	static new(): NWTLSParameters; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	SSLCipherSuites: NSSet<number>;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	TLSSessionID: NSData;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	maximumSSLProtocolVersion: number;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	minimumSSLProtocolVersion: number;
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare class NWUDPSession extends NSObject {

	static alloc(): NWUDPSession; // inherited from NSObject

	static new(): NWUDPSession; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly currentPath: NWPath;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly endpoint: NWEndpoint;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly hasBetterPath: boolean;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly maximumDatagramLength: number;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly resolvedEndpoint: NWEndpoint;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly state: NWUDPSessionState;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly viable: boolean;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	constructor(o: { upgradeForSession: NWUDPSession; });

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	cancel(): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	initWithUpgradeForSession(session: NWUDPSession): this;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	setReadHandlerMaxDatagrams(handler: (p1: NSArray<NSData>, p2: NSError) => void, maxDatagrams: number): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	tryNextResolvedEndpoint(): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	writeDatagramCompletionHandler(datagram: NSData, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	writeMultipleDatagramsCompletionHandler(datagramArray: NSArray<NSData> | NSData[], completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare const enum NWUDPSessionState {

	Invalid = 0,

	Waiting = 1,

	Preparing = 2,

	Ready = 3,

	Failed = 4,

	Cancelled = 5
}

/**
 * @since 9.0
 */
declare var kNEHotspotHelperOptionDisplayName: string;
