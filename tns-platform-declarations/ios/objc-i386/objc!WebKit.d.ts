
declare const enum WKAudiovisualMediaTypes {

	None = 0,

	Audio = 1,

	Video = 2,

	All = 4294967295
}

declare class WKBackForwardList extends NSObject {

	static alloc(): WKBackForwardList; // inherited from NSObject

	static new(): WKBackForwardList; // inherited from NSObject

	/* readonly */ backItem: WKBackForwardListItem;

	/* readonly */ backList: NSArray<WKBackForwardListItem>;

	/* readonly */ currentItem: WKBackForwardListItem;

	/* readonly */ forwardItem: WKBackForwardListItem;

	/* readonly */ forwardList: NSArray<WKBackForwardListItem>;

	itemAtIndex(index: number): WKBackForwardListItem;
}

declare class WKBackForwardListItem extends NSObject {

	static alloc(): WKBackForwardListItem; // inherited from NSObject

	static new(): WKBackForwardListItem; // inherited from NSObject

	/* readonly */ URL: NSURL;

	/* readonly */ initialURL: NSURL;

	/* readonly */ title: string;
}

declare const enum WKDataDetectorTypes {

	None = 0,

	PhoneNumber = 1,

	Link = 2,

	Address = 4,

	CalendarEvent = 8,

	TrackingNumber = 16,

	FlightNumber = 32,

	LookupSuggestion = 64,

	All = 4294967295,

	SpotlightSuggestion = 64
}

declare const enum WKErrorCode {

	Unknown = 1,

	WebContentProcessTerminated = 2,

	WebViewInvalidated = 3,

	JavaScriptExceptionOccurred = 4,

	JavaScriptResultTypeIsUnsupported = 5
}

declare var WKErrorDomain: string;

declare class WKFrameInfo extends NSObject implements NSCopying {

	static alloc(): WKFrameInfo; // inherited from NSObject

	static new(): WKFrameInfo; // inherited from NSObject

	/* readonly */ mainFrame: boolean;

	/* readonly */ request: NSURLRequest;

	/* readonly */ securityOrigin: WKSecurityOrigin;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class WKNavigation extends NSObject {

	static alloc(): WKNavigation; // inherited from NSObject

	static new(): WKNavigation; // inherited from NSObject
}

declare class WKNavigationAction extends NSObject {

	static alloc(): WKNavigationAction; // inherited from NSObject

	static new(): WKNavigationAction; // inherited from NSObject

	/* readonly */ navigationType: WKNavigationType;

	/* readonly */ request: NSURLRequest;

	/* readonly */ sourceFrame: WKFrameInfo;

	/* readonly */ targetFrame: WKFrameInfo;
}

declare const enum WKNavigationActionPolicy {

	Cancel = 0,

	Allow = 1
}

interface WKNavigationDelegate extends NSObjectProtocol {

	webViewDecidePolicyForNavigationActionDecisionHandler?(webView: WKWebView, navigationAction: WKNavigationAction, decisionHandler: (p1: WKNavigationActionPolicy) => void): void;

	webViewDecidePolicyForNavigationResponseDecisionHandler?(webView: WKWebView, navigationResponse: WKNavigationResponse, decisionHandler: (p1: WKNavigationResponsePolicy) => void): void;

	webViewDidCommitNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewDidFailNavigationWithError?(webView: WKWebView, navigation: WKNavigation, error: NSError): void;

	webViewDidFailProvisionalNavigationWithError?(webView: WKWebView, navigation: WKNavigation, error: NSError): void;

	webViewDidFinishNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewDidReceiveAuthenticationChallengeCompletionHandler?(webView: WKWebView, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;

	webViewDidReceiveServerRedirectForProvisionalNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewDidStartProvisionalNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewWebContentProcessDidTerminate?(webView: WKWebView): void;
}
declare var WKNavigationDelegate: {

	prototype: WKNavigationDelegate;
};

declare class WKNavigationResponse extends NSObject {

	static alloc(): WKNavigationResponse; // inherited from NSObject

	static new(): WKNavigationResponse; // inherited from NSObject

	/* readonly */ canShowMIMEType: boolean;

	/* readonly */ forMainFrame: boolean;

	/* readonly */ response: NSURLResponse;
}

declare const enum WKNavigationResponsePolicy {

	Cancel = 0,

	Allow = 1
}

declare const enum WKNavigationType {

	LinkActivated = 0,

	FormSubmitted = 1,

	BackForward = 2,

	Reload = 3,

	FormResubmitted = 4,

	Other = -1
}

declare class WKPreferences extends NSObject implements NSCoding {

	static alloc(): WKPreferences; // inherited from NSObject

	static new(): WKPreferences; // inherited from NSObject

	javaScriptCanOpenWindowsAutomatically: boolean;

	javaScriptEnabled: boolean;

	minimumFontSize: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

interface WKPreviewActionItem extends UIPreviewActionItem {

