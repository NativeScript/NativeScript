
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

	/**
	 * @since 18.2
	 */
	readonly originatingFrame: WKFrameInfo;

	/**
	 * @since 18.2
	 */
	readonly userInitiated: boolean;

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

	/**
	 * @since 18.2
	 */
	downloadDecidePlaceholderPolicy?(download: WKDownload, completionHandler: (p1: WKDownloadPlaceholderPolicy, p2: NSURL) => void): void;

	downloadDidFailWithErrorResumeData?(download: WKDownload, error: NSError, resumeData: NSData): void;

	downloadDidFinish?(download: WKDownload): void;

	downloadDidReceiveAuthenticationChallengeCompletionHandler?(download: WKDownload, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;

	/**
	 * @since 18.2
	 */
	downloadDidReceiveFinalURL?(download: WKDownload, url: NSURL): void;

	/**
	 * @since 18.2
	 */
	downloadDidReceivePlaceholderURLCompletionHandler?(download: WKDownload, url: NSURL, completionHandler: () => void): void;

	downloadWillPerformHTTPRedirectionNewRequestDecisionHandler?(download: WKDownload, response: NSHTTPURLResponse, request: NSURLRequest, decisionHandler: (p1: WKDownloadRedirectPolicy) => void): void;
}
declare var WKDownloadDelegate: {

	prototype: WKDownloadDelegate;
};

/**
 * @since 18.2
 */
declare const enum WKDownloadPlaceholderPolicy {

	Disable = 0,

	Enable = 1
}

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

	/**
	 * @since 26.0
	 */
	setCookiesCompletionHandler(cookies: NSArray<NSHTTPCookie> | NSHTTPCookie[], completionHandler: () => void): void;
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

	/**
	 * @since 18.4
	 */
	readonly buttonNumber: UIEventButtonMask;

	/**
	 * @since 26.0
	 */
	readonly isContentRuleListRedirect: boolean;

	/**
	 * @since 18.4
	 */
	readonly modifierFlags: UIKeyModifierFlags;

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
	 * @since 26.0
	 */
	webViewShouldGoToBackForwardListItemWillUseInstantBackCompletionHandler?(webView: WKWebView, backForwardListItem: WKBackForwardListItem, willUseInstantBack: boolean, completionHandler: (p1: boolean) => void): void;

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
 * @since 18.4
 */
declare class WKOpenPanelParameters extends NSObject {

	static alloc(): WKOpenPanelParameters; // inherited from NSObject

	static new(): WKOpenPanelParameters; // inherited from NSObject

	/**
	 * @since 18.4
	 */
	readonly allowsDirectories: boolean;

