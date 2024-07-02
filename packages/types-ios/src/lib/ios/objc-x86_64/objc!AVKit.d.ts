
/**
 * @since 13.0
 */
declare const enum AVAudioSessionRouteSelection {

	None = 0,

	Local = 1,

	External = 2
}

/**
 * @since 17.2
 */
declare class AVCaptureEvent extends NSObject {

	static alloc(): AVCaptureEvent; // inherited from NSObject

	static new(): AVCaptureEvent; // inherited from NSObject

	readonly phase: AVCaptureEventPhase;
}

/**
 * @since 17.2
 */
declare class AVCaptureEventInteraction extends NSObject implements UIInteraction {

	static alloc(): AVCaptureEventInteraction; // inherited from NSObject

	static new(): AVCaptureEventInteraction; // inherited from NSObject

	enabled: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { eventHandler: (p1: AVCaptureEvent) => void; });

	constructor(o: { primaryEventHandler: (p1: AVCaptureEvent) => void; secondaryEventHandler: (p1: AVCaptureEvent) => void; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithEventHandler(handler: (p1: AVCaptureEvent) => void): this;

	initWithPrimaryEventHandlerSecondaryEventHandler(primaryHandler: (p1: AVCaptureEvent) => void, secondaryHandler: (p1: AVCaptureEvent) => void): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 17.2
 */
declare const enum AVCaptureEventPhase {

	Began = 0,

	Ended = 1,

	Cancelled = 2
}

/**
 * @since 16.0
 */
declare class AVInterstitialTimeRange extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AVInterstitialTimeRange; // inherited from NSObject

	static new(): AVInterstitialTimeRange; // inherited from NSObject

	readonly timeRange: CMTimeRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare const enum AVKitError {

	Unknown = -1000,

	PictureInPictureStartFailed = -1001,

	ContentRatingUnknown = -1100,

	ContentDisallowedByPasscode = -1101,

	ContentDisallowedByProfile = -1102,

	RecordingFailed = -1200
}

/**
 * @since 9.0
 */
declare var AVKitErrorDomain: string;

/**
 * @since 9.0
 */
declare class AVPictureInPictureController extends NSObject {

	static alloc(): AVPictureInPictureController; // inherited from NSObject

	static isPictureInPictureSupported(): boolean;

	static new(): AVPictureInPictureController; // inherited from NSObject

	static pictureInPictureButtonStartImageCompatibleWithTraitCollection(traitCollection: UITraitCollection): UIImage;

	static pictureInPictureButtonStopImageCompatibleWithTraitCollection(traitCollection: UITraitCollection): UIImage;

	/**
	 * @since 14.2
	 */
	canStartPictureInPictureAutomaticallyFromInline: boolean;

	/**
	 * @since 15.0
	 */
	contentSource: AVPictureInPictureControllerContentSource;

	delegate: AVPictureInPictureControllerDelegate;

	readonly pictureInPictureActive: boolean;

	readonly pictureInPicturePossible: boolean;

	readonly pictureInPictureSuspended: boolean;

	readonly playerLayer: AVPlayerLayer;

	/**
	 * @since 14.0
	 */
	requiresLinearPlayback: boolean;

	/**
	 * @since 13.0
	 */
	static readonly pictureInPictureButtonStartImage: UIImage;

	/**
	 * @since 13.0
	 */
	static readonly pictureInPictureButtonStopImage: UIImage;

	/**
	 * @since 15.0
	 */
	constructor(o: { contentSource: AVPictureInPictureControllerContentSource; });

	constructor(o: { playerLayer: AVPlayerLayer; });

	/**
	 * @since 15.0
	 */
	initWithContentSource(contentSource: AVPictureInPictureControllerContentSource): this;

	initWithPlayerLayer(playerLayer: AVPlayerLayer): this;

	/**
	 * @since 15.0
	 */
	invalidatePlaybackState(): void;

	startPictureInPicture(): void;

	stopPictureInPicture(): void;
}

/**
 * @since 15.0
 */
declare class AVPictureInPictureControllerContentSource extends NSObject {

	static alloc(): AVPictureInPictureControllerContentSource; // inherited from NSObject

	static new(): AVPictureInPictureControllerContentSource; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly activeVideoCallContentViewController: AVPictureInPictureVideoCallViewController;

	/**
	 * @since 15.0
	 */
	readonly activeVideoCallSourceView: UIView;

	readonly playerLayer: AVPlayerLayer;

	readonly sampleBufferDisplayLayer: AVSampleBufferDisplayLayer;

	readonly sampleBufferPlaybackDelegate: AVPictureInPictureSampleBufferPlaybackDelegate;

	/**
	 * @since 15.0
	 */
	constructor(o: { activeVideoCallSourceView: UIView; contentViewController: AVPictureInPictureVideoCallViewController; });

	constructor(o: { playerLayer: AVPlayerLayer; });

	constructor(o: { sampleBufferDisplayLayer: AVSampleBufferDisplayLayer; playbackDelegate: AVPictureInPictureSampleBufferPlaybackDelegate; });

	/**
	 * @since 15.0
	 */
	initWithActiveVideoCallSourceViewContentViewController(sourceView: UIView, contentViewController: AVPictureInPictureVideoCallViewController): this;

	initWithPlayerLayer(playerLayer: AVPlayerLayer): this;

	initWithSampleBufferDisplayLayerPlaybackDelegate(sampleBufferDisplayLayer: AVSampleBufferDisplayLayer, playbackDelegate: AVPictureInPictureSampleBufferPlaybackDelegate): this;
}

/**
 * @since 9.0
 */
interface AVPictureInPictureControllerDelegate extends NSObjectProtocol {

	pictureInPictureControllerDidStartPictureInPicture?(pictureInPictureController: AVPictureInPictureController): void;

	pictureInPictureControllerDidStopPictureInPicture?(pictureInPictureController: AVPictureInPictureController): void;

	pictureInPictureControllerFailedToStartPictureInPictureWithError?(pictureInPictureController: AVPictureInPictureController, error: NSError): void;

	pictureInPictureControllerRestoreUserInterfaceForPictureInPictureStopWithCompletionHandler?(pictureInPictureController: AVPictureInPictureController, completionHandler: (p1: boolean) => void): void;

	pictureInPictureControllerWillStartPictureInPicture?(pictureInPictureController: AVPictureInPictureController): void;

	pictureInPictureControllerWillStopPictureInPicture?(pictureInPictureController: AVPictureInPictureController): void;
}
declare var AVPictureInPictureControllerDelegate: {

	prototype: AVPictureInPictureControllerDelegate;
};

/**
 * @since 15.0
 */
interface AVPictureInPictureSampleBufferPlaybackDelegate extends NSObjectProtocol {

	pictureInPictureControllerDidTransitionToRenderSize(pictureInPictureController: AVPictureInPictureController, newRenderSize: CMVideoDimensions): void;

	pictureInPictureControllerIsPlaybackPaused(pictureInPictureController: AVPictureInPictureController): boolean;

	pictureInPictureControllerSetPlaying(pictureInPictureController: AVPictureInPictureController, playing: boolean): void;

	pictureInPictureControllerShouldProhibitBackgroundAudioPlayback?(pictureInPictureController: AVPictureInPictureController): boolean;

	pictureInPictureControllerSkipByIntervalCompletionHandler(pictureInPictureController: AVPictureInPictureController, skipInterval: CMTime, completionHandler: () => void): void;

	pictureInPictureControllerTimeRangeForPlayback(pictureInPictureController: AVPictureInPictureController): CMTimeRange;
}
declare var AVPictureInPictureSampleBufferPlaybackDelegate: {

	prototype: AVPictureInPictureSampleBufferPlaybackDelegate;
};

/**
 * @since 15.0
 */
declare class AVPictureInPictureVideoCallViewController extends UIViewController {

	static alloc(): AVPictureInPictureVideoCallViewController; // inherited from NSObject

	static new(): AVPictureInPictureVideoCallViewController; // inherited from NSObject
}

/**
 * @since 16.0
 */
declare class AVPlaybackSpeed extends NSObject {

	static alloc(): AVPlaybackSpeed; // inherited from NSObject

	static new(): AVPlaybackSpeed; // inherited from NSObject

	readonly localizedName: string;

	readonly localizedNumericName: string;

	readonly rate: number;

	static readonly systemDefaultSpeeds: NSArray<AVPlaybackSpeed>;

	constructor(o: { rate: number; localizedName: string; });

	initWithRateLocalizedName(rate: number, localizedName: string): this;
}

/**
 * @since 8.0
 */
declare class AVPlayerViewController extends UIViewController {

	static alloc(): AVPlayerViewController; // inherited from NSObject

	static new(): AVPlayerViewController; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	allowsPictureInPicturePlayback: boolean;

	/**
	 * @since 16.0
	 */
	allowsVideoFrameAnalysis: boolean;

	/**
	 * @since 14.2
	 */
	canStartPictureInPictureAutomaticallyFromInline: boolean;

	readonly contentOverlayView: UIView;

	/**
	 * @since 9.0
	 */
	delegate: AVPlayerViewControllerDelegate;

	/**
	 * @since 11.0
	 */
	entersFullScreenWhenPlaybackBegins: boolean;

	/**
	 * @since 11.0
	 */
	exitsFullScreenWhenPlaybackEnds: boolean;

	/**
	 * @since 9.0
	 */
	pixelBufferAttributes: NSDictionary<string, any>;

	player: AVPlayer;

	readonly readyForDisplay: boolean;

	/**
	 * @since 11.0
	 */
	requiresLinearPlayback: boolean;

	/**
	 * @since 16.0
	 */
	readonly selectedSpeed: AVPlaybackSpeed;

	showsPlaybackControls: boolean;

	/**
	 * @since 13.0
	 */
	showsTimecodes: boolean;

	/**
	 * @since 16.0
	 */
	speeds: NSArray<AVPlaybackSpeed>;

	/**
	 * @since 17.0
	 */
	readonly toggleLookupAction: UIAction;

	/**
	 * @since 10.0
	 */
	updatesNowPlayingInfoCenter: boolean;

	readonly videoBounds: CGRect;

	/**
	 * @since 17.0
	 */
	videoFrameAnalysisTypes: AVVideoFrameAnalysisType;

	videoGravity: string;

	/**
	 * @since 16.0
	 */
	selectSpeed(speed: AVPlaybackSpeed): void;
}

/**
 * @since 9.0
 */
interface AVPlayerViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 16.0
	 */
	playerViewControllerDidPresentInterstitialTimeRange?(playerViewController: AVPlayerViewController, interstitial: AVInterstitialTimeRange): void;

	/**
	 * @since 9.0
	 */
	playerViewControllerDidStartPictureInPicture?(playerViewController: AVPlayerViewController): void;

	/**
	 * @since 9.0
	 */
	playerViewControllerDidStopPictureInPicture?(playerViewController: AVPlayerViewController): void;

	/**
	 * @since 9.0
	 */
	playerViewControllerFailedToStartPictureInPictureWithError?(playerViewController: AVPlayerViewController, error: NSError): void;

	/**
	 * @since 15.0
	 */
	playerViewControllerRestoreUserInterfaceForFullScreenExitWithCompletionHandler?(playerViewController: AVPlayerViewController, completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 9.0
	 */
	playerViewControllerRestoreUserInterfaceForPictureInPictureStopWithCompletionHandler?(playerViewController: AVPlayerViewController, completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 9.0
	 */
	playerViewControllerShouldAutomaticallyDismissAtPictureInPictureStart?(playerViewController: AVPlayerViewController): boolean;

	/**
	 * @since 12.0
	 */
	playerViewControllerWillBeginFullScreenPresentationWithAnimationCoordinator?(playerViewController: AVPlayerViewController, coordinator: UIViewControllerTransitionCoordinator): void;

	/**
	 * @since 12.0
	 */
	playerViewControllerWillEndFullScreenPresentationWithAnimationCoordinator?(playerViewController: AVPlayerViewController, coordinator: UIViewControllerTransitionCoordinator): void;

	/**
	 * @since 16.0
	 */
	playerViewControllerWillPresentInterstitialTimeRange?(playerViewController: AVPlayerViewController, interstitial: AVInterstitialTimeRange): void;

	/**
	 * @since 9.0
	 */
	playerViewControllerWillStartPictureInPicture?(playerViewController: AVPlayerViewController): void;

	/**
	 * @since 9.0
	 */
	playerViewControllerWillStopPictureInPicture?(playerViewController: AVPlayerViewController): void;
}
declare var AVPlayerViewControllerDelegate: {

	prototype: AVPlayerViewControllerDelegate;
};

/**
 * @since 11.0
 */
declare class AVRoutePickerView extends UIView {

	static alloc(): AVRoutePickerView; // inherited from NSObject

	static appearance(): AVRoutePickerView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): AVRoutePickerView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): AVRoutePickerView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): AVRoutePickerView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): AVRoutePickerView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): AVRoutePickerView; // inherited from UIAppearance

	static new(): AVRoutePickerView; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	activeTintColor: UIColor;

	/**
	 * @since 16.0
	 */
	customRoutingController: AVCustomRoutingController;

	delegate: AVRoutePickerViewDelegate;

	/**
	 * @since 13.0
	 */
	prioritizesVideoDevices: boolean;
}

/**
 * @since 11.0
 */
interface AVRoutePickerViewDelegate extends NSObjectProtocol {

	routePickerViewDidEndPresentingRoutes?(routePickerView: AVRoutePickerView): void;

	routePickerViewWillBeginPresentingRoutes?(routePickerView: AVRoutePickerView): void;
}
declare var AVRoutePickerViewDelegate: {

	prototype: AVRoutePickerViewDelegate;
};

/**
 * @since 17.0
 */
declare const enum AVVideoFrameAnalysisType {

	None = 0,

	Default = 1,

	Text = 2,

	Subject = 4,

	VisualSearch = 8,

	MachineReadableCode = 16
}
