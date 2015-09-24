import definition = require("ui/web-view");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils");
import fs = require("file-system");
import trace = require("trace");

var urlProperty = new dependencyObservable.Property(
    "url",
    "WebView",
    new proxy.PropertyMetadata("")
    );

function onUrlPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var webView = <WebView>data.object;

    if (webView._suspendLoading) {
        return;
    }

    webView._loadUrl(data.newValue);
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>urlProperty.metadata).onSetNativeValue = onUrlPropertyChanged;

var srcProperty = new dependencyObservable.Property(
    "src",
    "WebView",
    new proxy.PropertyMetadata("")
    );

function onSrcPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var webView = <WebView>data.object;

    if (webView._suspendLoading) {
        return;
    }

    webView.stopLoading();

    var src = <string>data.newValue;
    trace.write("WebView._loadSrc(" + src + ")", trace.categories.Debug);

    if (utils.isFileOrResourcePath(src)) {
        if (src.indexOf("~/") === 0) {
            src = fs.path.join(fs.knownFolders.currentApp().path, src.replace("~/", ""));
        }

        if (fs.File.exists(src)) {
            var file = fs.File.fromPath(src);
            var content = file.readTextSync();
            webView._loadFileOrResource(src, content);
        }
    } else if (src.toLowerCase().indexOf("http://") === 0 || src.toLowerCase().indexOf("https://") === 0) {
        webView._loadHttp(src);
    } else {
        webView._loadData(src);
    }
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>srcProperty.metadata).onSetNativeValue = onSrcPropertyChanged;

export class WebView extends view.View implements definition.WebView {
    public static loadStartedEvent = "loadStarted";
    public static loadFinishedEvent = "loadFinished";

    public static urlProperty = urlProperty;
    public static srcProperty = srcProperty;

    public _suspendLoading: boolean;

    constructor() {
        super();
    }

    get url(): string {
        return this._getValue(WebView.urlProperty);
    }

    set url(value: string) {
        this._setValue(WebView.urlProperty, value);
    }

    get src(): string {
        return this._getValue(WebView.srcProperty);
    }

    set src(value: string) {
        this._setValue(WebView.srcProperty, value);
    }

    public _onLoadFinished(url: string, error?: string) {

        this._suspendLoading = true;
        this.url = url;
        this._suspendLoading = false;

        var args = <definition.LoadEventData>{
            eventName: WebView.loadFinishedEvent,
            object: this,
            url: url,
            error: error
        };

        this.notify(args);
    }

    public _onLoadStarted(url: string) {
        var args = <definition.LoadEventData>{
            eventName: WebView.loadStartedEvent,
            object: this,
            url: url,
            error: undefined
        };

        this.notify(args);
    }

    public _loadUrl(url: string) {
        throw new Error("This member is abstract.");
    }

    public _loadFileOrResource(path: string, content: string) {
        throw new Error("This member is abstract.");
    }

    public _loadHttp(src: string) {
        throw new Error("This member is abstract.");
    }

    public _loadData(src: string) {
        throw new Error("This member is abstract.");
    }

    public stopLoading(): void {
        throw new Error("This member is abstract.");
    }

    get canGoBack(): boolean {
        throw new Error("This member is abstract.");
    }

    get canGoForward(): boolean {
        throw new Error("This member is abstract.");
    }

    public goBack() {
        throw new Error("This member is abstract.");
    }

    public goForward() {
        throw new Error("This member is abstract.");
    }

    public reload() {
        throw new Error("This member is abstract.");
    }
} 