	readonly allowsMultipleSelection: boolean;
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
 * @deprecated 15.0
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
 * @deprecated 11.0
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
	 * @since 26.0
	 */
	webViewInsertInputSuggestion?(webView: WKWebView, inputSuggestion: UIInputSuggestion): void;

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
	 * @since 18.4
	 */
	webViewRunOpenPanelWithParametersInitiatedByFrameCompletionHandler?(webView: WKWebView, parameters: WKOpenPanelParameters, frame: WKFrameInfo, completionHandler: (p1: NSArray<NSURL>) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	webViewShouldPreviewElement?(webView: WKWebView, elementInfo: WKPreviewElementInfo): boolean;

	/**
	 * @since 16.0
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
 * @since 18.4
 */
declare class WKWebExtension extends NSObject {

	static alloc(): WKWebExtension; // inherited from NSObject

	static extensionWithAppExtensionBundleCompletionHandler(appExtensionBundle: NSBundle, completionHandler: (p1: WKWebExtension, p2: NSError) => void): void;

	static extensionWithResourceBaseURLCompletionHandler(resourceBaseURL: NSURL, completionHandler: (p1: WKWebExtension, p2: NSError) => void): void;

	static new(): WKWebExtension; // inherited from NSObject

	readonly allRequestedMatchPatterns: NSSet<WKWebExtensionMatchPattern>;

	readonly defaultLocale: NSLocale;

	readonly displayActionLabel: string;

	readonly displayDescription: string;

	readonly displayName: string;

	readonly displayShortName: string;

	readonly displayVersion: string;

	readonly errors: NSArray<NSError>;

	readonly hasBackgroundContent: boolean;

	readonly hasCommands: boolean;

	readonly hasContentModificationRules: boolean;

	readonly hasInjectedContent: boolean;

	readonly hasOptionsPage: boolean;

	readonly hasOverrideNewTabPage: boolean;

	readonly hasPersistentBackgroundContent: boolean;

	readonly manifest: NSDictionary<string, any>;

	readonly manifestVersion: number;

	readonly optionalPermissionMatchPatterns: NSSet<WKWebExtensionMatchPattern>;

	readonly optionalPermissions: NSSet<string>;

	readonly requestedPermissionMatchPatterns: NSSet<WKWebExtensionMatchPattern>;

	readonly requestedPermissions: NSSet<string>;

	readonly version: string;

	actionIconForSize(size: CGSize): UIImage;

	iconForSize(size: CGSize): UIImage;

	supportsManifestVersion(manifestVersion: number): boolean;
}

/**
 * @since 18.4
 */
declare class WKWebExtensionAction extends NSObject {

	static alloc(): WKWebExtensionAction; // inherited from NSObject

	static new(): WKWebExtensionAction; // inherited from NSObject

	readonly associatedTab: WKWebExtensionTab;

	readonly badgeText: string;

	readonly enabled: boolean;

	hasUnreadBadgeText: boolean;

	inspectionName: string;

	readonly label: string;

	readonly menuItems: NSArray<UIMenuElement>;

	readonly popupViewController: UIViewController;

	readonly popupWebView: WKWebView;

	readonly presentsPopup: boolean;

	readonly webExtensionContext: WKWebExtensionContext;

	closePopup(): void;

	iconForSize(size: CGSize): UIImage;
}

/**
 * @since 18.4
 */
declare class WKWebExtensionCommand extends NSObject {

	static alloc(): WKWebExtensionCommand; // inherited from NSObject

	static new(): WKWebExtensionCommand; // inherited from NSObject

	activationKey: string;

	readonly identifier: string;

	readonly keyCommand: UIKeyCommand;

	readonly menuItem: UIMenuElement;

	modifierFlags: UIKeyModifierFlags;

	readonly title: string;

	readonly webExtensionContext: WKWebExtensionContext;
}

/**
 * @since 18.4
 */
declare class WKWebExtensionContext extends NSObject {

	static alloc(): WKWebExtensionContext; // inherited from NSObject

	static contextForExtension(extension: WKWebExtension): WKWebExtensionContext;

	static new(): WKWebExtensionContext; // inherited from NSObject

	baseURL: NSURL;

	readonly commands: NSArray<WKWebExtensionCommand>;

	readonly currentPermissionMatchPatterns: NSSet<WKWebExtensionMatchPattern>;

	readonly currentPermissions: NSSet<string>;

	deniedPermissionMatchPatterns: NSDictionary<WKWebExtensionMatchPattern, Date>;

	deniedPermissions: NSDictionary<string, Date>;

	readonly errors: NSArray<NSError>;

	readonly focusedWindow: WKWebExtensionWindow;

	grantedPermissionMatchPatterns: NSDictionary<WKWebExtensionMatchPattern, Date>;

	grantedPermissions: NSDictionary<string, Date>;

	readonly hasAccessToAllHosts: boolean;

	readonly hasAccessToAllURLs: boolean;

	hasAccessToPrivateData: boolean;

	readonly hasContentModificationRules: boolean;

	readonly hasInjectedContent: boolean;

	hasRequestedOptionalAccessToAllHosts: boolean;

	inspectable: boolean;

	inspectionName: string;

	readonly loaded: boolean;

	readonly openTabs: NSSet<WKWebExtensionTab>;

	readonly openWindows: NSArray<WKWebExtensionWindow>;

	readonly optionsPageURL: NSURL;

	readonly overrideNewTabPageURL: NSURL;

	uniqueIdentifier: string;

	unsupportedAPIs: NSSet<string>;

	readonly webExtension: WKWebExtension;

	readonly webExtensionController: WKWebExtensionController;

	readonly webViewConfiguration: WKWebViewConfiguration;

	constructor(o: { forExtension: WKWebExtension; });

	actionForTab(tab: WKWebExtensionTab): WKWebExtensionAction;

	clearUserGestureInTab(tab: WKWebExtensionTab): void;

	didActivateTabPreviousActiveTab(activatedTab: WKWebExtensionTab, previousTab: WKWebExtensionTab): void;

	didChangeTabPropertiesForTab(properties: WKWebExtensionTabChangedProperties, changedTab: WKWebExtensionTab): void;

	didCloseTabWindowIsClosing(closedTab: WKWebExtensionTab, windowIsClosing: boolean): void;

	didCloseWindow(closedWindow: WKWebExtensionWindow): void;

	didDeselectTabs(deselectedTabs: NSArray<WKWebExtensionTab> | WKWebExtensionTab[]): void;

	didFocusWindow(focusedWindow: WKWebExtensionWindow): void;

	didMoveTabFromIndexInWindow(movedTab: WKWebExtensionTab, index: number, oldWindow: WKWebExtensionWindow): void;

	didOpenTab(newTab: WKWebExtensionTab): void;

	didOpenWindow(newWindow: WKWebExtensionWindow): void;

	didReplaceTabWithTab(oldTab: WKWebExtensionTab, newTab: WKWebExtensionTab): void;

	didSelectTabs(selectedTabs: NSArray<WKWebExtensionTab> | WKWebExtensionTab[]): void;

	hasAccessToURL(url: NSURL): boolean;

	hasAccessToURLInTab(url: NSURL, tab: WKWebExtensionTab): boolean;

	hasActiveUserGestureInTab(tab: WKWebExtensionTab): boolean;

	hasInjectedContentForURL(url: NSURL): boolean;

	hasPermission(permission: string): boolean;

	hasPermissionInTab(permission: string, tab: WKWebExtensionTab): boolean;

	initForExtension(extension: WKWebExtension): this;

	loadBackgroundContentWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	menuItemsForTab(tab: WKWebExtensionTab): NSArray<UIMenuElement>;

	performActionForTab(tab: WKWebExtensionTab): void;

	performCommand(command: WKWebExtensionCommand): void;

	performCommandForKeyCommand(keyCommand: UIKeyCommand): boolean;

	permissionStatusForMatchPattern(pattern: WKWebExtensionMatchPattern): WKWebExtensionContextPermissionStatus;

	permissionStatusForMatchPatternInTab(pattern: WKWebExtensionMatchPattern, tab: WKWebExtensionTab): WKWebExtensionContextPermissionStatus;

	permissionStatusForPermission(permission: string): WKWebExtensionContextPermissionStatus;

	permissionStatusForPermissionInTab(permission: string, tab: WKWebExtensionTab): WKWebExtensionContextPermissionStatus;

	permissionStatusForURL(url: NSURL): WKWebExtensionContextPermissionStatus;

	permissionStatusForURLInTab(url: NSURL, tab: WKWebExtensionTab): WKWebExtensionContextPermissionStatus;

	setPermissionStatusForMatchPattern(status: WKWebExtensionContextPermissionStatus, pattern: WKWebExtensionMatchPattern): void;

	setPermissionStatusForMatchPatternExpirationDate(status: WKWebExtensionContextPermissionStatus, pattern: WKWebExtensionMatchPattern, expirationDate: Date): void;

	setPermissionStatusForPermission(status: WKWebExtensionContextPermissionStatus, permission: string): void;

	setPermissionStatusForPermissionExpirationDate(status: WKWebExtensionContextPermissionStatus, permission: string, expirationDate: Date): void;

	setPermissionStatusForURL(status: WKWebExtensionContextPermissionStatus, url: NSURL): void;

	setPermissionStatusForURLExpirationDate(status: WKWebExtensionContextPermissionStatus, url: NSURL, expirationDate: Date): void;

	userGesturePerformedInTab(tab: WKWebExtensionTab): void;
}

/**
 * @since 18.4
 */
declare var WKWebExtensionContextDeniedPermissionMatchPatternsWereRemovedNotification: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionContextDeniedPermissionsWereRemovedNotification: string;

/**
 * @since 18.4
 */
declare const enum WKWebExtensionContextError {

	Unknown = 1,

	AlreadyLoaded = 2,

	NotLoaded = 3,

	BaseURLAlreadyInUse = 4,

	NoBackgroundContent = 5,

	BackgroundContentFailedToLoad = 6
}

/**
 * @since 18.4
 */
declare var WKWebExtensionContextErrorDomain: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionContextErrorsDidUpdateNotification: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionContextGrantedPermissionMatchPatternsWereRemovedNotification: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionContextGrantedPermissionsWereRemovedNotification: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionContextNotificationUserInfoKeyMatchPatterns: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionContextNotificationUserInfoKeyPermissions: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionContextPermissionMatchPatternsWereDeniedNotification: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionContextPermissionMatchPatternsWereGrantedNotification: string;

/**
 * @since 18.4
 */
declare const enum WKWebExtensionContextPermissionStatus {

	DeniedExplicitly = -3,

	DeniedImplicitly = -2,

	RequestedImplicitly = -1,

	Unknown = 0,

	RequestedExplicitly = 1,

	GrantedImplicitly = 2,

	GrantedExplicitly = 3
}

/**
 * @since 18.4
 */
declare var WKWebExtensionContextPermissionsWereDeniedNotification: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionContextPermissionsWereGrantedNotification: string;

/**
 * @since 18.4
 */
declare class WKWebExtensionController extends NSObject {

	static alloc(): WKWebExtensionController; // inherited from NSObject

	static new(): WKWebExtensionController; // inherited from NSObject

	readonly configuration: WKWebExtensionControllerConfiguration;

	delegate: WKWebExtensionControllerDelegate;

	readonly extensionContexts: NSSet<WKWebExtensionContext>;

	readonly extensions: NSSet<WKWebExtension>;

	static readonly allExtensionDataTypes: NSSet<string>;

	constructor(o: { configuration: WKWebExtensionControllerConfiguration; });

	didActivateTabPreviousActiveTab(activatedTab: WKWebExtensionTab, previousTab: WKWebExtensionTab): void;

	didChangeTabPropertiesForTab(properties: WKWebExtensionTabChangedProperties, changedTab: WKWebExtensionTab): void;

	didCloseTabWindowIsClosing(closedTab: WKWebExtensionTab, windowIsClosing: boolean): void;

	didCloseWindow(closedWindow: WKWebExtensionWindow): void;

	didDeselectTabs(deselectedTabs: NSArray<WKWebExtensionTab> | WKWebExtensionTab[]): void;

	didFocusWindow(focusedWindow: WKWebExtensionWindow): void;

	didMoveTabFromIndexInWindow(movedTab: WKWebExtensionTab, index: number, oldWindow: WKWebExtensionWindow): void;

	didOpenTab(newTab: WKWebExtensionTab): void;

	didOpenWindow(newWindow: WKWebExtensionWindow): void;

	didReplaceTabWithTab(oldTab: WKWebExtensionTab, newTab: WKWebExtensionTab): void;

	didSelectTabs(selectedTabs: NSArray<WKWebExtensionTab> | WKWebExtensionTab[]): void;

	extensionContextForExtension(extension: WKWebExtension): WKWebExtensionContext;

	extensionContextForURL(URL: NSURL): WKWebExtensionContext;

	fetchDataRecordOfTypesForExtensionContextCompletionHandler(dataTypes: NSSet<string>, extensionContext: WKWebExtensionContext, completionHandler: (p1: WKWebExtensionDataRecord) => void): void;

	fetchDataRecordsOfTypesCompletionHandler(dataTypes: NSSet<string>, completionHandler: (p1: NSArray<WKWebExtensionDataRecord>) => void): void;

	initWithConfiguration(configuration: WKWebExtensionControllerConfiguration): this;

	loadExtensionContextError(extensionContext: WKWebExtensionContext): boolean;

	removeDataOfTypesFromDataRecordsCompletionHandler(dataTypes: NSSet<string>, dataRecords: NSArray<WKWebExtensionDataRecord> | WKWebExtensionDataRecord[], completionHandler: () => void): void;

	unloadExtensionContextError(extensionContext: WKWebExtensionContext): boolean;
}

/**
 * @since 18.4
 */
declare class WKWebExtensionControllerConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): WKWebExtensionControllerConfiguration; // inherited from NSObject

