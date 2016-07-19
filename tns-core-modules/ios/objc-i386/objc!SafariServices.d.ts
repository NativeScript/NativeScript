
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

	constructor(); // inherited from NSObject

	self(): SFContentBlockerManager; // inherited from NSObjectProtocol
}

declare class SFSafariViewController extends UIViewController {

	delegate: SFSafariViewControllerDelegate;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	constructor(o: { URL: NSURL; });

	constructor(o: { URL: NSURL; entersReaderIfAvailable: boolean; });

	self(): SFSafariViewController; // inherited from NSObjectProtocol
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

	constructor(); // inherited from NSObject

	addReadingListItemWithURLTitlePreviewTextError(URL: NSURL, title: string, previewText: string): boolean;

	self(): SSReadingList; // inherited from NSObjectProtocol
}

declare const enum SSReadingListErrorCode {

	URLSchemeNotAllowed = 1
}

declare var SSReadingListErrorDomain: string;
