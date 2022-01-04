
declare const enum SFAuthenticationError {

	CanceledLogin = 1
}

declare var SFAuthenticationErrorDomain: string;

declare class SFAuthenticationSession extends NSObject {

	static alloc(): SFAuthenticationSession; // inherited from NSObject

	static new(): SFAuthenticationSession; // inherited from NSObject

	constructor(o: { URL: NSURL; callbackURLScheme: string; completionHandler: (p1: NSURL, p2: NSError) => void; });

	cancel(): void;

	initWithURLCallbackURLSchemeCompletionHandler(URL: NSURL, callbackURLScheme: string, completionHandler: (p1: NSURL, p2: NSError) => void): this;

	start(): boolean;
}

declare const enum SFContentBlockerErrorCode {

	NoExtensionFound = 1,

	NoAttachmentFound = 2,

	LoadingInterrupted = 3
}

declare var SFContentBlockerErrorDomain: string;

declare class SFContentBlockerManager extends NSObject {

	static alloc(): SFContentBlockerManager; // inherited from NSObject

	static getStateOfContentBlockerWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: SFContentBlockerState, p2: NSError) => void): void;

	static new(): SFContentBlockerManager; // inherited from NSObject

	static reloadContentBlockerWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: NSError) => void): void;
}

declare class SFContentBlockerState extends NSObject {

	static alloc(): SFContentBlockerState; // inherited from NSObject

	static new(): SFContentBlockerState; // inherited from NSObject

	readonly enabled: boolean;
}

declare const enum SFErrorCode {

	NoExtensionFound = 1,

	NoAttachmentFound = 2,

	LoadingInterrupted = 3
}

declare var SFErrorDomain: string;

declare var SFExtensionMessageKey: string;

declare class SFSafariViewController extends UIViewController {

	static alloc(): SFSafariViewController; // inherited from NSObject

	static new(): SFSafariViewController; // inherited from NSObject

	static prewarmConnectionsToURLs(URLs: NSArray<NSURL> | NSURL[]): SFSafariViewControllerPrewarmingToken;

	readonly configuration: SFSafariViewControllerConfiguration;

	delegate: SFSafariViewControllerDelegate;

	dismissButtonStyle: SFSafariViewControllerDismissButtonStyle;

	preferredBarTintColor: UIColor;

	preferredControlTintColor: UIColor;

	constructor(o: { URL: NSURL; });

	constructor(o: { URL: NSURL; configuration: SFSafariViewControllerConfiguration; });

	constructor(o: { URL: NSURL; entersReaderIfAvailable: boolean; });

	initWithURL(URL: NSURL): this;

	initWithURLConfiguration(URL: NSURL, configuration: SFSafariViewControllerConfiguration): this;

	initWithURLEntersReaderIfAvailable(URL: NSURL, entersReaderIfAvailable: boolean): this;
}

declare class SFSafariViewControllerActivityButton extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFSafariViewControllerActivityButton; // inherited from NSObject

	static new(): SFSafariViewControllerActivityButton; // inherited from NSObject

	readonly extensionIdentifier: string;

	readonly templateImage: UIImage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { templateImage: UIImage; extensionIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTemplateImageExtensionIdentifier(templateImage: UIImage, extensionIdentifier: string): this;
}

declare class SFSafariViewControllerConfiguration extends NSObject implements NSCopying {

	static alloc(): SFSafariViewControllerConfiguration; // inherited from NSObject

	static new(): SFSafariViewControllerConfiguration; // inherited from NSObject

	activityButton: SFSafariViewControllerActivityButton;

	barCollapsingEnabled: boolean;

	entersReaderIfAvailable: boolean;

	eventAttribution: UIEventAttribution;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface SFSafariViewControllerDelegate extends NSObjectProtocol {

	safariViewControllerActivityItemsForURLTitle?(controller: SFSafariViewController, URL: NSURL, title: string): NSArray<UIActivity>;

	safariViewControllerDidCompleteInitialLoad?(controller: SFSafariViewController, didLoadSuccessfully: boolean): void;

	safariViewControllerDidFinish?(controller: SFSafariViewController): void;

	safariViewControllerExcludedActivityTypesForURLTitle?(controller: SFSafariViewController, URL: NSURL, title: string): NSArray<string>;

	safariViewControllerInitialLoadDidRedirectToURL?(controller: SFSafariViewController, URL: NSURL): void;

	safariViewControllerWillOpenInBrowser?(controller: SFSafariViewController): void;
}
declare var SFSafariViewControllerDelegate: {

	prototype: SFSafariViewControllerDelegate;
};

declare const enum SFSafariViewControllerDismissButtonStyle {

	Done = 0,

	Close = 1,

	Cancel = 2
}

declare class SFSafariViewControllerPrewarmingToken extends NSObject {

	static alloc(): SFSafariViewControllerPrewarmingToken; // inherited from NSObject

	static new(): SFSafariViewControllerPrewarmingToken; // inherited from NSObject

	invalidate(): void;
}

declare class SSReadingList extends NSObject {

	static alloc(): SSReadingList; // inherited from NSObject

	static defaultReadingList(): SSReadingList;

	static new(): SSReadingList; // inherited from NSObject

	static supportsURL(URL: NSURL): boolean;

	addReadingListItemWithURLTitlePreviewTextError(URL: NSURL, title: string, previewText: string): boolean;
}

declare const enum SSReadingListErrorCode {

	URLSchemeNotAllowed = 1
}

declare var SSReadingListErrorDomain: string;
