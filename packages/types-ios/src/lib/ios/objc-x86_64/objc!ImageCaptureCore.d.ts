
/**
 * @since 14.0
 */
declare var ICAuthorizationStatusAuthorized: string;

/**
 * @since 14.0
 */
declare var ICAuthorizationStatusDenied: string;

/**
 * @since 14.0
 */
declare var ICAuthorizationStatusNotDetermined: string;

/**
 * @since 14.0
 */
declare var ICAuthorizationStatusRestricted: string;

/**
 * @since 13.0
 */
declare class ICCameraDevice extends ICDevice {

	static alloc(): ICCameraDevice; // inherited from NSObject

	static new(): ICCameraDevice; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly accessRestrictedAppleDevice: boolean;

	readonly batteryLevel: number;

	readonly batteryLevelAvailable: boolean;

	/**
	 * @since 13.0
	 */
	readonly contentCatalogPercentCompleted: number;

	/**
	 * @since 13.0
	 */
	readonly contents: NSArray<ICCameraItem>;

	/**
	 * @since 13.0
	 */
	readonly ejectable: boolean;

	/**
	 * @since 13.0
	 */
	readonly iCloudPhotosEnabled: boolean;

	/**
	 * @since 13.0
	 */
	readonly locked: boolean;

	/**
	 * @since 13.0
	 */
	readonly mediaFiles: NSArray<ICCameraItem>;

	/**
	 * @since 14.0
	 */
	mediaPresentation: ICMediaPresentation;

	/**
	 * @since 13.0
	 */
	ptpEventHandler: (p1: NSData) => void;

	readonly tetheredCaptureEnabled: boolean;

	readonly timeOffset: number;

	/**
	 * @since 13.0
	 */
	filesOfType(fileUTType: string): NSArray<string>;

	/**
	 * @since 13.0
	 */
	requestDeleteFiles(files: NSArray<ICCameraItem> | ICCameraItem[]): void;

	/**
	 * @since 13.0
	 */
	requestDeleteFilesDeleteFailedCompletion(files: NSArray<ICCameraItem> | ICCameraItem[], deleteFailed: (p1: NSDictionary<string, ICCameraItem>) => void, completion: (p1: NSDictionary<string, NSArray<ICCameraItem>>, p2: NSError) => void): NSProgress;

