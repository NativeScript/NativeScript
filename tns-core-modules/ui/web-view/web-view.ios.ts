import { WebViewBase, knownFolders, traceWrite, traceEnabled, traceCategories, NavigationType } from "./web-view-common";
import { profile } from "../../profiling";
export * from "./web-view-common";

class WKNavigationDelegateImpl extends NSObject
    implements WKNavigationDelegate {
    public static ObjCProtocols = [WKNavigationDelegate];
    public static initWithOwner(owner: WeakRef<WebView>): WKNavigationDelegateImpl {
        const handler = <WKNavigationDelegateImpl>WKNavigationDelegateImpl.new();
        handler._owner = owner;
        return handler;
    }
    private _owner: WeakRef<WebView>;

    public webViewDecidePolicyForNavigationActionDecisionHandler(webView: WKWebView, navigationAction: WKNavigationAction, decisionHandler: any): void {
        const owner = this._owner.get();
        if (owner && navigationAction.request.URL) {
            let navType: NavigationType = "other";

            switch (navigationAction.navigationType) {
                case WKNavigationType.LinkActivated:
                    navType = "linkClicked";
                    break;
                case WKNavigationType.FormSubmitted:
                    navType = "formSubmitted";
                    break;
                case WKNavigationType.BackForward:
                    navType = "backForward";
                    break;
                case WKNavigationType.Reload:
                    navType = "reload";
                    break;
                case WKNavigationType.FormResubmitted:
                    navType = "formResubmitted";
                    break;
            }
            decisionHandler(WKNavigationActionPolicy.Allow);

            if (traceEnabled()) {
                traceWrite("WKNavigationDelegateClass.webViewDecidePolicyForNavigationActionDecisionHandler(" + navigationAction.request.URL.absoluteString + ", " + navigationAction.navigationType + ")", traceCategories.Debug);
            }
            
            if ( owner.syncCookies ) {
                // Following handle will get invoked for subsequent page navigation and updates the sharedHTTPCookieStorage
                webView.evaluateJavaScriptCompletionHandler("window.webkit.messageHandlers.updateCookies.postMessage(document.cookie);", null);            
            }
            owner._onLoadStarted(navigationAction.request.URL.absoluteString, navType);
        }
    }

    public webViewDidStartProvisionalNavigation(webView: WKWebView, navigation: WKNavigation): void {
        if (traceEnabled()) {
            traceWrite("WKNavigationDelegateClass.webViewDidStartProvisionalNavigation(" + webView.URL + ")", traceCategories.Debug);
        }
    };

    public webViewDidFinishNavigation(webView: WKWebView, navigation: WKNavigation): void {
        if (traceEnabled()) {
            traceWrite("WKNavigationDelegateClass.webViewDidFinishNavigation(" + webView.URL + ")", traceCategories.Debug);
        }
        const owner = this._owner.get();
        if (owner) {
            let src = owner.src;
            if (webView.URL) {
                src = webView.URL.absoluteString;
            }
            owner._onLoadFinished(src);
        }
    }

    public webViewDidFailNavigationWithError(webView: WKWebView, navigation: WKNavigation, error: NSError): void {
        const owner = this._owner.get();
        if (owner) {
            let src = owner.src;
            if (webView.URL) {
                src = webView.URL.absoluteString;
            }
            if (traceEnabled()) {
                traceWrite("WKNavigationDelegateClass.webViewDidFailNavigationWithError(" + error.localizedDescription + ")", traceCategories.Debug);
            }
            owner._onLoadFinished(src, error.localizedDescription);
        }
    }

}

