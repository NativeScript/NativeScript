export * from './web-view-common';

import { WebViewBase } from './web-view-common';
import { openUrl } from '../../utils';
import { connect } from '../../utils/gtk.linux';

/**
 * TODO(linux): embed WebKitGTK 6.0 (the GTK 4 build) once it is part of the
 * runtime's metadata. Until then the page opens in the desktop's browser.
 */
export class WebView extends WebViewBase {
	private _label: any;
	private _url: string | null = null;
	private _disconnect: () => void;

	createNativeView() {
		const box: any = gtk_box_new(GtkOrientation.VERTICAL, 12);
		gtk_widget_set_valign(box, GtkAlign.CENTER);
		gtk_widget_set_halign(box, GtkAlign.CENTER);
		this._label = gtk_label_new('');
		gtk_label_set_wrap(this._label, 1);
		gtk_label_set_selectable(this._label, 1);
		const button: any = gtk_button_new_with_label('Open in browser');
		const owner = new WeakRef(this);
		this._disconnect = connect(button, 'clicked', () => {
			const view = owner.deref();
			if (view?._url) openUrl(view._url);
		});
		gtk_box_append(box, this._label);
		gtk_box_append(box, button);
		return box;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	disposeNativeView(): void {
		this._disconnect?.();
		this._label = null;
		super.disposeNativeView();
	}

	public _loadUrl(src: string) {
		this._url = src;
		this._onLoadStarted(src, undefined);
		gtk_label_set_text(this._label, src);
		this._onLoadFinished(src, 'Embedded web content needs WebKitGTK 6.0');
	}

	public _loadData(src: string) {
		this._url = null;
		gtk_label_set_text(this._label, 'HTML content can be shown once WebKitGTK 6.0 is available.');
		this._onLoadFinished(undefined, 'Embedded web content needs WebKitGTK 6.0');
	}

	public stopLoading() {}

	get canGoBack(): boolean {
		return false;
	}

	get canGoForward(): boolean {
		return false;
	}

	public goBack() {}

	public goForward() {}

	public reload() {
		if (this._url) this._loadUrl(this._url);
	}
}
