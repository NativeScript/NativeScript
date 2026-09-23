
/**
 * @since 17.4
 */
interface SFAddToHomeScreenActivityItem extends NSObjectProtocol {

	URL: NSURL;

	iconItemProvider?: NSItemProvider | null;

	title: string;

	/**
	 * @since 18.2
	 */
	getHomeScreenWebAppInfoWithCompletionHandler?(completionHandler: (p1: SFAddToHomeScreenInfo | null) => void): void;

	/**
	 * @since 17.5
	 * @deprecated 100000
	 */
	getWebAppManifestWithCompletionHandler?(completionHandler: (p1: BEWebAppManifest | null) => void): void;
}
declare var SFAddToHomeScreenActivityItem: {

	prototype: SFAddToHomeScreenActivityItem;
};

/**
 * @since 18.2
 */
declare class SFAddToHomeScreenInfo extends NSObject implements NSCopying {

	static alloc(): SFAddToHomeScreenInfo; // inherited from NSObject

	static new(): SFAddToHomeScreenInfo; // inherited from NSObject

	readonly manifest: BEWebAppManifest;

	websiteCookies: NSArray<NSHTTPCookie>;

	constructor(o: { manifest: BEWebAppManifest; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	initWithManifest(manifest: BEWebAppManifest): this;
}

/**
 * @since 11.0
 * @deprecated 12.0
 */
declare const enum SFAuthenticationError {

	CanceledLogin = 1
}

/**
 * @since 11.0
 * @deprecated 12.0
 */
declare var SFAuthenticationErrorDomain: string;

/**
 * @since 11.0
 * @deprecated 12.0
 */
declare class SFAuthenticationSession extends NSObject {

	static alloc(): SFAuthenticationSession; // inherited from NSObject

	static new(): SFAuthenticationSession; // inherited from NSObject

	constructor(o: { URL: NSURL; callbackURLScheme: string | null; completionHandler: (p1: NSURL | null, p2: NSError | null) => void; });

	cancel(): void;

	initWithURLCallbackURLSchemeCompletionHandler(URL: NSURL, callbackURLScheme: string | null, completionHandler: (p1: NSURL | null, p2: NSError | null) => void): this;

	start(): boolean;
}

/**
 * @since 9.0
 * @deprecated 10.0
 */
declare const enum SFContentBlockerErrorCode {

	NoExtensionFound = 1,

	NoAttachmentFound = 2,

	LoadingInterrupted = 3
}

/**
 * @since 9.0
 * @deprecated 10.0
 */
declare var SFContentBlockerErrorDomain: string;

/**
 * @since 9.0
 */
declare class SFContentBlockerManager extends NSObject {

	static alloc(): SFContentBlockerManager; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static getStateOfContentBlockerWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: SFContentBlockerState | null, p2: NSError | null) => void): void;

	static new(): SFContentBlockerManager; // inherited from NSObject

	static reloadContentBlockerWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: NSError | null) => void | null): void;
}

/**
 * @since 10.0
 */
declare class SFContentBlockerState extends NSObject {

	static alloc(): SFContentBlockerState; // inherited from NSObject

	static new(): SFContentBlockerState; // inherited from NSObject

	readonly enabled: boolean;
}

/**
 * @since 10.0
 */
declare const enum SFErrorCode {

	NoExtensionFound = 1,

	NoAttachmentFound = 2,

	LoadingInterrupted = 3,

	InternalError = 4,

	MissingEntitlement = 5,

	MaximumAttemptsExceeded = 6
}

/**
 * @since 10.0
 */
declare var SFErrorDomain: string;

/**
 * @since 15.0
 */
declare var SFExtensionMessageKey: string;

/**
 * @since 17.0
 */
declare var SFExtensionProfileKey: string;

/**
 * @since 26.2
 */
declare class SFSafariExtensionManager extends NSObject {

	static alloc(): SFSafariExtensionManager; // inherited from NSObject

	static getStateOfExtensionWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: SFSafariExtensionState | null, p2: NSError | null) => void): void;

	static new(): SFSafariExtensionManager; // inherited from NSObject
}

/**
 * @since 26.2
 */
declare class SFSafariExtensionState extends NSObject {

	static alloc(): SFSafariExtensionState; // inherited from NSObject

	static new(): SFSafariExtensionState; // inherited from NSObject

	readonly enabled: boolean;
}

/**
 * @since 26.0
 */
declare class SFSafariSettings extends NSObject {

	static alloc(): SFSafariSettings; // inherited from NSObject

	static new(): SFSafariSettings; // inherited from NSObject

	static openExportBrowsingDataSettingsWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 26.2
	 */
	static openExtensionsSettingsForIdentifiersCompletionHandler(extensionIdentifiers: NSArray<string> | string[], completionHandler: (p1: NSError | null) => void | null): void;
}

/**
 * @since 9.0
 */
declare class SFSafariViewController extends UIViewController {

	static alloc(): SFSafariViewController; // inherited from NSObject

