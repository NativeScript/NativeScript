
/**
 * @since 16.0
 */
declare class AVCustomDeviceRoute extends NSObject {

	static alloc(): AVCustomDeviceRoute; // inherited from NSObject

	static new(): AVCustomDeviceRoute; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly bluetoothIdentifier: NSUUID;

	/**
	 * @since 16.0
	 */
	readonly networkEndpoint: NSObject & OS_nw_endpoint;
}

/**
 * @since 16.0
 */
declare class AVCustomRoutingActionItem extends NSObject {

	static alloc(): AVCustomRoutingActionItem; // inherited from NSObject

	static new(): AVCustomRoutingActionItem; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	overrideTitle: string;

	/**
	 * @since 16.0
	 */
	type: UTType;
}

/**
 * @since 16.0
 */
declare class AVCustomRoutingController extends NSObject {

	static alloc(): AVCustomRoutingController; // inherited from NSObject

	static new(): AVCustomRoutingController; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly authorizedRoutes: NSArray<AVCustomDeviceRoute>;

	/**
	 * @since 16.0
	 */
	customActionItems: NSArray<AVCustomRoutingActionItem>;

	/**
	 * @since 16.0
	 */
	delegate: AVCustomRoutingControllerDelegate;

	/**
	 * @since 16.1
	 */
	knownRouteIPs: NSArray<AVCustomRoutingPartialIP>;

	invalidateAuthorizationForRoute(route: AVCustomDeviceRoute): void;

	isRouteActive(route: AVCustomDeviceRoute): boolean;

	setActiveForRoute(active: boolean, route: AVCustomDeviceRoute): void;
}

/**
 * @since 16.0
 */
declare var AVCustomRoutingControllerAuthorizedRoutesDidChangeNotification: string;

/**
 * @since 16.0
 */
interface AVCustomRoutingControllerDelegate extends NSObjectProtocol {

	customRoutingControllerDidSelectItem?(controller: AVCustomRoutingController, customActionItem: AVCustomRoutingActionItem): void;

	customRoutingControllerEventDidTimeOut?(controller: AVCustomRoutingController, event: AVCustomRoutingEvent): void;

	customRoutingControllerHandleEventCompletionHandler(controller: AVCustomRoutingController, event: AVCustomRoutingEvent, completionHandler: (p1: boolean) => void): void;
}
declare var AVCustomRoutingControllerDelegate: {

	prototype: AVCustomRoutingControllerDelegate;
};

/**
 * @since 16.0
 */
declare class AVCustomRoutingEvent extends NSObject {

	static alloc(): AVCustomRoutingEvent; // inherited from NSObject

	static new(): AVCustomRoutingEvent; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly reason: AVCustomRoutingEventReason;

	/**
	 * @since 16.0
	 */
	readonly route: AVCustomDeviceRoute;
}

declare const enum AVCustomRoutingEventReason {

	Activate = 0,

	Deactivate = 1,

	Reactivate = 2
}

/**
 * @since 16.1
 */
declare class AVCustomRoutingPartialIP extends NSObject {

	static alloc(): AVCustomRoutingPartialIP; // inherited from NSObject

	static new(): AVCustomRoutingPartialIP; // inherited from NSObject

	/**
	 * @since 16.1
	 */
	readonly address: NSData;

	/**
	 * @since 16.1
	 */
	readonly mask: NSData;

	/**
	 * @since 16.1
	 */
	constructor(o: { address: NSData; mask: NSData; });

	/**
	 * @since 16.1
	 */
	initWithAddressMask(address: NSData, mask: NSData): this;
}