	/**
	 * @since 13.0
	 */
	requestDownloadFileOptionsDownloadDelegateDidDownloadSelectorContextInfo(file: ICCameraFile, options: NSDictionary<string, any>, downloadDelegate: ICCameraDeviceDownloadDelegate, selector: string, contextInfo: interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 15.2
	 */
	requestReadDataFromFileAtOffsetLengthReadDelegateDidReadDataSelectorContextInfo(file: ICCameraFile, offset: number, length: number, readDelegate: any, selector: string, contextInfo: interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 13.0
	 */
	requestSendPTPCommandOutDataCompletion(ptpCommand: NSData, ptpData: NSData, completion: (p1: NSData, p2: NSData, p3: NSError) => void): void;

	/**
	 * @since 15.2
	 */
	requestSendPTPCommandOutDataSendCommandDelegateDidSendCommandSelectorContextInfo(command: NSData, data: NSData, sendCommandDelegate: any, selector: string, contextInfo: interop.Pointer | interop.Reference<any>): void;
}

/**
 * @since 13.0
 */
declare var ICCameraDeviceCanAcceptPTPCommands: string;

/**
 * @since 13.0
 */
declare var ICCameraDeviceCanDeleteAllFiles: string;

/**
 * @since 13.0
 */
declare var ICCameraDeviceCanDeleteOneFile: string;

/**
 * @since 13.0
 */
declare var ICCameraDeviceCanReceiveFile: string;

/**
 * @since 13.0
 */
declare var ICCameraDeviceCanSyncClock: string;

/**
 * @since 13.0
 */
declare var ICCameraDeviceCanTakePicture: string;

/**
 * @since 13.0
 */
declare var ICCameraDeviceCanTakePictureUsingShutterReleaseOnCamera: string;

interface ICCameraDeviceDelegate extends ICDeviceDelegate {

	cameraDeviceDidAddItem?(camera: ICCameraDevice, item: ICCameraItem): void;

	/**
	 * @since 13.0
	 */
	cameraDeviceDidAddItems(camera: ICCameraDevice, items: NSArray<ICCameraItem> | ICCameraItem[]): void;

	/**
	 * @since 13.0
	 */
	cameraDeviceDidChangeCapability(camera: ICCameraDevice): void;

	/**
	 * @since 13.0
	 */
	cameraDeviceDidCompleteDeleteFilesWithError?(camera: ICCameraDevice, error: NSError): void;

	cameraDeviceDidEnableAccessRestriction(device: ICDevice): void;

	cameraDeviceDidReceiveMetadataForItem?(camera: ICCameraDevice, item: ICCameraItem): void;

	/**
	 * @since 13.0
	 */
	cameraDeviceDidReceiveMetadataForItemError(camera: ICCameraDevice, metadata: NSDictionary<any, any>, item: ICCameraItem, error: NSError): void;

	/**
	 * @since 13.0
	 */
	cameraDeviceDidReceivePTPEvent(camera: ICCameraDevice, eventData: NSData): void;

	cameraDeviceDidReceiveThumbnailForItem?(camera: ICCameraDevice, item: ICCameraItem): void;

	/**
	 * @since 13.0
	 */
	cameraDeviceDidReceiveThumbnailForItemError(camera: ICCameraDevice, thumbnail: any, item: ICCameraItem, error: NSError): void;

	cameraDeviceDidRemoveAccessRestriction(device: ICDevice): void;

	cameraDeviceDidRemoveItem?(camera: ICCameraDevice, item: ICCameraItem): void;

	/**
	 * @since 13.0
	 */
	cameraDeviceDidRemoveItems(camera: ICCameraDevice, items: NSArray<ICCameraItem> | ICCameraItem[]): void;

	/**
	 * @since 13.0
	 */
	cameraDeviceDidRenameItems(camera: ICCameraDevice, items: NSArray<ICCameraItem> | ICCameraItem[]): void;

	/**
	 * @since 13.0
	 */
	cameraDeviceShouldGetMetadataOfItem?(cameraDevice: ICCameraDevice, item: ICCameraItem): boolean;

	/**
	 * @since 13.0
	 */
	cameraDeviceShouldGetThumbnailOfItem?(cameraDevice: ICCameraDevice, item: ICCameraItem): boolean;

	/**
	 * @since 13.0
	 */
	deviceDidBecomeReadyWithCompleteContentCatalog(device: ICCameraDevice): void;
}
declare var ICCameraDeviceDelegate: {

	prototype: ICCameraDeviceDelegate;
};

interface ICCameraDeviceDownloadDelegate extends NSObjectProtocol {

	didDownloadFileErrorOptionsContextInfo?(file: ICCameraFile, error: NSError, options: NSDictionary<string, any>, contextInfo: interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 13.0
	 */
	didReceiveDownloadProgressForFileDownloadedBytesMaxBytes?(file: ICCameraFile, downloadedBytes: number, maxBytes: number): void;
}
declare var ICCameraDeviceDownloadDelegate: {

	prototype: ICCameraDeviceDownloadDelegate;
};

/**
 * @since 14.0
 */
declare var ICCameraDeviceSupportsHEIF: string;

/**
 * @since 13.0
 */
declare class ICCameraFile extends ICCameraItem {

	static alloc(): ICCameraFile; // inherited from NSObject

	static fingerprintForFileAtURL(url: NSURL): string;

	static new(): ICCameraFile; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly burstFavorite: boolean;

	/**
	 * @since 13.0
	 */
	readonly burstPicked: boolean;

	/**
	 * @since 13.0
	 */
	readonly burstUUID: string;

	/**
	 * @since 13.0
	 */
	readonly createdFilename: string;

	/**
	 * @since 13.0
	 */
	readonly duration: number;

	/**
	 * @since 13.0
	 */
	readonly exifCreationDate: Date;

	/**
	 * @since 13.0
	 */
	readonly exifModificationDate: Date;

	/**
	 * @since 13.0
	 */
	readonly fileCreationDate: Date;

	/**
	 * @since 13.0
	 */
	readonly fileModificationDate: Date;

	/**
	 * @since 13.0
	 */
	readonly fileSize: number;

	readonly fingerprint: string;

	/**
	 * @since 13.0
	 */
	readonly firstPicked: boolean;

	/**
	 * @since 13.0
	 */
	readonly gpsString: string;

	/**
	 * @since 13.0
	 */
	readonly groupUUID: string;

	/**
	 * @since 13.0
	 */
	readonly height: number;

	/**
	 * @since 13.0
	 */
	readonly highFramerate: boolean;

	/**
	 * @since 13.0
	 */
	orientation: ICEXIFOrientationType;

	/**
	 * @since 13.0
	 */
	readonly originalFilename: string;

	/**
	 * @since 13.0
	 */
	readonly originatingAssetID: string;

	/**
	 * @since 13.0
	 */
	readonly pairedRawImage: ICCameraFile;

	/**
	 * @since 13.0
	 */
	readonly relatedUUID: string;

	/**
	 * @since 13.0
	 */
	readonly sidecarFiles: NSArray<ICCameraItem>;

	/**
	 * @since 13.0
	 */
	readonly timeLapse: boolean;

	/**
	 * @since 13.0
	 */
	readonly width: number;

	/**
	 * @since 13.0
	 */
	requestDownloadWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: string, p2: NSError) => void): NSProgress;

	/**
	 * @since 18.0
	 */
	requestFingerprintWithCompletion(completion: (p1: string, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestMetadataDictionaryWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: NSDictionary<any, any>, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestReadDataAtOffsetLengthCompletion(offset: number, length: number, completion: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 17.0
	 */
	requestSecurityScopedURLWithCompletion(completion: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestThumbnailDataWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: NSData, p2: NSError) => void): void;
}

/**
 * @since 13.0
 */
declare class ICCameraFolder extends ICCameraItem {

	static alloc(): ICCameraFolder; // inherited from NSObject

	static new(): ICCameraFolder; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly contents: NSArray<ICCameraItem>;
}

/**
 * @since 13.0
 */
declare class ICCameraItem extends NSObject {

	static alloc(): ICCameraItem; // inherited from NSObject

	static new(): ICCameraItem; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly UTI: string;

	/**
	 * @since 13.0
	 */
	readonly addedAfterContentCatalogCompleted: boolean;

	/**
	 * @since 13.0
	 */
	readonly creationDate: Date;

	/**
	 * @since 13.0
	 */
	readonly device: ICCameraDevice;

	/**
	 * @since 13.0
	 */
	readonly inTemporaryStore: boolean;

	readonly largeThumbnailIfAvailable: any;

	/**
	 * @since 13.0
	 */
	readonly locked: boolean;

	/**
	 * @since 13.0
	 */
	readonly metadata: NSDictionary<any, any>;

	readonly metadataIfAvailable: NSDictionary<string, any>;

	/**
	 * @since 13.0
	 */
	readonly modificationDate: Date;

	/**
	 * @since 13.0
	 */
	readonly name: string;

	/**
	 * @since 13.0
	 */
	readonly parentFolder: ICCameraFolder;

	/**
	 * @since 13.0
	 */
	readonly ptpObjectHandle: number;

	/**
	 * @since 13.0
	 */
	readonly raw: boolean;

	/**
	 * @since 13.0
	 */
	readonly thumbnail: any;

	readonly thumbnailIfAvailable: any;

	/**
	 * @since 13.0
	 */
	readonly userData: NSMutableDictionary<any, any>;

	/**
	 * @since 13.0
	 */
	flushMetadataCache(): void;

	/**
	 * @since 13.0
	 */
	flushThumbnailCache(): void;

	/**
	 * @since 13.0
	 */
	requestMetadata(): void;

	/**
	 * @since 13.0
	 */
	requestThumbnail(): void;
}

/**
 * @since 13.0
 */
declare var ICDeleteAfterSuccessfulDownload: string;

/**
 * @since 13.0
 */
declare var ICDeleteCanceled: string;

/**
 * @since 13.0
 */
declare var ICDeleteErrorCanceled: string;

/**
 * @since 13.0
 */
declare var ICDeleteErrorDeviceMissing: string;

/**
 * @since 13.0
 */
declare var ICDeleteErrorFileMissing: string;

/**
 * @since 13.0
 */
declare var ICDeleteErrorReadOnly: string;

/**
 * @since 13.0
 */
declare var ICDeleteFailed: string;

/**
 * @since 13.0
 */
declare var ICDeleteSuccessful: string;

/**
 * @since 13.0
 */
declare class ICDevice extends NSObject {

	static alloc(): ICDevice; // inherited from NSObject

	static new(): ICDevice; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly UUIDString: string;

	/**
	 * @since 13.0
	 */
	readonly capabilities: NSArray<string>;

	/**
	 * @since 13.0
	 */
	delegate: ICDeviceDelegate;

	/**
	 * @since 13.0
	 */
	readonly hasOpenSession: boolean;

	/**
	 * @since 13.0
	 */
	readonly icon: any;

	/**
	 * @since 13.0
	 */
	readonly name: string;

	/**
	 * @since 13.0
	 */
	readonly productKind: string;

	/**
	 * @since 15.2
	 */
	readonly systemSymbolName: string;

	/**
	 * @since 13.0
	 */
	readonly transportType: string;

	/**
	 * @since 13.0
	 */
	readonly type: ICDeviceType;

	/**
	 * @since 13.0
	 */
	readonly usbLocationID: number;

	/**
	 * @since 13.0
	 */
	readonly usbProductID: number;

	/**
	 * @since 13.0
	 */
	readonly usbVendorID: number;

	/**
	 * @since 13.0
	 */
	readonly userData: NSMutableDictionary<any, any>;

	/**
	 * @since 13.0
	 */
	requestCloseSession(): void;

	/**
	 * @since 13.0
	 */
	requestCloseSessionWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestEject(): void;

	/**
	 * @since 13.0
	 */
	requestEjectWithCompletion(completion: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestOpenSession(): void;

	/**
	 * @since 13.0
	 */
	requestOpenSessionWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: NSError) => void): void;
}

/**
 * @since 13.0
 */
declare class ICDeviceBrowser extends NSObject {

	static alloc(): ICDeviceBrowser; // inherited from NSObject

	static new(): ICDeviceBrowser; // inherited from NSObject

	/**
	 * @since 15.2
	 */
	browsedDeviceTypeMask: ICDeviceTypeMask;

	readonly browsing: boolean;

	/**
	 * @since 14.0
	 */
	readonly contentsAuthorizationStatus: string;

	/**
	 * @since 14.0
	 */
	readonly controlAuthorizationStatus: string;

	delegate: ICDeviceBrowserDelegate;

	/**
	 * @since 13.0
	 */
	readonly devices: NSArray<ICDevice>;

	/**
	 * @since 14.0
	 */
	readonly suspended: boolean;

	/**
	 * @since 14.0
	 */
	requestContentsAuthorizationWithCompletion(completion: (p1: string) => void): void;

	/**
	 * @since 14.0
	 */
	requestControlAuthorizationWithCompletion(completion: (p1: string) => void): void;

	/**
	 * @since 15.0
	 */
	resetContentsAuthorizationWithCompletion(completion: (p1: string) => void): void;

	/**
	 * @since 15.0
	 */
	resetControlAuthorizationWithCompletion(completion: (p1: string) => void): void;

	/**
	 * @since 13.0
	 */
	start(): void;

	/**
	 * @since 13.0
	 */
	stop(): void;
}

interface ICDeviceBrowserDelegate extends NSObjectProtocol {

	/**
	 * @since 13.0
	 */
	deviceBrowserDeviceDidChangeName?(browser: ICDeviceBrowser, device: ICDevice): void;

	deviceBrowserDeviceDidChangeSharingState?(browser: ICDeviceBrowser, device: ICDevice): void;

	/**
	 * @since 13.0
	 */
	deviceBrowserDidAddDeviceMoreComing(browser: ICDeviceBrowser, device: ICDevice, moreComing: boolean): void;

	/**
	 * @since 14.0
	 */
	deviceBrowserDidCancelSuspendOperations?(browser: ICDeviceBrowser): void;

	/**
	 * @since 13.0
	 */
	deviceBrowserDidRemoveDeviceMoreGoing(browser: ICDeviceBrowser, device: ICDevice, moreGoing: boolean): void;

	/**
	 * @since 14.0
	 */
	deviceBrowserDidResumeOperations?(browser: ICDeviceBrowser): void;

	/**
	 * @since 14.0
	 */
	deviceBrowserDidSuspendOperations?(browser: ICDeviceBrowser): void;

	/**
	 * @since 14.0
	 */
	deviceBrowserWillSuspendOperations?(browser: ICDeviceBrowser): void;
}
declare var ICDeviceBrowserDelegate: {

	prototype: ICDeviceBrowserDelegate;
};

/**
 * @since 13.0
 */
declare var ICDeviceCanEjectOrDisconnect: string;

interface ICDeviceDelegate extends NSObjectProtocol {

	/**
	 * @since 13.0
	 */
	deviceDidBecomeReady?(device: ICDevice): void;

	/**
	 * @since 13.0
	 */
	deviceDidCloseSessionWithError(device: ICDevice, error: NSError): void;

	/**
	 * @since 13.0
	 */
	deviceDidEjectWithError?(device: ICDevice, error: NSError): void;

	/**
	 * @since 13.0
	 */
	deviceDidEncounterError?(device: ICDevice, error: NSError): void;

	/**
	 * @since 13.0
	 */
	deviceDidOpenSessionWithError(device: ICDevice, error: NSError): void;

	/**
	 * @since 13.0
	 */
	deviceDidReceiveStatusInformation?(device: ICDevice, status: NSDictionary<string, any>): void;

	/**
	 * @since 13.0
	 */
	didRemoveDevice(device: ICDevice): void;
}
declare var ICDeviceDelegate: {

	prototype: ICDeviceDelegate;
};

/**
 * @since 16.0
 */
declare var ICDeviceLocationDescriptionBluetooth: string;

/**
 * @since 16.0
 */
declare var ICDeviceLocationDescriptionFireWire: string;

/**
 * @since 16.0
 */
declare var ICDeviceLocationDescriptionMassStorage: string;

/**
 * @since 16.0
 */
declare var ICDeviceLocationDescriptionUSB: string;

/**
 * @since 16.0
 */
declare const enum ICDeviceLocationType {

	Local = 256,

	Shared = 512,

	Bonjour = 1024,

	Bluetooth = 2048
}

/**
 * @since 15.2
 */
declare const enum ICDeviceLocationTypeMask {

	Local = 256,

	Shared = 512,

	Bonjour = 1024,

	Bluetooth = 2048,

	Remote = 65024
}

/**
 * @since 13.0
 */
declare const enum ICDeviceType {

	Camera = 1,

	Scanner = 2
}

/**
 * @since 15.2
 */
declare const enum ICDeviceTypeMask {

	Camera = 1,

	Scanner = 2
}

/**
 * @since 13.0
 */
declare var ICDownloadSidecarFiles: string;

/**
 * @since 13.0
 */
declare var ICDownloadsDirectoryURL: string;

declare const enum ICEXIFOrientationType {

	Orientation1 = 1,

	Orientation2 = 2,

	Orientation3 = 3,

	Orientation4 = 4,

	Orientation5 = 5,

	Orientation6 = 6,

	Orientation7 = 7,

	Orientation8 = 8
}

/**
 * @since 13.0
 */
declare var ICEnumerationChronologicalOrder: string;

/**
 * @since 13.0
 */
declare var ICErrorDomain: string;

/**
 * @since 13.0
 */
declare var ICImageSourceShouldCache: string;

/**
 * @since 13.0
 */
declare var ICImageSourceThumbnailMaxPixelSize: string;

declare const enum ICLegacyReturnCode {

	CommunicationErr = -9900,

	DeviceNotFoundErr = -9901,

	DeviceNotOpenErr = -9902,

	FileCorruptedErr = -9903,

	IOPendingErr = -9904,

	InvalidObjectErr = -9905,

	InvalidPropertyErr = -9906,

	IndexOutOfRangeErr = -9907,

	PropertyTypeNotFoundErr = -9908,

	CannotYieldDevice = -9909,

	DataTypeNotFoundErr = -9910,

	DeviceMemoryAllocationErr = -9911,

	DeviceInternalErr = -9912,

	DeviceInvalidParamErr = -9913,

	DeviceAlreadyOpenErr = -9914,

	DeviceLocationIDNotFoundErr = -9915,

	DeviceGUIDNotFoundErr = -9916,

	DeviceIOServicePathNotFoundErr = -9917,

	DeviceUnsupportedErr = -9918,

	FrameworkInternalErr = -9919,

	ExtensionInternalErr = -9920,

	InvalidSessionErr = -9921
}

/**
 * @since 14.0
 */
declare const enum ICMediaPresentation {

	ConvertedAssets = 1,

	OriginalAssets = 2
}

/**
 * @since 13.0
 */
declare var ICOverwrite: string;

declare const enum ICReturnCode {

	Success = 0,

	InvalidParam = -9922,

	CommunicationTimedOut = -9923,

	ScanOperationCanceled = -9924,

	ScannerInUseByLocalUser = -9925,

	ScannerInUseByRemoteUser = -9926,

	DeviceFailedToOpenSession = -9927,

	DeviceFailedToCloseSession = -9928,

	ScannerFailedToSelectFunctionalUnit = -9929,

	ScannerFailedToCompleteOverviewScan = -9930,

	ScannerFailedToCompleteScan = -9931,

	ReceivedUnsolicitedScannerStatusInfo = -9932,

	ReceivedUnsolicitedScannerErrorInfo = -9933,

	DownloadFailed = -9934,

	UploadFailed = -9935,

	FailedToCompletePassThroughCommand = -9936,

	DownloadCanceled = -9937,

	FailedToEnabeTethering = -9938,

	FailedToDisabeTethering = -9939,

	FailedToCompleteSendMessageRequest = -9940,

	DeleteFilesFailed = -9941,

	DeleteFilesCanceled = -9942,

	DeviceIsPasscodeLocked = -9943,

	DeviceFailedToTakePicture = -9944,

	DeviceSoftwareNotInstalled = -9945,

	DeviceSoftwareIsBeingInstalled = -9946,

	DeviceSoftwareInstallationCompleted = -9947,

	DeviceSoftwareInstallationCanceled = -9948,

	DeviceSoftwareInstallationFailed = -9949,

	DeviceSoftwareNotAvailable = -9950,

	DeviceCouldNotPair = -9951,

	DeviceCouldNotUnpair = -9952,

	DeviceNeedsCredentials = -9953,

	DeviceIsBusyEnumerating = -9954,

	DeviceCommandGeneralFailure = -9955,

	DeviceFailedToCompleteTransfer = -9956,

	DeviceFailedToSendData = -9957,

	SessionNotOpened = -9958,

	ExFATVolumeInvalid = 21200,

	MultiErrorDictionary = -30000
}

declare const enum ICReturnCodeOffset {

	ThumbnailOffset = -21000,

	MetadataOffset = -21050,

	DownloadOffset = -21100,

	DeleteOffset = -21150,

	ExFATOffset = -21200,

	PTPOffset = -21250,

	SystemOffset = -21300,

	DeviceOffset = -21350,

	DeviceConnection = -21400,

	ObjectOffset = -21450
}

declare const enum ICReturnConnectionErrorCode {

	DriverExited = -21350,

	ClosedSessionSuddenly = -21349,

	EjectedSuddenly = -21348,

	SessionAlreadyOpen = -21347,

	EjectFailed = -21346,

	FailedToOpen = -21345,

	FailedToOpenDevice = -21344,

	NotAuthorizedToOpenDevice = -21343
}

declare const enum ICReturnDownloadErrorCode {

	PathInvalid = -21100,

	FileWritable = -21099
}

declare const enum ICReturnMetadataErrorCode {

	NotAvailable = -20150,

	AlreadyFetching = -20149,

	Canceled = -20148,

	Invalid = -20147
}

declare const enum ICReturnObjectErrorCode {

	CodeObjectDoesNotExist = -21450,

	CodeObjectDataOffsetInvalid = -21449,

	CodeObjectCouldNotBeRead = -21448,

	CodeObjectDataEmpty = -21447,

	CodeObjectDataRequestTooLarge = -21446
}

declare const enum ICReturnPTPDeviceErrorCode {

	FailedToSendCommand = -21250,

	NotAuthorizedToSendCommand = -21249
}

declare const enum ICReturnThumbnailErrorCode {

	NotAvailable = -21000,

	AlreadyFetching = -20999,

	Canceled = -20098,

	Invalid = -20097
}

/**
 * @since 13.0
 */
declare var ICSaveAsFilename: string;

/**
 * @since 13.0
 */
declare var ICSavedAncillaryFiles: string;

/**
 * @since 13.0
 */
declare var ICSavedFilename: string;

/**
 * @since 13.0
 */
declare var ICStatusNotificationKey: string;

/**
 * @since 10.0
 */
declare var ICTransportTypeExFAT: string;

/**
 * @since 13.0
 */
declare var ICTransportTypeMassStorage: string;

/**
 * @since 17.0
 */
declare var ICTransportTypeProximity: string;

/**
 * @since 13.0
 */
declare var ICTransportTypeTCPIP: string;

/**
 * @since 13.0
 */
declare var ICTransportTypeUSB: string;

/**
 * @since 14.0
 */
declare var ICTruncateAfterSuccessfulDownload: string;
