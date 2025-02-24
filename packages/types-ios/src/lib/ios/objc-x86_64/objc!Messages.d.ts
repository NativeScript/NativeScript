
/**
 * @since 10.0
 */
declare class MSConversation extends NSObject {

	static alloc(): MSConversation; // inherited from NSObject

	static new(): MSConversation; // inherited from NSObject

	readonly localParticipantIdentifier: NSUUID;

	readonly remoteParticipantIdentifiers: NSArray<NSUUID>;

	readonly selectedMessage: MSMessage;

	insertAttachmentWithAlternateFilenameCompletionHandler(URL: NSURL, filename: string, completionHandler: (p1: NSError) => void): void;

	insertMessageCompletionHandler(message: MSMessage, completionHandler: (p1: NSError) => void): void;

	insertStickerCompletionHandler(sticker: MSSticker, completionHandler: (p1: NSError) => void): void;

	insertTextCompletionHandler(text: string, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	sendAttachmentWithAlternateFilenameCompletionHandler(URL: NSURL, filename: string, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	sendMessageCompletionHandler(message: MSMessage, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	sendStickerCompletionHandler(sticker: MSSticker, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	sendTextCompletionHandler(text: string, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 10.0
 */
declare class MSMessage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MSMessage; // inherited from NSObject

	static new(): MSMessage; // inherited from NSObject

	URL: NSURL;

	error: NSError;

	layout: MSMessageLayout;

	/**
	 * @since 11.0
	 */
	readonly pending: boolean;

	readonly senderParticipantIdentifier: NSUUID;

	readonly session: MSSession;

	shouldExpire: boolean;

	summaryText: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { session: MSSession; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSession(session: MSSession): this;
}

/**
 * @since 10.0
 */
declare const enum MSMessageErrorCode {

	Unknown = -1,

	FileNotFound = 1,

	FileUnreadable = 2,

	ImproperFileType = 3,

	ImproperFileURL = 4,

	StickerFileImproperFileAttributes = 5,

	StickerFileImproperFileSize = 6,

	StickerFileImproperFileFormat = 7,

	URLExceedsMaxSize = 8,

	SendWithoutRecentInteraction = 9,

	SendWhileNotVisible = 10,

	APIUnavailableInPresentationContext = 11
}

/**
 * @since 10.0
 */
declare class MSMessageLayout extends NSObject implements NSCopying {

	static alloc(): MSMessageLayout; // inherited from NSObject

	static new(): MSMessageLayout; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
declare class MSMessageLiveLayout extends MSMessageLayout {

	static alloc(): MSMessageLiveLayout; // inherited from NSObject

	static new(): MSMessageLiveLayout; // inherited from NSObject

	readonly alternateLayout: MSMessageTemplateLayout;

	constructor(o: { alternateLayout: MSMessageTemplateLayout; });

	initWithAlternateLayout(alternateLayout: MSMessageTemplateLayout): this;
}

/**
 * @since 10.0
 */
declare class MSMessageTemplateLayout extends MSMessageLayout {

	static alloc(): MSMessageTemplateLayout; // inherited from NSObject

	static new(): MSMessageTemplateLayout; // inherited from NSObject

	caption: string;

	image: UIImage;

	imageSubtitle: string;

	imageTitle: string;

	mediaFileURL: NSURL;

	subcaption: string;

	trailingCaption: string;

	trailingSubcaption: string;
}

/**
 * @since 12.0
 */
declare const enum MSMessagesAppPresentationContext {

	Messages = 0,

	Media = 1
}

/**
 * @since 10.0
 */
declare const enum MSMessagesAppPresentationStyle {

	Compact = 0,

	Expanded = 1,

	Transcript = 2
}

/**
 * @since 11.0
 */
interface MSMessagesAppTranscriptPresentation {

	/**
	 * @since 11.0
	 */
	contentSizeThatFits(size: CGSize): CGSize;
}
declare var MSMessagesAppTranscriptPresentation: {

	prototype: MSMessagesAppTranscriptPresentation;
};

/**
 * @since 10.0
 */
declare class MSMessagesAppViewController extends UIViewController implements MSMessagesAppTranscriptPresentation {

	static alloc(): MSMessagesAppViewController; // inherited from NSObject

	static new(): MSMessagesAppViewController; // inherited from NSObject

	readonly activeConversation: MSConversation;

	/**
	 * @since 12.0
	 */
	readonly presentationContext: MSMessagesAppPresentationContext;

	readonly presentationStyle: MSMessagesAppPresentationStyle;

	/**
	 * @since 11.0
	 */
	contentSizeThatFits(size: CGSize): CGSize;

	didBecomeActiveWithConversation(conversation: MSConversation): void;

	/**
	 * @since 10.0
	 */
	didCancelSendingMessageConversation(message: MSMessage, conversation: MSConversation): void;

	/**
	 * @since 10.0
	 */
	didReceiveMessageConversation(message: MSMessage, conversation: MSConversation): void;

	didResignActiveWithConversation(conversation: MSConversation): void;

	/**
	 * @since 10.0
	 */
	didSelectMessageConversation(message: MSMessage, conversation: MSConversation): void;

	/**
	 * @since 10.0
	 */
	didStartSendingMessageConversation(message: MSMessage, conversation: MSConversation): void;

	/**
	 * @since 10.0
	 */
	didTransitionToPresentationStyle(presentationStyle: MSMessagesAppPresentationStyle): void;

	/**
	 * @since 10.0
	 */
	dismiss(): void;

	requestPresentationStyle(presentationStyle: MSMessagesAppPresentationStyle): void;

	willBecomeActiveWithConversation(conversation: MSConversation): void;

	willResignActiveWithConversation(conversation: MSConversation): void;

	/**
	 * @since 10.0
	 */
	willSelectMessageConversation(message: MSMessage, conversation: MSConversation): void;

	/**
	 * @since 10.0
	 */
	willTransitionToPresentationStyle(presentationStyle: MSMessagesAppPresentationStyle): void;
}

/**
 * @since 10.0
 */
declare var MSMessagesErrorDomain: string;

/**
 * @since 10.0
 */
declare class MSSession extends NSObject implements NSSecureCoding {

	static alloc(): MSSession; // inherited from NSObject

	static new(): MSSession; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class MSSticker extends NSObject {

	static alloc(): MSSticker; // inherited from NSObject

	static new(): MSSticker; // inherited from NSObject

	readonly imageFileURL: NSURL;

	readonly localizedDescription: string;

	constructor(o: { contentsOfFileURL: NSURL; localizedDescription: string; });

	initWithContentsOfFileURLLocalizedDescriptionError(fileURL: NSURL, localizedDescription: string): this;
}

/**
 * @since 10.0
 */
declare class MSStickerBrowserView extends UIView {

	static alloc(): MSStickerBrowserView; // inherited from NSObject

	static appearance(): MSStickerBrowserView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MSStickerBrowserView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MSStickerBrowserView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MSStickerBrowserView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MSStickerBrowserView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MSStickerBrowserView; // inherited from UIAppearance

	static new(): MSStickerBrowserView; // inherited from NSObject

	contentInset: UIEdgeInsets;

	contentOffset: CGPoint;

	dataSource: MSStickerBrowserViewDataSource;

	readonly stickerSize: MSStickerSize;

	constructor(o: { frame: CGRect; stickerSize: MSStickerSize; });

	initWithFrameStickerSize(frame: CGRect, stickerSize: MSStickerSize): this;

	reloadData(): void;

	setContentOffsetAnimated(contentOffset: CGPoint, animated: boolean): void;
}

/**
 * @since 10.0
 */
declare class MSStickerBrowserViewController extends UIViewController implements MSStickerBrowserViewDataSource {

	static alloc(): MSStickerBrowserViewController; // inherited from NSObject

	static new(): MSStickerBrowserViewController; // inherited from NSObject

	readonly stickerBrowserView: MSStickerBrowserView;

	readonly stickerSize: MSStickerSize;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { stickerSize: MSStickerSize; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithStickerSize(stickerSize: MSStickerSize): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	numberOfStickersInStickerBrowserView(stickerBrowserView: MSStickerBrowserView): number;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	stickerBrowserViewStickerAtIndex(stickerBrowserView: MSStickerBrowserView, index: number): MSSticker;
}

/**
 * @since 10.0
 */
interface MSStickerBrowserViewDataSource extends NSObjectProtocol {

	numberOfStickersInStickerBrowserView(stickerBrowserView: MSStickerBrowserView): number;

	stickerBrowserViewStickerAtIndex(stickerBrowserView: MSStickerBrowserView, index: number): MSSticker;
}
declare var MSStickerBrowserViewDataSource: {

	prototype: MSStickerBrowserViewDataSource;
};

/**
 * @since 10.0
 */
declare const enum MSStickerSize {

	Small = 0,

	Regular = 1,

	Large = 2
}

/**
 * @since 10.0
 */
declare class MSStickerView extends UIView {

	static alloc(): MSStickerView; // inherited from NSObject

	static appearance(): MSStickerView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MSStickerView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MSStickerView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MSStickerView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MSStickerView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MSStickerView; // inherited from UIAppearance

	static new(): MSStickerView; // inherited from NSObject

	readonly animationDuration: number;

	sticker: MSSticker;

	constructor(o: { frame: CGRect; sticker: MSSticker; });

	initWithFrameSticker(frame: CGRect, sticker: MSSticker): this;

	isAnimating(): boolean;

	startAnimating(): void;

	stopAnimating(): void;
}

/**
 * @since 10.0
 */
declare var MSStickersErrorDomain: string;
