
/**
 * @since 3.0
 */
declare class EAAccessory extends NSObject {

	static alloc(): EAAccessory; // inherited from NSObject

	static new(): EAAccessory; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	readonly connected: boolean;

	/**
	 * @since 3.0
	 */
	readonly connectionID: number;

	/**
	 * @since 3.0
	 */
	delegate: EAAccessoryDelegate;

	/**
	 * @since 9.3
	 * @deprecated 13.0
	 */
	readonly dockType: string;

	/**
	 * @since 3.0
	 */
	readonly firmwareRevision: string;

	/**
	 * @since 3.0
	 */
	readonly hardwareRevision: string;

	/**
	 * @since 3.0
	 */
	readonly manufacturer: string;

	/**
	 * @since 3.0
	 */
	readonly modelNumber: string;

	/**
	 * @since 3.0
	 */
	readonly name: string;

	/**
	 * @since 3.0
	 */
	readonly protocolStrings: NSArray<string>;

	/**
	 * @since 3.0
	 */
	readonly serialNumber: string;
}

interface EAAccessoryDelegate extends NSObjectProtocol {

	/**
	 * @since 3.0
	 */
	accessoryDidDisconnect?(accessory: EAAccessory): void;
}
declare var EAAccessoryDelegate: {

	prototype: EAAccessoryDelegate;
};

/**
 * @since 3.0
 */
declare var EAAccessoryDidConnectNotification: string;

/**
 * @since 3.0
 */
declare var EAAccessoryDidDisconnectNotification: string;

/**
 * @since 3.0
 */
declare var EAAccessoryKey: string;

/**
 * @since 3.0
 */
declare class EAAccessoryManager extends NSObject {

	static alloc(): EAAccessoryManager; // inherited from NSObject

	static new(): EAAccessoryManager; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	static sharedAccessoryManager(): EAAccessoryManager;

	/**
	 * @since 3.0
	 */
	readonly connectedAccessories: NSArray<EAAccessory>;

	/**
	 * @since 3.0
	 */
	registerForLocalNotifications(): void;

	/**
	 * @since 6
	 */
	showBluetoothAccessoryPickerWithNameFilterCompletion(predicate: NSPredicate, completion: (p1: NSError) => void): void;

	/**
	 * @since 3.0
	 */
	unregisterForLocalNotifications(): void;
}

/**
 * @since 6.0
 */
declare var EAAccessorySelectedKey: string;

declare const enum EABluetoothAccessoryPickerErrorCode {

	AlreadyConnected = 0,

	ResultNotFound = 1,

	ResultCancelled = 2,

	ResultFailed = 3
}

declare var EABluetoothAccessoryPickerErrorDomain: string;

declare const EAConnectionIDNone: number;

/**
 * @since 3.0
 */
declare class EASession extends NSObject {

	static alloc(): EASession; // inherited from NSObject

	static new(): EASession; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	readonly accessory: EAAccessory;

	/**
	 * @since 3.0
	 */
	readonly inputStream: NSInputStream;

	/**
	 * @since 3.0
	 */
	readonly outputStream: NSOutputStream;

	/**
	 * @since 3.0
	 */
	readonly protocolString: string;

	/**
	 * @since 3.0
	 */
	constructor(o: { accessory: EAAccessory; forProtocol: string; });

	/**
	 * @since 3.0
	 */
	initWithAccessoryForProtocol(accessory: EAAccessory, protocolString: string): this;
}

/**
 * @since 8.0
 */
declare class EAWiFiUnconfiguredAccessory extends NSObject {

	static alloc(): EAWiFiUnconfiguredAccessory; // inherited from NSObject

	static new(): EAWiFiUnconfiguredAccessory; // inherited from NSObject

	readonly macAddress: string;

	readonly manufacturer: string;

	readonly model: string;

	readonly name: string;

	readonly properties: EAWiFiUnconfiguredAccessoryProperties;

	readonly ssid: string;
}

/**
 * @since 8.0
 */
declare class EAWiFiUnconfiguredAccessoryBrowser extends NSObject {

	static alloc(): EAWiFiUnconfiguredAccessoryBrowser; // inherited from NSObject

	static new(): EAWiFiUnconfiguredAccessoryBrowser; // inherited from NSObject

	delegate: EAWiFiUnconfiguredAccessoryBrowserDelegate;

	readonly unconfiguredAccessories: NSSet<EAWiFiUnconfiguredAccessory>;

	/**
	 * @since 8.0
	 */
	constructor(o: { delegate: EAWiFiUnconfiguredAccessoryBrowserDelegate; queue: NSObject & OS_dispatch_queue; });

	/**
	 * @since 8.0
	 */
	configureAccessoryWithConfigurationUIOnViewController(accessory: EAWiFiUnconfiguredAccessory, viewController: UIViewController): void;

	/**
	 * @since 8.0
	 */
	initWithDelegateQueue(delegate: EAWiFiUnconfiguredAccessoryBrowserDelegate, queue: NSObject & OS_dispatch_queue): this;

	/**
	 * @since 8.0
	 */
	startSearchingForUnconfiguredAccessoriesMatchingPredicate(predicate: NSPredicate): void;

	/**
	 * @since 8.0
	 */
	stopSearchingForUnconfiguredAccessories(): void;
}

interface EAWiFiUnconfiguredAccessoryBrowserDelegate extends NSObjectProtocol {

	/**
	 * @since 8.0
	 */
	accessoryBrowserDidFindUnconfiguredAccessories(browser: EAWiFiUnconfiguredAccessoryBrowser, accessories: NSSet<EAWiFiUnconfiguredAccessory>): void;

	/**
	 * @since 8.0
	 */
	accessoryBrowserDidFinishConfiguringAccessoryWithStatus(browser: EAWiFiUnconfiguredAccessoryBrowser, accessory: EAWiFiUnconfiguredAccessory, status: EAWiFiUnconfiguredAccessoryConfigurationStatus): void;

	/**
	 * @since 8.0
	 */
	accessoryBrowserDidRemoveUnconfiguredAccessories(browser: EAWiFiUnconfiguredAccessoryBrowser, accessories: NSSet<EAWiFiUnconfiguredAccessory>): void;

	/**
	 * @since 8.0
	 */
	accessoryBrowserDidUpdateState(browser: EAWiFiUnconfiguredAccessoryBrowser, state: EAWiFiUnconfiguredAccessoryBrowserState): void;
}
declare var EAWiFiUnconfiguredAccessoryBrowserDelegate: {

	prototype: EAWiFiUnconfiguredAccessoryBrowserDelegate;
};

declare const enum EAWiFiUnconfiguredAccessoryBrowserState {

	WiFiUnavailable = 0,

	Stopped = 1,

	Searching = 2,

	Configuring = 3
}

declare const enum EAWiFiUnconfiguredAccessoryConfigurationStatus {

	Success = 0,

	UserCancelledConfiguration = 1,

	Failed = 2
}

declare const enum EAWiFiUnconfiguredAccessoryProperties {

	PropertySupportsAirPlay = 1,

	PropertySupportsAirPrint = 2,

	PropertySupportsHomeKit = 4
}
