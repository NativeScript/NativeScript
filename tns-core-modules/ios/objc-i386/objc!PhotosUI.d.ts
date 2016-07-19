
interface PHContentEditingController extends NSObjectProtocol {

	shouldShowCancelConfirmation: boolean;

	canHandleAdjustmentData(adjustmentData: PHAdjustmentData): boolean;

	cancelContentEditing(): void;

	finishContentEditingWithCompletionHandler(completionHandler: (p1: PHContentEditingOutput) => void): void;

	startContentEditingWithInputPlaceholderImage(contentEditingInput: PHContentEditingInput, placeholderImage: UIImage): void;
}
declare var PHContentEditingController: {

	prototype: PHContentEditingController;
};

declare const enum PHLivePhotoBadgeOptions {

	OverContent = 1,

	LiveOff = 2
}

declare class PHLivePhotoView extends UIView {

	static appearance(): PHLivePhotoView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): PHLivePhotoView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PHLivePhotoView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): PHLivePhotoView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PHLivePhotoView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): PHLivePhotoView; // inherited from UIAppearance

	static livePhotoBadgeImageWithOptions(badgeOptions: PHLivePhotoBadgeOptions): UIImage;

	delegate: PHLivePhotoViewDelegate;

	livePhoto: PHLivePhoto;

	muted: boolean;

	/* readonly */ playbackGestureRecognizer: UIGestureRecognizer;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	self(): PHLivePhotoView; // inherited from NSObjectProtocol

	startPlaybackWithStyle(playbackStyle: PHLivePhotoViewPlaybackStyle): void;

	stopPlayback(): void;
}

interface PHLivePhotoViewDelegate extends NSObjectProtocol {

	livePhotoViewDidEndPlaybackWithStyle?(livePhotoView: PHLivePhotoView, playbackStyle: PHLivePhotoViewPlaybackStyle): void;

	livePhotoViewWillBeginPlaybackWithStyle?(livePhotoView: PHLivePhotoView, playbackStyle: PHLivePhotoViewPlaybackStyle): void;
}
declare var PHLivePhotoViewDelegate: {

	prototype: PHLivePhotoViewDelegate;
};

declare const enum PHLivePhotoViewPlaybackStyle {

	Undefined = 0,

	Full = 1,

	Hint = 2
}
