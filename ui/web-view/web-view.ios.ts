import common = require("./web-view-common");
import trace = require("trace");

global.moduleMerge(common, exports);

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
            var navTypeIndex = common.WebView.navigationTypes.indexOf("other");

            switch (navigationType) {
                case UIWebViewNavigationType.LinkClicked:
                    navTypeIndex = common.WebView.navigationTypes.indexOf("linkClicked");
                    break;
                case UIWebViewNavigationType.FormSubmitted:
                    navTypeIndex = common.WebView.navigationTypes.indexOf("formSubmitted");
                    break;
                case UIWebViewNavigationType.BackForward:
                    navTypeIndex = common.WebView.navigationTypes.indexOf("backForward");
                    break;
                case UIWebViewNavigationType.Reload:
                    navTypeIndex = common.WebView.navigationTypes.indexOf("reload");
                    break;
                case UIWebViewNavigationType.FormResubmitted:
                    navTypeIndex = common.WebView.navigationTypes.indexOf("formResubmitted");
                    break;
            }

            trace.write("UIWebViewDelegateClass.webViewShouldStartLoadWithRequestNavigationType(" + request.URL.absoluteString + ", " + navigationType + ")", trace.categories.Debug);
            owner._onLoadStarted(request.URL.absoluteString, common.WebView.navigationTypes[navTypeIndex]);
        }

        return true;
    }

    public webViewDidStartLoad(webView: UIWebView) {
        trace.write("UIWebViewDelegateClass.webViewDidStartLoad(" + webView.request.URL + ")", trace.categories.Debug);
    }

    public webViewDidFinishLoad(webView: UIWebView) {
        trace.write("UIWebViewDelegateClass.webViewDidFinishLoad(" + webView.request.URL + ")", trace.categories.Debug);
        let owner = this._owner.get();
        if (owner) {
            owner._onLoadFinished(webView.request.URL.absoluteString);
        }
    }

    public webViewDidFailLoadWithError(webView: UIWebView, error: NSError) {
        let owner = this._owner.get();
        if (owner) {
            var url = owner.url;
            if (webView.request && webView.request.URL) {
                url = webView.request.URL.absoluteString;
            }

            trace.write("UIWebViewDelegateClass.webViewDidFailLoadWithError(" + error.localizedDescription + ")", trace.categories.Debug);
            if (owner) {
                owner._onLoadFinished(url, error.localizedDescription);
            }
        }
    }
}

export class WebView extends common.WebView {
    private _ios: UIWebView;
    private _delegate: any;

    constructor() {
        super();

        this._ios = new UIWebView();
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

    public _loadUrl(url: string) {
        trace.write("WebView._loadUrl(" + url + ")", trace.categories.Debug);

        if (this._ios.loading) {
            this._ios.stopLoading();
        }
        this._ios.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(url)));
    }

    public _loadFileOrResource(path: string, content: string) {
        var baseURL = NSURL.fileURLWithPath(NSString.stringWithString(path).stringByDeletingLastPathComponent);
        this._ios.loadHTMLStringBaseURL(content, baseURL);
    }

    public _loadHttp(src: string) {
        this._ios.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(src)));
    }

    public _loadData(content: string) {
        var fs = require("file-system");

        this._ios.loadHTMLStringBaseURL(content, NSURL.alloc().initWithString(`file:///${fs.knownFolders.currentApp().path}/`));
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
