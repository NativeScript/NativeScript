import { WebViewBase, knownFolders, traceWrite, traceEnabled, traceCategories, NavigationType } from "./web-view-common";

export * from "./web-view-common";

class UIWebViewDelegateImpl extends NSObject implements UIWebViewDelegate {
    public static ObjCProtocols = [UIWebViewDelegate];

    private _owner: WeakRef<WebView>;

    public static initWithOwner(owner: WeakRef<WebView>): UIWebViewDelegateImpl {
        let delegate = <UIWebViewDelegateImpl>UIWebViewDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    public webViewShouldStartLoadWithRequestNavigationType(webView: UIWebView, request: NSURLRequest, navigationType: number) {
        let owner = this._owner.get();

        if (owner && request.URL) {
            let navType: NavigationType = "other";

            switch (navigationType) {
                case UIWebViewNavigationType.LinkClicked:
                    navType = "linkClicked";
                    break;
                case UIWebViewNavigationType.FormSubmitted:
                    navType = "formSubmitted";
                    break;
                case UIWebViewNavigationType.BackForward:
                    navType = "backForward";
                    break;
                case UIWebViewNavigationType.Reload:
                    navType = "reload";
                    break;
                case UIWebViewNavigationType.FormResubmitted:
                    navType = "formResubmitted";
                    break;
            }

            if (traceEnabled()) {
                traceWrite("UIWebViewDelegateClass.webViewShouldStartLoadWithRequestNavigationType(" + request.URL.absoluteString + ", " + navigationType + ")", traceCategories.Debug);
            }
            owner._onLoadStarted(request.URL.absoluteString, navType);
        }

        return true;
    }

    public webViewDidStartLoad(webView: UIWebView) {
        if (traceEnabled()) {
            traceWrite("UIWebViewDelegateClass.webViewDidStartLoad(" + webView.request.URL + ")", traceCategories.Debug);
        }
    }

    public webViewDidFinishLoad(webView: UIWebView) {
        if (traceEnabled()) {
            traceWrite("UIWebViewDelegateClass.webViewDidFinishLoad(" + webView.request.URL + ")", traceCategories.Debug);
        }
        let owner = this._owner.get();
        if (owner) {
            owner._onLoadFinished(webView.request.URL.absoluteString);
        }
    }

    public webViewDidFailLoadWithError(webView: UIWebView, error: NSError) {
        let owner = this._owner.get();
        if (owner) {
            let src = owner.src;
            if (webView.request && webView.request.URL) {
                src = webView.request.URL.absoluteString;
            }

            if (traceEnabled()) {
                traceWrite("UIWebViewDelegateClass.webViewDidFailLoadWithError(" + error.localizedDescription + ")", traceCategories.Debug);
            }
            if (owner) {
                owner._onLoadFinished(src, error.localizedDescription);
            }
        }
    }
}

export class WebView extends WebViewBase {
    private _ios: UIWebView;
    private _delegate: any;

    constructor() {
        super();

        this.nativeView = this._ios = UIWebView.new();
        this._delegate = UIWebViewDelegateImpl.initWithOwner(new WeakRef(this));
    }

    public onLoaded() {
        super.onLoaded();
        this._ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this._ios.delegate = null;
        super.onUnloaded();
    }

    get ios(): UIWebView {
        return this._ios;
    }

    public stopLoading() {
        this._ios.stopLoading();
    }

    public _loadFileOrResource(path: string, content: string) {
        var baseURL = NSURL.fileURLWithPath(NSString.stringWithString(path).stringByDeletingLastPathComponent);
        this._ios.loadHTMLStringBaseURL(content, baseURL);
    }

    public _loadHttp(src: string) {
        this._ios.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(src)));
    }

    public _loadData(content: string) {
        this._ios.loadHTMLStringBaseURL(content, NSURL.alloc().initWithString(`file:///${knownFolders.currentApp().path}/`));
    }

    get canGoBack(): boolean {
        return this._ios.canGoBack;
    }

    get canGoForward(): boolean {
        return this._ios.canGoForward;
    }

    public goBack() {
        this._ios.goBack();
    }

    public goForward() {
        this._ios.goForward();
    }

    public reload() {
        this._ios.reload();
    }
} 