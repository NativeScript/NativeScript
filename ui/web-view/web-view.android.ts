import common = require("./web-view-common");
import trace = require("trace");
import fs = require("file-system");

global.moduleMerge(common, exports);

class WebViewClientClass extends android.webkit.WebViewClient {
    private _view: common.WebView;

    constructor(view: common.WebView) {
        super();

        this._view = view;
        return global.__native(this);
    }

    public shouldOverrideUrlLoading(view: android.webkit.WebView, url: string) {
        trace.write("WebViewClientClass.shouldOverrideUrlLoading(" + url + ")", trace.categories.Debug);
        return false;
    }

    public onPageStarted(view: android.webkit.WebView, url: string, favicon: android.graphics.Bitmap) {
        super.onPageStarted(view, url, favicon);

        if (this._view) {
            trace.write("WebViewClientClass.onPageStarted(" + url + ", " + favicon + ")", trace.categories.Debug);
            this._view._onLoadStarted(url);
        }
    }

    public onPageFinished(view: android.webkit.WebView, url: string) {
        super.onPageFinished(view, url);

        if (this._view) {
            trace.write("WebViewClientClass.onPageFinished(" + url + ")", trace.categories.Debug);
            this._view._onLoadFinished(url, undefined);
        }
    }

    public onReceivedError(view: android.webkit.WebView, errorCode: number, description: string, failingUrl: string) {
        super.onReceivedError(view, errorCode, description, failingUrl);

        if (this._view) {
            trace.write("WebViewClientClass.onReceivedError(" + errorCode + ", " + description + ", " + failingUrl + ")", trace.categories.Debug);
            this._view._onLoadFinished(failingUrl, description + "(" + errorCode + ")");
        }
    }
};

export class WebView extends common.WebView {
    private _android: android.webkit.WebView;
    private _webViewClient: android.webkit.WebViewClient;

    constructor() {
        super();

        this._webViewClient = new WebViewClientClass(this);
    }

    get android(): android.webkit.WebView {
        return this._android;
    }

    public _createUI() {
        this._android = new android.webkit.WebView(this._context);
        this._android.getSettings().setJavaScriptEnabled(true);
        this._android.getSettings().setBuiltInZoomControls(true);
        this._android.setWebViewClient(this._webViewClient);
    }

    public _loadUrl(url: string) {
        if (!this._android) {
            return;
        }

        trace.write("WebView._loadUrl(" + url + ")", trace.categories.Debug);
        this._android.stopLoading();
        this._android.loadUrl(url);
    }

    public _loadFileOrResource(path: string, content: string) {
        if (!this._android) {
            return;
        }

        var baseUrl = `file:///${path.substring(0, path.lastIndexOf('/') + 1) }`;
        this._android.loadDataWithBaseURL(baseUrl, content, "text/html; charset=utf-8", "utf-8", null);
    }

    public _loadHttp(src: string) {
        if (!this._android) {
            return;
        }

        this._android.loadUrl(src);
    }

    public _loadData(src: string) {
        if (!this._android) {
            return;
        }

        var baseUrl = `file:///${fs.knownFolders.currentApp().path}/`;
        this._android.loadDataWithBaseURL(baseUrl, src, "text/html; charset=utf-8", "utf-8", null);
    }

    get canGoBack(): boolean {
        return this._android.canGoBack();
    }

    public stopLoading() {
        if (this._android) {
            this._android.stopLoading();
        }
    }

    get canGoForward(): boolean {
        return this._android.canGoForward();
    }

    public goBack() {
        this._android.goBack();
    }

    public goForward() {
        this._android.goForward();
    }

    public reload() {
        this._android.reload();
    }
}
