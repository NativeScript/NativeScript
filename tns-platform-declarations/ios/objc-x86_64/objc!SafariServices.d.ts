
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

declare class SFSafariViewController extends UIViewController {

	static alloc(): SFSafariViewController; // inherited from NSObject

	static new(): SFSafariViewController; // inherited from NSObject

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

declare class SFSafariViewControllerConfiguration extends NSObject implements NSCopying {

	static alloc(): SFSafariViewControllerConfiguration; // inherited from NSObject

	static new(): SFSafariViewControllerConfiguration; // inherited from NSObject

	barCollapsingEnabled: boolean;

	entersReaderIfAvailable: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface SFSafariViewControllerDelegate extends NSObjectProtocol {

	safariViewControllerActivityItemsForURLTitle?(controller: SFSafariViewController, URL: NSURL, title: string): NSArray<UIActivity>;

	safariViewControllerDidCompleteInitialLoad?(controller: SFSafariViewController, didLoadSuccessfully: boolean): void;

	safariViewControllerDidFinish?(controller: SFSafariViewController): void;

	safariViewControllerExcludedActivityTypesForURLTitle?(controller: SFSafariViewController, URL: NSURL, title: string): NSArray<string>;

	safariViewControllerInitialLoadDidRedirectToURL?(controller: SFSafariViewController, URL: NSURL): void;
}
declare var SFSafariViewControllerDelegate: {

	prototype: SFSafariViewControllerDelegate;
};

declare const enum SFSafariViewControllerDismissButtonStyle {

	Done = 0,

	Close = 1,

	Cancel = 2
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
