import { WebView as WebViewDefinition, LoadEventData, NavigationType } from ".";
import { View, Property } from "../core/view";
import { isFileOrResourcePath } from "../../utils/utils";
import { File, knownFolders, path } from "../../file-system";

export { File, knownFolders, path, NavigationType };
export * from "../core/view";

export const srcProperty = new Property<WebViewBase, string>({ name: "src" });

export abstract class WebViewBase extends View implements WebViewDefinition {
    public static loadStartedEvent = "loadStarted";
    public static loadFinishedEvent = "loadFinished";

    public src: string;

    public _onLoadFinished(url: string, error?: string) {
        let args = <LoadEventData>{
            eventName: WebViewBase.loadFinishedEvent,
            object: this,
            url: url,
            navigationType: undefined,
            error: error
        };

        this.notify(args);
    }

    public _onLoadStarted(url: string, navigationType: NavigationType) {
        let args = <LoadEventData>{
            eventName: WebViewBase.loadStartedEvent,
            object: this,
            url: url,
            navigationType: navigationType,
            error: undefined
        };

        this.notify(args);
    }

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

    [srcProperty.getDefault](): string {
        return "";
    }
    [srcProperty.setNative](src: string) {
        this.stopLoading();

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

    get url() : string {
        throw new Error("Property url of WebView is deprecated. Use src istead");
    }
    set url(value:string){
        throw new Error("Property url of WebView is deprecated. Use src istead")
    }
}

srcProperty.register(WebViewBase);
