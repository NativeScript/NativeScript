import common = require("ui/web-view/web-view-common");
import trace = require("trace");
import utils = require("utils/utils");
import fs = require("file-system");

declare var exports;
require("utils/module-merge").merge(common, exports);

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
        trace.write("WebView._loadUrl(" + url + ")", trace.categories.Debug);
        this._android.stopLoading();
        url = this._getRealUrl(url);
        this._android.loadUrl(url);
    }

    public _loadSrc(src: string) {
        trace.write("WebView._loadSrc(" + src + ")", trace.categories.Debug);

        this._android.stopLoading();
        this._android.loadUrl("about:blank");

        if (utils.isFileOrResourcePath(src)) {

            if (src.indexOf("~/") === 0) {
                src = fs.path.join(fs.knownFolders.currentApp().path, src.replace("~/", ""));
            }

            var file = fs.File.fromPath(src);
            if (file) {
                file.readText().then((r) => {
                    this._android.loadData(r, "text/html", null);
                });
            }
        } else if (src.indexOf("http://") === 0 || src.indexOf("https://") === 0) {
            this._android.loadUrl(src);
        } else {
            this._android.loadData(src, "text/html", null);
        }
    }

    get canGoBack(): boolean {
        return this._android.canGoBack();
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
