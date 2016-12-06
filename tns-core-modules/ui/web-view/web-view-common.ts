import { WebView as WebViewDefinition, LoadEventData } from "ui/web-view";
import { View, Property, EventData } from "ui/core/view";
import { isFileOrResourcePath } from "utils/utils";
import { File, knownFolders, path } from "file-system";
import * as trace from "trace";

export { trace, File, knownFolders, path };
export * from "ui/core/view";

export abstract class WebViewBase extends View implements WebViewDefinition {
    public static loadStartedEvent = "loadStarted";
    public static loadFinishedEvent = "loadFinished";

    public static navigationTypes = [
        "linkClicked",
        "formSubmitted",
        "backForward",
        "reload",
        "formResubmitted",
        "other"
    ];

    public _suspendLoading: boolean;

    public src: string;

    public _onLoadFinished(url: string, error?: string) {

        this._suspendLoading = true;
        this._suspendLoading = false;

        let args = <LoadEventData>{
            eventName: WebViewBase.loadFinishedEvent,
            object: this,
            url: url,
            navigationType: undefined,
            error: error
        };

        this.notify(args);
    }

    public _onLoadStarted(url: string, navigationType: string) {
        let args = <LoadEventData>{
            eventName: WebViewBase.loadStartedEvent,
            object: this,
            url: url,
            navigationType: navigationType,
            error: undefined
        };

        this.notify(args);
    }

    abstract _loadUrl(url: string): void;

    abstract _loadFileOrResource(path: string, content: string): void;

    abstract _loadHttp(src: string): void;

    abstract _loadData(src: string): void;

    abstract stopLoading(): void;

    get canGoBack(): boolean {
        throw new Error("This member is abstract.");
    }

    get canGoForward(): boolean {
        throw new Error("This member is abstract.");
    }

    abstract goBack(): void;

    abstract goForward(): void;

    abstract reload(): void;

    get [srcProperty.native](): string {
        return "";
    }
    set [srcProperty.native](src: string) {
        if (this._suspendLoading) {
            return;
        }

        this.stopLoading();

        if (trace.enabled) {
            trace.write("WebView._loadSrc(" + src + ")", trace.categories.Debug);
        }

        if (isFileOrResourcePath(src)) {
            if (src.indexOf("~/") === 0) {
                src = path.join(knownFolders.currentApp().path, src.replace("~/", ""));
            }

            if (File.exists(src)) {
                let file = File.fromPath(src);
                let content = file.readTextSync();
                this._loadFileOrResource(src, content);
            }
        } else if (src.toLowerCase().indexOf("http://") === 0 || src.toLowerCase().indexOf("https://") === 0) {
            this._loadHttp(src);
        } else {
            this._loadData(src);
        }
    }
}

export let srcProperty = new Property<WebViewBase, string>({ name: "url" });
srcProperty.register(WebViewBase);