	static new(): SFSafariViewController; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	static prewarmConnectionsToURLs(URLs: NSArray<NSURL> | NSURL[]): SFSafariViewControllerPrewarmingToken;

	/**
	 * @since 11.0
	 */
	readonly configuration: SFSafariViewControllerConfiguration;

	delegate: SFSafariViewControllerDelegate | null;

	/**
	 * @since 11.0
	 */
	dismissButtonStyle: SFSafariViewControllerDismissButtonStyle;

	/**
	 * @since 10.0
	 * @deprecated 26.0
	 */
	preferredBarTintColor: UIColor | null;

	/**
	 * @since 10.0
	 * @deprecated 26.0
	 */
	preferredControlTintColor: UIColor | null;

	constructor(o: { URL: NSURL; });

	/**
	 * @since 11.0
	 */
	constructor(o: { URL: NSURL; configuration: SFSafariViewControllerConfiguration; });

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	constructor(o: { URL: NSURL; entersReaderIfAvailable: boolean; });

	initWithURL(URL: NSURL): this;

	/**
	 * @since 11.0
	 */
	initWithURLConfiguration(URL: NSURL, configuration: SFSafariViewControllerConfiguration): this;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	initWithURLEntersReaderIfAvailable(URL: NSURL, entersReaderIfAvailable: boolean): this;
}

/**
 * @since 15.0
 */
declare class SFSafariViewControllerActivityButton extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SFSafariViewControllerActivityButton; // inherited from NSObject

	static new(): SFSafariViewControllerActivityButton; // inherited from NSObject

	readonly extensionIdentifier: string | null;

	readonly templateImage: UIImage | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { templateImage: UIImage; extensionIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTemplateImageExtensionIdentifier(templateImage: UIImage, extensionIdentifier: string): this;
}

/**
 * @since 11.0
 */
declare class SFSafariViewControllerConfiguration extends NSObject implements NSCopying {

	static alloc(): SFSafariViewControllerConfiguration; // inherited from NSObject

	static new(): SFSafariViewControllerConfiguration; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	activityButton: SFSafariViewControllerActivityButton | null;

	barCollapsingEnabled: boolean;

	entersReaderIfAvailable: boolean;

	/**
	 * @since 15.2
	 */
	eventAttribution: UIEventAttribution | null;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 16.0
 */
declare class SFSafariViewControllerDataStore extends NSObject {

	static alloc(): SFSafariViewControllerDataStore; // inherited from NSObject

	static new(): SFSafariViewControllerDataStore; // inherited from NSObject

	static readonly defaultDataStore: SFSafariViewControllerDataStore;

	clearWebsiteDataWithCompletionHandler(completion: () => void | null): void;
}

/**
 * @since 9.0
 */
interface SFSafariViewControllerDelegate extends NSObjectProtocol {

	safariViewControllerActivityItemsForURLTitle?(controller: SFSafariViewController, URL: NSURL, title: string | null): NSArray<UIActivity>;

	safariViewControllerDidCompleteInitialLoad?(controller: SFSafariViewController, didLoadSuccessfully: boolean): void;

	safariViewControllerDidFinish?(controller: SFSafariViewController): void;

	/**
	 * @since 11.0
	 */
	safariViewControllerExcludedActivityTypesForURLTitle?(controller: SFSafariViewController, URL: NSURL, title: string | null): NSArray<string>;

	/**
	 * @since 11.0
	 */
	safariViewControllerInitialLoadDidRedirectToURL?(controller: SFSafariViewController, URL: NSURL): void;

	/**
	 * @since 14.0
	 */
	safariViewControllerWillOpenInBrowser?(controller: SFSafariViewController): void;
}
declare var SFSafariViewControllerDelegate: {

	prototype: SFSafariViewControllerDelegate;
};

/**
 * @since 11.0
 */
declare const enum SFSafariViewControllerDismissButtonStyle {

	Done = 0,

	Close = 1,

	Cancel = 2
}

/**
 * @since 15.0
 */
declare class SFSafariViewControllerPrewarmingToken extends NSObject {

	static alloc(): SFSafariViewControllerPrewarmingToken; // inherited from NSObject

	static new(): SFSafariViewControllerPrewarmingToken; // inherited from NSObject

	invalidate(): void;
}

/**
 * @since 7.0
 */
declare class SSReadingList extends NSObject {

	static alloc(): SSReadingList; // inherited from NSObject

	static defaultReadingList(): SSReadingList | null;

	static new(): SSReadingList; // inherited from NSObject

	static supportsURL(URL: NSURL): boolean;

	addReadingListItemWithURLTitlePreviewTextError(URL: NSURL, title: string | null, previewText: string | null, error?: interop.Reference<NSError>): boolean;
}

/**
 * @since 7.0
 */
declare const enum SSReadingListErrorCode {

	URLSchemeNotAllowed = 1
}

/**
 * @since 7.0
 */
declare var SSReadingListErrorDomain: string;
