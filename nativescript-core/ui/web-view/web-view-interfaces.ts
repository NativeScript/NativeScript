import { WebView } from ".";
import { EventData } from "../core/view";

export type NavigationType = "linkClicked" | "formSubmitted" | "backForward" | "reload" | "formResubmitted" | "other" | undefined;

export interface LoadEventData extends EventData {
    url: string;
    navigationType: NavigationType;
    error: string;
}

export interface WebViewClient {
    new(owner: WebView): any /* android.webkit.WebViewClient */;
}