// WKScriptMessageHandlerImpl javascript handler will updates the document.cookie to sharedHTTPCookieStorage
class WKScriptMessageHandlerImpl extends NSObject
    implements WKScriptMessageHandler {
    public static ObjCProtocols = [WKScriptMessageHandler];
    public static initWithOwner(owner: WeakRef<WebView>): WKScriptMessageHandlerImpl {
        const handler = <WKScriptMessageHandlerImpl>WKScriptMessageHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }
    private _owner: WeakRef<WebView>;

    public userContentControllerDidReceiveScriptMessage(userContentController: WKUserContentController, message: WKScriptMessage): void {
        const owner = this._owner.get();
        if (owner) {
            let body: string = message.body;
            let cookies = body.split("; ");
            for (let i = 0; i < cookies.length; i++) {
                let comps = cookies[i].split('=');

                if (comps.length < 2) {
                    continue;
                }

                // we need NSHTTPCookieOriginURL for NSHTTPCookie to be created
                let cookieWithURL = cookies[i] + "; ORIGINURL=" + owner.ios.URL ;
                let httpCookie = this.getCookie(cookieWithURL);

                if (httpCookie) {
                    traceWrite("Adding cookie to sharedHTTPCookieStorage = " + httpCookie, traceCategories.Debug);
                    NSHTTPCookieStorage.sharedHTTPCookieStorage.setCookie(httpCookie);
                }
            }
        }
    }

    private getCookie(cookieWithURL): NSHTTPCookie {
        let cookieExpiresIn = null;
        const owner = this._owner.get();
        if (owner) {
            cookieExpiresIn = owner.cookieExpiresIn;
        }

        let cookieMap = this.cookieMap(cookieWithURL);
        let cookieProperties = NSMutableDictionary.new();

        for (let key in cookieMap) {

            let value = cookieMap[key];
            let uppercaseKey = key.toUpperCase();

            if ( uppercaseKey === "DOMAIN" ) {
                if (!value.startsWith('.') && !value.startsWith('www')) {
                    value = "." + value;
                }

                cookieProperties.setObjectForKey(value, NSHTTPCookieDomain);
            } else if ( uppercaseKey === "VERSION" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookieVersion);
            } else if ( uppercaseKey === "MAX-AGE" || uppercaseKey === "MAXAGE" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookieMaximumAge);
            } else if ( uppercaseKey === "PATH" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookiePath);
            } else if ( uppercaseKey === "ORIGINURL" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookieOriginURL);
            } else if ( uppercaseKey === "PORT" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookiePort);
            } else if ( uppercaseKey === "SECURE" || uppercaseKey === "ISSECURE" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookieSecure);
            } else if ( uppercaseKey === "COMMENT" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookieComment);
            } else if ( uppercaseKey === "COMMENTURL" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookieCommentURL);
            } else if ( uppercaseKey === "EXPIRES" ) {
                let dateFormatter: NSDateFormatter = NSDateFormatter.new();
                dateFormatter.locale = NSLocale.alloc().initWithLocaleIdentifier("en_US");
                dateFormatter.dateFormat = "EEE, dd-MMM-yyyy HH:mm:ss zzz";
                cookieProperties.setObjectForKey(dateFormatter.dateFromString(value), NSHTTPCookieExpires);
            } else if ( uppercaseKey === "DISCART" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookieDiscard);
            } else if ( uppercaseKey === "NAME" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookieName);
            } else if ( uppercaseKey === "VALUE" ) {
                cookieProperties.setObjectForKey(value, NSHTTPCookieValue);
            } else {
                cookieProperties.setObjectForKey(key, NSHTTPCookieName);
                cookieProperties.setObjectForKey(value, NSHTTPCookieValue);
            }
        }

        // document.cookie doesn't return cookie expiration date, so added cookieExpiresIn property for overriding
        if ( !cookieProperties[NSHTTPCookieExpires] && cookieExpiresIn ) {
            let currentDate = NSDate.date();
            let expireDate = currentDate.dateByAddingTimeInterval(cookieExpiresIn);
            cookieProperties.setObjectForKey(expireDate, NSHTTPCookieExpires);
        }

        if ( !cookieProperties.objectForKey(NSHTTPCookiePath) ) {
            cookieProperties.setObjectForKey("/", NSHTTPCookiePath);
        }

        let cookie: NSHTTPCookie = NSHTTPCookie.cookieWithProperties(cookieProperties.copy());
        return cookie;
    }

    private cookieMap(cookieWithURL): any {
        let cookieMap = [];
        let cookieKeyValueStrings = cookieWithURL.split(';');

        for ( let i = 0; i < cookieKeyValueStrings.length; i++ ) {
            let cookieKeyValueString = cookieKeyValueStrings[i];

            let separator = cookieKeyValueString.indexOf('=');
            if ( separator !== -1 && separator > 0 && separator < cookieKeyValueString.length ) {
                let key = cookieKeyValueString.substring(0, separator).trim();
                let value = cookieKeyValueString.substring(separator + 1).trim()
                cookieMap[key] = value;
            }
        }

        return cookieMap;
    }
}

export class WebView extends WebViewBase {
    nativeViewProtected: WKWebView;
    private _delegate: any;
    private _wkUController: any;
    private _isCookieHandlerAttached: boolean = false;

    createNativeView() {
        const jScript = "var meta = document.createElement('meta'); meta.setAttribute('name', 'viewport'); meta.setAttribute('content', 'initial-scale=1.0'); document.getElementsByTagName('head')[0].appendChild(meta);";
        const wkUScript = WKUserScript.alloc().initWithSourceInjectionTimeForMainFrameOnly(jScript, WKUserScriptInjectionTime.AtDocumentEnd, true);
        const wkUController = WKUserContentController.new();
        wkUController.addUserScript(wkUScript);
        const configuration = WKWebViewConfiguration.new();
        configuration.userContentController = wkUController;
        configuration.preferences.setValueForKey(
            true,
            "allowFileAccessFromFileURLs"
        );
        return new WKWebView({
            frame: CGRectZero,
            configuration: configuration
        });
    }

    initNativeView() {
        super.initNativeView();
        this._delegate = WKNavigationDelegateImpl.initWithOwner(new WeakRef(this));
    }

    disposeNativeView() {
        this._delegate = null;
        super.disposeNativeView();
    }

