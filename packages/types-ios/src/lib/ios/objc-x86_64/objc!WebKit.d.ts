
declare var NSReadAccessURLDocumentOption: string;

declare const enum WKAudiovisualMediaTypes {

	None = 0,

	Audio = 1,

	Video = 2,

	All = -1
}

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

declare class WKBackForwardListItem extends NSObject {

	static alloc(): WKBackForwardListItem; // inherited from NSObject

	static new(): WKBackForwardListItem; // inherited from NSObject

	readonly URL: NSURL;

	readonly initialURL: NSURL;

	readonly title: string;
}

declare const enum WKContentMode {

	Recommended = 0,

	Mobile = 1,

	Desktop = 2
}

declare class WKContentRuleList extends NSObject {

	static alloc(): WKContentRuleList; // inherited from NSObject

	static new(): WKContentRuleList; // inherited from NSObject

	readonly identifier: string;
}

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

declare class WKContentWorld extends NSObject {

	static alloc(): WKContentWorld; // inherited from NSObject

	static new(): WKContentWorld; // inherited from NSObject

	static worldWithName(name: string): WKContentWorld;

	readonly name: string;

	static readonly defaultClientWorld: WKContentWorld;

	static readonly pageWorld: WKContentWorld;
}

declare class WKContextMenuElementInfo extends NSObject {

	static alloc(): WKContextMenuElementInfo; // inherited from NSObject

	static new(): WKContextMenuElementInfo; // inherited from NSObject

	readonly linkURL: NSURL;
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

	All = -1,

	SpotlightSuggestion = 64
}

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

declare const enum WKDownloadRedirectPolicy {

	Cancel = 0,

	Allow = 1
}

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

	JavaScriptAppBoundDomain = 14
}

declare var WKErrorDomain: string;

declare class WKFindConfiguration extends NSObject implements NSCopying {

	static alloc(): WKFindConfiguration; // inherited from NSObject

	static new(): WKFindConfiguration; // inherited from NSObject

	backwards: boolean;

	caseSensitive: boolean;

