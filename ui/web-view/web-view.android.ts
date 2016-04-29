import common = require("./web-view-common");
import trace = require("trace");
import * as fileSystemModule from "file-system";

global.moduleMerge(common, exports);

var fs: typeof fileSystemModule;
function ensureFS() {
    if (!fs) {
        fs = require("file-system");
    }
}

var WebViewClientClass;
function ensureWebViewClientClass() {
    if (WebViewClientClass) {
        return;
    }

    class WebViewClientClassInner extends android.webkit.WebViewClient {
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
                this._view._onLoadStarted(url, common.WebView.navigationTypes[common.WebView.navigationTypes.indexOf("linkClicked")]);
            }
        }

        public onPageFinished(view: android.webkit.WebView, url: string) {
            super.onPageFinished(view, url);

            if (this._view) {
                trace.write("WebViewClientClass.onPageFinished(" + url + ")", trace.categories.Debug);
                this._view._onLoadFinished(url, undefined);
            }
        }

        public onReceivedError() {
            var view: android.webkit.WebView = arguments[0];

            if (arguments.length === 4) {

                var errorCode: number = arguments[1];
                var description: string = arguments[2];
                var failingUrl: string = arguments[3];

                super.onReceivedError(view, errorCode, description, failingUrl);

                if (this._view) {
                    trace.write("WebViewClientClass.onReceivedError(" + errorCode + ", " + description + ", " + failingUrl + ")", trace.categories.Debug);
                    this._view._onLoadFinished(failingUrl, description + "(" + errorCode + ")");
                }
            } else {

                var request: any = arguments[1];
                var error: any = arguments[2];

                super.onReceivedError(view, request, error);

                if (this._view) {
                    trace.write("WebViewClientClass.onReceivedError(" + error.getErrorCode() + ", " + error.getDescription() + ", " + (error.getUrl && error.getUrl()) + ")", trace.categories.Debug);
                    this._view._onLoadFinished(error.getUrl && error.getUrl(), error.getDescription() + "(" + error.getErrorCode() + ")");
                }
            }
        }
    };

    WebViewClientClass = WebViewClientClassInner;
}

export class WebView extends common.WebView {
    private _android: android.webkit.WebView;
    private _webViewClient: android.webkit.WebViewClient;

    constructor() {
        super();

        ensureWebViewClientClass();
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
        this._android.loadDataWithBaseURL(baseUrl, content, "text/html", "utf-8", null);
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

        ensureFS();

        var baseUrl = `file:///${fs.knownFolders.currentApp().path}/`;
        this._android.loadDataWithBaseURL(baseUrl, src, "text/html", "utf-8", null);
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
