import { WebViewBase, knownFolders, traceEnabled, traceWrite, traceCategories } from "./web-view-common";

export * from "./web-view-common";

interface WebViewClient {
    new (owner: WebView): android.webkit.WebViewClient;
}

let WebViewClient: WebViewClient;

function initializeWebViewClient(): void {
    if (WebViewClient) {
        return;
    }

    class WebViewClientImpl extends android.webkit.WebViewClient {
        private _view: WebViewBase;

        constructor(view: WebViewBase) {
            super();

            this._view = view;
            return global.__native(this);
        }

        public shouldOverrideUrlLoading(view: android.webkit.WebView, url: string) {
            if (traceEnabled()) {
                traceWrite("WebViewClientClass.shouldOverrideUrlLoading(" + url + ")", traceCategories.Debug);
            }
            return false;
        }

        public onPageStarted(view: android.webkit.WebView, url: string, favicon: android.graphics.Bitmap) {
            super.onPageStarted(view, url, favicon);

            if (this._view) {
                if (traceEnabled()) {
                    traceWrite("WebViewClientClass.onPageStarted(" + url + ", " + favicon + ")", traceCategories.Debug);
                }
                this._view._onLoadStarted(url, WebViewBase.navigationTypes[WebViewBase.navigationTypes.indexOf("linkClicked")]);
            }
        }

        public onPageFinished(view: android.webkit.WebView, url: string) {
            super.onPageFinished(view, url);

            if (this._view) {
                if (traceEnabled()) {
                    traceWrite("WebViewClientClass.onPageFinished(" + url + ")", traceCategories.Debug);
                }
                this._view._onLoadFinished(url, undefined);
            }
        }

        public onReceivedError() {
            let view: android.webkit.WebView = arguments[0];

            if (arguments.length === 4) {
                let errorCode: number = arguments[1];
                let description: string = arguments[2];
                let failingUrl: string = arguments[3];

                super.onReceivedError(view, errorCode, description, failingUrl);

                if (this._view) {
                    if (traceEnabled()) {
                        traceWrite("WebViewClientClass.onReceivedError(" + errorCode + ", " + description + ", " + failingUrl + ")", traceCategories.Debug);
                    }
                    this._view._onLoadFinished(failingUrl, description + "(" + errorCode + ")");
                }
            } else {
                let request: any = arguments[1];
                let error: any = arguments[2];

                super.onReceivedError(view, request, error);

                if (this._view) {
                    if (traceEnabled()) {
                        traceWrite("WebViewClientClass.onReceivedError(" + error.getErrorCode() + ", " + error.getDescription() + ", " + (error.getUrl && error.getUrl()) + ")", traceCategories.Debug);
                    }
                    this._view._onLoadFinished(error.getUrl && error.getUrl(), error.getDescription() + "(" + error.getErrorCode() + ")");
                }
            }
        }
    };

    WebViewClient = WebViewClientImpl;
}

export class WebView extends WebViewBase {
    private _android: android.webkit.WebView;
    private _webViewClient: android.webkit.WebViewClient;

    get android(): android.webkit.WebView {
        return this._android;
    }

    public _createNativeView() {
        initializeWebViewClient();
        this._webViewClient = new WebViewClient(this);
        this._android = new android.webkit.WebView(this._context);
        this._android.getSettings().setJavaScriptEnabled(true);
        this._android.getSettings().setBuiltInZoomControls(true);
        this._android.setWebViewClient(this._webViewClient);
    }

    public _resetNativeView() {
        if (this.android) {
            this.android.destroy();
        }
        super._resetNativeView();
    }

    public _loadUrl(url: string) {
        if (!this._android) {
            return;
        }

        if (traceEnabled()) {
            traceWrite("WebView._loadUrl(" + url + ")", traceCategories.Debug);
        }
        this._android.stopLoading();
        this._android.loadUrl(url);
    }

    public _loadFileOrResource(path: string, content: string) {
        if (!this._android) {
            return;
        }

        const baseUrl = `file:///${path.substring(0, path.lastIndexOf('/') + 1)}`;
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

        const baseUrl = `file:///${knownFolders.currentApp().path}/`;
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