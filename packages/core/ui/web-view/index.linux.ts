export * from './web-view-common';

import { WebViewBase } from './web-view-common';

// TODO(linux): placeholder until the GTK implementation lands
export class WebView extends WebViewBase {
	createNativeView() {
		return gtk_label_new('WebView');
	}

	public _loadUrl(src: string) {}

	public _loadData(src: string) {}

	public stopLoading() {}

	get canGoBack(): boolean {
		return false;
	}

	get canGoForward(): boolean {
		return false;
	}

	public goBack() {}

	public goForward() {}

	public reload() {}
}
