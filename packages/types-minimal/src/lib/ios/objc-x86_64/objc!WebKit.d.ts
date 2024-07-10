
/**
 * @since 13.0
 */
declare var NSReadAccessURLDocumentOption: string;

/**
 * @since 10.0
 */
declare const enum WKAudiovisualMediaTypes {

	None = 0,

	Audio = 1,

	Video = 2,

	All = -1
}

/**
 * @since 8.0
 */
declare class WKBackForwardList extends NSObject {

	static alloc(): WKBackForwardList; // inherited from NSObject

	static new(): WKBackForwardList; // inherited from NSObject

	readonly backItem: WKBackForwardListItem;

	readonly backList: NSArray<WKBackForwardListItem>;

	readonly currentItem: WKBackForwardListItem;

	readonly forwardItem: WKBackForwardListItem;

	readonly forwardList: NSArray<WKBackForwardListItem>;

	itemAtIndex(index: number): WKBackForwardListItem;
}

/**
 * @since 8.0
 */
declare class WKBackForwardListItem extends NSObject {

	static alloc(): WKBackForwardListItem; // inherited from NSObject

	static new(): WKBackForwardListItem; // inherited from NSObject

	readonly URL: NSURL;

	readonly initialURL: NSURL;

	readonly title: string;
}

/**
 * @since 13.0
 */
declare const enum WKContentMode {

	Recommended = 0,

	Mobile = 1,

	Desktop = 2
}

/**
 * @since 11.0
 */
declare class WKContentRuleList extends NSObject {

	static alloc(): WKContentRuleList; // inherited from NSObject

	static new(): WKContentRuleList; // inherited from NSObject

	readonly identifier: string;
}

/**
 * @since 11.0
 */
declare class WKContentRuleListStore extends NSObject {

	static alloc(): WKContentRuleListStore; // inherited from NSObject

	static defaultStore(): WKContentRuleListStore;

	static new(): WKContentRuleListStore; // inherited from NSObject

	static storeWithURL(url: NSURL): WKContentRuleListStore;

	compileContentRuleListForIdentifierEncodedContentRuleListCompletionHandler(identifier: string, encodedContentRuleList: string, completionHandler: (p1: WKContentRuleList, p2: NSError) => void): void;

	getAvailableContentRuleListIdentifiers(completionHandler: (p1: NSArray<string>) => void): void;

	lookUpContentRuleListForIdentifierCompletionHandler(identifier: string, completionHandler: (p1: WKContentRuleList, p2: NSError) => void): void;

