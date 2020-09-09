
declare class ICCameraDevice extends ICDevice {

	static alloc(): ICCameraDevice; // inherited from NSObject

	static new(): ICCameraDevice; // inherited from NSObject

	readonly accessRestrictedAppleDevice: boolean;

	readonly batteryLevel: number;

	readonly batteryLevelAvailable: boolean;

	readonly contentCatalogPercentCompleted: number;

	readonly contents: NSArray<ICCameraItem>;

	readonly ejectable: boolean;

	readonly iCloudPhotosEnabled: boolean;

	readonly locked: boolean;

	readonly mediaFiles: NSArray<ICCameraItem>;

	ptpEventHandler: (p1: NSData) => void;

	readonly tetheredCaptureEnabled: boolean;

	readonly timeOffset: number;

	filesOfType(fileUTType: string): NSArray<string>;

	requestDeleteFiles(files: NSArray<ICCameraItem> | ICCameraItem[]): void;

	requestDeleteFilesDeleteFailedCompletion(files: NSArray<ICCameraItem> | ICCameraItem[], deleteFailed: (p1: NSDictionary<string, ICCameraItem>) => void, completion: (p1: NSDictionary<string, NSArray<ICCameraItem>>, p2: NSError) => void): NSProgress;

	requestDownloadFileOptionsDownloadDelegateDidDownloadSelectorContextInfo(file: ICCameraFile, options: NSDictionary<string, any>, downloadDelegate: ICCameraDeviceDownloadDelegate, selector: string, contextInfo: interop.Pointer | interop.Reference<any>): void;

	requestSendPTPCommandOutDataCompletion(ptpCommand: NSData, ptpData: NSData, completion: (p1: NSData, p2: NSData, p3: NSError) => void): void;
}

declare var ICCameraDeviceCanAcceptPTPCommands: string;

declare var ICCameraDeviceCanDeleteAllFiles: string;

declare var ICCameraDeviceCanDeleteOneFile: string;

declare var ICCameraDeviceCanReceiveFile: string;

declare var ICCameraDeviceCanSyncClock: string;

declare var ICCameraDeviceCanTakePicture: string;

declare var ICCameraDeviceCanTakePictureUsingShutterReleaseOnCamera: string;

interface ICCameraDeviceDelegate extends ICDeviceDelegate {

	cameraDeviceDidAddItem?(camera: ICCameraDevice, item: ICCameraItem): void;

	cameraDeviceDidAddItems(camera: ICCameraDevice, items: NSArray<ICCameraItem> | ICCameraItem[]): void;

	cameraDeviceDidChangeCapability(camera: ICCameraDevice): void;

	cameraDeviceDidCompleteDeleteFilesWithError?(camera: ICCameraDevice, error: NSError): void;

	cameraDeviceDidEnableAccessRestriction(device: ICDevice): void;

	cameraDeviceDidReceiveMetadataForItem?(camera: ICCameraDevice, item: ICCameraItem): void;

	cameraDeviceDidReceiveMetadataForItemError(camera: ICCameraDevice, metadata: NSDictionary<any, any>, item: ICCameraItem, error: NSError): void;

	cameraDeviceDidReceivePTPEvent(camera: ICCameraDevice, eventData: NSData): void;

	cameraDeviceDidReceiveThumbnailForItem?(camera: ICCameraDevice, item: ICCameraItem): void;

	cameraDeviceDidReceiveThumbnailForItemError(camera: ICCameraDevice, thumbnail: any, item: ICCameraItem, error: NSError): void;

	cameraDeviceDidRemoveAccessRestriction(device: ICDevice): void;

	cameraDeviceDidRemoveItem?(camera: ICCameraDevice, item: ICCameraItem): void;

	cameraDeviceDidRemoveItems(camera: ICCameraDevice, items: NSArray<ICCameraItem> | ICCameraItem[]): void;

	cameraDeviceDidRenameItems(camera: ICCameraDevice, items: NSArray<ICCameraItem> | ICCameraItem[]): void;

	cameraDeviceShouldGetMetadataOfItem?(cameraDevice: ICCameraDevice, item: ICCameraItem): boolean;

	cameraDeviceShouldGetThumbnailOfItem?(cameraDevice: ICCameraDevice, item: ICCameraItem): boolean;

