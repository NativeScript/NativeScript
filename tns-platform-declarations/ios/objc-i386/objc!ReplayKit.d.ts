
declare class RPBroadcastActivityViewController extends UIViewController {

	static alloc(): RPBroadcastActivityViewController; // inherited from NSObject

	static loadBroadcastActivityViewControllerWithHandler(handler: (p1: RPBroadcastActivityViewController, p2: NSError) => void): void;

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
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

	broadcastFinished(): void;

	broadcastPaused(): void;

	broadcastResumed(): void;

	broadcastStartedWithSetupInfo(setupInfo: NSDictionary<string, NSObject>): void;

	processSampleBufferWithType(sampleBuffer: any, sampleBufferType: RPSampleBufferType): void;
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

	SystemDormancy = -5809
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

	readonly cameraPreviewView: UIView;

	delegate: RPScreenRecorderDelegate;

	microphoneEnabled: boolean;

	readonly recording: boolean;

	discardRecordingWithHandler(handler: () => void): void;

	startRecordingWithHandler(handler: (p1: NSError) => void): void;

	startRecordingWithMicrophoneEnabledHandler(microphoneEnabled: boolean, handler: (p1: NSError) => void): void;

	stopRecordingWithHandler(handler: (p1: RPPreviewViewController, p2: NSError) => void): void;
}

interface RPScreenRecorderDelegate extends NSObjectProtocol {

	screenRecorderDidChangeAvailability?(screenRecorder: RPScreenRecorder): void;

	screenRecorderDidStopRecordingWithErrorPreviewViewController?(screenRecorder: RPScreenRecorder, error: NSError, previewViewController: RPPreviewViewController): void;
}
declare var RPScreenRecorderDelegate: {

	prototype: RPScreenRecorderDelegate;
};
