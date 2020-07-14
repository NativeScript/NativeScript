
declare var NEAppProxyErrorDomain: string;

declare class NEAppProxyFlow extends NSObject {

	static alloc(): NEAppProxyFlow; // inherited from NSObject

	static new(): NEAppProxyFlow; // inherited from NSObject

	readonly metaData: NEFlowMetaData;

	closeReadWithError(error: NSError): void;

	closeWriteWithError(error: NSError): void;

	openWithLocalEndpointCompletionHandler(localEndpoint: NWHostEndpoint, completionHandler: (p1: NSError) => void): void;
}

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

declare class NEAppProxyProvider extends NETunnelProvider {

	static alloc(): NEAppProxyProvider; // inherited from NSObject

	static new(): NEAppProxyProvider; // inherited from NSObject

	cancelProxyWithError(error: NSError): void;

	handleNewFlow(flow: NEAppProxyFlow): boolean;

	handleNewUDPFlowInitialRemoteEndpoint(flow: NEAppProxyUDPFlow, remoteEndpoint: NWEndpoint): boolean;

	startProxyWithOptionsCompletionHandler(options: NSDictionary<string, any>, completionHandler: (p1: NSError) => void): void;

	stopProxyWithReasonCompletionHandler(reason: NEProviderStopReason, completionHandler: () => void): void;
}

declare class NEAppProxyProviderManager extends NETunnelProviderManager {

	static alloc(): NEAppProxyProviderManager; // inherited from NSObject

	static new(): NEAppProxyProviderManager; // inherited from NSObject
}

declare class NEAppProxyTCPFlow extends NEAppProxyFlow {

	static alloc(): NEAppProxyTCPFlow; // inherited from NSObject

	static new(): NEAppProxyTCPFlow; // inherited from NSObject

	readonly remoteEndpoint: NWEndpoint;

	readDataWithCompletionHandler(completionHandler: (p1: NSData, p2: NSError) => void): void;

	writeDataWithCompletionHandler(data: NSData, completionHandler: (p1: NSError) => void): void;
}

declare class NEAppProxyUDPFlow extends NEAppProxyFlow {

	static alloc(): NEAppProxyUDPFlow; // inherited from NSObject

	static new(): NEAppProxyUDPFlow; // inherited from NSObject

	readonly localEndpoint: NWEndpoint;

	readDatagramsWithCompletionHandler(completionHandler: (p1: NSArray<NSData>, p2: NSArray<NWEndpoint>, p3: NSError) => void): void;

	writeDatagramsSentByEndpointsCompletionHandler(datagrams: NSArray<NSData> | NSData[], remoteEndpoints: NSArray<NWEndpoint> | NWEndpoint[], completionHandler: (p1: NSError) => void): void;
}

declare class NEAppRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEAppRule; // inherited from NSObject

	static new(): NEAppRule; // inherited from NSObject

	matchDomains: NSArray<any>;

	matchPath: string;

	readonly matchSigningIdentifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { signingIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSigningIdentifier(signingIdentifier: string): this;
}

declare var NEDNSProxyConfigurationDidChangeNotification: string;

declare var NEDNSProxyErrorDomain: string;

declare class NEDNSProxyManager extends NSObject {

	static alloc(): NEDNSProxyManager; // inherited from NSObject

	static new(): NEDNSProxyManager; // inherited from NSObject

	static sharedManager(): NEDNSProxyManager;

	enabled: boolean;

	localizedDescription: string;

	providerProtocol: NEDNSProxyProviderProtocol;

	loadFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	removeFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	saveToPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

declare const enum NEDNSProxyManagerError {

	ConfigurationInvalid = 1,

	ConfigurationDisabled = 2,

	ConfigurationStale = 3,

	ConfigurationCannotBeRemoved = 4
}

declare class NEDNSProxyProvider extends NEProvider {

	static alloc(): NEDNSProxyProvider; // inherited from NSObject

	static new(): NEDNSProxyProvider; // inherited from NSObject

	readonly systemDNSSettings: NSArray<NEDNSSettings>;

	cancelProxyWithError(error: NSError): void;

	handleNewFlow(flow: NEAppProxyFlow): boolean;

	handleNewUDPFlowInitialRemoteEndpoint(flow: NEAppProxyUDPFlow, remoteEndpoint: NWEndpoint): boolean;

	startProxyWithOptionsCompletionHandler(options: NSDictionary<string, any>, completionHandler: (p1: NSError) => void): void;

	stopProxyWithReasonCompletionHandler(reason: NEProviderStopReason, completionHandler: () => void): void;
}

declare class NEDNSProxyProviderProtocol extends NEVPNProtocol {

	static alloc(): NEDNSProxyProviderProtocol; // inherited from NSObject

	static new(): NEDNSProxyProviderProtocol; // inherited from NSObject

	providerBundleIdentifier: string;

	providerConfiguration: NSDictionary<string, any>;
}

declare class NEDNSSettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEDNSSettings; // inherited from NSObject

	static new(): NEDNSSettings; // inherited from NSObject

	domainName: string;

	matchDomains: NSArray<string>;

	matchDomainsNoSearch: boolean;

	searchDomains: NSArray<string>;

