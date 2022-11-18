
declare const enum AVAudioSessionRouteSelection {

	None = 0,

	Local = 1,

	External = 2
}

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

declare const enum AVKitError {

	Unknown = -1000,

	PictureInPictureStartFailed = -1001
}

declare var AVKitErrorDomain: string;

declare class AVPictureInPictureController extends NSObject {

	static alloc(): AVPictureInPictureController; // inherited from NSObject

	static isPictureInPictureSupported(): boolean;

	static new(): AVPictureInPictureController; // inherited from NSObject

	static pictureInPictureButtonStartImageCompatibleWithTraitCollection(traitCollection: UITraitCollection): UIImage;

	static pictureInPictureButtonStopImageCompatibleWithTraitCollection(traitCollection: UITraitCollection): UIImage;

	canStartPictureInPictureAutomaticallyFromInline: boolean;

	contentSource: AVPictureInPictureControllerContentSource;

	delegate: AVPictureInPictureControllerDelegate;

	readonly pictureInPictureActive: boolean;

	readonly pictureInPicturePossible: boolean;

	readonly pictureInPictureSuspended: boolean;

	readonly playerLayer: AVPlayerLayer;

	requiresLinearPlayback: boolean;

	static readonly pictureInPictureButtonStartImage: UIImage;

	static readonly pictureInPictureButtonStopImage: UIImage;

	constructor(o: { contentSource: AVPictureInPictureControllerContentSource; });

	constructor(o: { playerLayer: AVPlayerLayer; });

	initWithContentSource(contentSource: AVPictureInPictureControllerContentSource): this;

	initWithPlayerLayer(playerLayer: AVPlayerLayer): this;

	invalidatePlaybackState(): void;

	startPictureInPicture(): void;

	stopPictureInPicture(): void;
}

declare class AVPictureInPictureControllerContentSource extends NSObject {

	static alloc(): AVPictureInPictureControllerContentSource; // inherited from NSObject

	static new(): AVPictureInPictureControllerContentSource; // inherited from NSObject

	readonly activeVideoCallContentViewController: AVPictureInPictureVideoCallViewController;

	readonly activeVideoCallSourceView: UIView;

	readonly playerLayer: AVPlayerLayer;

	readonly sampleBufferDisplayLayer: AVSampleBufferDisplayLayer;

	readonly sampleBufferPlaybackDelegate: AVPictureInPictureSampleBufferPlaybackDelegate;

	constructor(o: { activeVideoCallSourceView: UIView; contentViewController: AVPictureInPictureVideoCallViewController; });

	constructor(o: { playerLayer: AVPlayerLayer; });

	constructor(o: { sampleBufferDisplayLayer: AVSampleBufferDisplayLayer; playbackDelegate: AVPictureInPictureSampleBufferPlaybackDelegate; });

	initWithActiveVideoCallSourceViewContentViewController(sourceView: UIView, contentViewController: AVPictureInPictureVideoCallViewController): this;

	initWithPlayerLayer(playerLayer: AVPlayerLayer): this;

	initWithSampleBufferDisplayLayerPlaybackDelegate(sampleBufferDisplayLayer: AVSampleBufferDisplayLayer, playbackDelegate: AVPictureInPictureSampleBufferPlaybackDelegate): this;
}

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

declare class AVPictureInPictureVideoCallViewController extends UIViewController {

	static alloc(): AVPictureInPictureVideoCallViewController; // inherited from NSObject

	static new(): AVPictureInPictureVideoCallViewController; // inherited from NSObject
}

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

declare class AVPlayerViewController extends UIViewController {

	static alloc(): AVPlayerViewController; // inherited from NSObject

	static new(): AVPlayerViewController; // inherited from NSObject

	allowsPictureInPicturePlayback: boolean;

	allowsVideoFrameAnalysis: boolean;

	canStartPictureInPictureAutomaticallyFromInline: boolean;

	readonly contentOverlayView: UIView;

	delegate: AVPlayerViewControllerDelegate;

	entersFullScreenWhenPlaybackBegins: boolean;

	exitsFullScreenWhenPlaybackEnds: boolean;

	pixelBufferAttributes: NSDictionary<string, any>;

	player: AVPlayer;

	readonly readyForDisplay: boolean;

	requiresLinearPlayback: boolean;

	readonly selectedSpeed: AVPlaybackSpeed;

	showsPlaybackControls: boolean;

	showsTimecodes: boolean;

	speeds: NSArray<AVPlaybackSpeed>;

	updatesNowPlayingInfoCenter: boolean;

	readonly videoBounds: CGRect;

	videoGravity: string;

	selectSpeed(speed: AVPlaybackSpeed): void;
}

interface AVPlayerViewControllerDelegate extends NSObjectProtocol {

	playerViewControllerDidPresentInterstitialTimeRange?(playerViewController: AVPlayerViewController, interstitial: AVInterstitialTimeRange): void;

	playerViewControllerDidStartPictureInPicture?(playerViewController: AVPlayerViewController): void;

	playerViewControllerDidStopPictureInPicture?(playerViewController: AVPlayerViewController): void;

	playerViewControllerFailedToStartPictureInPictureWithError?(playerViewController: AVPlayerViewController, error: NSError): void;

	playerViewControllerRestoreUserInterfaceForFullScreenExitWithCompletionHandler?(playerViewController: AVPlayerViewController, completionHandler: (p1: boolean) => void): void;

	playerViewControllerRestoreUserInterfaceForPictureInPictureStopWithCompletionHandler?(playerViewController: AVPlayerViewController, completionHandler: (p1: boolean) => void): void;

	playerViewControllerShouldAutomaticallyDismissAtPictureInPictureStart?(playerViewController: AVPlayerViewController): boolean;

	playerViewControllerWillBeginFullScreenPresentationWithAnimationCoordinator?(playerViewController: AVPlayerViewController, coordinator: UIViewControllerTransitionCoordinator): void;

	playerViewControllerWillEndFullScreenPresentationWithAnimationCoordinator?(playerViewController: AVPlayerViewController, coordinator: UIViewControllerTransitionCoordinator): void;

	playerViewControllerWillPresentInterstitialTimeRange?(playerViewController: AVPlayerViewController, interstitial: AVInterstitialTimeRange): void;

	playerViewControllerWillStartPictureInPicture?(playerViewController: AVPlayerViewController): void;

	playerViewControllerWillStopPictureInPicture?(playerViewController: AVPlayerViewController): void;
}
declare var AVPlayerViewControllerDelegate: {

	prototype: AVPlayerViewControllerDelegate;
};

declare class AVRoutePickerView extends UIView {

	static alloc(): AVRoutePickerView; // inherited from NSObject

	static appearance(): AVRoutePickerView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): AVRoutePickerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): AVRoutePickerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): AVRoutePickerView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): AVRoutePickerView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): AVRoutePickerView; // inherited from UIAppearance

	static new(): AVRoutePickerView; // inherited from NSObject

	activeTintColor: UIColor;

	customRoutingController: AVCustomRoutingController;

	delegate: AVRoutePickerViewDelegate;

	prioritizesVideoDevices: boolean;
}

interface AVRoutePickerViewDelegate extends NSObjectProtocol {

	routePickerViewDidEndPresentingRoutes?(routePickerView: AVRoutePickerView): void;

	routePickerViewWillBeginPresentingRoutes?(routePickerView: AVRoutePickerView): void;
}
declare var AVRoutePickerViewDelegate: {

	prototype: AVRoutePickerViewDelegate;
};
