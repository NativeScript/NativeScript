
declare class EAAccessory extends NSObject {

	static alloc(): EAAccessory; // inherited from NSObject

	static new(): EAAccessory; // inherited from NSObject

	/* readonly */ connected: boolean;

	/* readonly */ connectionID: number;

	delegate: EAAccessoryDelegate;

	/* readonly */ dockType: string;

	/* readonly */ firmwareRevision: string;

	/* readonly */ hardwareRevision: string;

	/* readonly */ manufacturer: string;

	/* readonly */ modelNumber: string;

	/* readonly */ name: string;

	/* readonly */ protocolStrings: NSArray<string>;

	/* readonly */ serialNumber: string;

	constructor(); // inherited from NSObject

	self(): EAAccessory; // inherited from NSObjectProtocol
}

interface EAAccessoryDelegate extends NSObjectProtocol {

	accessoryDidDisconnect?(accessory: EAAccessory): void;
}
declare var EAAccessoryDelegate: {

	prototype: EAAccessoryDelegate;
};

declare var EAAccessoryDidConnectNotification: string;

declare var EAAccessoryDidDisconnectNotification: string;

declare var EAAccessoryKey: string;

declare class EAAccessoryManager extends NSObject {

	static alloc(): EAAccessoryManager; // inherited from NSObject

	static new(): EAAccessoryManager; // inherited from NSObject

	static sharedAccessoryManager(): EAAccessoryManager;

	/* readonly */ connectedAccessories: NSArray<EAAccessory>;

	constructor(); // inherited from NSObject

	registerForLocalNotifications(): void;

	self(): EAAccessoryManager; // inherited from NSObjectProtocol

	showBluetoothAccessoryPickerWithNameFilterCompletion(predicate: NSPredicate, completion: (p1: NSError) => void): void;

	unregisterForLocalNotifications(): void;
}

declare var EAAccessorySelectedKey: string;

declare const enum EABluetoothAccessoryPickerErrorCode {

	AlreadyConnected = 0,

	ResultNotFound = 1,

	ResultCancelled = 2,

	ResultFailed = 3
}

declare var EABluetoothAccessoryPickerErrorDomain: string;

declare class EASession extends NSObject {

	static alloc(): EASession; // inherited from NSObject

	static new(): EASession; // inherited from NSObject

	/* readonly */ accessory: EAAccessory;

	/* readonly */ inputStream: NSInputStream;

	/* readonly */ outputStream: NSOutputStream;

	/* readonly */ protocolString: string;

	constructor(); // inherited from NSObject

	constructor(o: { accessory: EAAccessory; forProtocol: string; });

	self(): EASession; // inherited from NSObjectProtocol
}

declare class EAWiFiUnconfiguredAccessory extends NSObject {

	static alloc(): EAWiFiUnconfiguredAccessory; // inherited from NSObject

	static new(): EAWiFiUnconfiguredAccessory; // inherited from NSObject

	/* readonly */ macAddress: string;

	/* readonly */ manufacturer: string;

	/* readonly */ model: string;

	/* readonly */ name: string;

	/* readonly */ properties: EAWiFiUnconfiguredAccessoryProperties;

	/* readonly */ ssid: string;

	constructor(); // inherited from NSObject

	self(): EAWiFiUnconfiguredAccessory; // inherited from NSObjectProtocol
}

declare class EAWiFiUnconfiguredAccessoryBrowser extends NSObject {

	static alloc(): EAWiFiUnconfiguredAccessoryBrowser; // inherited from NSObject

	static new(): EAWiFiUnconfiguredAccessoryBrowser; // inherited from NSObject

	delegate: EAWiFiUnconfiguredAccessoryBrowserDelegate;

	/* readonly */ unconfiguredAccessories: NSSet<EAWiFiUnconfiguredAccessory>;

	constructor(); // inherited from NSObject

	constructor(o: { delegate: EAWiFiUnconfiguredAccessoryBrowserDelegate; queue: NSObject; });

	configureAccessoryWithConfigurationUIOnViewController(accessory: EAWiFiUnconfiguredAccessory, viewController: UIViewController): void;

	self(): EAWiFiUnconfiguredAccessoryBrowser; // inherited from NSObjectProtocol

	startSearchingForUnconfiguredAccessoriesMatchingPredicate(predicate: NSPredicate): void;

	stopSearchingForUnconfiguredAccessories(): void;
}

interface EAWiFiUnconfiguredAccessoryBrowserDelegate extends NSObjectProtocol {

	accessoryBrowserDidFindUnconfiguredAccessories(browser: EAWiFiUnconfiguredAccessoryBrowser, accessories: NSSet<EAWiFiUnconfiguredAccessory>): void;

	accessoryBrowserDidFinishConfiguringAccessoryWithStatus(browser: EAWiFiUnconfiguredAccessoryBrowser, accessory: EAWiFiUnconfiguredAccessory, status: EAWiFiUnconfiguredAccessoryConfigurationStatus): void;

	accessoryBrowserDidRemoveUnconfiguredAccessories(browser: EAWiFiUnconfiguredAccessoryBrowser, accessories: NSSet<EAWiFiUnconfiguredAccessory>): void;

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