	identifier: string;
}
declare var WKPreviewActionItem: {

	prototype: WKPreviewActionItem;
};

declare var WKPreviewActionItemIdentifierAddToReadingList: string;

declare var WKPreviewActionItemIdentifierCopy: string;

declare var WKPreviewActionItemIdentifierOpen: string;

declare var WKPreviewActionItemIdentifierShare: string;

declare class WKPreviewElementInfo extends NSObject implements NSCopying {

	static alloc(): WKPreviewElementInfo; // inherited from NSObject

	static new(): WKPreviewElementInfo; // inherited from NSObject

	/* readonly */ linkURL: NSURL;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class WKProcessPool extends NSObject implements NSCoding {

	static alloc(): WKProcessPool; // inherited from NSObject

	static new(): WKProcessPool; // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class WKScriptMessage extends NSObject {

	static alloc(): WKScriptMessage; // inherited from NSObject

	static new(): WKScriptMessage; // inherited from NSObject

	/* readonly */ body: any;

	/* readonly */ frameInfo: WKFrameInfo;

	/* readonly */ name: string;

	/* readonly */ webView: WKWebView;
}

interface WKScriptMessageHandler extends NSObjectProtocol {

	userContentControllerDidReceiveScriptMessage(userContentController: WKUserContentController, message: WKScriptMessage): void;
}
declare var WKScriptMessageHandler: {

	prototype: WKScriptMessageHandler;
};

declare class WKSecurityOrigin extends NSObject {

	static alloc(): WKSecurityOrigin; // inherited from NSObject

	static new(): WKSecurityOrigin; // inherited from NSObject

	/* readonly */ host: string;

	/* readonly */ port: number;

	/* readonly */ protocol: string;
}

declare const enum WKSelectionGranularity {

	Dynamic = 0,

	Character = 1
}

interface WKUIDelegate extends NSObjectProtocol {

	webViewCommitPreviewingViewController?(webView: WKWebView, previewingViewController: UIViewController): void;

	webViewCreateWebViewWithConfigurationForNavigationActionWindowFeatures?(webView: WKWebView, configuration: WKWebViewConfiguration, navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures): WKWebView;

	webViewDidClose?(webView: WKWebView): void;

	webViewPreviewingViewControllerForElementDefaultActions?(webView: WKWebView, elementInfo: WKPreviewElementInfo, previewActions: NSArray<WKPreviewActionItem>): UIViewController;

	webViewRunJavaScriptAlertPanelWithMessageInitiatedByFrameCompletionHandler?(webView: WKWebView, message: string, frame: WKFrameInfo, completionHandler: () => void): void;

	webViewRunJavaScriptConfirmPanelWithMessageInitiatedByFrameCompletionHandler?(webView: WKWebView, message: string, frame: WKFrameInfo, completionHandler: (p1: boolean) => void): void;

	webViewRunJavaScriptTextInputPanelWithPromptDefaultTextInitiatedByFrameCompletionHandler?(webView: WKWebView, prompt: string, defaultText: string, frame: WKFrameInfo, completionHandler: (p1: string) => void): void;

	webViewShouldPreviewElement?(webView: WKWebView, elementInfo: WKPreviewElementInfo): boolean;
}
declare var WKUIDelegate: {

	prototype: WKUIDelegate;
};

declare class WKUserContentController extends NSObject implements NSCoding {

	static alloc(): WKUserContentController; // inherited from NSObject

	static new(): WKUserContentController; // inherited from NSObject

	/* readonly */ userScripts: NSArray<WKUserScript>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addScriptMessageHandlerName(scriptMessageHandler: WKScriptMessageHandler, name: string): void;

	addUserScript(userScript: WKUserScript): void;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	removeAllUserScripts(): void;

	removeScriptMessageHandlerForName(name: string): void;
}

declare class WKUserScript extends NSObject implements NSCopying {

	static alloc(): WKUserScript; // inherited from NSObject

	static new(): WKUserScript; // inherited from NSObject

	/* readonly */ forMainFrameOnly: boolean;

	/* readonly */ injectionTime: WKUserScriptInjectionTime;

	/* readonly */ source: string;

	constructor(o: { source: string; injectionTime: WKUserScriptInjectionTime; forMainFrameOnly: boolean; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithSourceInjectionTimeForMainFrameOnly(source: string, injectionTime: WKUserScriptInjectionTime, forMainFrameOnly: boolean): this;
}

declare const enum WKUserScriptInjectionTime {

	AtDocumentStart = 0,

	AtDocumentEnd = 1
}

declare class WKWebView extends UIView {

	static alloc(): WKWebView; // inherited from NSObject

	static appearance(): WKWebView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): WKWebView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): WKWebView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): WKWebView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): WKWebView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): WKWebView; // inherited from UIAppearance

	static new(): WKWebView; // inherited from NSObject

	UIDelegate: WKUIDelegate;

	/* readonly */ URL: NSURL;

	allowsBackForwardNavigationGestures: boolean;

	allowsLinkPreview: boolean;

	/* readonly */ backForwardList: WKBackForwardList;

	/* readonly */ canGoBack: boolean;

