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

    public webViewDidFailProvisionalNavigationWithError(webView: WKWebView, navigation: WKNavigation, error: NSError): void {
        const owner = this._owner.get();
        if (owner) {
            let src = owner.src;
            if (webView.URL) {
                src = webView.URL.absoluteString;
            }
            if (traceEnabled()) {
                traceWrite("WKNavigationDelegateClass.webViewDidFailProvisionalNavigationWithError(" + error.localizedDescription + ")", traceCategories.Debug);
            }
            owner._onLoadFinished(src, error.localizedDescription);
        }
    }

}

export class WebView extends WebViewBase {
    nativeViewProtected: WKWebView;
    private _delegate: any;

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

    public _loadUrl(src: string) {
        if (src.startsWith("file:///")) {
            const cachePath = src.substring(0, src.lastIndexOf("/"));
            this.ios.loadFileURLAllowingReadAccessToURL(NSURL.URLWithString(src), NSURL.URLWithString(cachePath));
        } else {
            this.ios.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(src)));
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