	deviceDidBecomeReadyWithCompleteContentCatalog(device: ICCameraDevice): void;
}
declare var ICCameraDeviceDelegate: {

	prototype: ICCameraDeviceDelegate;
};

interface ICCameraDeviceDownloadDelegate extends NSObjectProtocol {

	didDownloadFileErrorOptionsContextInfo?(file: ICCameraFile, error: NSError, options: NSDictionary<string, any>, contextInfo: interop.Pointer | interop.Reference<any>): void;

	didReceiveDownloadProgressForFileDownloadedBytesMaxBytes?(file: ICCameraFile, downloadedBytes: number, maxBytes: number): void;
}
declare var ICCameraDeviceDownloadDelegate: {

	prototype: ICCameraDeviceDownloadDelegate;
};

declare class ICCameraFile extends ICCameraItem {

	static alloc(): ICCameraFile; // inherited from NSObject

	static new(): ICCameraFile; // inherited from NSObject

	readonly burstFavorite: boolean;

	readonly burstPicked: boolean;

	readonly burstUUID: string;

	readonly createdFilename: string;

	readonly duration: number;

	readonly exifCreationDate: Date;

	readonly exifModificationDate: Date;

	readonly fileCreationDate: Date;

	readonly fileModificationDate: Date;

	readonly fileSize: number;

	readonly firstPicked: boolean;

	readonly gpsString: string;

	readonly groupUUID: string;

	readonly height: number;

	readonly highFramerate: boolean;

	orientation: ICEXIFOrientationType;

	readonly originalFilename: string;

	readonly originatingAssetID: string;

	readonly pairedRawImage: ICCameraFile;

	readonly relatedUUID: string;

	readonly sidecarFiles: NSArray<ICCameraItem>;

	readonly timeLapse: boolean;

	readonly width: number;

	requestDownloadWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: string, p2: NSError) => void): NSProgress;

	requestMetadataDictionaryWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: NSDictionary<any, any>, p2: NSError) => void): void;

	requestReadDataAtOffsetLengthCompletion(offset: number, length: number, completion: (p1: NSData, p2: NSError) => void): void;

	requestThumbnailDataWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: NSData, p2: NSError) => void): void;
}

declare class ICCameraFolder extends ICCameraItem {

	static alloc(): ICCameraFolder; // inherited from NSObject

	static new(): ICCameraFolder; // inherited from NSObject

	readonly contents: NSArray<ICCameraItem>;
}

declare class ICCameraItem extends NSObject {

	static alloc(): ICCameraItem; // inherited from NSObject

	static new(): ICCameraItem; // inherited from NSObject

	readonly UTI: string;

	readonly addedAfterContentCatalogCompleted: boolean;

	readonly creationDate: Date;

	readonly device: ICCameraDevice;

	readonly inTemporaryStore: boolean;

	readonly largeThumbnailIfAvailable: any;

	readonly locked: boolean;

	readonly metadata: NSDictionary<any, any>;

	readonly metadataIfAvailable: NSDictionary<string, any>;

	readonly modificationDate: Date;

	readonly name: string;

	readonly parentFolder: ICCameraFolder;

	readonly ptpObjectHandle: number;

	readonly raw: boolean;

	readonly thumbnail: any;

	readonly thumbnailIfAvailable: any;

	readonly userData: NSMutableDictionary<any, any>;

	flushMetadataCache(): void;

	flushThumbnailCache(): void;

	requestMetadata(): void;

	requestThumbnail(): void;
}

declare var ICDeleteAfterSuccessfulDownload: string;

declare var ICDeleteCanceled: string;

declare var ICDeleteErrorCanceled: string;

declare var ICDeleteErrorDeviceMissing: string;

declare var ICDeleteErrorFileMissing: string;

declare var ICDeleteErrorReadOnly: string;

declare var ICDeleteFailed: string;

declare var ICDeleteSuccessful: string;

declare class ICDevice extends NSObject {

	static alloc(): ICDevice; // inherited from NSObject

	static new(): ICDevice; // inherited from NSObject

	readonly UUIDString: string;

	readonly capabilities: NSArray<string>;

	delegate: ICDeviceDelegate;

	readonly hasOpenSession: boolean;

	readonly icon: any;

	readonly name: string;