	removeContentRuleListForIdentifierCompletionHandler(identifier: string, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 14.0
 */
declare class WKContentWorld extends NSObject {

	static alloc(): WKContentWorld; // inherited from NSObject

	static new(): WKContentWorld; // inherited from NSObject

	static worldWithName(name: string): WKContentWorld;

	readonly name: string;

	static readonly defaultClientWorld: WKContentWorld;

	static readonly pageWorld: WKContentWorld;
}

/**
 * @since 13.0
 */
declare class WKContextMenuElementInfo extends NSObject {

	static alloc(): WKContextMenuElementInfo; // inherited from NSObject

	static new(): WKContextMenuElementInfo; // inherited from NSObject

	readonly linkURL: NSURL;
}

/**
 * @since 17.0
 */
declare const enum WKCookiePolicy {

	Allow = 0,

	Disallow = 1
}

/**
 * @since 10.0
 */
declare const enum WKDataDetectorTypes {

	None = 0,

	PhoneNumber = 1,

	Link = 2,

	Address = 4,

	CalendarEvent = 8,

	TrackingNumber = 16,

	FlightNumber = 32,

	LookupSuggestion = 64,

	All = -1,

	SpotlightSuggestion = 64
}

/**
 * @since 16.0
 */
declare const enum WKDialogResult {

	ShowDefault = 1,

	AskAgain = 2,

	Handled = 3
}

/**
 * @since 14.5
 */
declare class WKDownload extends NSObject implements NSProgressReporting {

	static alloc(): WKDownload; // inherited from NSObject

	static new(): WKDownload; // inherited from NSObject

	delegate: WKDownloadDelegate;

	readonly originalRequest: NSURLRequest;

	readonly webView: WKWebView;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly progress: NSProgress; // inherited from NSProgressReporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	cancel(completionHandler: (p1: NSData) => void): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

interface WKDownloadDelegate extends NSObjectProtocol {

	downloadDecideDestinationUsingResponseSuggestedFilenameCompletionHandler(download: WKDownload, response: NSURLResponse, suggestedFilename: string, completionHandler: (p1: NSURL) => void): void;

	downloadDidFailWithErrorResumeData?(download: WKDownload, error: NSError, resumeData: NSData): void;

	downloadDidFinish?(download: WKDownload): void;

	downloadDidReceiveAuthenticationChallengeCompletionHandler?(download: WKDownload, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;

	downloadWillPerformHTTPRedirectionNewRequestDecisionHandler?(download: WKDownload, response: NSHTTPURLResponse, request: NSURLRequest, decisionHandler: (p1: WKDownloadRedirectPolicy) => void): void;
}
declare var WKDownloadDelegate: {

	prototype: WKDownloadDelegate;
};

/**
 * @since 14.5
 */
declare const enum WKDownloadRedirectPolicy {

	Cancel = 0,

	Allow = 1
}

/**
 * @since 8.0
 */
declare const enum WKErrorCode {

	Unknown = 1,

	WebContentProcessTerminated = 2,

	WebViewInvalidated = 3,

	JavaScriptExceptionOccurred = 4,

	JavaScriptResultTypeIsUnsupported = 5,

	ContentRuleListStoreCompileFailed = 6,

	ContentRuleListStoreLookUpFailed = 7,

	ContentRuleListStoreRemoveFailed = 8,

	ContentRuleListStoreVersionMismatch = 9,

	AttributedStringContentFailedToLoad = 10,

	AttributedStringContentLoadTimedOut = 11,

	JavaScriptInvalidFrameTarget = 12,

	NavigationAppBoundDomain = 13,

	JavaScriptAppBoundDomain = 14,

	DuplicateCredential = 15,

	MalformedCredential = 16,

	CredentialNotFound = 17
}

/**
 * @since 8.0
 */
declare var WKErrorDomain: string;

/**
 * @since 13.4
 */
declare class WKFindConfiguration extends NSObject implements NSCopying {

	static alloc(): WKFindConfiguration; // inherited from NSObject

	static new(): WKFindConfiguration; // inherited from NSObject

	backwards: boolean;

	caseSensitive: boolean;

	wraps: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.4
 */
declare class WKFindResult extends NSObject implements NSCopying {

	static alloc(): WKFindResult; // inherited from NSObject

	static new(): WKFindResult; // inherited from NSObject

	readonly matchFound: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class WKFrameInfo extends NSObject implements NSCopying {

	static alloc(): WKFrameInfo; // inherited from NSObject

	static new(): WKFrameInfo; // inherited from NSObject

	readonly mainFrame: boolean;

	readonly request: NSURLRequest;

	/**
	 * @since 9.0
	 */
	readonly securityOrigin: WKSecurityOrigin;

	/**
	 * @since 11.0
	 */
	readonly webView: WKWebView;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.0
 */
declare const enum WKFullscreenState {

	NotInFullscreen = 0,

	EnteringFullscreen = 1,

	InFullscreen = 2,

	ExitingFullscreen = 3
}

/**
 * @since 11.0
 */
declare class WKHTTPCookieStore extends NSObject {

	static alloc(): WKHTTPCookieStore; // inherited from NSObject

	static new(): WKHTTPCookieStore; // inherited from NSObject

	addObserver(observer: WKHTTPCookieStoreObserver): void;

	deleteCookieCompletionHandler(cookie: NSHTTPCookie, completionHandler: () => void): void;

	getAllCookies(completionHandler: (p1: NSArray<NSHTTPCookie>) => void): void;

	/**
	 * @since 17.0
	 */
	getCookiePolicy(completionHandler: (p1: WKCookiePolicy) => void): void;

	removeObserver(observer: WKHTTPCookieStoreObserver): void;

	setCookieCompletionHandler(cookie: NSHTTPCookie, completionHandler: () => void): void;

	/**
	 * @since 17.0
	 */
	setCookiePolicyCompletionHandler(policy: WKCookiePolicy, completionHandler: () => void): void;
}

/**
 * @since 11.0
 */
interface WKHTTPCookieStoreObserver extends NSObjectProtocol {

	cookiesDidChangeInCookieStore?(cookieStore: WKHTTPCookieStore): void;
}
declare var WKHTTPCookieStoreObserver: {

	prototype: WKHTTPCookieStoreObserver;
};

/**
 * @since 17.0
 */
declare const enum WKInactiveSchedulingPolicy {

	Suspend = 0,

	Throttle = 1,

	None = 2
}

/**
 * @since 15.0
 */
declare const enum WKMediaCaptureState {

	None = 0,

	Active = 1,

	Muted = 2
}

/**
 * @since 15.0
 */
declare const enum WKMediaCaptureType {

	Camera = 0,

	Microphone = 1,

	CameraAndMicrophone = 2
}

/**
 * @since 14.5
 */
declare const enum WKMediaPlaybackState {

	None = 0,

	Playing = 1,

	Paused = 2,

	Suspended = 3
}

/**
 * @since 8.0
 */
declare class WKNavigation extends NSObject {

	static alloc(): WKNavigation; // inherited from NSObject

	static new(): WKNavigation; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly effectiveContentMode: WKContentMode;
}

/**
 * @since 8.0
 */
declare class WKNavigationAction extends NSObject {

	static alloc(): WKNavigationAction; // inherited from NSObject

	static new(): WKNavigationAction; // inherited from NSObject

	readonly navigationType: WKNavigationType;

	readonly request: NSURLRequest;

	/**
	 * @since 14.5
	 */
	readonly shouldPerformDownload: boolean;

	readonly sourceFrame: WKFrameInfo;

	readonly targetFrame: WKFrameInfo;
}

/**
 * @since 8.0
 */
declare const enum WKNavigationActionPolicy {

	Cancel = 0,

	Allow = 1,

	Download = 2
}

interface WKNavigationDelegate extends NSObjectProtocol {

	/**
	 * @since 14.0
	 */
	webViewAuthenticationChallengeShouldAllowDeprecatedTLS?(webView: WKWebView, challenge: NSURLAuthenticationChallenge, decisionHandler: (p1: boolean) => void): void;

	webViewDecidePolicyForNavigationActionDecisionHandler?(webView: WKWebView, navigationAction: WKNavigationAction, decisionHandler: (p1: WKNavigationActionPolicy) => void): void;

	/**
	 * @since 13.0
	 */
	webViewDecidePolicyForNavigationActionPreferencesDecisionHandler?(webView: WKWebView, navigationAction: WKNavigationAction, preferences: WKWebpagePreferences, decisionHandler: (p1: WKNavigationActionPolicy, p2: WKWebpagePreferences) => void): void;

	webViewDecidePolicyForNavigationResponseDecisionHandler?(webView: WKWebView, navigationResponse: WKNavigationResponse, decisionHandler: (p1: WKNavigationResponsePolicy) => void): void;

	webViewDidCommitNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewDidFailNavigationWithError?(webView: WKWebView, navigation: WKNavigation, error: NSError): void;

	webViewDidFailProvisionalNavigationWithError?(webView: WKWebView, navigation: WKNavigation, error: NSError): void;

	webViewDidFinishNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewDidReceiveAuthenticationChallengeCompletionHandler?(webView: WKWebView, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;

	webViewDidReceiveServerRedirectForProvisionalNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewDidStartProvisionalNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	/**
	 * @since 14.5
	 */
	webViewNavigationActionDidBecomeDownload?(webView: WKWebView, navigationAction: WKNavigationAction, download: WKDownload): void;

	/**
	 * @since 14.5
	 */
	webViewNavigationResponseDidBecomeDownload?(webView: WKWebView, navigationResponse: WKNavigationResponse, download: WKDownload): void;

	/**
	 * @since 9.0
	 */
	webViewWebContentProcessDidTerminate?(webView: WKWebView): void;
}
declare var WKNavigationDelegate: {

	prototype: WKNavigationDelegate;
};

/**
 * @since 8.0
 */
declare class WKNavigationResponse extends NSObject {

	static alloc(): WKNavigationResponse; // inherited from NSObject

	static new(): WKNavigationResponse; // inherited from NSObject

	readonly canShowMIMEType: boolean;

	readonly forMainFrame: boolean;

	readonly response: NSURLResponse;
}

/**
 * @since 8.0
 */
declare const enum WKNavigationResponsePolicy {

	Cancel = 0,

	Allow = 1,

	Download = 2
}

/**
 * @since 8.0
 */
declare const enum WKNavigationType {

	LinkActivated = 0,

	FormSubmitted = 1,

	BackForward = 2,

	Reload = 3,

	FormResubmitted = 4,

	Other = -1
}

/**
 * @since 13.4
 */
declare class WKPDFConfiguration extends NSObject implements NSCopying {

	static alloc(): WKPDFConfiguration; // inherited from NSObject

	static new(): WKPDFConfiguration; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	allowTransparentBackground: boolean;

	rect: CGRect;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 15.0
 */
declare const enum WKPermissionDecision {

	Prompt = 0,

	Grant = 1,

	Deny = 2
}

/**
 * @since 8.0
 */
declare class WKPreferences extends NSObject implements NSSecureCoding {

	static alloc(): WKPreferences; // inherited from NSObject

	static new(): WKPreferences; // inherited from NSObject

	/**
	 * @since 15.4
	 */
	elementFullscreenEnabled: boolean;

	/**
	 * @since 13.0
	 */
	fraudulentWebsiteWarningEnabled: boolean;

	/**
	 * @since 17.0
	 */
	inactiveSchedulingPolicy: WKInactiveSchedulingPolicy;

	javaScriptCanOpenWindowsAutomatically: boolean;

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	javaScriptEnabled: boolean;

	minimumFontSize: number;

	/**
	 * @since 16.4
	 */
	shouldPrintBackgrounds: boolean;

	/**
	 * @since 15.4
	 */
	siteSpecificQuirksModeEnabled: boolean;

	/**
	 * @since 14.5
	 */
	textInteractionEnabled: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
interface WKPreviewActionItem extends UIPreviewActionItem {

	identifier: string;
}
declare var WKPreviewActionItem: {

	prototype: WKPreviewActionItem;
};

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare var WKPreviewActionItemIdentifierAddToReadingList: string;

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare var WKPreviewActionItemIdentifierCopy: string;

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare var WKPreviewActionItemIdentifierOpen: string;

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare var WKPreviewActionItemIdentifierShare: string;

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare class WKPreviewElementInfo extends NSObject implements NSCopying {

	static alloc(): WKPreviewElementInfo; // inherited from NSObject

	static new(): WKPreviewElementInfo; // inherited from NSObject

	readonly linkURL: NSURL;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class WKProcessPool extends NSObject implements NSSecureCoding {

	static alloc(): WKProcessPool; // inherited from NSObject

	static new(): WKProcessPool; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class WKScriptMessage extends NSObject {

	static alloc(): WKScriptMessage; // inherited from NSObject

	static new(): WKScriptMessage; // inherited from NSObject

	readonly body: any;

	readonly frameInfo: WKFrameInfo;

	readonly name: string;

	readonly webView: WKWebView;

	/**
	 * @since 14.0
	 */
	readonly world: WKContentWorld;
}

interface WKScriptMessageHandler extends NSObjectProtocol {

	userContentControllerDidReceiveScriptMessage(userContentController: WKUserContentController, message: WKScriptMessage): void;
}
declare var WKScriptMessageHandler: {

	prototype: WKScriptMessageHandler;
};

interface WKScriptMessageHandlerWithReply extends NSObjectProtocol {

	/**
	 * @since 14.0
	 */
	userContentControllerDidReceiveScriptMessageReplyHandler(userContentController: WKUserContentController, message: WKScriptMessage, replyHandler: (p1: any, p2: string) => void): void;
}
declare var WKScriptMessageHandlerWithReply: {

	prototype: WKScriptMessageHandlerWithReply;
};

/**
 * @since 9.0
 */
declare class WKSecurityOrigin extends NSObject {

	static alloc(): WKSecurityOrigin; // inherited from NSObject

	static new(): WKSecurityOrigin; // inherited from NSObject

	readonly host: string;

	readonly port: number;

	readonly protocol: string;
}

/**
 * @since 8.0
 */
declare const enum WKSelectionGranularity {

	Dynamic = 0,

	Character = 1
}

/**
 * @since 11.0
 */
declare class WKSnapshotConfiguration extends NSObject implements NSCopying {

	static alloc(): WKSnapshotConfiguration; // inherited from NSObject

	static new(): WKSnapshotConfiguration; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	afterScreenUpdates: boolean;

	rect: CGRect;

	snapshotWidth: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface WKUIDelegate extends NSObjectProtocol {

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	webViewCommitPreviewingViewController?(webView: WKWebView, previewingViewController: UIViewController): void;

	/**
	 * @since 13.0
	 */
	webViewContextMenuConfigurationForElementCompletionHandler?(webView: WKWebView, elementInfo: WKContextMenuElementInfo, completionHandler: (p1: UIContextMenuConfiguration) => void): void;

	/**
	 * @since 13.0
	 */
	webViewContextMenuDidEndForElement?(webView: WKWebView, elementInfo: WKContextMenuElementInfo): void;

	/**
	 * @since 13.0
	 */
	webViewContextMenuForElementWillCommitWithAnimator?(webView: WKWebView, elementInfo: WKContextMenuElementInfo, animator: UIContextMenuInteractionCommitAnimating): void;

	/**
	 * @since 13.0
	 */
	webViewContextMenuWillPresentForElement?(webView: WKWebView, elementInfo: WKContextMenuElementInfo): void;

	webViewCreateWebViewWithConfigurationForNavigationActionWindowFeatures?(webView: WKWebView, configuration: WKWebViewConfiguration, navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures): WKWebView;

	/**
	 * @since 9.0
	 */
	webViewDidClose?(webView: WKWebView): void;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	webViewPreviewingViewControllerForElementDefaultActions?(webView: WKWebView, elementInfo: WKPreviewElementInfo, previewActions: NSArray<WKPreviewActionItem> | WKPreviewActionItem[]): UIViewController;

	/**
	 * @since 15.0
	 */
	webViewRequestDeviceOrientationAndMotionPermissionForOriginInitiatedByFrameDecisionHandler?(webView: WKWebView, origin: WKSecurityOrigin, frame: WKFrameInfo, decisionHandler: (p1: WKPermissionDecision) => void): void;

	/**
	 * @since 15.0
	 */
	webViewRequestMediaCapturePermissionForOriginInitiatedByFrameTypeDecisionHandler?(webView: WKWebView, origin: WKSecurityOrigin, frame: WKFrameInfo, type: WKMediaCaptureType, decisionHandler: (p1: WKPermissionDecision) => void): void;

	webViewRunJavaScriptAlertPanelWithMessageInitiatedByFrameCompletionHandler?(webView: WKWebView, message: string, frame: WKFrameInfo, completionHandler: () => void): void;

	webViewRunJavaScriptConfirmPanelWithMessageInitiatedByFrameCompletionHandler?(webView: WKWebView, message: string, frame: WKFrameInfo, completionHandler: (p1: boolean) => void): void;

	webViewRunJavaScriptTextInputPanelWithPromptDefaultTextInitiatedByFrameCompletionHandler?(webView: WKWebView, prompt: string, defaultText: string, frame: WKFrameInfo, completionHandler: (p1: string) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	webViewShouldPreviewElement?(webView: WKWebView, elementInfo: WKPreviewElementInfo): boolean;

	/**
	 * @since 13.0
	 */
	webViewShowLockdownModeFirstUseMessageCompletionHandler?(webView: WKWebView, message: string, completionHandler: (p1: WKDialogResult) => void): void;

	/**
	 * @since 16.4
	 */
	webViewWillDismissEditMenuWithAnimator?(webView: WKWebView, animator: UIEditMenuInteractionAnimating): void;

	/**
	 * @since 16.4
	 */
	webViewWillPresentEditMenuWithAnimator?(webView: WKWebView, animator: UIEditMenuInteractionAnimating): void;
}
declare var WKUIDelegate: {

	prototype: WKUIDelegate;
};

/**
 * @since 11.0
 */
interface WKURLSchemeHandler extends NSObjectProtocol {

	webViewStartURLSchemeTask(webView: WKWebView, urlSchemeTask: WKURLSchemeTask): void;

	webViewStopURLSchemeTask(webView: WKWebView, urlSchemeTask: WKURLSchemeTask): void;
}
declare var WKURLSchemeHandler: {

	prototype: WKURLSchemeHandler;
};

/**
 * @since 11.0
 */
interface WKURLSchemeTask extends NSObjectProtocol {

	request: NSURLRequest;

	didFailWithError(error: NSError): void;

	didFinish(): void;

	didReceiveData(data: NSData): void;

	didReceiveResponse(response: NSURLResponse): void;
}
declare var WKURLSchemeTask: {

	prototype: WKURLSchemeTask;
};

/**
 * @since 8.0
 */
declare class WKUserContentController extends NSObject implements NSSecureCoding {

	static alloc(): WKUserContentController; // inherited from NSObject

	static new(): WKUserContentController; // inherited from NSObject

	readonly userScripts: NSArray<WKUserScript>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 11.0
	 */
	addContentRuleList(contentRuleList: WKContentRuleList): void;

	/**
	 * @since 14.0
	 */
	addScriptMessageHandlerContentWorldName(scriptMessageHandler: WKScriptMessageHandler, world: WKContentWorld, name: string): void;

	addScriptMessageHandlerName(scriptMessageHandler: WKScriptMessageHandler, name: string): void;

	/**
	 * @since 14.0
	 */
	addScriptMessageHandlerWithReplyContentWorldName(scriptMessageHandlerWithReply: WKScriptMessageHandlerWithReply, contentWorld: WKContentWorld, name: string): void;

	addUserScript(userScript: WKUserScript): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 11.0
	 */
	removeAllContentRuleLists(): void;

	/**
	 * @since 14.0
	 */
	removeAllScriptMessageHandlers(): void;

	/**
	 * @since 14.0
	 */
	removeAllScriptMessageHandlersFromContentWorld(contentWorld: WKContentWorld): void;

	removeAllUserScripts(): void;

	/**
	 * @since 11.0
	 */
	removeContentRuleList(contentRuleList: WKContentRuleList): void;

	removeScriptMessageHandlerForName(name: string): void;

	/**
	 * @since 14.0
	 */
	removeScriptMessageHandlerForNameContentWorld(name: string, contentWorld: WKContentWorld): void;
}

/**
 * @since 8.0
 */
declare class WKUserScript extends NSObject implements NSCopying {

	static alloc(): WKUserScript; // inherited from NSObject

	static new(): WKUserScript; // inherited from NSObject

	readonly forMainFrameOnly: boolean;

	readonly injectionTime: WKUserScriptInjectionTime;

	readonly source: string;

	constructor(o: { source: string; injectionTime: WKUserScriptInjectionTime; forMainFrameOnly: boolean; });

	/**
	 * @since 14.0
	 */
	constructor(o: { source: string; injectionTime: WKUserScriptInjectionTime; forMainFrameOnly: boolean; inContentWorld: WKContentWorld; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithSourceInjectionTimeForMainFrameOnly(source: string, injectionTime: WKUserScriptInjectionTime, forMainFrameOnly: boolean): this;

	/**
	 * @since 14.0
	 */
	initWithSourceInjectionTimeForMainFrameOnlyInContentWorld(source: string, injectionTime: WKUserScriptInjectionTime, forMainFrameOnly: boolean, contentWorld: WKContentWorld): this;
}

/**
 * @since 8.0
 */
declare const enum WKUserScriptInjectionTime {

	AtDocumentStart = 0,

	AtDocumentEnd = 1
}

/**
 * @since 8.0
 */
declare class WKWebView extends UIView {

	static alloc(): WKWebView; // inherited from NSObject

	static appearance(): WKWebView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): WKWebView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): WKWebView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): WKWebView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): WKWebView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): WKWebView; // inherited from UIAppearance

	/**
	 * @since 11.0
	 */
	static handlesURLScheme(urlScheme: string): boolean;

	static new(): WKWebView; // inherited from NSObject

	UIDelegate: WKUIDelegate;

	readonly URL: NSURL;

	allowsBackForwardNavigationGestures: boolean;

	/**
	 * @since 9.0
	 */
	allowsLinkPreview: boolean;

	readonly backForwardList: WKBackForwardList;

	/**
	 * @since 15.0
	 */
	readonly cameraCaptureState: WKMediaCaptureState;

	readonly canGoBack: boolean;

	readonly canGoForward: boolean;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	readonly certificateChain: NSArray<any>;

	readonly configuration: WKWebViewConfiguration;

	/**
	 * @since 9.0
	 */
	customUserAgent: string;

	readonly estimatedProgress: number;

	/**
	 * @since 16.0
	 */
	readonly findInteraction: UIFindInteraction;

	/**
	 * @since 16.0
	 */
	findInteractionEnabled: boolean;

	/**
	 * @since 16.0
	 */
	readonly fullscreenState: WKFullscreenState;

	readonly hasOnlySecureContent: boolean;

	/**
	 * @since 16.4
	 */
	inspectable: boolean;

	/**
	 * @since 15.0
	 */
	interactionState: any;

	readonly loading: boolean;

	/**
	 * @since 15.5
	 */
	readonly maximumViewportInset: UIEdgeInsets;

	/**
	 * @since 14.0
	 */
	mediaType: string;

	/**
	 * @since 15.0
	 */
	readonly microphoneCaptureState: WKMediaCaptureState;

	/**
	 * @since 15.5
	 */
	readonly minimumViewportInset: UIEdgeInsets;

	navigationDelegate: WKNavigationDelegate;

	/**
	 * @since 14.0
	 */
	pageZoom: number;

	readonly scrollView: UIScrollView;

	/**
	 * @since 10.0
	 */
	readonly serverTrust: any;

	/**
	 * @since 15.0
	 */
	readonly themeColor: UIColor;

	readonly title: string;

	/**
	 * @since 15.0
	 */
	underPageBackgroundColor: UIColor;

	/**
	 * @since 18.0
	 */
	readonly writingToolsActive: boolean;

	constructor(o: { frame: CGRect; configuration: WKWebViewConfiguration; });

	/**
	 * @since 14.0
	 */
	callAsyncJavaScriptArgumentsInFrameInContentWorldCompletionHandler(functionBody: string, _arguments: NSDictionary<string, any>, frame: WKFrameInfo, contentWorld: WKContentWorld, completionHandler: (p1: any, p2: NSError) => void): void;

	/**
	 * @since 14.5
	 * @deprecated 15.0
	 */
	closeAllMediaPresentations(): void;

	/**
	 * @since 15.0
	 */
	closeAllMediaPresentationsWithCompletionHandler(completionHandler: () => void): void;

	/**
	 * @since 14.0
	 */
	createPDFWithConfigurationCompletionHandler(pdfConfiguration: WKPDFConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	createWebArchiveDataWithCompletionHandler(completionHandler: (p1: NSData, p2: NSError) => void): void;

	evaluateJavaScriptCompletionHandler(javaScriptString: string, completionHandler: (p1: any, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	evaluateJavaScriptInFrameInContentWorldCompletionHandler(javaScriptString: string, frame: WKFrameInfo, contentWorld: WKContentWorld, completionHandler: (p1: any, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	findStringWithConfigurationCompletionHandler(string: string, configuration: WKFindConfiguration, completionHandler: (p1: WKFindResult) => void): void;

	goBack(): WKNavigation;

	goForward(): WKNavigation;

	goToBackForwardListItem(item: WKBackForwardListItem): WKNavigation;

	initWithFrameConfiguration(frame: CGRect, configuration: WKWebViewConfiguration): this;

	/**
	 * @since 9.0
	 */
	loadDataMIMETypeCharacterEncodingNameBaseURL(data: NSData, MIMEType: string, characterEncodingName: string, baseURL: NSURL): WKNavigation;

	/**
	 * @since 15.0
	 */
	loadFileRequestAllowingReadAccessToURL(request: NSURLRequest, readAccessURL: NSURL): WKNavigation;

	/**
	 * @since 9.0
	 */
	loadFileURLAllowingReadAccessToURL(URL: NSURL, readAccessURL: NSURL): WKNavigation;

	loadHTMLStringBaseURL(string: string, baseURL: NSURL): WKNavigation;

	loadRequest(request: NSURLRequest): WKNavigation;

	/**
	 * @since 15.0
	 */
	loadSimulatedRequestResponseHTMLString(request: NSURLRequest, string: string): WKNavigation;

	/**
	 * @since 15.0
	 */
	loadSimulatedRequestResponseResponseData(request: NSURLRequest, response: NSURLResponse, data: NSData): WKNavigation;

	/**
	 * @since 15.0
	 * @deprecated 15.0
	 */
	loadSimulatedRequestWithResponseHTMLString(request: NSURLRequest, string: string): WKNavigation;

	/**
	 * @since 15.0
	 * @deprecated 15.0
	 */
	loadSimulatedRequestWithResponseResponseData(request: NSURLRequest, response: NSURLResponse, data: NSData): WKNavigation;

	/**
	 * @since 14.5
	 * @deprecated 15.0
	 */
	pauseAllMediaPlayback(completionHandler: () => void): void;

	/**
	 * @since 15.0
	 */
	pauseAllMediaPlaybackWithCompletionHandler(completionHandler: () => void): void;

	reload(): WKNavigation;

	reloadFromOrigin(): WKNavigation;

	/**
	 * @since 14.5
	 * @deprecated 15.0
	 */
	requestMediaPlaybackState(completionHandler: (p1: WKMediaPlaybackState) => void): void;

	/**
	 * @since 15.0
	 */
	requestMediaPlaybackStateWithCompletionHandler(completionHandler: (p1: WKMediaPlaybackState) => void): void;

	/**
	 * @since 14.5
	 * @deprecated 15.0
	 */
	resumeAllMediaPlayback(completionHandler: () => void): void;

	/**
	 * @since 14.5
	 */
	resumeDownloadFromResumeDataCompletionHandler(resumeData: NSData, completionHandler: (p1: WKDownload) => void): void;

	/**
	 * @since 15.0
	 */
	setAllMediaPlaybackSuspendedCompletionHandler(suspended: boolean, completionHandler: () => void): void;

	/**
	 * @since 15.0
	 */
	setCameraCaptureStateCompletionHandler(state: WKMediaCaptureState, completionHandler: () => void): void;

	/**
	 * @since 15.0
	 */
	setMicrophoneCaptureStateCompletionHandler(state: WKMediaCaptureState, completionHandler: () => void): void;

	/**
	 * @since 15.5
	 */
	setMinimumViewportInsetMaximumViewportInset(minimumViewportInset: UIEdgeInsets, maximumViewportInset: UIEdgeInsets): void;

	/**
	 * @since 14.5
	 */
	startDownloadUsingRequestCompletionHandler(request: NSURLRequest, completionHandler: (p1: WKDownload) => void): void;

	stopLoading(): void;

	/**
	 * @since 14.5
	 * @deprecated 15.0
	 */
	suspendAllMediaPlayback(completionHandler: () => void): void;

	/**
	 * @since 11.0
	 */
	takeSnapshotWithConfigurationCompletionHandler(snapshotConfiguration: WKSnapshotConfiguration, completionHandler: (p1: UIImage, p2: NSError) => void): void;
}

/**
 * @since 8.0
 */
declare class WKWebViewConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): WKWebViewConfiguration; // inherited from NSObject

	static new(): WKWebViewConfiguration; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	allowsAirPlayForMediaPlayback: boolean;

	allowsInlineMediaPlayback: boolean;

	/**
	 * @since 17.0
	 */
	allowsInlinePredictions: boolean;

	/**
	 * @since 9.0
	 */
	allowsPictureInPictureMediaPlayback: boolean;

	/**
	 * @since 9.0
	 */
	applicationNameForUserAgent: string;

	/**
	 * @since 10.0
	 */
	dataDetectorTypes: WKDataDetectorTypes;

	/**
	 * @since 13.0
	 */
	defaultWebpagePreferences: WKWebpagePreferences;

	/**
	 * @since 10.0
	 */
	ignoresViewportScaleLimits: boolean;

	/**
	 * @since 14.0
	 */
	limitsNavigationsToAppBoundDomains: boolean;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	mediaPlaybackAllowsAirPlay: boolean;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	mediaPlaybackRequiresUserAction: boolean;

	/**
	 * @since 10.0
	 */
	mediaTypesRequiringUserActionForPlayback: WKAudiovisualMediaTypes;

	preferences: WKPreferences;

	processPool: WKProcessPool;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	requiresUserActionForMediaPlayback: boolean;

	selectionGranularity: WKSelectionGranularity;

	/**
	 * @since 18.0
	 */
	supportsAdaptiveImageGlyph: boolean;

	suppressesIncrementalRendering: boolean;

	/**
	 * @since 14.5
	 */
	upgradeKnownHostsToHTTPS: boolean;

	userContentController: WKUserContentController;

	/**
	 * @since 9.0
	 */
	websiteDataStore: WKWebsiteDataStore;

	/**
	 * @since 18.0
	 */
	writingToolsBehavior: UIWritingToolsBehavior;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 11.0
	 */
	setURLSchemeHandlerForURLScheme(urlSchemeHandler: WKURLSchemeHandler, urlScheme: string): void;

	/**
	 * @since 11.0
	 */
	urlSchemeHandlerForURLScheme(urlScheme: string): WKURLSchemeHandler;
}

/**
 * @since 13.0
 */
declare class WKWebpagePreferences extends NSObject {

	static alloc(): WKWebpagePreferences; // inherited from NSObject

	static new(): WKWebpagePreferences; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	allowsContentJavaScript: boolean;

	/**
	 * @since 16.0
	 */
	lockdownModeEnabled: boolean;

	/**
	 * @since 13.0
	 */
	preferredContentMode: WKContentMode;
}

/**
 * @since 9.0
 */
declare class WKWebsiteDataRecord extends NSObject {

	static alloc(): WKWebsiteDataRecord; // inherited from NSObject

	static new(): WKWebsiteDataRecord; // inherited from NSObject

	readonly dataTypes: NSSet<string>;

	readonly displayName: string;
}

/**
 * @since 9.0
 */
declare class WKWebsiteDataStore extends NSObject implements NSSecureCoding {

	static allWebsiteDataTypes(): NSSet<string>;

	static alloc(): WKWebsiteDataStore; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static dataStoreForIdentifier(identifier: NSUUID): WKWebsiteDataStore;

	static defaultDataStore(): WKWebsiteDataStore;

	/**
	 * @since 17.0
	 */
	static fetchAllDataStoreIdentifiers(completionHandler: (p1: NSArray<NSUUID>) => void): void;

	static new(): WKWebsiteDataStore; // inherited from NSObject

	static nonPersistentDataStore(): WKWebsiteDataStore;

	/**
	 * @since 17.0
	 */
	static removeDataStoreForIdentifierCompletionHandler(identifier: NSUUID, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	readonly httpCookieStore: WKHTTPCookieStore;

	/**
	 * @since 17.0
	 */
	readonly identifier: NSUUID;

	readonly persistent: boolean;

	/**
	 * @since 17.0
	 */
	proxyConfigurations: NSArray<NSObject & OS_nw_proxy_config>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	fetchDataRecordsOfTypesCompletionHandler(dataTypes: NSSet<string>, completionHandler: (p1: NSArray<WKWebsiteDataRecord>) => void): void;

	initWithCoder(coder: NSCoder): this;

	removeDataOfTypesForDataRecordsCompletionHandler(dataTypes: NSSet<string>, dataRecords: NSArray<WKWebsiteDataRecord> | WKWebsiteDataRecord[], completionHandler: () => void): void;

	removeDataOfTypesModifiedSinceCompletionHandler(dataTypes: NSSet<string>, date: Date, completionHandler: () => void): void;
}

/**
 * @since 9.0
 */
declare var WKWebsiteDataTypeCookies: string;

/**
 * @since 9.0
 */
declare var WKWebsiteDataTypeDiskCache: string;

/**
 * @since 11.3
 */
declare var WKWebsiteDataTypeFetchCache: string;

/**
 * @since 16.0
 */
declare var WKWebsiteDataTypeFileSystem: string;

/**
 * @since 17.0
 */
declare var WKWebsiteDataTypeHashSalt: string;

/**
 * @since 9.0
 */
declare var WKWebsiteDataTypeIndexedDBDatabases: string;

/**
 * @since 9.0
 */
declare var WKWebsiteDataTypeLocalStorage: string;

/**
 * @since 17.0
 */
declare var WKWebsiteDataTypeMediaKeys: string;

/**
 * @since 9.0
 */
declare var WKWebsiteDataTypeMemoryCache: string;

/**
 * @since 9.0
 */
declare var WKWebsiteDataTypeOfflineWebApplicationCache: string;

/**
 * @since 17.0
 */
declare var WKWebsiteDataTypeSearchFieldRecentSearches: string;

/**
 * @since 11.3
 */
declare var WKWebsiteDataTypeServiceWorkerRegistrations: string;

/**
 * @since 9.0
 */
declare var WKWebsiteDataTypeSessionStorage: string;

/**
 * @since 9.0
 */
declare var WKWebsiteDataTypeWebSQLDatabases: string;

/**
 * @since 8.0
 */
declare class WKWindowFeatures extends NSObject {

	static alloc(): WKWindowFeatures; // inherited from NSObject

	static new(): WKWindowFeatures; // inherited from NSObject

	readonly allowsResizing: number;

	readonly height: number;

	readonly menuBarVisibility: number;

	readonly statusBarVisibility: number;

	readonly toolbarsVisibility: number;

	readonly width: number;

	readonly x: number;

	readonly y: number;
}
