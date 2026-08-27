
/**
 * @since 18.0
 */
declare class ASAccessory extends NSObject {

	static alloc(): ASAccessory; // inherited from NSObject

	static new(): ASAccessory; // inherited from NSObject

	readonly SSID: string | null;

	readonly bluetoothIdentifier: NSUUID | null;

	readonly bluetoothTransportBridgingIdentifier: NSData | null;

	readonly descriptor: ASDiscoveryDescriptor;

	readonly displayName: string;

	readonly state: ASAccessoryState;

	/**
	 * @since 26.0
	 */
	readonly wifiAwarePairedDeviceID: number;
}

/**
 * @since 18.0
 */
declare class ASAccessoryEvent extends NSObject {

	static alloc(): ASAccessoryEvent; // inherited from NSObject

	static new(): ASAccessoryEvent; // inherited from NSObject

	readonly accessory: ASAccessory | null;

	readonly error: NSError | null;

	readonly eventType: ASAccessoryEventType;
}

declare const enum ASAccessoryEventType {

	Unknown = 0,

	Activated = 10,

	Invalidated = 11,

	MigrationComplete = 20,

	AccessoryAdded = 30,

	AccessoryRemoved = 31,

	AccessoryChanged = 32,

	AccessoryDiscovered = 33,

	PickerDidPresent = 40,

	PickerDidDismiss = 50,

	PickerSetupBridging = 60,

	PickerSetupFailed = 70,

	PickerSetupPairing = 80,

	PickerSetupRename = 90
}

declare const enum ASAccessoryRenameOptions {

	SSID = 1
}

/**
 * @since 18.0
 */
declare class ASAccessorySession extends NSObject {

	static alloc(): ASAccessorySession; // inherited from NSObject

	static new(): ASAccessorySession; // inherited from NSObject

	readonly accessories: NSArray<ASAccessory>;

	/**
	 * @since 26.0
	 */
	pickerDisplaySettings: ASPickerDisplaySettings | null;

	activateWithQueueEventHandler(queue: NSObject & OS_dispatch_queue, eventHandler: (p1: ASAccessoryEvent) => void): void;

	failAuthorizationCompletionHandler(accessory: ASAccessory, completionHandler: (p1: NSError | null) => void): void;

	finishAuthorizationSettingsCompletionHandler(accessory: ASAccessory, settings: ASAccessorySettings, completionHandler: (p1: NSError | null) => void): void;

	/**
	 * @since 26.1
	 */
	finishPickerDiscovery(completionHandler: (p1: NSError | null) => void): void;

	invalidate(): void;

	removeAccessoryCompletionHandler(accessory: ASAccessory, completionHandler: (p1: NSError | null) => void): void;

	renameAccessoryOptionsCompletionHandler(accessory: ASAccessory, renameOptions: ASAccessoryRenameOptions, completionHandler: (p1: NSError | null) => void): void;

	showPickerForDisplayItemsCompletionHandler(displayItems: NSArray<ASPickerDisplayItem> | ASPickerDisplayItem[], completionHandler: (p1: NSError | null) => void): void;

	showPickerWithCompletionHandler(completionHandler: (p1: NSError | null) => void): void;

	/**
	 * @since 26.0
	 */
	updateAuthorizationDescriptorCompletionHandler(accessory: ASAccessory, descriptor: ASDiscoveryDescriptor, completionHandler: (p1: NSError | null) => void): void;

	/**
	 * @since 26.1
	 */
	updatePickerShowingDiscoveredDisplayItemsCompletionHandler(displayItems: NSArray<ASDiscoveredDisplayItem> | ASDiscoveredDisplayItem[], completionHandler: (p1: NSError | null) => void): void;
}

/**
 * @since 18.0
 */
declare class ASAccessorySettings extends NSObject {

	static alloc(): ASAccessorySettings; // inherited from NSObject

	static new(): ASAccessorySettings; // inherited from NSObject

	SSID: string | null;

	bluetoothTransportBridgingIdentifier: NSData | null;

	static readonly defaultSettings: ASAccessorySettings;
}

declare const enum ASAccessoryState {

	Unauthorized = 0,

	AwaitingAuthorization = 10,

	Authorized = 20
}

declare const enum ASAccessorySupportOptions {

	BluetoothPairingLE = 2,

	BluetoothTransportBridging = 4,

	BluetoothHID = 8
}

/**
 * @since 26.1
 */
declare class ASDiscoveredAccessory extends ASAccessory {

	static alloc(): ASDiscoveredAccessory; // inherited from NSObject

	static new(): ASDiscoveredAccessory; // inherited from NSObject

	readonly bluetoothAdvertisementData: NSDictionary<any, any> | null;

	readonly bluetoothRSSI: number | null;
}

/**
 * @since 26.1
 */
declare class ASDiscoveredDisplayItem extends ASPickerDisplayItem {

	static alloc(): ASDiscoveredDisplayItem; // inherited from NSObject

	static new(): ASDiscoveredDisplayItem; // inherited from NSObject

	constructor(o: { name: string; productImage: UIImage; accessory: ASDiscoveredAccessory; });

