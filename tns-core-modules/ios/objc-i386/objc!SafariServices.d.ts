
declare const enum SFContentBlockerErrorCode {

	NoExtensionFound = 1,

	NoAttachmentFound = 2,

	LoadingInterrupted = 3
}

declare var SFContentBlockerErrorDomain: string;

declare class SFContentBlockerManager extends NSObject {

	static alloc(): SFContentBlockerManager; // inherited from NSObject

	static new(): SFContentBlockerManager; // inherited from NSObject

	static reloadContentBlockerWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: NSError) => void): void;
}

declare class SFSafariViewController extends UIViewController {

	static alloc(): SFSafariViewController; // inherited from NSObject

	static new(): SFSafariViewController; // inherited from NSObject

	delegate: SFSafariViewControllerDelegate;

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
