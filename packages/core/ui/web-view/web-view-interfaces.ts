import { WebView } from '.';
import { EventData, Observable } from '../../data/observable';
import type { WebViewBase } from './web-view-common';

export type WebViewNavigationType = 'linkClicked' | 'formSubmitted' | 'backForward' | 'reload' | 'formResubmitted' | 'other' | undefined;

export interface LoadEventData<T = WebViewBase> extends EventData<T> {
	url: string;
	navigationType: WebViewNavigationType;
	error: string;
}

export interface WebViewClient {
	new (owner: WebView): any /* android.webkit.WebViewClient */;
}
