import common = require("ui/web-view/web-view-common");
import trace = require("trace");

declare var exports;
require("utils/module-merge").merge(common, exports);

class UIWebViewDelegateImpl extends NSObject implements UIWebViewDelegate {
    public static ObjCProtocols = [UIWebViewDelegate];

    static new(): UIWebViewDelegateImpl {
        return <UIWebViewDelegateImpl>super.new();
    }

    private _owner: WebView;

    public initWithOwner(owner: WebView): UIWebViewDelegateImpl {
        this._owner = owner;
        return this;
    }
    
    public webViewShouldStartLoadWithRequestNavigationType(webView: UIWebView, request: NSURLRequest, navigationType: number) {
        if (request.URL) {
            trace.write("UIWebViewDelegateClass.webViewShouldStartLoadWithRequestNavigationType(" + request.URL.absoluteString + ", " + navigationType + ")", trace.categories.Debug);
            this._owner._onLoadStarted(request.URL.absoluteString);
        }
        
        return true;
    }
    
    public webViewDidStartLoad(webView: UIWebView) {
        trace.write("UIWebViewDelegateClass.webViewDidStartLoad(" + webView.request.URL + ")", trace.categories.Debug);
    }

    public webViewDidFinishLoad(webView: UIWebView) {
        trace.write("UIWebViewDelegateClass.webViewDidFinishLoad(" + webView.request.URL + ")", trace.categories.Debug);
        this._owner._onLoadFinished(webView.request.URL.absoluteString);
    }

    public webViewDidFailLoadWithError(webView: UIWebView, error: NSError) {
        var url = this._owner.url;
        if (webView.request && webView.request.URL) {
            url = webView.request.URL.absoluteString;
        }

        trace.write("UIWebViewDelegateClass.webViewDidFailLoadWithError(" + error.localizedDescription + ")", trace.categories.Debug);
        this._owner._onLoadFinished(url, error.localizedDescription);
    }
}

export class WebView extends common.WebView {
    private _ios: UIWebView;
    private _delegate: any;

    constructor() {
        super();

        this._ios = new UIWebView();
        this._delegate = UIWebViewDelegateImpl.new().initWithOwner(this);
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

    public _loadUrl(url: string) {
        trace.write("WebView._loadUrl(" + url + ")", trace.categories.Debug);

        if (this._ios.loading) {
            this._ios.stopLoading();
        }
        this._ios.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(url)));
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