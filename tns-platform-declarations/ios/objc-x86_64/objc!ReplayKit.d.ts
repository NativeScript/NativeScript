
declare var RPApplicationInfoBundleIdentifierKey: string;

declare class RPBroadcastActivityViewController extends UIViewController {

	static alloc(): RPBroadcastActivityViewController; // inherited from NSObject

	static loadBroadcastActivityViewControllerWithHandler(handler: (p1: RPBroadcastActivityViewController, p2: NSError) => void): void;

	static loadBroadcastActivityViewControllerWithPreferredExtensionHandler(preferredExtension: string, handler: (p1: RPBroadcastActivityViewController, p2: NSError) => void): void;

	static new(): RPBroadcastActivityViewController; // inherited from NSObject

	delegate: RPBroadcastActivityViewControllerDelegate;
}

interface RPBroadcastActivityViewControllerDelegate extends NSObjectProtocol {

	broadcastActivityViewControllerDidFinishWithBroadcastControllerError(broadcastActivityViewController: RPBroadcastActivityViewController, broadcastController: RPBroadcastController, error: NSError): void;
}
declare var RPBroadcastActivityViewControllerDelegate: {

	prototype: RPBroadcastActivityViewControllerDelegate;
};

declare class RPBroadcastConfiguration extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): RPBroadcastConfiguration; // inherited from NSObject

	static new(): RPBroadcastConfiguration; // inherited from NSObject

	clipDuration: number;

	videoCompressionProperties: NSDictionary<string, NSObject>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class RPBroadcastController extends NSObject {

	static alloc(): RPBroadcastController; // inherited from NSObject

	static new(): RPBroadcastController; // inherited from NSObject

	readonly broadcastExtensionBundleID: string;

	readonly broadcastURL: NSURL;

	readonly broadcasting: boolean;

	delegate: RPBroadcastControllerDelegate;

	readonly paused: boolean;

	readonly serviceInfo: NSDictionary<string, NSObject>;

	finishBroadcastWithHandler(handler: (p1: NSError) => void): void;

	pauseBroadcast(): void;

	resumeBroadcast(): void;

	startBroadcastWithHandler(handler: (p1: NSError) => void): void;
}

interface RPBroadcastControllerDelegate extends NSObjectProtocol {

	broadcastControllerDidFinishWithError?(broadcastController: RPBroadcastController, error: NSError): void;

	broadcastControllerDidUpdateBroadcastURL?(broadcastController: RPBroadcastController, broadcastURL: NSURL): void;

	broadcastControllerDidUpdateServiceInfo?(broadcastController: RPBroadcastController, serviceInfo: NSDictionary<string, NSObject>): void;
}
declare var RPBroadcastControllerDelegate: {

	prototype: RPBroadcastControllerDelegate;
};

declare class RPBroadcastHandler extends NSObject implements NSExtensionRequestHandling {

	static alloc(): RPBroadcastHandler; // inherited from NSObject

	static new(): RPBroadcastHandler; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	beginRequestWithExtensionContext(context: NSExtensionContext): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updateBroadcastURL(broadcastURL: NSURL): void;

	updateServiceInfo(serviceInfo: NSDictionary<string, NSObject>): void;
}

declare class RPBroadcastMP4ClipHandler extends RPBroadcastHandler {

	static alloc(): RPBroadcastMP4ClipHandler; // inherited from NSObject

	static new(): RPBroadcastMP4ClipHandler; // inherited from NSObject

	finishedProcessingMP4ClipWithUpdatedBroadcastConfigurationError(broadcastConfiguration: RPBroadcastConfiguration, error: NSError): void;

	processMP4ClipWithURLSetupInfoFinished(mp4ClipURL: NSURL, setupInfo: NSDictionary<string, NSObject>, finished: boolean): void;
}

declare class RPBroadcastSampleHandler extends RPBroadcastHandler {

	static alloc(): RPBroadcastSampleHandler; // inherited from NSObject

	static new(): RPBroadcastSampleHandler; // inherited from NSObject

	broadcastAnnotatedWithApplicationInfo(applicationInfo: NSDictionary<any, any>): void;

	broadcastFinished(): void;

	broadcastPaused(): void;

	broadcastResumed(): void;

	broadcastStartedWithSetupInfo(setupInfo: NSDictionary<string, NSObject>): void;

	finishBroadcastWithError(error: NSError): void;

	processSampleBufferWithType(sampleBuffer: any, sampleBufferType: RPSampleBufferType): void;
}

declare const enum RPCameraPosition {

	Front = 1,

	Back = 2
}

declare class RPPreviewViewController extends UIViewController {

	static alloc(): RPPreviewViewController; // inherited from NSObject

