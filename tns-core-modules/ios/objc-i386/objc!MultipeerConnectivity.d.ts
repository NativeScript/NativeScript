
declare class MCAdvertiserAssistant extends NSObject {

	static alloc(): MCAdvertiserAssistant; // inherited from NSObject

	static new(): MCAdvertiserAssistant; // inherited from NSObject

	delegate: MCAdvertiserAssistantDelegate;

	/* readonly */ discoveryInfo: NSDictionary<string, string>;

	/* readonly */ serviceType: string;

	/* readonly */ session: MCSession;

	constructor(); // inherited from NSObject

	constructor(o: { serviceType: string; discoveryInfo: NSDictionary<string, string>; session: MCSession; });

	self(): MCAdvertiserAssistant; // inherited from NSObjectProtocol

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

	/* readonly */ browser: MCNearbyServiceBrowser;

	delegate: MCBrowserViewControllerDelegate;

	maximumNumberOfPeers: number;

	minimumNumberOfPeers: number;

	/* readonly */ session: MCSession;

	constructor(o: { browser: MCNearbyServiceBrowser; session: MCSession; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	constructor(o: { serviceType: string; session: MCSession; });

	browserDidNotStartBrowsingForPeers(browser: MCNearbyServiceBrowser, error: NSError): void; // inherited from MCNearbyServiceBrowserDelegate

	browserFoundPeerWithDiscoveryInfo(browser: MCNearbyServiceBrowser, peerID: MCPeerID, info: NSDictionary<string, string>): void; // inherited from MCNearbyServiceBrowserDelegate

	browserLostPeer(browser: MCNearbyServiceBrowser, peerID: MCPeerID): void; // inherited from MCNearbyServiceBrowserDelegate

	self(): MCBrowserViewController; // inherited from NSObjectProtocol
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

	/* readonly */ discoveryInfo: NSDictionary<string, string>;

	/* readonly */ myPeerID: MCPeerID;

	/* readonly */ serviceType: string;

	constructor(); // inherited from NSObject

	constructor(o: { peer: MCPeerID; discoveryInfo: NSDictionary<string, string>; serviceType: string; });

	self(): MCNearbyServiceAdvertiser; // inherited from NSObjectProtocol

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

	/* readonly */ myPeerID: MCPeerID;

	/* readonly */ serviceType: string;

	constructor(); // inherited from NSObject

	constructor(o: { peer: MCPeerID; serviceType: string; });

	invitePeerToSessionWithContextTimeout(peerID: MCPeerID, session: MCSession, context: NSData, timeout: number): void;

	self(): MCNearbyServiceBrowser; // inherited from NSObjectProtocol

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

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ displayName: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { displayName: string; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): MCPeerID; // inherited from NSObjectProtocol
}

declare class MCSession extends NSObject {

	static alloc(): MCSession; // inherited from NSObject

	static new(): MCSession; // inherited from NSObject

	/* readonly */ connectedPeers: NSArray<MCPeerID>;

	delegate: MCSessionDelegate;

	/* readonly */ encryptionPreference: MCEncryptionPreference;

	/* readonly */ myPeerID: MCPeerID;

	/* readonly */ securityIdentity: NSArray<any>;

	constructor(); // inherited from NSObject

	constructor(o: { peer: MCPeerID; });

	constructor(o: { peer: MCPeerID; securityIdentity: NSArray<any>; encryptionPreference: MCEncryptionPreference; });

	cancelConnectPeer(peerID: MCPeerID): void;

	connectPeerWithNearbyConnectionData(peerID: MCPeerID, data: NSData): void;

	disconnect(): void;

	nearbyConnectionDataForPeerWithCompletionHandler(peerID: MCPeerID, completionHandler: (p1: NSData, p2: NSError) => void): void;

	self(): MCSession; // inherited from NSObjectProtocol

	sendDataToPeersWithModeError(data: NSData, peerIDs: NSArray<MCPeerID>, mode: MCSessionSendDataMode): boolean;

	sendResourceAtURLWithNameToPeerWithCompletionHandler(resourceURL: NSURL, resourceName: string, peerID: MCPeerID, completionHandler: (p1: NSError) => void): NSProgress;

	startStreamWithNameToPeerError(streamName: string, peerID: MCPeerID): NSOutputStream;
}

interface MCSessionDelegate extends NSObjectProtocol {

	sessionDidFinishReceivingResourceWithNameFromPeerAtURLWithError(session: MCSession, resourceName: string, peerID: MCPeerID, localURL: NSURL, error: NSError): void;

	sessionDidReceiveCertificateFromPeerCertificateHandler?(session: MCSession, certificate: NSArray<any>, peerID: MCPeerID, certificateHandler: (p1: boolean) => void): void;

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
