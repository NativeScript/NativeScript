import { LoadEventData, WebViewNavigationType } from './web-view-interfaces';
import { ContainerView, CSSType } from '../core/view';
import { Property } from '../core/properties';
import { EventData } from '../../data/observable';
import { knownFolders } from '../../file-system';

export * from './web-view-interfaces';

export const srcProperty = new Property<WebViewBase, string>({ name: 'src' });

@CSSType('WebView')
export abstract class WebViewBase extends ContainerView {
	public static loadStartedEvent = 'loadStarted';
	public static loadFinishedEvent = 'loadFinished';

	public src: string;

	public _onLoadFinished(url: string, error?: string) {
		let args = <LoadEventData>{
			eventName: WebViewBase.loadFinishedEvent,
			object: this,
			url: url,
			navigationType: undefined,
			error: error,
		};

		this.notify(<any>args);
	}

	public _onLoadStarted(url: string, navigationType: WebViewNavigationType) {
		let args = <LoadEventData>{
			eventName: WebViewBase.loadStartedEvent,
			object: this,
			url: url,
			navigationType: navigationType,
			error: undefined,
		};

		this.notify(<any>args);
	}

	abstract _loadUrl(src: string): void;

	abstract _loadData(src: string): void;

	abstract stopLoading(): void;

	get canGoBack(): boolean {
		throw new Error('This member is abstract.');
	}

	get canGoForward(): boolean {
		throw new Error('This member is abstract.');
	}

	abstract goBack(): void;

	abstract goForward(): void;

	abstract reload(): void;

	[srcProperty.getDefault](): string {
		return '';
	}
	[srcProperty.setNative](src: string) {
		this.stopLoading();

		// Add file:// prefix for local files.
		// They should be loaded with _loadUrl() method as it handles query params.
		if (src.indexOf('~/') === 0) {
			let appPath = knownFolders.currentApp().path;
			if (appPath && appPath.indexOf('/') !== 0) {
				// ensure slash is correct
				appPath = `/${appPath}`;
			}
			src = `file://${appPath}/` + src.substr(2);
		} else if (src.indexOf('/') === 0) {
			src = 'file://' + src;
		}

		// loading local files from paths with spaces may fail
		if (src.toLowerCase().indexOf('file:///') === 0) {
			src = encodeURI(src);
		}

		if (src.toLowerCase().indexOf('http://') === 0 || src.toLowerCase().indexOf('https://') === 0 || src.toLowerCase().indexOf('file:///') === 0) {
			this._loadUrl(src);
		} else {
			this._loadData(src);
		}
	}
}

// HACK: Use an interface with the same name, so that the class above fulfills the 'implements' requirement
// HACK: We use the 'implements' to verify the class above is the same as the one declared in the d.ts
// HACK: We declare all these 'on' statements, so that they can appear in the API reference
// HACK: Do we need this? Is it useful? There are static fields to the WebViewBase class for the event names.
export interface WebViewBase {
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;
	on(event: 'loadFinished', callback: (args: LoadEventData) => void, thisArg?: any): void;
	on(event: 'loadStarted', callback: (args: LoadEventData) => void, thisArg?: any): void;
}

srcProperty.register(WebViewBase);
