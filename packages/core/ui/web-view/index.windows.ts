export * from './web-view-common';

import { WebViewBase } from './web-view-common';

// WebView2 is not WinRT-activatable in this WinAppSDK build: `new WebView2()` throws E_NOTIMPL.
// Create via XamlReader instead; attempt `new` only until first failure, then go straight to XamlReader.
let _webView2Activatable: boolean | undefined;
function createWebView2(): Microsoft.UI.Xaml.Controls.WebView2 {
	if (_webView2Activatable !== false) {
		try {
			const wv = new Microsoft.UI.Xaml.Controls.WebView2();
			_webView2Activatable = true;
			return wv;
		} catch (_e) {
			_webView2Activatable = false;
		}
	}
	return Microsoft.UI.Xaml.Markup.XamlReader.Load('<WebView2 xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" />') as Microsoft.UI.Xaml.Controls.WebView2;
}

export class WebView extends WebViewBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.WebView2;
	private _windows: Microsoft.UI.Xaml.Controls.WebView2;

	// Nav APIs are unusable until EnsureCoreWebView2Async() resolves; queue ops until then.
	private _ready = false;
	private _pending: Array<() => void> = [];
	private _currentUrl = '';

	constructor() {
		super();
		// WinRT deferred to createNativeView() — keeps constructor pure-JS.
	}

	public createNativeView() {
		this._windows = createWebView2();
		return this._windows;
	}

	initNativeView(): void {
		super.initNativeView();

		const nativeView = this.nativeViewProtected as any;

		nativeView.NavigationStarting = NSWinRT.asDelegate(
			'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Controls.WebView2,Microsoft.Web.WebView2.Core.CoreWebView2NavigationStartingEventArgs>',
			(_sender: any, args: any) => {
				const url = args?.Uri ?? this._currentUrl;
				this._currentUrl = url;
				this._onLoadStarted(url, undefined);
			}
		);

		nativeView.NavigationCompleted = NSWinRT.asDelegate(
			'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Controls.WebView2,Microsoft.Web.WebView2.Core.CoreWebView2NavigationCompletedEventArgs>',
			(_sender: any, args: any) => {
				const success = args?.IsSuccess !== false;
				this._onLoadFinished(this._currentUrl, success ? undefined : String(args?.WebErrorStatus ?? 'navigation failed'));
			}
		);

		NSWinRT.toPromise(this._windows.EnsureCoreWebView2Async())
			.then(() => {
				this._ready = true;
				const pending = this._pending;
				this._pending = [];
				for (const op of pending) {
					try {
						op();
					} catch (_e) {}
				}
			})
			.catch(() => {});
	}

	disposeNativeView(): void {
		this._pending = [];
		this._ready = false;
		super.disposeNativeView();
	}

	get windows(): Microsoft.UI.Xaml.Controls.WebView2 {
		return this._windows;
	}

	private _run(op: () => void): void {
		if (this._ready) {
			op();
		} else {
			this._pending.push(op);
		}
	}

	public _loadUrl(src: string): void {
		this._currentUrl = src;
		// Plain string avoids a System.Uri round-trip.
		this._run(() => (this.nativeViewProtected as any).CoreWebView2.Navigate(src));
	}

	public _loadData(src: string): void {
		this._run(() => this.nativeViewProtected.NavigateToString(src));
	}

	public stopLoading(): void {
		this._run(() => (this.nativeViewProtected as any).CoreWebView2?.Stop());
	}

	get canGoBack(): boolean {
		return this._ready ? this.nativeViewProtected.CanGoBack : false;
	}
	get canGoForward(): boolean {
		return this._ready ? this.nativeViewProtected.CanGoForward : false;
	}
	goBack(): void {
		this._run(() => this.nativeViewProtected.GoBack());
	}
	goForward(): void {
		this._run(() => this.nativeViewProtected.GoForward());
	}
	reload(): void {
		this._run(() => this.nativeViewProtected.Reload());
	}
}
