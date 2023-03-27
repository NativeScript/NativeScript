import { WebViewBase } from './web-view-common';
import { WebView } from '.';
import { EventData, Observable } from '../../data/observable';

export type WebViewNavigationType = 'linkClicked' | 'formSubmitted' | 'backForward' | 'reload' | 'formResubmitted' | 'other' | undefined;

export interface LoadEventData<T extends Observable = WebViewBase> extends EventData<T> {
	url: string;
	navigationType: WebViewNavigationType;
	error: string;
}

export interface WebViewClient {
	new (owner: WebView): any /* android.webkit.WebViewClient */;
}
