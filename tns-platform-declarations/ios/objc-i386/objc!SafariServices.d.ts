
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

	delegate: SFSafariViewControllerDelegate;

	preferredBarTintColor: UIColor;

	preferredControlTintColor: UIColor;

	constructor(o: { URL: NSURL; });

	constructor(o: { URL: NSURL; entersReaderIfAvailable: boolean; });

	initWithURL(URL: NSURL): this;

	initWithURLEntersReaderIfAvailable(URL: NSURL, entersReaderIfAvailable: boolean): this;
}

interface SFSafariViewControllerDelegate extends NSObjectProtocol {

	safariViewControllerActivityItemsForURLTitle?(controller: SFSafariViewController, URL: NSURL, title: string): NSArray<UIActivity>;

	safariViewControllerDidCompleteInitialLoad?(controller: SFSafariViewController, didLoadSuccessfully: boolean): void;

	safariViewControllerDidFinish?(controller: SFSafariViewController): void;
}
declare var SFSafariViewControllerDelegate: {

	prototype: SFSafariViewControllerDelegate;
};

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
