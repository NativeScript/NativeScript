
declare class MCAdvertiserAssistant extends NSObject {

	static alloc(): MCAdvertiserAssistant; // inherited from NSObject

	static new(): MCAdvertiserAssistant; // inherited from NSObject

	delegate: MCAdvertiserAssistantDelegate;

	readonly discoveryInfo: NSDictionary<string, string>;

	readonly serviceType: string;

	readonly session: MCSession;

	constructor(o: { serviceType: string; discoveryInfo: NSDictionary<string, string>; session: MCSession; });

	initWithServiceTypeDiscoveryInfoSession(serviceType: string, info: NSDictionary<string, string>, session: MCSession): this;

	start(): void;

	stop(): void;
}

interface MCAdvertiserAssistantDelegate extends NSObjectProtocol {

	advertiserAssistantDidDismissInvitation?(advertiserAssistant: MCAdvertiserAssistant): void;

	advertiserAssistantWillPresentInvitation?(advertiserAssistant: MCAdvertiserAssistant): void;
}
declare var MCAdvertiserAssistantDelegate: {

	prototype: MCAdvertiserAssistantDelegate;
};

declare class MCBrowserViewController extends UIViewController implements MCNearbyServiceBrowserDelegate {

	static alloc(): MCBrowserViewController; // inherited from NSObject

	static new(): MCBrowserViewController; // inherited from NSObject

	readonly browser: MCNearbyServiceBrowser;

	delegate: MCBrowserViewControllerDelegate;

	maximumNumberOfPeers: number;

	minimumNumberOfPeers: number;

	readonly session: MCSession;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { browser: MCNearbyServiceBrowser; session: MCSession; });

	constructor(o: { serviceType: string; session: MCSession; });

	browserDidNotStartBrowsingForPeers(browser: MCNearbyServiceBrowser, error: NSError): void;

	browserFoundPeerWithDiscoveryInfo(browser: MCNearbyServiceBrowser, peerID: MCPeerID, info: NSDictionary<string, string>): void;

	browserLostPeer(browser: MCNearbyServiceBrowser, peerID: MCPeerID): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithBrowserSession(browser: MCNearbyServiceBrowser, session: MCSession): this;

	initWithServiceTypeSession(serviceType: string, session: MCSession): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

interface MCBrowserViewControllerDelegate extends NSObjectProtocol {

	browserViewControllerDidFinish(browserViewController: MCBrowserViewController): void;

	browserViewControllerShouldPresentNearbyPeerWithDiscoveryInfo?(browserViewController: MCBrowserViewController, peerID: MCPeerID, info: NSDictionary<string, string>): boolean;

	browserViewControllerWasCancelled(browserViewController: MCBrowserViewController): void;
}
declare var MCBrowserViewControllerDelegate: {

	prototype: MCBrowserViewControllerDelegate;
};

declare const enum MCEncryptionPreference {

	Optional = 0,

	Required = 1,

	None = 2
}

declare const enum MCErrorCode {

	Unknown = 0,

	NotConnected = 1,

	InvalidParameter = 2,

	Unsupported = 3,

	TimedOut = 4,

	Cancelled = 5,

	Unavailable = 6
}

declare var MCErrorDomain: string;

declare class MCNearbyServiceAdvertiser extends NSObject {

	static alloc(): MCNearbyServiceAdvertiser; // inherited from NSObject

	static new(): MCNearbyServiceAdvertiser; // inherited from NSObject

	delegate: MCNearbyServiceAdvertiserDelegate;

	readonly discoveryInfo: NSDictionary<string, string>;

	readonly myPeerID: MCPeerID;

	readonly serviceType: string;

	constructor(o: { peer: MCPeerID; discoveryInfo: NSDictionary<string, string>; serviceType: string; });

	initWithPeerDiscoveryInfoServiceType(myPeerID: MCPeerID, info: NSDictionary<string, string>, serviceType: string): this;

	startAdvertisingPeer(): void;

	stopAdvertisingPeer(): void;
}

interface MCNearbyServiceAdvertiserDelegate extends NSObjectProtocol {

	advertiserDidNotStartAdvertisingPeer?(advertiser: MCNearbyServiceAdvertiser, error: NSError): void;

	advertiserDidReceiveInvitationFromPeerWithContextInvitationHandler(advertiser: MCNearbyServiceAdvertiser, peerID: MCPeerID, context: NSData, invitationHandler: (p1: boolean, p2: MCSession) => void): void;
}
declare var MCNearbyServiceAdvertiserDelegate: {

	prototype: MCNearbyServiceAdvertiserDelegate;
};