	static configurationWithIdentifier(identifier: NSUUID): WKWebExtensionControllerConfiguration;

	static defaultConfiguration(): WKWebExtensionControllerConfiguration;

	static new(): WKWebExtensionControllerConfiguration; // inherited from NSObject

	static nonPersistentConfiguration(): WKWebExtensionControllerConfiguration;

	defaultWebsiteDataStore: WKWebsiteDataStore;

	readonly identifier: NSUUID;

	readonly persistent: boolean;

	webViewConfiguration: WKWebViewConfiguration;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.4
 */
interface WKWebExtensionControllerDelegate extends NSObjectProtocol {

	webExtensionControllerConnectUsingMessagePortForExtensionContextCompletionHandler?(controller: WKWebExtensionController, port: WKWebExtensionMessagePort, extensionContext: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	webExtensionControllerDidUpdateActionForExtensionContext?(controller: WKWebExtensionController, action: WKWebExtensionAction, context: WKWebExtensionContext): void;

	webExtensionControllerFocusedWindowForExtensionContext?(controller: WKWebExtensionController, extensionContext: WKWebExtensionContext): WKWebExtensionWindow;

	webExtensionControllerOpenNewTabUsingConfigurationForExtensionContextCompletionHandler?(controller: WKWebExtensionController, configuration: WKWebExtensionTabConfiguration, extensionContext: WKWebExtensionContext, completionHandler: (p1: WKWebExtensionTab, p2: NSError) => void): void;

	webExtensionControllerOpenNewWindowUsingConfigurationForExtensionContextCompletionHandler?(controller: WKWebExtensionController, configuration: WKWebExtensionWindowConfiguration, extensionContext: WKWebExtensionContext, completionHandler: (p1: WKWebExtensionWindow, p2: NSError) => void): void;

	webExtensionControllerOpenOptionsPageForExtensionContextCompletionHandler?(controller: WKWebExtensionController, extensionContext: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	webExtensionControllerOpenWindowsForExtensionContext?(controller: WKWebExtensionController, extensionContext: WKWebExtensionContext): NSArray<WKWebExtensionWindow>;

	webExtensionControllerPresentPopupForActionForExtensionContextCompletionHandler?(controller: WKWebExtensionController, action: WKWebExtensionAction, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	webExtensionControllerPromptForPermissionMatchPatternsInTabForExtensionContextCompletionHandler?(controller: WKWebExtensionController, matchPatterns: NSSet<WKWebExtensionMatchPattern>, tab: WKWebExtensionTab, extensionContext: WKWebExtensionContext, completionHandler: (p1: NSSet<WKWebExtensionMatchPattern>, p2: Date) => void): void;

	webExtensionControllerPromptForPermissionToAccessURLsInTabForExtensionContextCompletionHandler?(controller: WKWebExtensionController, urls: NSSet<NSURL>, tab: WKWebExtensionTab, extensionContext: WKWebExtensionContext, completionHandler: (p1: NSSet<NSURL>, p2: Date) => void): void;

	webExtensionControllerPromptForPermissionsInTabForExtensionContextCompletionHandler?(controller: WKWebExtensionController, permissions: NSSet<string>, tab: WKWebExtensionTab, extensionContext: WKWebExtensionContext, completionHandler: (p1: NSSet<string>, p2: Date) => void): void;

	webExtensionControllerSendMessageToApplicationWithIdentifierForExtensionContextReplyHandler?(controller: WKWebExtensionController, message: any, applicationIdentifier: string, extensionContext: WKWebExtensionContext, replyHandler: (p1: any, p2: NSError) => void): void;
}
declare var WKWebExtensionControllerDelegate: {

	prototype: WKWebExtensionControllerDelegate;
};

/**
 * @since 18.4
 */
declare class WKWebExtensionDataRecord extends NSObject {

	static alloc(): WKWebExtensionDataRecord; // inherited from NSObject

	static new(): WKWebExtensionDataRecord; // inherited from NSObject

	readonly containedDataTypes: NSSet<string>;

	readonly displayName: string;

	readonly errors: NSArray<NSError>;

	readonly totalSizeInBytes: number;

	readonly uniqueIdentifier: string;

	sizeInBytesOfTypes(dataTypes: NSSet<string>): number;
}

/**
 * @since 18.4
 */
declare const enum WKWebExtensionDataRecordError {

	Unknown = 1,

	LocalStorageFailed = 2,

	SessionStorageFailed = 3,

	SynchronizedStorageFailed = 4
}

/**
 * @since 18.4
 */
declare var WKWebExtensionDataRecordErrorDomain: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionDataTypeLocal: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionDataTypeSession: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionDataTypeSynchronized: string;

/**
 * @since 18.4
 */
declare const enum WKWebExtensionError {

	Unknown = 1,

	ResourceNotFound = 2,

	InvalidResourceCodeSignature = 3,

	InvalidManifest = 4,

	UnsupportedManifestVersion = 5,

	InvalidManifestEntry = 6,

	InvalidDeclarativeNetRequestEntry = 7,

	InvalidBackgroundPersistence = 8,

	InvalidArchive = 9
}

/**
 * @since 18.4
 */
declare var WKWebExtensionErrorDomain: string;

/**
 * @since 18.4
 */
declare class WKWebExtensionMatchPattern extends NSObject implements NSCopying, NSSecureCoding {

	static allHostsAndSchemesMatchPattern(): WKWebExtensionMatchPattern;

	static allURLsMatchPattern(): WKWebExtensionMatchPattern;

	static alloc(): WKWebExtensionMatchPattern; // inherited from NSObject

	static matchPatternWithSchemeHostPath(scheme: string, host: string, path: string): WKWebExtensionMatchPattern;

	static matchPatternWithString(string: string): WKWebExtensionMatchPattern;

	static new(): WKWebExtensionMatchPattern; // inherited from NSObject

	static registerCustomURLScheme(urlScheme: string): void;

	readonly host: string;

	readonly matchesAllHosts: boolean;

	readonly matchesAllURLs: boolean;

	readonly path: string;

	readonly scheme: string;

	readonly string: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { scheme: string; host: string; path: string; });

	constructor(o: { string: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSchemeHostPathError(scheme: string, host: string, path: string): this;

	initWithStringError(string: string): this;

	matchesPattern(pattern: WKWebExtensionMatchPattern): boolean;

	matchesPatternOptions(pattern: WKWebExtensionMatchPattern, options: WKWebExtensionMatchPatternOptions): boolean;

	matchesURL(url: NSURL): boolean;

	matchesURLOptions(url: NSURL, options: WKWebExtensionMatchPatternOptions): boolean;
}

/**
 * @since 18.4
 */
declare const enum WKWebExtensionMatchPatternError {

	Unknown = 1,

	InvalidScheme = 2,

	InvalidHost = 3,

	InvalidPath = 4
}

/**
 * @since 18.4
 */
declare var WKWebExtensionMatchPatternErrorDomain: string;

/**
 * @since 18.4
 */
declare const enum WKWebExtensionMatchPatternOptions {

	None = 0,

	IgnoreSchemes = 1,

	IgnorePaths = 2,

	MatchBidirectionally = 4
}

/**
 * @since 18.4
 */
declare class WKWebExtensionMessagePort extends NSObject {

	static alloc(): WKWebExtensionMessagePort; // inherited from NSObject

	static new(): WKWebExtensionMessagePort; // inherited from NSObject

	readonly applicationIdentifier: string;

	disconnectHandler: (p1: NSError) => void;

	readonly disconnected: boolean;

	messageHandler: (p1: any, p2: NSError) => void;

	disconnect(): void;

	disconnectWithError(error: NSError): void;

	sendMessageCompletionHandler(message: any, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 18.4
 */
declare const enum WKWebExtensionMessagePortError {

	Unknown = 1,

	NotConnected = 2,

	MessageInvalid = 3
}

/**
 * @since 18.4
 */
declare var WKWebExtensionMessagePortErrorDomain: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionActiveTab: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionAlarms: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionClipboardWrite: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionContextMenus: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionCookies: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionDeclarativeNetRequest: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionDeclarativeNetRequestFeedback: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionDeclarativeNetRequestWithHostAccess: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionMenus: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionNativeMessaging: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionScripting: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionStorage: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionTabs: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionUnlimitedStorage: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionWebNavigation: string;

/**
 * @since 18.4
 */
declare var WKWebExtensionPermissionWebRequest: string;

/**
 * @since 18.4
 */
interface WKWebExtensionTab extends NSObjectProtocol {

	activateForWebExtensionContextCompletionHandler?(context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	closeForWebExtensionContextCompletionHandler?(context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	detectWebpageLocaleForWebExtensionContextCompletionHandler?(context: WKWebExtensionContext, completionHandler: (p1: NSLocale, p2: NSError) => void): void;

	duplicateUsingConfigurationForWebExtensionContextCompletionHandler?(configuration: WKWebExtensionTabConfiguration, context: WKWebExtensionContext, completionHandler: (p1: WKWebExtensionTab, p2: NSError) => void): void;

	goBackForWebExtensionContextCompletionHandler?(context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	goForwardForWebExtensionContextCompletionHandler?(context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	indexInWindowForWebExtensionContext?(context: WKWebExtensionContext): number;

	isLoadingCompleteForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	isMutedForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	isPinnedForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	isPlayingAudioForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	isReaderModeActiveForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	isReaderModeAvailableForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	isSelectedForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	loadURLForWebExtensionContextCompletionHandler?(url: NSURL, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	parentTabForWebExtensionContext?(context: WKWebExtensionContext): WKWebExtensionTab;

	pendingURLForWebExtensionContext?(context: WKWebExtensionContext): NSURL;

	reloadFromOriginForWebExtensionContextCompletionHandler?(fromOrigin: boolean, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	setMutedForWebExtensionContextCompletionHandler?(muted: boolean, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	setParentTabForWebExtensionContextCompletionHandler?(parentTab: WKWebExtensionTab, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	setPinnedForWebExtensionContextCompletionHandler?(pinned: boolean, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	setReaderModeActiveForWebExtensionContextCompletionHandler?(active: boolean, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	setSelectedForWebExtensionContextCompletionHandler?(selected: boolean, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	setZoomFactorForWebExtensionContextCompletionHandler?(zoomFactor: number, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	shouldBypassPermissionsForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	shouldGrantPermissionsOnUserGestureForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	sizeForWebExtensionContext?(context: WKWebExtensionContext): CGSize;

	takeSnapshotUsingConfigurationForWebExtensionContextCompletionHandler?(configuration: WKSnapshotConfiguration, context: WKWebExtensionContext, completionHandler: (p1: UIImage, p2: NSError) => void): void;

	titleForWebExtensionContext?(context: WKWebExtensionContext): string;

	urlForWebExtensionContext?(context: WKWebExtensionContext): NSURL;

	webViewForWebExtensionContext?(context: WKWebExtensionContext): WKWebView;

	windowForWebExtensionContext?(context: WKWebExtensionContext): WKWebExtensionWindow;

	zoomFactorForWebExtensionContext?(context: WKWebExtensionContext): number;
}
declare var WKWebExtensionTab: {

	prototype: WKWebExtensionTab;
};

/**
 * @since 18.4
 */
declare const enum WKWebExtensionTabChangedProperties {

	None = 0,

	Loading = 2,

	Muted = 4,

	Pinned = 8,

	PlayingAudio = 16,

	ReaderMode = 32,

	Size = 64,

	Title = 128,

	URL = 256,

	ZoomFactor = 512
}

/**
 * @since 18.4
 */
declare class WKWebExtensionTabConfiguration extends NSObject {

	static alloc(): WKWebExtensionTabConfiguration; // inherited from NSObject

	static new(): WKWebExtensionTabConfiguration; // inherited from NSObject

	readonly index: number;

	readonly parentTab: WKWebExtensionTab;

	readonly shouldAddToSelection: boolean;

	readonly shouldBeActive: boolean;

	readonly shouldBeMuted: boolean;

	readonly shouldBePinned: boolean;

	readonly shouldReaderModeBeActive: boolean;

	readonly url: NSURL;

	readonly window: WKWebExtensionWindow;
}

/**
 * @since 18.4
 */
interface WKWebExtensionWindow extends NSObjectProtocol {

	activeTabForWebExtensionContext?(context: WKWebExtensionContext): WKWebExtensionTab;

	closeForWebExtensionContextCompletionHandler?(context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	focusForWebExtensionContextCompletionHandler?(context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	frameForWebExtensionContext?(context: WKWebExtensionContext): CGRect;

	isPrivateForWebExtensionContext?(context: WKWebExtensionContext): boolean;

	setFrameForWebExtensionContextCompletionHandler?(frame: CGRect, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	setWindowStateForWebExtensionContextCompletionHandler?(state: WKWebExtensionWindowState, context: WKWebExtensionContext, completionHandler: (p1: NSError) => void): void;

	tabsForWebExtensionContext?(context: WKWebExtensionContext): NSArray<WKWebExtensionTab>;

	windowStateForWebExtensionContext?(context: WKWebExtensionContext): WKWebExtensionWindowState;

	windowTypeForWebExtensionContext?(context: WKWebExtensionContext): WKWebExtensionWindowType;
}
declare var WKWebExtensionWindow: {

	prototype: WKWebExtensionWindow;
};

/**
 * @since 18.4
 */
declare class WKWebExtensionWindowConfiguration extends NSObject {

	static alloc(): WKWebExtensionWindowConfiguration; // inherited from NSObject

	static new(): WKWebExtensionWindowConfiguration; // inherited from NSObject

	readonly frame: CGRect;

	readonly shouldBeFocused: boolean;

	readonly shouldBePrivate: boolean;

	readonly tabURLs: NSArray<NSURL>;

	readonly tabs: NSArray<WKWebExtensionTab>;

	readonly windowState: WKWebExtensionWindowState;

	readonly windowType: WKWebExtensionWindowType;
}

/**
 * @since 18.4
 */
declare const enum WKWebExtensionWindowState {

	Normal = 0,

	Minimized = 1,

	Maximized = 2,

	Fullscreen = 3
}

/**
 * @since 18.4
 */
declare const enum WKWebExtensionWindowType {

	Normal = 0,

	Popup = 1
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
	 * @since 26.0
	 */
	conversationContext: UIConversationContext;

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

	/**
	 * @since 26.0
	 */
	readonly isBlockedByScreenTime: boolean;

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
	 * @since 26.0
	 */
	obscuredContentInsets: UIEdgeInsets;

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
	 * @since 26.0
	 */
	fetchDataOfTypesCompletionHandler(dataTypes: WKWebViewDataType, completionHandler: (p1: NSData, p2: NSError) => void): void;

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
	 * @since 26.0
	 */
	restoreDataCompletionHandler(data: NSData, completionHandler: (p1: NSError) => void): void;

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

	/**
	 * @since 8.0
	 * @deprecated 15.0
	 */
	processPool: WKProcessPool;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	requiresUserActionForMediaPlayback: boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	selectionGranularity: WKSelectionGranularity;

	/**
	 * @since 26.0
	 */
	showsSystemScreenTimeBlockingView: boolean;

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
	 * @since 18.4
	 */
	webExtensionController: WKWebExtensionController;

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
 * @since 26.0
 */
declare const enum WKWebViewDataType {

	SessionStorage = 1
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

	/**
	 * @since 18.2
	 */
	preferredHTTPSNavigationPolicy: WKWebpagePreferencesUpgradeToHTTPSPolicy;
}

/**
 * @since 18.2
 */
declare const enum WKWebpagePreferencesUpgradeToHTTPSPolicy {

	KeepAsRequested = 0,

	AutomaticFallbackToHTTP = 1,

	UserMediatedFallbackToHTTP = 2,

	ErrorOnFailure = 3
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

	/**
	 * @since 26.0
	 */
	fetchDataOfTypesCompletionHandler(dataTypes: NSSet<string>, completionHandler: (p1: NSData, p2: NSError) => void): void;

	fetchDataRecordsOfTypesCompletionHandler(dataTypes: NSSet<string>, completionHandler: (p1: NSArray<WKWebsiteDataRecord>) => void): void;

	initWithCoder(coder: NSCoder): this;

	removeDataOfTypesForDataRecordsCompletionHandler(dataTypes: NSSet<string>, dataRecords: NSArray<WKWebsiteDataRecord> | WKWebsiteDataRecord[], completionHandler: () => void): void;

	removeDataOfTypesModifiedSinceCompletionHandler(dataTypes: NSSet<string>, date: Date, completionHandler: () => void): void;

	/**
	 * @since 26.0
	 */
	restoreDataCompletionHandler(data: NSData, completionHandler: (p1: NSError) => void): void;
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
 * @since 26.0
 */
declare var WKWebsiteDataTypeScreenTime: string;

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