    private javascriptStringWithCookie(cookie: NSHTTPCookie) {
        let cookieString = cookie.name + "=" + cookie.value + ";domain=" + cookie.domain + ";path=" + (cookie.path?cookie.path:'/');

        if (cookie.secure) {
            cookieString += ";secure=true";
        }

        return cookieString;
    }

    @profile
    public onLoaded() {
        super.onLoaded();
        this.ios.navigationDelegate = this._delegate;
    }

    public onUnloaded() {
        this.ios.navigationDelegate = null;
        super.onUnloaded();
    }

    get ios(): WKWebView {
        return this.nativeViewProtected;
    }

    public stopLoading() {
        this.ios.stopLoading();
    }

    setupCookieHandlers() {
        if (this.syncCookies && !this._isCookieHandlerAttached) {
            this._isCookieHandlerAttached = true;
            // "updateCookies" message handler is used to get all the cookies from webpage
            const jScriptOutCookie = "window.webkit.messageHandlers.updateCookies.postMessage(document.cookie);";
            const wkUScriptOutCookie = WKUserScript.alloc().initWithSourceInjectionTimeForMainFrameOnly(jScriptOutCookie, WKUserScriptInjectionTime.AtDocumentStart, true);
            this._wkUController.addUserScript(wkUScriptOutCookie);
            let cookieScriptHandler = WKScriptMessageHandlerImpl.initWithOwner(new WeakRef(this));
            this._wkUController.addScriptMessageHandlerName(cookieScriptHandler, "updateCookies");

            // For AJAX calls to work document.cookie is updated with the cookies from sharedHTTPCookieStorage
            let jScriptInCookie = "var cookieNames = document.cookie.split('; ').map(function(cookie) { return cookie.split('=')[0] } );";
            for (let i = 0; i < NSHTTPCookieStorage.sharedHTTPCookieStorage.cookies.count; i++) {
                let cookie: NSHTTPCookie = NSHTTPCookieStorage.sharedHTTPCookieStorage.cookies[i];
                if (cookie.name.includes("'")) {
                    console.log("Skipping " + cookie.properties + " because it contains a '");
                    continue;
                }

                jScriptInCookie += "if (cookieNames.indexOf('" + cookie.name + "') == -1) { document.cookie='" + this.javascriptStringWithCookie(cookie) + "'; };";
            }

            traceWrite("jScriptInCookie = " + jScriptInCookie, traceCategories.Debug);
            const wkUScriptInCookie = WKUserScript.alloc().initWithSourceInjectionTimeForMainFrameOnly(jScriptInCookie, WKUserScriptInjectionTime.AtDocumentStart, true);
            this._wkUController.addUserScript(wkUScriptInCookie);
        }
    }

    public _loadUrl(src: string) {
        if (src.startsWith('file:///')) {
            this.ios.loadFileURLAllowingReadAccessToURL(NSURL.URLWithString(src), NSURL.URLWithString(src));
        } else {
            this.setupCookieHandlers();
            let url: NSURL = NSURL.URLWithString(src);
            let request: NSMutableURLRequest = NSMutableURLRequest.requestWithURL(url);

            if (this.syncCookies) {
                let validDomain = url.host;
                let requestIsSecure = (url.scheme === 'https');

                let cookieArray = [];
                for (let i = 0; i < NSHTTPCookieStorage.sharedHTTPCookieStorage.cookies.count; i++) {
                    let cookie: NSHTTPCookie = NSHTTPCookieStorage.sharedHTTPCookieStorage.cookies[i];
                    if (cookie.name.includes("'")) {
                        traceWrite("Skipping " + cookie.properties + " because it contains a '", traceCategories.Debug);                
                        continue;
                    }

                    if (!cookie.domain.endsWith(validDomain)) {
                        traceWrite("Skipping " + cookie.properties + " (because not " + validDomain + ")", traceCategories.Debug);     
                        continue;
                    }

                    // Are we secure only?
                    if (cookie.secure && !requestIsSecure) {
                        traceWrite("Skipping " + cookie.properties + " (because " + url.absoluteString + " not secure)", traceCategories.Debug);                             
                        continue;
                    }

                    cookieArray.push(cookie.name + "=" + cookie.value);
                }

                let header = cookieArray.join(';');
                traceWrite("cookie header = " + header, traceCategories.Debug);        
                request.setValueForHTTPHeaderField(header, 'Cookie');
            }
            this.ios.loadRequest(request);
        }
    }

    public _loadData(content: string) {
        this.ios.loadHTMLStringBaseURL(content, NSURL.alloc().initWithString(`file:///${knownFolders.currentApp().path}/`));
    }

    get canGoBack(): boolean {
        return this.ios.canGoBack;
    }

    get canGoForward(): boolean {
        return this.ios.canGoForward;
    }

    public goBack() {
        this.ios.goBack();
    }

    public goForward() {
        this.ios.goForward();
    }

    public reload() {
        this.ios.reload();
    }
} 