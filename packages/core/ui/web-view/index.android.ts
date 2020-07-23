import { WebViewBase, WebViewClient } from './web-view-common';
import { Trace } from '../../trace';
import { knownFolders } from '../../file-system';

export * from './web-view-common';

let WebViewClient: WebViewClient;

function initializeWebViewClient(): void {
	if (WebViewClient) {
		return;
	}

	@NativeClass
	class WebViewClientImpl extends android.webkit.WebViewClient {
		constructor(public owner: WebViewBase) {
			super();

			return global.__native(this);
		}

		public shouldOverrideUrlLoading(view: android.webkit.WebView, url: any) {
			if (Trace.isEnabled()) {
				Trace.write('WebViewClientClass.shouldOverrideUrlLoading(' + url + ')', Trace.categories.Debug);
			}

			return false;
		}

		public onPageStarted(view: android.webkit.WebView, url: string, favicon: android.graphics.Bitmap) {
			super.onPageStarted(view, url, favicon);
			const owner = this.owner;
			if (owner) {
				if (Trace.isEnabled()) {
					Trace.write('WebViewClientClass.onPageStarted(' + url + ', ' + favicon + ')', Trace.categories.Debug);
				}
				owner._onLoadStarted(url, undefined);
			}
		}

		public onPageFinished(view: android.webkit.WebView, url: string) {
			super.onPageFinished(view, url);
			const owner = this.owner;
			if (owner) {
				if (Trace.isEnabled()) {
					Trace.write('WebViewClientClass.onPageFinished(' + url + ')', Trace.categories.Debug);
				}
				owner._onLoadFinished(url, undefined);
			}
		}

		public onReceivedError() {
			let view: android.webkit.WebView = arguments[0];

			if (arguments.length === 4) {
				let errorCode: number = arguments[1];
				let description: string = arguments[2];
				let failingUrl: string = arguments[3];

				super.onReceivedError(view, errorCode, description, failingUrl);

				const owner = this.owner;
				if (owner) {
					if (Trace.isEnabled()) {
						Trace.write('WebViewClientClass.onReceivedError(' + errorCode + ', ' + description + ', ' + failingUrl + ')', Trace.categories.Debug);
					}
					owner._onLoadFinished(failingUrl, description + '(' + errorCode + ')');
				}
			} else {
				let request: any = arguments[1];
				let error: any = arguments[2];

				// before API version 23 there's no onReceiveError with 3 parameters, so it shouldn't come here
				// but we don't have the onReceivedError with 3 parameters there and that's why we are ignorint tye typescript error
				// @ts-ignore TS2554
				super.onReceivedError(view, request, error);

				const owner = this.owner;
				if (owner) {
					if (Trace.isEnabled()) {
						Trace.write('WebViewClientClass.onReceivedError(' + error.getErrorCode() + ', ' + error.getDescription() + ', ' + (error.getUrl && error.getUrl()) + ')', Trace.categories.Debug);
					}
					owner._onLoadFinished(error.getUrl && error.getUrl(), error.getDescription() + '(' + error.getErrorCode() + ')');
				}
			}
		}
	}

	WebViewClient = <any>WebViewClientImpl;
}

export class WebView extends WebViewBase {
	nativeViewProtected: android.webkit.WebView;

	public createNativeView() {
		const nativeView = new android.webkit.WebView(this._context);
		nativeView.getSettings().setJavaScriptEnabled(true);
		nativeView.getSettings().setBuiltInZoomControls(true);

		return nativeView;
	}

	public initNativeView(): void {
		super.initNativeView();
		initializeWebViewClient();
		const nativeView = this.nativeViewProtected;
		const client = new WebViewClient(<any>this);
		nativeView.setWebViewClient(client);
		(<any>nativeView).client = client;
	}

	public disposeNativeView() {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			nativeView.destroy();
		}

		(<any>nativeView).client.owner = null;
		super.disposeNativeView();
	}

	public _loadUrl(src: string) {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		nativeView.loadUrl(src);
	}

	public _loadData(src: string) {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		const baseUrl = `file:///${knownFolders.currentApp().path}/`;
		nativeView.loadDataWithBaseURL(baseUrl, src, 'text/html', 'utf-8', null);
	}

	get canGoBack(): boolean {
		return this.nativeViewProtected.canGoBack();
	}

	public stopLoading() {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			nativeView.stopLoading();
		}
	}

	get canGoForward(): boolean {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			return nativeView.canGoForward();
		}

		return false;
	}

	public goBack() {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			return nativeView.goBack();
		}
	}

	public goForward() {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			return nativeView.goForward();
		}
	}

	public reload() {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			return nativeView.reload();
		}
	}
}