	readonly productKind: string;

	readonly transportType: string;

	readonly type: ICDeviceType;

	readonly usbLocationID: number;

	readonly usbProductID: number;

	readonly usbVendorID: number;

	readonly userData: NSMutableDictionary<any, any>;

	requestCloseSession(): void;

	requestCloseSessionWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: NSError) => void): void;

	requestEject(): void;

	requestEjectWithCompletion(completion: (p1: NSError) => void): void;

	requestOpenSession(): void;

	requestOpenSessionWithOptionsCompletion(options: NSDictionary<string, any>, completion: (p1: NSError) => void): void;
}

declare class ICDeviceBrowser extends NSObject {

	static alloc(): ICDeviceBrowser; // inherited from NSObject

	static new(): ICDeviceBrowser; // inherited from NSObject

	readonly browsing: boolean;

	delegate: ICDeviceBrowserDelegate;

	readonly devices: NSArray<ICDevice>;

	start(): void;

	stop(): void;
}

interface ICDeviceBrowserDelegate extends NSObjectProtocol {

	deviceBrowserDeviceDidChangeName?(browser: ICDeviceBrowser, device: ICDevice): void;

	deviceBrowserDeviceDidChangeSharingState?(browser: ICDeviceBrowser, device: ICDevice): void;

	deviceBrowserDidAddDeviceMoreComing(browser: ICDeviceBrowser, device: ICDevice, moreComing: boolean): void;

	deviceBrowserDidRemoveDeviceMoreGoing(browser: ICDeviceBrowser, device: ICDevice, moreGoing: boolean): void;
}
declare var ICDeviceBrowserDelegate: {

	prototype: ICDeviceBrowserDelegate;
};

declare var ICDeviceCanEjectOrDisconnect: string;

interface ICDeviceDelegate extends NSObjectProtocol {

	deviceDidBecomeReady?(device: ICDevice): void;

	deviceDidCloseSessionWithError(device: ICDevice, error: NSError): void;

	deviceDidEjectWithError?(device: ICDevice, error: NSError): void;

	deviceDidEncounterError?(device: ICDevice, error: NSError): void;

	deviceDidOpenSessionWithError(device: ICDevice, error: NSError): void;

	deviceDidReceiveStatusInformation?(device: ICDevice, status: NSDictionary<string, any>): void;

	didRemoveDevice(device: ICDevice): void;
}
declare var ICDeviceDelegate: {

	prototype: ICDeviceDelegate;
};

declare const enum ICDeviceType {

	Camera = 1,

	Scanner = 2
}

declare var ICDownloadSidecarFiles: string;

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

declare var ICEnumerationChronologicalOrder: string;

declare var ICErrorDomain: string;

declare var ICImageSourceShouldCache: string;

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

	ExFATVolumeInvalid = -21200,

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

	ClosedSessionSuddenly = -21351,

	EjectedSuddenly = -21352,

	SessionAlreadyOpen = -21353,

	EjectFailed = -21354,

	FailedToOpen = -21355,

	FailedToOpenDevice = -21356
}

declare const enum ICReturnDownloadErrorCode {

	PathInvalid = -21100,

	FileWritable = -21101
}

declare const enum ICReturnMetadataErrorCode {

	NotAvailable = -21050,

	AlreadyFetching = -21051,

	Canceled = -21052,

	Invalid = -21053
}

declare const enum ICReturnObjectErrorCode {

	CodeObjectDoesNotExist = -21450,

	CodeObjectDataOffsetInvalid = -21451,

	CodeObjectCouldNotBeRead = -21452,

	CodeObjectDataEmpty = -21453
}

declare const enum ICReturnPTPDeviceErrorCode {

	FailedToSendCommand = -21100
}

declare const enum ICReturnThumbnailErrorCode {

	NotAvailable = -21000,

	AlreadyFetching = -21001,

	Canceled = -21002,

	Invalid = -21003
}

declare var ICSaveAsFilename: string;

declare var ICSavedAncillaryFiles: string;

declare var ICSavedFilename: string;

declare var ICStatusNotificationKey: string;

declare var ICTransportTypeExFAT: string;

declare var ICTransportTypeMassStorage: string;

declare var ICTransportTypeTCPIP: string;

declare var ICTransportTypeUSB: string;