	readonly servers: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { servers: NSArray<string> | string[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithServers(servers: NSArray<string> | string[]): this;
}

declare class NEEvaluateConnectionRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEEvaluateConnectionRule; // inherited from NSObject

	static new(): NEEvaluateConnectionRule; // inherited from NSObject

	readonly action: NEEvaluateConnectionRuleAction;

	readonly matchDomains: NSArray<string>;

	probeURL: NSURL;

	useDNSServers: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { matchDomains: NSArray<string> | string[]; andAction: NEEvaluateConnectionRuleAction; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithMatchDomainsAndAction(domains: NSArray<string> | string[], action: NEEvaluateConnectionRuleAction): this;
}

declare const enum NEEvaluateConnectionRuleAction {

	ConnectIfNeeded = 1,

	NeverConnect = 2
}

declare const enum NEFilterAction {

	Invalid = 0,

	Allow = 1,

	Drop = 2,

	Remediate = 3,

	FilterData = 4
}

declare class NEFilterBrowserFlow extends NEFilterFlow implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterBrowserFlow; // inherited from NSObject

	static new(): NEFilterBrowserFlow; // inherited from NSObject

	readonly parentURL: NSURL;

	readonly request: NSURLRequest;

	readonly response: NSURLResponse;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var NEFilterConfigurationDidChangeNotification: string;

declare class NEFilterControlProvider extends NEFilterProvider {

	static alloc(): NEFilterControlProvider; // inherited from NSObject

	static new(): NEFilterControlProvider; // inherited from NSObject

	URLAppendStringMap: NSDictionary<string, string>;

	remediationMap: NSDictionary<string, NSDictionary<string, NSObject>>;

	handleNewFlowCompletionHandler(flow: NEFilterFlow, completionHandler: (p1: NEFilterControlVerdict) => void): void;

	handleRemediationForFlowCompletionHandler(flow: NEFilterFlow, completionHandler: (p1: NEFilterControlVerdict) => void): void;

	notifyRulesChanged(): void;
}

declare class NEFilterControlVerdict extends NEFilterNewFlowVerdict implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterControlVerdict; // inherited from NSObject

	static allowVerdictWithUpdateRules(updateRules: boolean): NEFilterControlVerdict;

	static dropVerdictWithUpdateRules(updateRules: boolean): NEFilterControlVerdict;

	static new(): NEFilterControlVerdict; // inherited from NSObject

	static updateRules(): NEFilterControlVerdict;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NEFilterDataProvider extends NEFilterProvider {

	static alloc(): NEFilterDataProvider; // inherited from NSObject

	static new(): NEFilterDataProvider; // inherited from NSObject

	handleInboundDataCompleteForFlow(flow: NEFilterFlow): NEFilterDataVerdict;

	handleInboundDataFromFlowReadBytesStartOffsetReadBytes(flow: NEFilterFlow, offset: number, readBytes: NSData): NEFilterDataVerdict;

	handleNewFlow(flow: NEFilterFlow): NEFilterNewFlowVerdict;

	handleOutboundDataCompleteForFlow(flow: NEFilterFlow): NEFilterDataVerdict;

	handleOutboundDataFromFlowReadBytesStartOffsetReadBytes(flow: NEFilterFlow, offset: number, readBytes: NSData): NEFilterDataVerdict;

	handleRemediationForFlow(flow: NEFilterFlow): NEFilterRemediationVerdict;

	handleRulesChanged(): void;
}

declare class NEFilterDataVerdict extends NEFilterVerdict implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterDataVerdict; // inherited from NSObject

	static allowVerdict(): NEFilterDataVerdict;

	static dataVerdictWithPassBytesPeekBytes(passBytes: number, peekBytes: number): NEFilterDataVerdict;

	static dropVerdict(): NEFilterDataVerdict;

	static needRulesVerdict(): NEFilterDataVerdict;

	static new(): NEFilterDataVerdict; // inherited from NSObject

	static remediateVerdictWithRemediationURLMapKeyRemediationButtonTextMapKey(remediationURLMapKey: string, remediationButtonTextMapKey: string): NEFilterDataVerdict;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var NEFilterErrorDomain: string;

declare class NEFilterFlow extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterFlow; // inherited from NSObject

	static new(): NEFilterFlow; // inherited from NSObject

	readonly URL: NSURL;

	readonly direction: NETrafficDirection;

	readonly identifier: NSUUID;

	readonly sourceAppIdentifier: string;

	readonly sourceAppUniqueIdentifier: NSData;

	readonly sourceAppVersion: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NEFilterManager extends NSObject {

	static alloc(): NEFilterManager; // inherited from NSObject

	static new(): NEFilterManager; // inherited from NSObject

	static sharedManager(): NEFilterManager;

	enabled: boolean;

	localizedDescription: string;

	providerConfiguration: NEFilterProviderConfiguration;

	loadFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	removeFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	saveToPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

declare const enum NEFilterManagerError {

	ConfigurationInvalid = 1,

	ConfigurationDisabled = 2,

	ConfigurationStale = 3,

	ConfigurationCannotBeRemoved = 4,

	ConfigurationPermissionDenied = 5,

	ConfigurationInternalError = 6
}

declare class NEFilterNewFlowVerdict extends NEFilterVerdict implements NSCopying, NSSecureCoding {

	static URLAppendStringVerdictWithMapKey(urlAppendMapKey: string): NEFilterNewFlowVerdict;

	static alloc(): NEFilterNewFlowVerdict; // inherited from NSObject

	static allowVerdict(): NEFilterNewFlowVerdict;

	static dropVerdict(): NEFilterNewFlowVerdict;

	static filterDataVerdictWithFilterInboundPeekInboundBytesFilterOutboundPeekOutboundBytes(filterInbound: boolean, peekInboundBytes: number, filterOutbound: boolean, peekOutboundBytes: number): NEFilterNewFlowVerdict;

	static needRulesVerdict(): NEFilterNewFlowVerdict;

	static new(): NEFilterNewFlowVerdict; // inherited from NSObject

	static remediateVerdictWithRemediationURLMapKeyRemediationButtonTextMapKey(remediationURLMapKey: string, remediationButtonTextMapKey: string): NEFilterNewFlowVerdict;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NEFilterProvider extends NEProvider {

	static alloc(): NEFilterProvider; // inherited from NSObject

	static new(): NEFilterProvider; // inherited from NSObject

	readonly filterConfiguration: NEFilterProviderConfiguration;

	handleReport(report: NEFilterReport): void;

	startFilterWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	stopFilterWithReasonCompletionHandler(reason: NEProviderStopReason, completionHandler: () => void): void;
}

declare class NEFilterProviderConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterProviderConfiguration; // inherited from NSObject

	static new(): NEFilterProviderConfiguration; // inherited from NSObject

	filterBrowsers: boolean;

	filterSockets: boolean;

	identityReference: NSData;

	organization: string;

	passwordReference: NSData;

	serverAddress: string;

	username: string;

	vendorConfiguration: NSDictionary<string, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var NEFilterProviderRemediationMapRemediationButtonTexts: string;

declare var NEFilterProviderRemediationMapRemediationURLs: string;

declare class NEFilterRemediationVerdict extends NEFilterVerdict implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterRemediationVerdict; // inherited from NSObject

	static allowVerdict(): NEFilterRemediationVerdict;

	static dropVerdict(): NEFilterRemediationVerdict;

	static needRulesVerdict(): NEFilterRemediationVerdict;

	static new(): NEFilterRemediationVerdict; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NEFilterReport extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterReport; // inherited from NSObject

	static new(): NEFilterReport; // inherited from NSObject

	readonly action: NEFilterAction;

	readonly bytesInboundCount: number;

	readonly bytesOutboundCount: number;

	readonly event: NEFilterReportEvent;

	readonly flow: NEFilterFlow;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum NEFilterReportEvent {

	NewFlow = 1,

	DataDecision = 2,

	FlowClosed = 3
}

declare class NEFilterSocketFlow extends NEFilterFlow implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterSocketFlow; // inherited from NSObject

	static new(): NEFilterSocketFlow; // inherited from NSObject

	readonly localEndpoint: NWEndpoint;

	readonly remoteEndpoint: NWEndpoint;

	readonly socketFamily: number;

	readonly socketProtocol: number;

	readonly socketType: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NEFilterVerdict extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFilterVerdict; // inherited from NSObject

	static new(): NEFilterVerdict; // inherited from NSObject

	shouldReport: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NEFlowMetaData extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEFlowMetaData; // inherited from NSObject

	static new(): NEFlowMetaData; // inherited from NSObject

	readonly sourceAppSigningIdentifier: string;

	readonly sourceAppUniqueIdentifier: NSData;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NEHotspotConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEHotspotConfiguration; // inherited from NSObject

	static new(): NEHotspotConfiguration; // inherited from NSObject

	readonly SSID: string;

	readonly SSIDPrefix: string;

	hidden: boolean;

	joinOnce: boolean;

	lifeTimeInDays: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { HS20Settings: NEHotspotHS20Settings; eapSettings: NEHotspotEAPSettings; });

	constructor(o: { SSID: string; });

	constructor(o: { SSID: string; eapSettings: NEHotspotEAPSettings; });

	constructor(o: { SSID: string; passphrase: string; isWEP: boolean; });

	constructor(o: { SSIDPrefix: string; });

	constructor(o: { SSIDPrefix: string; passphrase: string; isWEP: boolean; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHS20SettingsEapSettings(hs20Settings: NEHotspotHS20Settings, eapSettings: NEHotspotEAPSettings): this;

	initWithSSID(SSID: string): this;

	initWithSSIDEapSettings(SSID: string, eapSettings: NEHotspotEAPSettings): this;

	initWithSSIDPassphraseIsWEP(SSID: string, passphrase: string, isWEP: boolean): this;

	initWithSSIDPrefix(SSIDPrefix: string): this;

	initWithSSIDPrefixPassphraseIsWEP(SSIDPrefix: string, passphrase: string, isWEP: boolean): this;
}

declare const enum NEHotspotConfigurationEAPTLSVersion {

	Version_1_0 = 0,

	Version_1_1 = 1,

	Version_1_2 = 2
}

declare const enum NEHotspotConfigurationEAPType {

	EAPTLS = 13,

	EAPTTLS = 21,

	EAPPEAP = 25,

	EAPFAST = 43
}

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

	InvalidSSIDPrefix = 15
}

declare var NEHotspotConfigurationErrorDomain: string;

declare class NEHotspotConfigurationManager extends NSObject {

	static alloc(): NEHotspotConfigurationManager; // inherited from NSObject

	static new(): NEHotspotConfigurationManager; // inherited from NSObject

	static readonly sharedManager: NEHotspotConfigurationManager;

	applyConfigurationCompletionHandler(configuration: NEHotspotConfiguration, completionHandler: (p1: NSError) => void): void;

	getConfiguredSSIDsWithCompletionHandler(completionHandler: (p1: NSArray<string>) => void): void;

	removeConfigurationForHS20DomainName(domainName: string): void;

	removeConfigurationForSSID(SSID: string): void;
}

declare const enum NEHotspotConfigurationTTLSInnerAuthenticationType {

	EAPTTLSInnerAuthenticationPAP = 0,

	EAPTTLSInnerAuthenticationCHAP = 1,

	EAPTTLSInnerAuthenticationMSCHAP = 2,

	EAPTTLSInnerAuthenticationMSCHAPv2 = 3,

	EAPTTLSInnerAuthenticationEAP = 4
}

declare class NEHotspotEAPSettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEHotspotEAPSettings; // inherited from NSObject

	static new(): NEHotspotEAPSettings; // inherited from NSObject

	outerIdentity: string;

	password: string;

	preferredTLSVersion: NEHotspotConfigurationEAPTLSVersion;

	supportedEAPTypes: NSArray<number>;

	tlsClientCertificateRequired: boolean;

	trustedServerNames: NSArray<string>;

	ttlsInnerAuthenticationType: NEHotspotConfigurationTTLSInnerAuthenticationType;

	username: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setIdentity(identity: any): boolean;

	setTrustedServerCertificates(certificates: NSArray<any> | any[]): boolean;
}

declare class NEHotspotHS20Settings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEHotspotHS20Settings; // inherited from NSObject

	static new(): NEHotspotHS20Settings; // inherited from NSObject

	MCCAndMNCs: NSArray<string>;

	readonly domainName: string;

	naiRealmNames: NSArray<string>;

	roamingConsortiumOIs: NSArray<string>;

	roamingEnabled: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { domainName: string; roamingEnabled: boolean; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDomainNameRoamingEnabled(domainName: string, roamingEnabled: boolean): this;
}

declare class NEHotspotHelper extends NSObject {

	static alloc(): NEHotspotHelper; // inherited from NSObject

	static logoff(network: NEHotspotNetwork): boolean;

	static new(): NEHotspotHelper; // inherited from NSObject

	static registerWithOptionsQueueHandler(options: NSDictionary<string, NSObject>, queue: NSObject, handler: (p1: NEHotspotHelperCommand) => void): boolean;

	static supportedNetworkInterfaces(): NSArray<any>;
}

declare class NEHotspotHelperCommand extends NSObject {

	static alloc(): NEHotspotHelperCommand; // inherited from NSObject

	static new(): NEHotspotHelperCommand; // inherited from NSObject

	readonly commandType: NEHotspotHelperCommandType;

	readonly network: NEHotspotNetwork;

	readonly networkList: NSArray<NEHotspotNetwork>;

	createResponse(result: NEHotspotHelperResult): NEHotspotHelperResponse;

	createTCPConnection(endpoint: NWEndpoint): NWTCPConnection;

	createUDPSession(endpoint: NWEndpoint): NWUDPSession;
}

declare const enum NEHotspotHelperCommandType {

	kNEHotspotHelperCommandTypeNone = 0,

	kNEHotspotHelperCommandTypeFilterScanList = 1,

	kNEHotspotHelperCommandTypeEvaluate = 2,

	kNEHotspotHelperCommandTypeAuthenticate = 3,

	kNEHotspotHelperCommandTypePresentUI = 4,

	kNEHotspotHelperCommandTypeMaintain = 5,

	kNEHotspotHelperCommandTypeLogoff = 6
}

declare const enum NEHotspotHelperConfidence {

	kNEHotspotHelperConfidenceNone = 0,

	kNEHotspotHelperConfidenceLow = 1,

	kNEHotspotHelperConfidenceHigh = 2
}

declare class NEHotspotHelperResponse extends NSObject {

	static alloc(): NEHotspotHelperResponse; // inherited from NSObject

	static new(): NEHotspotHelperResponse; // inherited from NSObject

	deliver(): void;

	setNetwork(network: NEHotspotNetwork): void;

	setNetworkList(networkList: NSArray<NEHotspotNetwork> | NEHotspotNetwork[]): void;
}

declare const enum NEHotspotHelperResult {

	kNEHotspotHelperResultSuccess = 0,

	kNEHotspotHelperResultFailure = 1,

	kNEHotspotHelperResultUIRequired = 2,

	kNEHotspotHelperResultCommandNotRecognized = 3,

	kNEHotspotHelperResultAuthenticationRequired = 4,

	kNEHotspotHelperResultUnsupportedNetwork = 5,

	kNEHotspotHelperResultTemporaryFailure = 6
}

declare class NEHotspotNetwork extends NSObject {

	static alloc(): NEHotspotNetwork; // inherited from NSObject

	static new(): NEHotspotNetwork; // inherited from NSObject

	readonly BSSID: string;

	readonly SSID: string;

	readonly autoJoined: boolean;

	readonly chosenHelper: boolean;

	readonly justJoined: boolean;

	readonly secure: boolean;

	readonly signalStrength: number;

	setConfidence(confidence: NEHotspotHelperConfidence): void;

	setPassword(password: string): void;
}

declare class NEIPv4Route extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEIPv4Route; // inherited from NSObject

	static defaultRoute(): NEIPv4Route;

	static new(): NEIPv4Route; // inherited from NSObject

	readonly destinationAddress: string;

	readonly destinationSubnetMask: string;

	gatewayAddress: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { destinationAddress: string; subnetMask: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDestinationAddressSubnetMask(address: string, subnetMask: string): this;
}

declare class NEIPv4Settings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEIPv4Settings; // inherited from NSObject

	static new(): NEIPv4Settings; // inherited from NSObject

	readonly addresses: NSArray<string>;

	excludedRoutes: NSArray<NEIPv4Route>;

	includedRoutes: NSArray<NEIPv4Route>;

	readonly subnetMasks: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { addresses: NSArray<string> | string[]; subnetMasks: NSArray<string> | string[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAddressesSubnetMasks(addresses: NSArray<string> | string[], subnetMasks: NSArray<string> | string[]): this;

	initWithCoder(coder: NSCoder): this;
}

declare class NEIPv6Route extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEIPv6Route; // inherited from NSObject

	static defaultRoute(): NEIPv6Route;

	static new(): NEIPv6Route; // inherited from NSObject

	readonly destinationAddress: string;

	readonly destinationNetworkPrefixLength: number;

	gatewayAddress: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { destinationAddress: string; networkPrefixLength: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDestinationAddressNetworkPrefixLength(address: string, networkPrefixLength: number): this;
}

declare class NEIPv6Settings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEIPv6Settings; // inherited from NSObject

	static new(): NEIPv6Settings; // inherited from NSObject

	readonly addresses: NSArray<string>;

	excludedRoutes: NSArray<NEIPv6Route>;

	includedRoutes: NSArray<NEIPv6Route>;

	readonly networkPrefixLengths: NSArray<number>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { addresses: NSArray<string> | string[]; networkPrefixLengths: NSArray<number> | number[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAddressesNetworkPrefixLengths(addresses: NSArray<string> | string[], networkPrefixLengths: NSArray<number> | number[]): this;

	initWithCoder(coder: NSCoder): this;
}

declare class NEOnDemandRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEOnDemandRule; // inherited from NSObject

	static new(): NEOnDemandRule; // inherited from NSObject

	DNSSearchDomainMatch: NSArray<string>;

	DNSServerAddressMatch: NSArray<string>;

	SSIDMatch: NSArray<string>;

	readonly action: NEOnDemandRuleAction;

	interfaceTypeMatch: NEOnDemandRuleInterfaceType;

	probeURL: NSURL;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum NEOnDemandRuleAction {

	Connect = 1,

	Disconnect = 2,

	EvaluateConnection = 3,

	Ignore = 4
}

declare class NEOnDemandRuleConnect extends NEOnDemandRule {

	static alloc(): NEOnDemandRuleConnect; // inherited from NSObject

	static new(): NEOnDemandRuleConnect; // inherited from NSObject
}

declare class NEOnDemandRuleDisconnect extends NEOnDemandRule {

	static alloc(): NEOnDemandRuleDisconnect; // inherited from NSObject

	static new(): NEOnDemandRuleDisconnect; // inherited from NSObject
}

declare class NEOnDemandRuleEvaluateConnection extends NEOnDemandRule {

	static alloc(): NEOnDemandRuleEvaluateConnection; // inherited from NSObject

	static new(): NEOnDemandRuleEvaluateConnection; // inherited from NSObject

	connectionRules: NSArray<NEEvaluateConnectionRule>;
}

declare class NEOnDemandRuleIgnore extends NEOnDemandRule {

	static alloc(): NEOnDemandRuleIgnore; // inherited from NSObject

	static new(): NEOnDemandRuleIgnore; // inherited from NSObject
}

declare const enum NEOnDemandRuleInterfaceType {

	Any = 0,

	Ethernet = 1,

	WiFi = 2,

	Cellular = 3
}

declare class NEPacket extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEPacket; // inherited from NSObject

	static new(): NEPacket; // inherited from NSObject

	readonly data: NSData;

	readonly metadata: NEFlowMetaData;

	readonly protocolFamily: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { data: NSData; protocolFamily: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDataProtocolFamily(data: NSData, protocolFamily: number): this;
}

declare class NEPacketTunnelFlow extends NSObject {

	static alloc(): NEPacketTunnelFlow; // inherited from NSObject

	static new(): NEPacketTunnelFlow; // inherited from NSObject

	readPacketObjectsWithCompletionHandler(completionHandler: (p1: NSArray<NEPacket>) => void): void;

	readPacketsWithCompletionHandler(completionHandler: (p1: NSArray<NSData>, p2: NSArray<number>) => void): void;

	writePacketObjects(packets: NSArray<NEPacket> | NEPacket[]): boolean;

	writePacketsWithProtocols(packets: NSArray<NSData> | NSData[], protocols: NSArray<number> | number[]): boolean;
}

declare class NEPacketTunnelNetworkSettings extends NETunnelNetworkSettings {

	static alloc(): NEPacketTunnelNetworkSettings; // inherited from NSObject

	static new(): NEPacketTunnelNetworkSettings; // inherited from NSObject

	IPv4Settings: NEIPv4Settings;

	IPv6Settings: NEIPv6Settings;

	MTU: number;

	tunnelOverheadBytes: number;
}

declare class NEPacketTunnelProvider extends NETunnelProvider {

	static alloc(): NEPacketTunnelProvider; // inherited from NSObject

	static new(): NEPacketTunnelProvider; // inherited from NSObject

	readonly packetFlow: NEPacketTunnelFlow;

	cancelTunnelWithError(error: NSError): void;

	createTCPConnectionThroughTunnelToEndpointEnableTLSTLSParametersDelegate(remoteEndpoint: NWEndpoint, enableTLS: boolean, TLSParameters: NWTLSParameters, delegate: any): NWTCPConnection;

	createUDPSessionThroughTunnelToEndpointFromEndpoint(remoteEndpoint: NWEndpoint, localEndpoint: NWHostEndpoint): NWUDPSession;

	startTunnelWithOptionsCompletionHandler(options: NSDictionary<string, NSObject>, completionHandler: (p1: NSError) => void): void;

	stopTunnelWithReasonCompletionHandler(reason: NEProviderStopReason, completionHandler: () => void): void;
}

declare class NEProvider extends NSObject {

	static alloc(): NEProvider; // inherited from NSObject

	static new(): NEProvider; // inherited from NSObject

	readonly defaultPath: NWPath;

	createTCPConnectionToEndpointEnableTLSTLSParametersDelegate(remoteEndpoint: NWEndpoint, enableTLS: boolean, TLSParameters: NWTLSParameters, delegate: any): NWTCPConnection;

	createUDPSessionToEndpointFromEndpoint(remoteEndpoint: NWEndpoint, localEndpoint: NWHostEndpoint): NWUDPSession;

	displayMessageCompletionHandler(message: string, completionHandler: (p1: boolean) => void): void;

	sleepWithCompletionHandler(completionHandler: () => void): void;

	wake(): void;
}

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

	AppUpdate = 16
}

declare class NEProxyServer extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEProxyServer; // inherited from NSObject

	static new(): NEProxyServer; // inherited from NSObject

	readonly address: string;

	authenticationRequired: boolean;

	password: string;

	readonly port: number;

	username: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { address: string; port: number; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAddressPort(address: string, port: number): this;

	initWithCoder(coder: NSCoder): this;
}

declare class NEProxySettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEProxySettings; // inherited from NSObject

	static new(): NEProxySettings; // inherited from NSObject

	HTTPEnabled: boolean;

	HTTPSEnabled: boolean;

	HTTPSServer: NEProxyServer;

	HTTPServer: NEProxyServer;

	autoProxyConfigurationEnabled: boolean;

	exceptionList: NSArray<string>;

	excludeSimpleHostnames: boolean;

	matchDomains: NSArray<string>;

	proxyAutoConfigurationJavaScript: string;

	proxyAutoConfigurationURL: NSURL;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum NETrafficDirection {

	Any = 0,

	Inbound = 1,

	Outbound = 2
}

declare class NETunnelNetworkSettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NETunnelNetworkSettings; // inherited from NSObject

	static new(): NETunnelNetworkSettings; // inherited from NSObject

	DNSSettings: NEDNSSettings;

	proxySettings: NEProxySettings;

	readonly tunnelRemoteAddress: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { tunnelRemoteAddress: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTunnelRemoteAddress(address: string): this;
}

declare class NETunnelProvider extends NEProvider {

	static alloc(): NETunnelProvider; // inherited from NSObject

	static new(): NETunnelProvider; // inherited from NSObject

	readonly appRules: NSArray<NEAppRule>;

	readonly protocolConfiguration: NEVPNProtocol;

	reasserting: boolean;

	readonly routingMethod: NETunnelProviderRoutingMethod;

	handleAppMessageCompletionHandler(messageData: NSData, completionHandler: (p1: NSData) => void): void;

	setTunnelNetworkSettingsCompletionHandler(tunnelNetworkSettings: NETunnelNetworkSettings, completionHandler: (p1: NSError) => void): void;
}

declare const enum NETunnelProviderError {

	NetworkSettingsInvalid = 1,

	NetworkSettingsCanceled = 2,

	NetworkSettingsFailed = 3
}

declare var NETunnelProviderErrorDomain: string;

declare class NETunnelProviderManager extends NEVPNManager {

	static alloc(): NETunnelProviderManager; // inherited from NSObject

	static loadAllFromPreferencesWithCompletionHandler(completionHandler: (p1: NSArray<NETunnelProviderManager>, p2: NSError) => void): void;

	static new(): NETunnelProviderManager; // inherited from NSObject

	readonly routingMethod: NETunnelProviderRoutingMethod;

	copyAppRules(): NSArray<NEAppRule>;
}

declare class NETunnelProviderProtocol extends NEVPNProtocol {

	static alloc(): NETunnelProviderProtocol; // inherited from NSObject

	static new(): NETunnelProviderProtocol; // inherited from NSObject

	providerBundleIdentifier: string;

	providerConfiguration: NSDictionary<string, any>;
}

declare const enum NETunnelProviderRoutingMethod {

	DestinationIP = 1,

	SourceApplication = 2,

	NetworkRule = 3
}

declare class NETunnelProviderSession extends NEVPNConnection {

	static alloc(): NETunnelProviderSession; // inherited from NSObject

	static new(): NETunnelProviderSession; // inherited from NSObject

	sendProviderMessageReturnErrorResponseHandler(messageData: NSData, error: interop.Pointer | interop.Reference<NSError>, responseHandler: (p1: NSData) => void): boolean;

	startTunnelWithOptionsAndReturnError(options: NSDictionary<string, any>): boolean;

	stopTunnel(): void;
}

declare var NEVPNConfigurationChangeNotification: string;

declare class NEVPNConnection extends NSObject {

	static alloc(): NEVPNConnection; // inherited from NSObject

	static new(): NEVPNConnection; // inherited from NSObject

	readonly connectedDate: Date;

	readonly manager: NEVPNManager;

	readonly status: NEVPNStatus;

	startVPNTunnelAndReturnError(): boolean;

	startVPNTunnelWithOptionsAndReturnError(options: NSDictionary<string, NSObject>): boolean;

	stopVPNTunnel(): void;
}

declare var NEVPNConnectionStartOptionPassword: string;

declare var NEVPNConnectionStartOptionUsername: string;

declare const enum NEVPNError {

	ConfigurationInvalid = 1,

	ConfigurationDisabled = 2,

	ConnectionFailed = 3,

	ConfigurationStale = 4,

	ConfigurationReadWriteFailed = 5,

	ConfigurationUnknown = 6
}

declare var NEVPNErrorDomain: string;

declare const enum NEVPNIKEAuthenticationMethod {

	None = 0,

	Certificate = 1,

	SharedSecret = 2
}

declare const enum NEVPNIKEv2CertificateType {

	RSA = 1,

	ECDSA256 = 2,

	ECDSA384 = 3,

	ECDSA521 = 4,

	Ed25519 = 5
}

declare const enum NEVPNIKEv2DeadPeerDetectionRate {

	None = 0,

	Low = 1,

	Medium = 2,

	High = 3
}

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

	Group31 = 31
}

declare const enum NEVPNIKEv2EncryptionAlgorithm {

	AlgorithmDES = 1,

	Algorithm3DES = 2,

	AlgorithmAES128 = 3,

	AlgorithmAES256 = 4,

	AlgorithmAES128GCM = 5,

	AlgorithmAES256GCM = 6,

	AlgorithmChaCha20Poly1305 = 7
}

declare const enum NEVPNIKEv2IntegrityAlgorithm {

	SHA96 = 1,

	SHA160 = 2,

	SHA256 = 3,

	SHA384 = 4,

	SHA512 = 5
}

declare class NEVPNIKEv2SecurityAssociationParameters extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEVPNIKEv2SecurityAssociationParameters; // inherited from NSObject

	static new(): NEVPNIKEv2SecurityAssociationParameters; // inherited from NSObject

	diffieHellmanGroup: NEVPNIKEv2DiffieHellmanGroup;

	encryptionAlgorithm: NEVPNIKEv2EncryptionAlgorithm;

	integrityAlgorithm: NEVPNIKEv2IntegrityAlgorithm;

	lifetimeMinutes: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum NEVPNIKEv2TLSVersion {

	VersionDefault = 0,

	Version1_0 = 1,

	Version1_1 = 2,

	Version1_2 = 3
}

declare class NEVPNManager extends NSObject {

	static alloc(): NEVPNManager; // inherited from NSObject

	static new(): NEVPNManager; // inherited from NSObject

	static sharedManager(): NEVPNManager;

	readonly connection: NEVPNConnection;

	enabled: boolean;

	localizedDescription: string;

	onDemandEnabled: boolean;

	onDemandRules: NSArray<NEOnDemandRule>;

	protocol: NEVPNProtocol;

	protocolConfiguration: NEVPNProtocol;

	loadFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	removeFromPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	saveToPreferencesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

declare class NEVPNProtocol extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NEVPNProtocol; // inherited from NSObject

	static new(): NEVPNProtocol; // inherited from NSObject

	disconnectOnSleep: boolean;

	identityData: NSData;

	identityDataPassword: string;

	identityReference: NSData;

	passwordReference: NSData;

	proxySettings: NEProxySettings;

	serverAddress: string;

	username: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NEVPNProtocolIKEv2 extends NEVPNProtocolIPSec {

	static alloc(): NEVPNProtocolIKEv2; // inherited from NSObject

	static new(): NEVPNProtocolIKEv2; // inherited from NSObject

	readonly IKESecurityAssociationParameters: NEVPNIKEv2SecurityAssociationParameters;

	certificateType: NEVPNIKEv2CertificateType;

	readonly childSecurityAssociationParameters: NEVPNIKEv2SecurityAssociationParameters;

	deadPeerDetectionRate: NEVPNIKEv2DeadPeerDetectionRate;

	disableMOBIKE: boolean;

	disableRedirect: boolean;

	enableFallback: boolean;

	enablePFS: boolean;

	enableRevocationCheck: boolean;

	maximumTLSVersion: NEVPNIKEv2TLSVersion;

	minimumTLSVersion: NEVPNIKEv2TLSVersion;

	serverCertificateCommonName: string;

	serverCertificateIssuerCommonName: string;

	strictRevocationCheck: boolean;

	useConfigurationAttributeInternalIPSubnet: boolean;
}

declare class NEVPNProtocolIPSec extends NEVPNProtocol {

	static alloc(): NEVPNProtocolIPSec; // inherited from NSObject

	static new(): NEVPNProtocolIPSec; // inherited from NSObject

	authenticationMethod: NEVPNIKEAuthenticationMethod;

	localIdentifier: string;

	remoteIdentifier: string;

	sharedSecretReference: NSData;

	useExtendedAuthentication: boolean;
}

declare const enum NEVPNStatus {

	Invalid = 0,

	Disconnected = 1,

	Connecting = 2,

	Connected = 3,

	Reasserting = 4,

	Disconnecting = 5
}

declare var NEVPNStatusDidChangeNotification: string;

declare class NWBonjourServiceEndpoint extends NWEndpoint {

	static alloc(): NWBonjourServiceEndpoint; // inherited from NSObject

	static endpointWithNameTypeDomain(name: string, type: string, domain: string): NWBonjourServiceEndpoint;

	static new(): NWBonjourServiceEndpoint; // inherited from NSObject

	readonly domain: string;

	readonly name: string;

	readonly type: string;
}

declare class NWEndpoint extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NWEndpoint; // inherited from NSObject

	static new(): NWEndpoint; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NWHostEndpoint extends NWEndpoint {

	static alloc(): NWHostEndpoint; // inherited from NSObject

	static endpointWithHostnamePort(hostname: string, port: string): NWHostEndpoint;

	static new(): NWHostEndpoint; // inherited from NSObject

	readonly hostname: string;

	readonly port: string;
}

declare class NWPath extends NSObject {

	static alloc(): NWPath; // inherited from NSObject

	static new(): NWPath; // inherited from NSObject

	readonly expensive: boolean;

	readonly status: NWPathStatus;

	isEqualToPath(path: NWPath): boolean;
}

declare const enum NWPathStatus {

	Invalid = 0,

	Satisfied = 1,

	Unsatisfied = 2,

	Satisfiable = 3
}

declare class NWTCPConnection extends NSObject {

	static alloc(): NWTCPConnection; // inherited from NSObject

	static new(): NWTCPConnection; // inherited from NSObject

	readonly connectedPath: NWPath;

	readonly endpoint: NWEndpoint;

	readonly error: NSError;

	readonly hasBetterPath: boolean;

	readonly localAddress: NWEndpoint;

	readonly remoteAddress: NWEndpoint;

	readonly state: NWTCPConnectionState;

	readonly txtRecord: NSData;

	readonly viable: boolean;

	constructor(o: { upgradeForConnection: NWTCPConnection; });

	cancel(): void;

	initWithUpgradeForConnection(connection: NWTCPConnection): this;

	readLengthCompletionHandler(length: number, completion: (p1: NSData, p2: NSError) => void): void;

	readMinimumLengthMaximumLengthCompletionHandler(minimum: number, maximum: number, completion: (p1: NSData, p2: NSError) => void): void;

	writeClose(): void;

	writeCompletionHandler(data: NSData, completion: (p1: NSError) => void): void;
}

interface NWTCPConnectionAuthenticationDelegate extends NSObjectProtocol {

	evaluateTrustForConnectionPeerCertificateChainCompletionHandler?(connection: NWTCPConnection, peerCertificateChain: NSArray<any> | any[], completion: (p1: any) => void): void;

	provideIdentityForConnectionCompletionHandler?(connection: NWTCPConnection, completion: (p1: any, p2: NSArray<any>) => void): void;

	shouldEvaluateTrustForConnection?(connection: NWTCPConnection): boolean;

	shouldProvideIdentityForConnection?(connection: NWTCPConnection): boolean;
}
declare var NWTCPConnectionAuthenticationDelegate: {

	prototype: NWTCPConnectionAuthenticationDelegate;
};

declare const enum NWTCPConnectionState {

	Invalid = 0,

	Connecting = 1,

	Waiting = 2,

	Connected = 3,

	Disconnected = 4,

	Cancelled = 5
}

declare class NWTLSParameters extends NSObject {

	static alloc(): NWTLSParameters; // inherited from NSObject

	static new(): NWTLSParameters; // inherited from NSObject

	SSLCipherSuites: NSSet<number>;

	TLSSessionID: NSData;

	maximumSSLProtocolVersion: number;

	minimumSSLProtocolVersion: number;
}

declare class NWUDPSession extends NSObject {

	static alloc(): NWUDPSession; // inherited from NSObject

	static new(): NWUDPSession; // inherited from NSObject

	readonly currentPath: NWPath;

	readonly endpoint: NWEndpoint;

	readonly hasBetterPath: boolean;

	readonly maximumDatagramLength: number;

	readonly resolvedEndpoint: NWEndpoint;

	readonly state: NWUDPSessionState;

	readonly viable: boolean;

	constructor(o: { upgradeForSession: NWUDPSession; });

	cancel(): void;

	initWithUpgradeForSession(session: NWUDPSession): this;

	setReadHandlerMaxDatagrams(handler: (p1: NSArray<NSData>, p2: NSError) => void, maxDatagrams: number): void;

	tryNextResolvedEndpoint(): void;

	writeDatagramCompletionHandler(datagram: NSData, completionHandler: (p1: NSError) => void): void;

	writeMultipleDatagramsCompletionHandler(datagramArray: NSArray<NSData> | NSData[], completionHandler: (p1: NSError) => void): void;
}

declare const enum NWUDPSessionState {

	Invalid = 0,

	Waiting = 1,

	Preparing = 2,

	Ready = 3,

	Failed = 4,

	Cancelled = 5
}

declare var kNEHotspotHelperOptionDisplayName: string;
