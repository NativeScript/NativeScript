import {WebViewBase} from "./web-view-common";
import * as trace from "trace";
import * as fs from "file-system";

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
            let navTypeIndex = WebViewBase.navigationTypes.indexOf("other");

            switch (navigationType) {
                case UIWebViewNavigationType.LinkClicked:
                    navTypeIndex = WebViewBase.navigationTypes.indexOf("linkClicked");
                    break;
                case UIWebViewNavigationType.FormSubmitted:
                    navTypeIndex = WebViewBase.navigationTypes.indexOf("formSubmitted");
                    break;
                case UIWebViewNavigationType.BackForward:
                    navTypeIndex = WebViewBase.navigationTypes.indexOf("backForward");
                    break;
                case UIWebViewNavigationType.Reload:
                    navTypeIndex = WebViewBase.navigationTypes.indexOf("reload");
                    break;
                case UIWebViewNavigationType.FormResubmitted:
                    navTypeIndex = WebViewBase.navigationTypes.indexOf("formResubmitted");
                    break;
            }

            if (trace.enabled) {
                trace.write("UIWebViewDelegateClass.webViewShouldStartLoadWithRequestNavigationType(" + request.URL.absoluteString + ", " + navigationType + ")", trace.categories.Debug);
            }
            owner._onLoadStarted(request.URL.absoluteString, WebViewBase.navigationTypes[navTypeIndex]);
        }

        return true;
    }

    public webViewDidStartLoad(webView: UIWebView) {
        if (trace.enabled) {
            trace.write("UIWebViewDelegateClass.webViewDidStartLoad(" + webView.request.URL + ")", trace.categories.Debug);
        }
    }

    public webViewDidFinishLoad(webView: UIWebView) {
        if (trace.enabled) {
            trace.write("UIWebViewDelegateClass.webViewDidFinishLoad(" + webView.request.URL + ")", trace.categories.Debug);
        }
        let owner = this._owner.get();
        if (owner) {
            owner._onLoadFinished(webView.request.URL.absoluteString);
        }
    }

    public webViewDidFailLoadWithError(webView: UIWebView, error: NSError) {
        let owner = this._owner.get();
        if (owner) {
            let src  = owner.src;
            if (webView.request && webView.request.URL) {
                src = webView.request.URL.absoluteString;
            }

            if (trace.enabled) {
                trace.write("UIWebViewDelegateClass.webViewDidFailLoadWithError(" + error.localizedDescription + ")", trace.categories.Debug);
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

        this._ios = UIWebView.new();
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
        if (trace.enabled) {
            trace.write("WebView._loadUrl(" + url + ")", trace.categories.Debug);
        }

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