	/* readonly */ canGoForward: boolean;

	/* readonly */ certificateChain: NSArray<any>;

	/* readonly */ configuration: WKWebViewConfiguration;

	customUserAgent: string;

	/* readonly */ estimatedProgress: number;

	/* readonly */ hasOnlySecureContent: boolean;

	/* readonly */ loading: boolean;

	navigationDelegate: WKNavigationDelegate;

	/* readonly */ scrollView: UIScrollView;

	/* readonly */ serverTrust: any;

	/* readonly */ title: string;

	constructor(o: { frame: CGRect; configuration: WKWebViewConfiguration; });

	evaluateJavaScriptCompletionHandler(javaScriptString: string, completionHandler: (p1: any, p2: NSError) => void): void;

	goBack(): WKNavigation;

	goForward(): WKNavigation;

	goToBackForwardListItem(item: WKBackForwardListItem): WKNavigation;

	initWithFrameConfiguration(frame: CGRect, configuration: WKWebViewConfiguration): this;

	loadDataMIMETypeCharacterEncodingNameBaseURL(data: NSData, MIMEType: string, characterEncodingName: string, baseURL: NSURL): WKNavigation;

	loadFileURLAllowingReadAccessToURL(URL: NSURL, readAccessURL: NSURL): WKNavigation;

	loadHTMLStringBaseURL(string: string, baseURL: NSURL): WKNavigation;

	loadRequest(request: NSURLRequest): WKNavigation;

	reload(): WKNavigation;

	reloadFromOrigin(): WKNavigation;

	stopLoading(): void;
}

declare class WKWebViewConfiguration extends NSObject implements NSCoding, NSCopying {

	static alloc(): WKWebViewConfiguration; // inherited from NSObject

	static new(): WKWebViewConfiguration; // inherited from NSObject

	allowsAirPlayForMediaPlayback: boolean;

	allowsInlineMediaPlayback: boolean;

	allowsPictureInPictureMediaPlayback: boolean;

	applicationNameForUserAgent: string;

	dataDetectorTypes: WKDataDetectorTypes;

	ignoresViewportScaleLimits: boolean;

	mediaPlaybackAllowsAirPlay: boolean;

	mediaPlaybackRequiresUserAction: boolean;

	mediaTypesRequiringUserActionForPlayback: WKAudiovisualMediaTypes;

	preferences: WKPreferences;

	processPool: WKProcessPool;

	requiresUserActionForMediaPlayback: boolean;

	selectionGranularity: WKSelectionGranularity;

	suppressesIncrementalRendering: boolean;

	userContentController: WKUserContentController;

	websiteDataStore: WKWebsiteDataStore;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class WKWebsiteDataRecord extends NSObject {

	static alloc(): WKWebsiteDataRecord; // inherited from NSObject

	static new(): WKWebsiteDataRecord; // inherited from NSObject

	/* readonly */ dataTypes: NSSet<string>;

	/* readonly */ displayName: string;
}

declare class WKWebsiteDataStore extends NSObject implements NSCoding {

	static allWebsiteDataTypes(): NSSet<string>;

	static alloc(): WKWebsiteDataStore; // inherited from NSObject

	static defaultDataStore(): WKWebsiteDataStore;

	static new(): WKWebsiteDataStore; // inherited from NSObject

	static nonPersistentDataStore(): WKWebsiteDataStore;

	/* readonly */ persistent: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	fetchDataRecordsOfTypesCompletionHandler(dataTypes: NSSet<string>, completionHandler: (p1: NSArray<WKWebsiteDataRecord>) => void): void;

	initWithCoder(aDecoder: NSCoder): this;

	removeDataOfTypesForDataRecordsCompletionHandler(dataTypes: NSSet<string>, dataRecords: NSArray<WKWebsiteDataRecord>, completionHandler: () => void): void;

	removeDataOfTypesModifiedSinceCompletionHandler(websiteDataTypes: NSSet<string>, date: Date, completionHandler: () => void): void;
}

declare var WKWebsiteDataTypeCookies: string;

declare var WKWebsiteDataTypeDiskCache: string;

declare var WKWebsiteDataTypeIndexedDBDatabases: string;

declare var WKWebsiteDataTypeLocalStorage: string;

declare var WKWebsiteDataTypeMemoryCache: string;

declare var WKWebsiteDataTypeOfflineWebApplicationCache: string;

declare var WKWebsiteDataTypeSessionStorage: string;

declare var WKWebsiteDataTypeWebSQLDatabases: string;

declare class WKWindowFeatures extends NSObject {

	static alloc(): WKWindowFeatures; // inherited from NSObject

	static new(): WKWindowFeatures; // inherited from NSObject

	/* readonly */ allowsResizing: number;

	/* readonly */ height: number;

	/* readonly */ menuBarVisibility: number;

	/* readonly */ statusBarVisibility: number;

	/* readonly */ toolbarsVisibility: number;

	/* readonly */ width: number;

	/* readonly */ x: number;

	/* readonly */ y: number;
}