	static new(): RPPreviewViewController; // inherited from NSObject

	previewControllerDelegate: RPPreviewViewControllerDelegate;
}

interface RPPreviewViewControllerDelegate extends NSObjectProtocol {

	previewControllerDidFinish?(previewController: RPPreviewViewController): void;

	previewControllerDidFinishWithActivityTypes?(previewController: RPPreviewViewController, activityTypes: NSSet<string>): void;
}
declare var RPPreviewViewControllerDelegate: {

	prototype: RPPreviewViewControllerDelegate;
};

declare const enum RPPreviewViewControllerMode {

	Preview = 0,

	Share = 1
}

declare const enum RPRecordingErrorCode {

	Unknown = -5800,

	UserDeclined = -5801,

	Disabled = -5802,

	FailedToStart = -5803,

	Failed = -5804,

	InsufficientStorage = -5805,

	Interrupted = -5806,

	ContentResize = -5807,

	BroadcastInvalidSession = -5808,

	SystemDormancy = -5809,

	Entitlements = -5810,

	ActivePhoneCall = -5811,

	FailedToSave = -5812,

	CarPlay = -5813,

	FailedApplicationConnectionInvalid = -5814,

	FailedApplicationConnectionInterrupted = -5815,

	FailedNoMatchingApplicationContext = -5816,

	FailedMediaServicesFailure = -5817,

	VideoMixingFailure = -5818,

	BroadcastSetupFailed = -5819,

	FailedToObtainURL = -5820,

	FailedIncorrectTimeStamps = -5821,

	FailedToProcessFirstSample = -5822,

	FailedAssetWriterFailedToSave = -5823,

	FailedNoAssetWriter = -5824,

	FailedAssetWriterInWrongState = -5825,

	FailedAssetWriterExportFailed = -5826,

	FailedToRemoveFile = -5827,

	FailedAssetWriterExportCanceled = -5828,

	AttemptToStopNonRecording = -5829,

	AttemptToStartInRecordingState = -5830,

	PhotoFailure = -5831,

	RecordingInvalidSession = -5832,

	FailedToStartCaptureStack = -5833,

	CodeSuccessful = 0
}

declare var RPRecordingErrorDomain: string;

declare const enum RPSampleBufferType {

	Video = 1,

	AudioApp = 2,

	AudioMic = 3
}

declare class RPScreenRecorder extends NSObject {

	static alloc(): RPScreenRecorder; // inherited from NSObject

	static new(): RPScreenRecorder; // inherited from NSObject

	static sharedRecorder(): RPScreenRecorder;

	readonly available: boolean;

	cameraEnabled: boolean;

	cameraPosition: RPCameraPosition;

	readonly cameraPreviewView: UIView;

	delegate: RPScreenRecorderDelegate;

	microphoneEnabled: boolean;

	readonly recording: boolean;

	discardRecordingWithHandler(handler: () => void): void;

	startCaptureWithHandlerCompletionHandler(captureHandler: (p1: any, p2: RPSampleBufferType, p3: NSError) => void, completionHandler: (p1: NSError) => void): void;

	startRecordingWithHandler(handler: (p1: NSError) => void): void;

	startRecordingWithMicrophoneEnabledHandler(microphoneEnabled: boolean, handler: (p1: NSError) => void): void;

	stopCaptureWithHandler(handler: (p1: NSError) => void): void;

	stopRecordingWithHandler(handler: (p1: RPPreviewViewController, p2: NSError) => void): void;
}

interface RPScreenRecorderDelegate extends NSObjectProtocol {

	screenRecorderDidChangeAvailability?(screenRecorder: RPScreenRecorder): void;

	screenRecorderDidStopRecordingWithErrorPreviewViewController?(screenRecorder: RPScreenRecorder, error: NSError, previewViewController: RPPreviewViewController): void;

	screenRecorderDidStopRecordingWithPreviewViewControllerError?(screenRecorder: RPScreenRecorder, previewViewController: RPPreviewViewController, error: NSError): void;
}
declare var RPScreenRecorderDelegate: {

	prototype: RPScreenRecorderDelegate;
};

declare class RPSystemBroadcastPickerView extends UIView implements NSCoding {

	static alloc(): RPSystemBroadcastPickerView; // inherited from NSObject

	static appearance(): RPSystemBroadcastPickerView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): RPSystemBroadcastPickerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): RPSystemBroadcastPickerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): RPSystemBroadcastPickerView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): RPSystemBroadcastPickerView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): RPSystemBroadcastPickerView; // inherited from UIAppearance

	static new(): RPSystemBroadcastPickerView; // inherited from NSObject

	preferredExtension: string;

	showsMicrophoneButton: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var RPVideoSampleOrientationKey: string;
