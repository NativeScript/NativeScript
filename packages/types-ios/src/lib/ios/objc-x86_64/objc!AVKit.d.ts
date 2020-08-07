
declare const enum AVAudioSessionRouteSelection {

	None = 0,

	Local = 1,

	External = 2
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

	delegate: AVPictureInPictureControllerDelegate;

	readonly pictureInPictureActive: boolean;

	readonly pictureInPicturePossible: boolean;

	readonly pictureInPictureSuspended: boolean;

	readonly playerLayer: AVPlayerLayer;

	static readonly pictureInPictureButtonStartImage: UIImage;

	static readonly pictureInPictureButtonStopImage: UIImage;

	constructor(o: { playerLayer: AVPlayerLayer; });

	initWithPlayerLayer(playerLayer: AVPlayerLayer): this;

	startPictureInPicture(): void;

	stopPictureInPicture(): void;
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

declare class AVPlayerViewController extends UIViewController {

	static alloc(): AVPlayerViewController; // inherited from NSObject

	static new(): AVPlayerViewController; // inherited from NSObject

	static preparePrerollAds(): void;

	allowsPictureInPicturePlayback: boolean;

	readonly contentOverlayView: UIView;

	delegate: AVPlayerViewControllerDelegate;

	entersFullScreenWhenPlaybackBegins: boolean;

	exitsFullScreenWhenPlaybackEnds: boolean;

	pixelBufferAttributes: NSDictionary<string, any>;

	player: AVPlayer;

	readonly readyForDisplay: boolean;

	showsPlaybackControls: boolean;

	updatesNowPlayingInfoCenter: boolean;

	readonly videoBounds: CGRect;

	videoGravity: string;

	cancelPreroll(): void;

	playPrerollAdWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

interface AVPlayerViewControllerDelegate extends NSObjectProtocol {

	playerViewControllerDidStartPictureInPicture?(playerViewController: AVPlayerViewController): void;

	playerViewControllerDidStopPictureInPicture?(playerViewController: AVPlayerViewController): void;

	playerViewControllerFailedToStartPictureInPictureWithError?(playerViewController: AVPlayerViewController, error: NSError): void;

	playerViewControllerRestoreUserInterfaceForPictureInPictureStopWithCompletionHandler?(playerViewController: AVPlayerViewController, completionHandler: (p1: boolean) => void): void;

	playerViewControllerShouldAutomaticallyDismissAtPictureInPictureStart?(playerViewController: AVPlayerViewController): boolean;

	playerViewControllerWillBeginFullScreenPresentationWithAnimationCoordinator?(playerViewController: AVPlayerViewController, coordinator: UIViewControllerTransitionCoordinator): void;

	playerViewControllerWillEndFullScreenPresentationWithAnimationCoordinator?(playerViewController: AVPlayerViewController, coordinator: UIViewControllerTransitionCoordinator): void;

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
