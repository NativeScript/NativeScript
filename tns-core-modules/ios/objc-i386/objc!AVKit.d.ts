
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

	/* readonly */ pictureInPictureActive: boolean;

	/* readonly */ pictureInPicturePossible: boolean;

	/* readonly */ pictureInPictureSuspended: boolean;

	/* readonly */ playerLayer: AVPlayerLayer;

	constructor(); // inherited from NSObject

	constructor(o: { playerLayer: AVPlayerLayer; });

	self(): AVPictureInPictureController; // inherited from NSObjectProtocol

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

	static preparePrerollAds(): void;

	allowsPictureInPicturePlayback: boolean;

	/* readonly */ contentOverlayView: UIView;

	delegate: AVPlayerViewControllerDelegate;

	player: AVPlayer;

	/* readonly */ readyForDisplay: boolean;

	showsPlaybackControls: boolean;

	/* readonly */ videoBounds: CGRect;

	videoGravity: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	cancelPreroll(): void;

	playPrerollAdWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	self(): AVPlayerViewController; // inherited from NSObjectProtocol
}

interface AVPlayerViewControllerDelegate extends NSObjectProtocol {

	playerViewControllerDidStartPictureInPicture?(playerViewController: AVPlayerViewController): void;

	playerViewControllerDidStopPictureInPicture?(playerViewController: AVPlayerViewController): void;

	playerViewControllerFailedToStartPictureInPictureWithError?(playerViewController: AVPlayerViewController, error: NSError): void;

	playerViewControllerRestoreUserInterfaceForPictureInPictureStopWithCompletionHandler?(playerViewController: AVPlayerViewController, completionHandler: (p1: boolean) => void): void;

	playerViewControllerShouldAutomaticallyDismissAtPictureInPictureStart?(playerViewController: AVPlayerViewController): boolean;

	playerViewControllerWillStartPictureInPicture?(playerViewController: AVPlayerViewController): void;

	playerViewControllerWillStopPictureInPicture?(playerViewController: AVPlayerViewController): void;
}
declare var AVPlayerViewControllerDelegate: {

	prototype: AVPlayerViewControllerDelegate;
};
