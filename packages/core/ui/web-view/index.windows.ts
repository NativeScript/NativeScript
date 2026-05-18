export * from './web-view-common';

import { WebViewBase } from './web-view-common';

export class WebView extends WebViewBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.WebView;
	private _windows: Windows.UI.Xaml.Controls.WebView;
	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.WebView();
	}
	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.WebView {
		return this._windows;
	}

	public _loadUrl(src: string): void {
		console.log('Loading URL in WebView for Windows is not implemented yet.', src); // TODO: Implement loading URL in WebView for Windows
		this.nativeViewProtected.Navigate(new Windows.Foundation.Uri(src));
	}

	public _loadData(src: string): void {
		console.log('Loading data in WebView for Windows is not implemented yet.', src); // TODO: Implement loading data in WebView for Windows
		this.nativeViewProtected.NavigateToString(src);
	}

	public stopLoading(): void {
		this.nativeViewProtected.Stop();
	}

	get canGoBack(): boolean {
		return this.nativeViewProtected.CanGoBack;
	}
	get canGoForward(): boolean {
		return this.nativeViewProtected.CanGoForward;
	}
	goBack(): void {
		this.nativeViewProtected.GoBack();
	}
	goForward(): void {
		this.nativeViewProtected.GoForward();
	}
	reload(): void {
		this.nativeViewProtected.Refresh();
	}
}