	initWithNameProductImageAccessory(name: string, productImage: UIImage, accessory: ASDiscoveredAccessory): this;
}

/**
 * @since 18.0
 */
declare class ASDiscoveryDescriptor extends NSObject {

	static alloc(): ASDiscoveryDescriptor; // inherited from NSObject

	static new(): ASDiscoveryDescriptor; // inherited from NSObject

	SSID: string | null;

	SSIDPrefix: string | null;

	bluetoothCompanyIdentifier: number;

	bluetoothManufacturerDataBlob: NSData | null;

	bluetoothManufacturerDataMask: NSData | null;

	bluetoothNameSubstring: string | null;

	/**
	 * @since 18.2
	 */
	bluetoothNameSubstringCompareOptions: NSStringCompareOptions;

	bluetoothRange: ASDiscoveryDescriptorRange;

	bluetoothServiceDataBlob: NSData | null;

	bluetoothServiceDataMask: NSData | null;

	bluetoothServiceUUID: CBUUID | null;

	supportedOptions: ASAccessorySupportOptions;

	/**
	 * @since 26.0
	 */
	wifiAwareModelNameMatch: ASPropertyCompareString | null;

	/**
	 * @since 26.0
	 */
	wifiAwareServiceName: string | null;

	/**
	 * @since 26.0
	 */
	wifiAwareServiceRole: ASDiscoveryDescriptorWiFiAwareServiceRole;

	/**
	 * @since 26.0
	 */
	wifiAwareVendorNameMatch: ASPropertyCompareString | null;
}

declare const enum ASDiscoveryDescriptorRange {

	Default = 0,

	Immediate = 10
}

declare const enum ASDiscoveryDescriptorWiFiAwareServiceRole {

	Subscriber = 10,

	Publisher = 20
}

/**
 * @since 18.0
 */
declare const enum ASErrorCode {

	Success = 0,

	Unknown = 1,

	ActivationFailed = 100,

	ConnectionFailed = 150,

	DiscoveryTimeout = 200,

	ExtensionNotFound = 300,

	Invalidated = 400,

	InvalidRequest = 450,

	PickerAlreadyActive = 500,

	PickerRestricted = 550,

	UserCancelled = 700,

	UserRestricted = 750
}

declare var ASErrorDomain: string;

/**
 * @since 18.0
 */
declare class ASMigrationDisplayItem extends ASPickerDisplayItem {

	static alloc(): ASMigrationDisplayItem; // inherited from NSObject

	static new(): ASMigrationDisplayItem; // inherited from NSObject

	hotspotSSID: string | null;

	peripheralIdentifier: NSUUID | null;

	/**
	 * @since 26.1
	 */
	wifiAwarePairedDeviceID: number;
}

/**
 * @since 18.0
 */
declare class ASPickerDisplayItem extends NSObject {

	static alloc(): ASPickerDisplayItem; // inherited from NSObject

	static new(): ASPickerDisplayItem; // inherited from NSObject

	readonly descriptor: ASDiscoveryDescriptor;

	readonly name: string;

	readonly productImage: UIImage;

	renameOptions: ASAccessoryRenameOptions;

	setupOptions: ASPickerDisplayItemSetupOptions;

	constructor(o: { name: string; productImage: UIImage; descriptor: ASDiscoveryDescriptor; });

	initWithNameProductImageDescriptor(name: string, productImage: UIImage, descriptor: ASDiscoveryDescriptor): this;
}

declare const enum ASPickerDisplayItemSetupOptions {

	Rename = 1,

	ConfirmAuthorization = 2,

	FinishInApp = 4
}

/**
 * @since 26.0
 */
declare class ASPickerDisplaySettings extends NSObject {

	static alloc(): ASPickerDisplaySettings; // inherited from NSObject

	static new(): ASPickerDisplaySettings; // inherited from NSObject

	discoveryTimeout: number;

	/**
	 * @since 26.1
	 */
	options: ASPickerDisplaySettingsOptions;

	static readonly defaultSettings: ASPickerDisplaySettings;
}

/**
 * @since 26.0
 */
declare var ASPickerDisplaySettingsDiscoveryTimeoutLong: number;

/**
 * @since 26.0
 */
declare var ASPickerDisplaySettingsDiscoveryTimeoutMedium: number;

/**
 * @since 26.0
 */
declare var ASPickerDisplaySettingsDiscoveryTimeoutShort: number;

/**
 * @since 26.1
 */
declare var ASPickerDisplaySettingsDiscoveryTimeoutUnbounded: number;

declare const enum ASPickerDisplaySettingsOptions {

	FilterDiscoveryResults = 1
}

/**
 * @since 26.0
 */
declare class ASPropertyCompareString extends NSObject {

	static alloc(): ASPropertyCompareString; // inherited from NSObject

	static new(): ASPropertyCompareString; // inherited from NSObject

	readonly compareOptions: NSStringCompareOptions;

	readonly string: string;

	constructor(o: { string: string; compareOptions: NSStringCompareOptions; });

	initWithStringCompareOptions(string: string, compareOptions: NSStringCompareOptions): this;
}
