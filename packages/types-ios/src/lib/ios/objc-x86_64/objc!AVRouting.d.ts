
declare class AVCustomDeviceRoute extends NSObject {

	static alloc(): AVCustomDeviceRoute; // inherited from NSObject

	static new(): AVCustomDeviceRoute; // inherited from NSObject

	readonly bluetoothIdentifier: NSUUID;

	readonly networkEndpoint: NSObject;
}

declare class AVCustomRoutingActionItem extends NSObject {

	static alloc(): AVCustomRoutingActionItem; // inherited from NSObject

	static new(): AVCustomRoutingActionItem; // inherited from NSObject

	overrideTitle: string;

	type: UTType;
}

declare class AVCustomRoutingController extends NSObject {

	static alloc(): AVCustomRoutingController; // inherited from NSObject

	static new(): AVCustomRoutingController; // inherited from NSObject

	readonly authorizedRoutes: NSArray<AVCustomDeviceRoute>;

	customActionItems: NSArray<AVCustomRoutingActionItem>;

	delegate: AVCustomRoutingControllerDelegate;

	knownRouteIPs: NSArray<AVCustomRoutingPartialIP>;

	invalidateAuthorizationForRoute(route: AVCustomDeviceRoute): void;

	isRouteActive(route: AVCustomDeviceRoute): boolean;

	setActiveForRoute(active: boolean, route: AVCustomDeviceRoute): void;
}

declare var AVCustomRoutingControllerAuthorizedRoutesDidChangeNotification: string;

interface AVCustomRoutingControllerDelegate extends NSObjectProtocol {

	customRoutingControllerDidSelectItem?(controller: AVCustomRoutingController, customActionItem: AVCustomRoutingActionItem): void;

	customRoutingControllerEventDidTimeOut?(controller: AVCustomRoutingController, event: AVCustomRoutingEvent): void;

	customRoutingControllerHandleEventCompletionHandler(controller: AVCustomRoutingController, event: AVCustomRoutingEvent, completionHandler: (p1: boolean) => void): void;
}
declare var AVCustomRoutingControllerDelegate: {

	prototype: AVCustomRoutingControllerDelegate;
};

declare class AVCustomRoutingEvent extends NSObject {

	static alloc(): AVCustomRoutingEvent; // inherited from NSObject

	static new(): AVCustomRoutingEvent; // inherited from NSObject

	readonly reason: AVCustomRoutingEventReason;

	readonly route: AVCustomDeviceRoute;
}

declare const enum AVCustomRoutingEventReason {

	Activate = 0,

	Deactivate = 1,

	Reactivate = 2
}

declare class AVCustomRoutingPartialIP extends NSObject {

	static alloc(): AVCustomRoutingPartialIP; // inherited from NSObject

	static new(): AVCustomRoutingPartialIP; // inherited from NSObject

	readonly address: NSData;

	readonly mask: NSData;

	constructor(o: { address: NSData; mask: NSData; });

	initWithAddressMask(address: NSData, mask: NSData): this;
}
