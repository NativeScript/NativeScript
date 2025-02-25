
/**
 * @since 18.0
 */
declare class ASAccessory extends NSObject {

	static alloc(): ASAccessory; // inherited from NSObject

	static new(): ASAccessory; // inherited from NSObject

	readonly SSID: string;

	readonly bluetoothIdentifier: NSUUID;

	readonly bluetoothTransportBridgingIdentifier: NSData;

	readonly descriptor: ASDiscoveryDescriptor;

	readonly displayName: string;

	readonly state: ASAccessoryState;
}

/**
 * @since 18.0
 */
declare class ASAccessoryEvent extends NSObject {

	static alloc(): ASAccessoryEvent; // inherited from NSObject

	static new(): ASAccessoryEvent; // inherited from NSObject

	readonly accessory: ASAccessory;

	readonly error: NSError;

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

	activateWithQueueEventHandler(queue: NSObject & OS_dispatch_queue, eventHandler: (p1: ASAccessoryEvent) => void): void;

	failAuthorizationCompletionHandler(accessory: ASAccessory, completionHandler: (p1: NSError) => void): void;

	finishAuthorizationSettingsCompletionHandler(accessory: ASAccessory, settings: ASAccessorySettings, completionHandler: (p1: NSError) => void): void;

	invalidate(): void;

	removeAccessoryCompletionHandler(accessory: ASAccessory, completionHandler: (p1: NSError) => void): void;

	renameAccessoryOptionsCompletionHandler(accessory: ASAccessory, renameOptions: ASAccessoryRenameOptions, completionHandler: (p1: NSError) => void): void;

	showPickerForDisplayItemsCompletionHandler(displayItems: NSArray<ASPickerDisplayItem> | ASPickerDisplayItem[], completionHandler: (p1: NSError) => void): void;

	showPickerWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 18.0
 */
declare class ASAccessorySettings extends NSObject {

	static alloc(): ASAccessorySettings; // inherited from NSObject

	static new(): ASAccessorySettings; // inherited from NSObject

	SSID: string;

	bluetoothTransportBridgingIdentifier: NSData;

	static readonly defaultSettings: ASAccessorySettings;
}

declare const enum ASAccessoryState {

	Unauthorized = 0,

	AwaitingAuthorization = 10,

	Authorized = 20
}

declare const enum ASAccessorySupportOptions {

	BluetoothPairingLE = 2,

	BluetoothTransportBridging = 4
}

/**
 * @since 18.0
 */
declare class ASDiscoveryDescriptor extends NSObject {

	static alloc(): ASDiscoveryDescriptor; // inherited from NSObject

	static new(): ASDiscoveryDescriptor; // inherited from NSObject

	SSID: string;

	SSIDPrefix: string;

	bluetoothCompanyIdentifier: number;

	bluetoothManufacturerDataBlob: NSData;

	bluetoothManufacturerDataMask: NSData;

	bluetoothNameSubstring: string;

	/**
	 * @since 18.2
	 */
	bluetoothNameSubstringCompareOptions: NSStringCompareOptions;

	bluetoothRange: ASDiscoveryDescriptorRange;

	bluetoothServiceDataBlob: NSData;

	bluetoothServiceDataMask: NSData;

	bluetoothServiceUUID: CBUUID;

	supportedOptions: ASAccessorySupportOptions;
}

declare const enum ASDiscoveryDescriptorRange {

	Default = 0,

	Immediate = 10
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

	hotspotSSID: string;

	peripheralIdentifier: NSUUID;
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