declare class MCNearbyServiceBrowser extends NSObject {

	static alloc(): MCNearbyServiceBrowser; // inherited from NSObject

	static new(): MCNearbyServiceBrowser; // inherited from NSObject

	delegate: MCNearbyServiceBrowserDelegate;

	readonly myPeerID: MCPeerID;

	readonly serviceType: string;

	constructor(o: { peer: MCPeerID; serviceType: string; });

	initWithPeerServiceType(myPeerID: MCPeerID, serviceType: string): this;

	invitePeerToSessionWithContextTimeout(peerID: MCPeerID, session: MCSession, context: NSData, timeout: number): void;

	startBrowsingForPeers(): void;

	stopBrowsingForPeers(): void;
}

interface MCNearbyServiceBrowserDelegate extends NSObjectProtocol {

	browserDidNotStartBrowsingForPeers?(browser: MCNearbyServiceBrowser, error: NSError): void;

	browserFoundPeerWithDiscoveryInfo(browser: MCNearbyServiceBrowser, peerID: MCPeerID, info: NSDictionary<string, string>): void;

	browserLostPeer(browser: MCNearbyServiceBrowser, peerID: MCPeerID): void;
}
declare var MCNearbyServiceBrowserDelegate: {

	prototype: MCNearbyServiceBrowserDelegate;
};

declare class MCPeerID extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MCPeerID; // inherited from NSObject

	static new(): MCPeerID; // inherited from NSObject

	readonly displayName: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { displayName: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDisplayName(myDisplayName: string): this;
}

declare class MCSession extends NSObject {

	static alloc(): MCSession; // inherited from NSObject

	static new(): MCSession; // inherited from NSObject

	readonly connectedPeers: NSArray<MCPeerID>;

	delegate: MCSessionDelegate;

	readonly encryptionPreference: MCEncryptionPreference;

	readonly myPeerID: MCPeerID;

	readonly securityIdentity: NSArray<any>;

	constructor(o: { peer: MCPeerID; });

	constructor(o: { peer: MCPeerID; securityIdentity: NSArray<any> | any[]; encryptionPreference: MCEncryptionPreference; });

	cancelConnectPeer(peerID: MCPeerID): void;

	connectPeerWithNearbyConnectionData(peerID: MCPeerID, data: NSData): void;

	disconnect(): void;

	initWithPeer(myPeerID: MCPeerID): this;

	initWithPeerSecurityIdentityEncryptionPreference(myPeerID: MCPeerID, identity: NSArray<any> | any[], encryptionPreference: MCEncryptionPreference): this;

	nearbyConnectionDataForPeerWithCompletionHandler(peerID: MCPeerID, completionHandler: (p1: NSData, p2: NSError) => void): void;

	sendDataToPeersWithModeError(data: NSData, peerIDs: NSArray<MCPeerID> | MCPeerID[], mode: MCSessionSendDataMode): boolean;

	sendResourceAtURLWithNameToPeerWithCompletionHandler(resourceURL: NSURL, resourceName: string, peerID: MCPeerID, completionHandler: (p1: NSError) => void): NSProgress;

	startStreamWithNameToPeerError(streamName: string, peerID: MCPeerID): NSOutputStream;
}

interface MCSessionDelegate extends NSObjectProtocol {

	sessionDidFinishReceivingResourceWithNameFromPeerAtURLWithError(session: MCSession, resourceName: string, peerID: MCPeerID, localURL: NSURL, error: NSError): void;

	sessionDidReceiveCertificateFromPeerCertificateHandler?(session: MCSession, certificate: NSArray<any> | any[], peerID: MCPeerID, certificateHandler: (p1: boolean) => void): void;

	sessionDidReceiveDataFromPeer(session: MCSession, data: NSData, peerID: MCPeerID): void;

	sessionDidReceiveStreamWithNameFromPeer(session: MCSession, stream: NSInputStream, streamName: string, peerID: MCPeerID): void;

	sessionDidStartReceivingResourceWithNameFromPeerWithProgress(session: MCSession, resourceName: string, peerID: MCPeerID, progress: NSProgress): void;

	sessionPeerDidChangeState(session: MCSession, peerID: MCPeerID, state: MCSessionState): void;
}
declare var MCSessionDelegate: {

	prototype: MCSessionDelegate;
};

declare const enum MCSessionSendDataMode {

	Reliable = 0,

	Unreliable = 1
}

declare const enum MCSessionState {

	NotConnected = 0,

	Connecting = 1,

	Connected = 2
}

declare var kMCSessionMaximumNumberOfPeers: number;

declare var kMCSessionMinimumNumberOfPeers: number;