	wraps: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class WKFindResult extends NSObject implements NSCopying {

	static alloc(): WKFindResult; // inherited from NSObject

	static new(): WKFindResult; // inherited from NSObject

	readonly matchFound: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class WKFrameInfo extends NSObject implements NSCopying {

	static alloc(): WKFrameInfo; // inherited from NSObject

	static new(): WKFrameInfo; // inherited from NSObject

	readonly mainFrame: boolean;

	readonly request: NSURLRequest;

	readonly securityOrigin: WKSecurityOrigin;

	readonly webView: WKWebView;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum WKFullscreenState {

	NotInFullscreen = 0,

	EnteringFullscreen = 1,

	InFullscreen = 2,

	ExitingFullscreen = 3
}

declare class WKHTTPCookieStore extends NSObject {

	static alloc(): WKHTTPCookieStore; // inherited from NSObject

	static new(): WKHTTPCookieStore; // inherited from NSObject

	addObserver(observer: WKHTTPCookieStoreObserver): void;

	deleteCookieCompletionHandler(cookie: NSHTTPCookie, completionHandler: () => void): void;

	getAllCookies(completionHandler: (p1: NSArray<NSHTTPCookie>) => void): void;

	removeObserver(observer: WKHTTPCookieStoreObserver): void;

	setCookieCompletionHandler(cookie: NSHTTPCookie, completionHandler: () => void): void;
}

interface WKHTTPCookieStoreObserver extends NSObjectProtocol {

	cookiesDidChangeInCookieStore?(cookieStore: WKHTTPCookieStore): void;
}
declare var WKHTTPCookieStoreObserver: {

	prototype: WKHTTPCookieStoreObserver;
};

declare const enum WKMediaCaptureState {

	None = 0,

	Active = 1,

	Muted = 2
}

declare const enum WKMediaCaptureType {

	Camera = 0,

	Microphone = 1,

	CameraAndMicrophone = 2
}

declare const enum WKMediaPlaybackState {

	None = 0,

	Playing = 1,

	Paused = 2,

	Suspended = 3
}

declare class WKNavigation extends NSObject {

	static alloc(): WKNavigation; // inherited from NSObject

	static new(): WKNavigation; // inherited from NSObject

	readonly effectiveContentMode: WKContentMode;
}

declare class WKNavigationAction extends NSObject {

	static alloc(): WKNavigationAction; // inherited from NSObject

	static new(): WKNavigationAction; // inherited from NSObject

	readonly navigationType: WKNavigationType;

	readonly request: NSURLRequest;

	readonly shouldPerformDownload: boolean;

	readonly sourceFrame: WKFrameInfo;

	readonly targetFrame: WKFrameInfo;
}

declare const enum WKNavigationActionPolicy {

	Cancel = 0,

	Allow = 1,

	Download = 2
}

interface WKNavigationDelegate extends NSObjectProtocol {

	webViewAuthenticationChallengeShouldAllowDeprecatedTLS?(webView: WKWebView, challenge: NSURLAuthenticationChallenge, decisionHandler: (p1: boolean) => void): void;

	webViewDecidePolicyForNavigationActionDecisionHandler?(webView: WKWebView, navigationAction: WKNavigationAction, decisionHandler: (p1: WKNavigationActionPolicy) => void): void;

	webViewDecidePolicyForNavigationActionPreferencesDecisionHandler?(webView: WKWebView, navigationAction: WKNavigationAction, preferences: WKWebpagePreferences, decisionHandler: (p1: WKNavigationActionPolicy, p2: WKWebpagePreferences) => void): void;

	webViewDecidePolicyForNavigationResponseDecisionHandler?(webView: WKWebView, navigationResponse: WKNavigationResponse, decisionHandler: (p1: WKNavigationResponsePolicy) => void): void;

	webViewDidCommitNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewDidFailNavigationWithError?(webView: WKWebView, navigation: WKNavigation, error: NSError): void;

	webViewDidFailProvisionalNavigationWithError?(webView: WKWebView, navigation: WKNavigation, error: NSError): void;

	webViewDidFinishNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewDidReceiveAuthenticationChallengeCompletionHandler?(webView: WKWebView, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;

	webViewDidReceiveServerRedirectForProvisionalNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewDidStartProvisionalNavigation?(webView: WKWebView, navigation: WKNavigation): void;

	webViewNavigationActionDidBecomeDownload?(webView: WKWebView, navigationAction: WKNavigationAction, download: WKDownload): void;

	webViewNavigationResponseDidBecomeDownload?(webView: WKWebView, navigationResponse: WKNavigationResponse, download: WKDownload): void;

	webViewWebContentProcessDidTerminate?(webView: WKWebView): void;
}
declare var WKNavigationDelegate: {

	prototype: WKNavigationDelegate;
};

declare class WKNavigationResponse extends NSObject {

	static alloc(): WKNavigationResponse; // inherited from NSObject

	static new(): WKNavigationResponse; // inherited from NSObject

	readonly canShowMIMEType: boolean;

	readonly forMainFrame: boolean;

	readonly response: NSURLResponse;
}

declare const enum WKNavigationResponsePolicy {

	Cancel = 0,

	Allow = 1,

	Download = 2
}

declare const enum WKNavigationType {

	LinkActivated = 0,

	FormSubmitted = 1,

	BackForward = 2,

	Reload = 3,

	FormResubmitted = 4,

	Other = -1
}

declare class WKPDFConfiguration extends NSObject implements NSCopying {

	static alloc(): WKPDFConfiguration; // inherited from NSObject

	static new(): WKPDFConfiguration; // inherited from NSObject

	rect: CGRect;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum WKPermissionDecision {

	Prompt = 0,

	Grant = 1,

	Deny = 2
}

declare class WKPreferences extends NSObject implements NSSecureCoding {

	static alloc(): WKPreferences; // inherited from NSObject

	static new(): WKPreferences; // inherited from NSObject

	elementFullscreenEnabled: boolean;

	fraudulentWebsiteWarningEnabled: boolean;

	javaScriptCanOpenWindowsAutomatically: boolean;

	javaScriptEnabled: boolean;

	minimumFontSize: number;

	siteSpecificQuirksModeEnabled: boolean;

	textInteractionEnabled: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
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

	readonly linkURL: NSURL;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class WKProcessPool extends NSObject implements NSSecureCoding {

	static alloc(): WKProcessPool; // inherited from NSObject

	static new(): WKProcessPool; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class WKScriptMessage extends NSObject {

	static alloc(): WKScriptMessage; // inherited from NSObject

	static new(): WKScriptMessage; // inherited from NSObject

	readonly body: any;

	readonly frameInfo: WKFrameInfo;

	readonly name: string;

	readonly webView: WKWebView;

	readonly world: WKContentWorld;
}

interface WKScriptMessageHandler extends NSObjectProtocol {

	userContentControllerDidReceiveScriptMessage(userContentController: WKUserContentController, message: WKScriptMessage): void;
}
declare var WKScriptMessageHandler: {

	prototype: WKScriptMessageHandler;
};

interface WKScriptMessageHandlerWithReply extends NSObjectProtocol {

	userContentControllerDidReceiveScriptMessageReplyHandler(userContentController: WKUserContentController, message: WKScriptMessage, replyHandler: (p1: any, p2: string) => void): void;
}
declare var WKScriptMessageHandlerWithReply: {

	prototype: WKScriptMessageHandlerWithReply;
};

declare class WKSecurityOrigin extends NSObject {

	static alloc(): WKSecurityOrigin; // inherited from NSObject

	static new(): WKSecurityOrigin; // inherited from NSObject

	readonly host: string;

	readonly port: number;

	readonly protocol: string;
}

declare const enum WKSelectionGranularity {

	Dynamic = 0,

	Character = 1
}

declare class WKSnapshotConfiguration extends NSObject implements NSCopying {

	static alloc(): WKSnapshotConfiguration; // inherited from NSObject

	static new(): WKSnapshotConfiguration; // inherited from NSObject

	afterScreenUpdates: boolean;

	rect: CGRect;

	snapshotWidth: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface WKUIDelegate extends NSObjectProtocol {

	webViewCommitPreviewingViewController?(webView: WKWebView, previewingViewController: UIViewController): void;

	webViewContextMenuConfigurationForElementCompletionHandler?(webView: WKWebView, elementInfo: WKContextMenuElementInfo, completionHandler: (p1: UIContextMenuConfiguration) => void): void;

	webViewContextMenuDidEndForElement?(webView: WKWebView, elementInfo: WKContextMenuElementInfo): void;

	webViewContextMenuForElementWillCommitWithAnimator?(webView: WKWebView, elementInfo: WKContextMenuElementInfo, animator: UIContextMenuInteractionCommitAnimating): void;

	webViewContextMenuWillPresentForElement?(webView: WKWebView, elementInfo: WKContextMenuElementInfo): void;

	webViewCreateWebViewWithConfigurationForNavigationActionWindowFeatures?(webView: WKWebView, configuration: WKWebViewConfiguration, navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures): WKWebView;

	webViewDidClose?(webView: WKWebView): void;

	webViewPreviewingViewControllerForElementDefaultActions?(webView: WKWebView, elementInfo: WKPreviewElementInfo, previewActions: NSArray<WKPreviewActionItem> | WKPreviewActionItem[]): UIViewController;

	webViewRequestDeviceOrientationAndMotionPermissionForOriginInitiatedByFrameDecisionHandler?(webView: WKWebView, origin: WKSecurityOrigin, frame: WKFrameInfo, decisionHandler: (p1: WKPermissionDecision) => void): void;

	webViewRequestMediaCapturePermissionForOriginInitiatedByFrameTypeDecisionHandler?(webView: WKWebView, origin: WKSecurityOrigin, frame: WKFrameInfo, type: WKMediaCaptureType, decisionHandler: (p1: WKPermissionDecision) => void): void;

	webViewRunJavaScriptAlertPanelWithMessageInitiatedByFrameCompletionHandler?(webView: WKWebView, message: string, frame: WKFrameInfo, completionHandler: () => void): void;

	webViewRunJavaScriptConfirmPanelWithMessageInitiatedByFrameCompletionHandler?(webView: WKWebView, message: string, frame: WKFrameInfo, completionHandler: (p1: boolean) => void): void;

	webViewRunJavaScriptTextInputPanelWithPromptDefaultTextInitiatedByFrameCompletionHandler?(webView: WKWebView, prompt: string, defaultText: string, frame: WKFrameInfo, completionHandler: (p1: string) => void): void;

	webViewShouldPreviewElement?(webView: WKWebView, elementInfo: WKPreviewElementInfo): boolean;
}
declare var WKUIDelegate: {

	prototype: WKUIDelegate;
};

interface WKURLSchemeHandler extends NSObjectProtocol {

	webViewStartURLSchemeTask(webView: WKWebView, urlSchemeTask: WKURLSchemeTask): void;

	webViewStopURLSchemeTask(webView: WKWebView, urlSchemeTask: WKURLSchemeTask): void;
}
declare var WKURLSchemeHandler: {

	prototype: WKURLSchemeHandler;
};

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

declare class WKUserContentController extends NSObject implements NSSecureCoding {

	static alloc(): WKUserContentController; // inherited from NSObject

	static new(): WKUserContentController; // inherited from NSObject

	readonly userScripts: NSArray<WKUserScript>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addContentRuleList(contentRuleList: WKContentRuleList): void;

	addScriptMessageHandlerContentWorldName(scriptMessageHandler: WKScriptMessageHandler, world: WKContentWorld, name: string): void;

	addScriptMessageHandlerName(scriptMessageHandler: WKScriptMessageHandler, name: string): void;

	addScriptMessageHandlerWithReplyContentWorldName(scriptMessageHandlerWithReply: WKScriptMessageHandlerWithReply, contentWorld: WKContentWorld, name: string): void;

	addUserScript(userScript: WKUserScript): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	removeAllContentRuleLists(): void;

	removeAllScriptMessageHandlers(): void;

	removeAllScriptMessageHandlersFromContentWorld(contentWorld: WKContentWorld): void;

	removeAllUserScripts(): void;

	removeContentRuleList(contentRuleList: WKContentRuleList): void;

	removeScriptMessageHandlerForName(name: string): void;

	removeScriptMessageHandlerForNameContentWorld(name: string, contentWorld: WKContentWorld): void;
}

declare class WKUserScript extends NSObject implements NSCopying {

	static alloc(): WKUserScript; // inherited from NSObject

	static new(): WKUserScript; // inherited from NSObject

	readonly forMainFrameOnly: boolean;

	readonly injectionTime: WKUserScriptInjectionTime;

	readonly source: string;

	constructor(o: { source: string; injectionTime: WKUserScriptInjectionTime; forMainFrameOnly: boolean; });

	constructor(o: { source: string; injectionTime: WKUserScriptInjectionTime; forMainFrameOnly: boolean; inContentWorld: WKContentWorld; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithSourceInjectionTimeForMainFrameOnly(source: string, injectionTime: WKUserScriptInjectionTime, forMainFrameOnly: boolean): this;

	initWithSourceInjectionTimeForMainFrameOnlyInContentWorld(source: string, injectionTime: WKUserScriptInjectionTime, forMainFrameOnly: boolean, contentWorld: WKContentWorld): this;
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

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): WKWebView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): WKWebView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): WKWebView; // inherited from UIAppearance

	static handlesURLScheme(urlScheme: string): boolean;

	static new(): WKWebView; // inherited from NSObject

	UIDelegate: WKUIDelegate;

	readonly URL: NSURL;

	allowsBackForwardNavigationGestures: boolean;

	allowsLinkPreview: boolean;

	readonly backForwardList: WKBackForwardList;

	readonly cameraCaptureState: WKMediaCaptureState;

	readonly canGoBack: boolean;

	readonly canGoForward: boolean;

	readonly certificateChain: NSArray<any>;

	readonly configuration: WKWebViewConfiguration;

	customUserAgent: string;

	readonly estimatedProgress: number;

	readonly fullscreenState: WKFullscreenState;

	readonly hasOnlySecureContent: boolean;

	interactionState: any;

	readonly loading: boolean;

	mediaType: string;

	readonly microphoneCaptureState: WKMediaCaptureState;

	navigationDelegate: WKNavigationDelegate;

	pageZoom: number;

	readonly scrollView: UIScrollView;

	readonly serverTrust: any;

	readonly themeColor: UIColor;

	readonly title: string;

	underPageBackgroundColor: UIColor;

	constructor(o: { frame: CGRect; configuration: WKWebViewConfiguration; });

	callAsyncJavaScriptArgumentsInFrameInContentWorldCompletionHandler(functionBody: string, _arguments: NSDictionary<string, any>, frame: WKFrameInfo, contentWorld: WKContentWorld, completionHandler: (p1: number, p2: NSError) => void): void;

	closeAllMediaPresentations(): void;

	closeAllMediaPresentationsWithCompletionHandler(completionHandler: () => void): void;

	createPDFWithConfigurationCompletionHandler(pdfConfiguration: WKPDFConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;

	createWebArchiveDataWithCompletionHandler(completionHandler: (p1: NSData, p2: NSError) => void): void;

	evaluateJavaScriptCompletionHandler(javaScriptString: string, completionHandler: (p1: any, p2: NSError) => void): void;

	evaluateJavaScriptInFrameInContentWorldCompletionHandler(javaScriptString: string, frame: WKFrameInfo, contentWorld: WKContentWorld, completionHandler: (p1: any, p2: NSError) => void): void;

	findStringWithConfigurationCompletionHandler(string: string, configuration: WKFindConfiguration, completionHandler: (p1: WKFindResult) => void): void;

	goBack(): WKNavigation;

	goForward(): WKNavigation;

	goToBackForwardListItem(item: WKBackForwardListItem): WKNavigation;

	initWithFrameConfiguration(frame: CGRect, configuration: WKWebViewConfiguration): this;

	loadDataMIMETypeCharacterEncodingNameBaseURL(data: NSData, MIMEType: string, characterEncodingName: string, baseURL: NSURL): WKNavigation;

	loadFileRequestAllowingReadAccessToURL(request: NSURLRequest, readAccessURL: NSURL): WKNavigation;

	loadFileURLAllowingReadAccessToURL(URL: NSURL, readAccessURL: NSURL): WKNavigation;

	loadHTMLStringBaseURL(string: string, baseURL: NSURL): WKNavigation;

	loadRequest(request: NSURLRequest): WKNavigation;

	loadSimulatedRequestResponseHTMLString(request: NSURLRequest, string: string): WKNavigation;

	loadSimulatedRequestResponseResponseData(request: NSURLRequest, response: NSURLResponse, data: NSData): WKNavigation;

	loadSimulatedRequestWithResponseHTMLString(request: NSURLRequest, string: string): WKNavigation;

	loadSimulatedRequestWithResponseResponseData(request: NSURLRequest, response: NSURLResponse, data: NSData): WKNavigation;

	pauseAllMediaPlayback(completionHandler: () => void): void;

	pauseAllMediaPlaybackWithCompletionHandler(completionHandler: () => void): void;

	reload(): WKNavigation;

	reloadFromOrigin(): WKNavigation;

	requestMediaPlaybackState(completionHandler: (p1: WKMediaPlaybackState) => void): void;

	requestMediaPlaybackStateWithCompletionHandler(completionHandler: (p1: WKMediaPlaybackState) => void): void;

	resumeAllMediaPlayback(completionHandler: () => void): void;

	resumeDownloadFromResumeDataCompletionHandler(resumeData: NSData, completionHandler: (p1: WKDownload) => void): void;

	setAllMediaPlaybackSuspendedCompletionHandler(suspended: boolean, completionHandler: () => void): void;

	setCameraCaptureStateCompletionHandler(state: WKMediaCaptureState, completionHandler: () => void): void;

	setMicrophoneCaptureStateCompletionHandler(state: WKMediaCaptureState, completionHandler: () => void): void;

	startDownloadUsingRequestCompletionHandler(request: NSURLRequest, completionHandler: (p1: WKDownload) => void): void;

	stopLoading(): void;

	suspendAllMediaPlayback(completionHandler: () => void): void;

	takeSnapshotWithConfigurationCompletionHandler(snapshotConfiguration: WKSnapshotConfiguration, completionHandler: (p1: UIImage, p2: NSError) => void): void;
}

declare class WKWebViewConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): WKWebViewConfiguration; // inherited from NSObject

	static new(): WKWebViewConfiguration; // inherited from NSObject

	allowsAirPlayForMediaPlayback: boolean;

	allowsInlineMediaPlayback: boolean;

	allowsPictureInPictureMediaPlayback: boolean;

	applicationNameForUserAgent: string;

	dataDetectorTypes: WKDataDetectorTypes;

	defaultWebpagePreferences: WKWebpagePreferences;

	ignoresViewportScaleLimits: boolean;

	limitsNavigationsToAppBoundDomains: boolean;

	mediaPlaybackAllowsAirPlay: boolean;

	mediaPlaybackRequiresUserAction: boolean;

	mediaTypesRequiringUserActionForPlayback: WKAudiovisualMediaTypes;

	preferences: WKPreferences;

	processPool: WKProcessPool;

	requiresUserActionForMediaPlayback: boolean;

	selectionGranularity: WKSelectionGranularity;

	suppressesIncrementalRendering: boolean;

	upgradeKnownHostsToHTTPS: boolean;

	userContentController: WKUserContentController;

	websiteDataStore: WKWebsiteDataStore;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setURLSchemeHandlerForURLScheme(urlSchemeHandler: WKURLSchemeHandler, urlScheme: string): void;

	urlSchemeHandlerForURLScheme(urlScheme: string): WKURLSchemeHandler;
}

declare class WKWebpagePreferences extends NSObject {

	static alloc(): WKWebpagePreferences; // inherited from NSObject

	static new(): WKWebpagePreferences; // inherited from NSObject

	allowsContentJavaScript: boolean;

	preferredContentMode: WKContentMode;
}

declare class WKWebsiteDataRecord extends NSObject {

	static alloc(): WKWebsiteDataRecord; // inherited from NSObject

	static new(): WKWebsiteDataRecord; // inherited from NSObject

	readonly dataTypes: NSSet<string>;

	readonly displayName: string;
}

declare class WKWebsiteDataStore extends NSObject implements NSSecureCoding {

	static allWebsiteDataTypes(): NSSet<string>;

	static alloc(): WKWebsiteDataStore; // inherited from NSObject

	static defaultDataStore(): WKWebsiteDataStore;

	static new(): WKWebsiteDataStore; // inherited from NSObject

	static nonPersistentDataStore(): WKWebsiteDataStore;

	readonly httpCookieStore: WKHTTPCookieStore;

	readonly persistent: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	fetchDataRecordsOfTypesCompletionHandler(dataTypes: NSSet<string>, completionHandler: (p1: NSArray<WKWebsiteDataRecord>) => void): void;

	initWithCoder(coder: NSCoder): this;

	removeDataOfTypesForDataRecordsCompletionHandler(dataTypes: NSSet<string>, dataRecords: NSArray<WKWebsiteDataRecord> | WKWebsiteDataRecord[], completionHandler: () => void): void;

	removeDataOfTypesModifiedSinceCompletionHandler(dataTypes: NSSet<string>, date: Date, completionHandler: () => void): void;
}

declare var WKWebsiteDataTypeCookies: string;

declare var WKWebsiteDataTypeDiskCache: string;

declare var WKWebsiteDataTypeFetchCache: string;

declare var WKWebsiteDataTypeIndexedDBDatabases: string;

declare var WKWebsiteDataTypeLocalStorage: string;

declare var WKWebsiteDataTypeMemoryCache: string;

declare var WKWebsiteDataTypeOfflineWebApplicationCache: string;

declare var WKWebsiteDataTypeServiceWorkerRegistrations: string;

declare var WKWebsiteDataTypeSessionStorage: string;

declare var WKWebsiteDataTypeWebSQLDatabases: string;

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
