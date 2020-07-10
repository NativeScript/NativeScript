import { Color } from '../../color';
import { Font } from '../styling/font';
import { colorProperty, fontSizeProperty, fontInternalProperty } from '../styling/style-properties';
import { HtmlViewBase, htmlProperty, linkColorProperty } from './html-view-common';

export * from './html-view-common';

export class HtmlView extends HtmlViewBase {
	nativeViewProtected: android.widget.TextView;

	public createNativeView() {
		return new android.widget.TextView(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;

		// Allow text selection
		nativeView.setTextIsSelectable(true);

		// This makes the html <a href...> work
		nativeView.setLinksClickable(true);
		nativeView.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());
	}

	public resetNativeView(): void {
		super.resetNativeView();
		this.nativeViewProtected.setAutoLinkMask(0);
	}

	[htmlProperty.getDefault](): string {
		return '';
	}
	[htmlProperty.setNative](value: string) {
		// If the data.newValue actually has a <a...> in it; we need to disable autolink mask
		// it internally disables the coloring, but then the <a> links won't work..  So to support both
		// styles of links (html and just text based) we have to manually enable/disable the autolink mask
		let mask = 15;
		if (value.search(/<a\s/i) >= 0) {
			mask = 0;
		}
		this.nativeViewProtected.setAutoLinkMask(mask);
		this.nativeViewProtected.setText(<any>android.text.Html.fromHtml(value));
	}

	[colorProperty.getDefault](): android.content.res.ColorStateList {
		return this.nativeViewProtected.getTextColors();
	}
	[colorProperty.setNative](value: Color | android.content.res.ColorStateList) {
		if (value instanceof Color) {
			this.nativeViewProtected.setTextColor(value.android);
		} else {
			this.nativeViewProtected.setTextColor(value);
		}
	}

	[linkColorProperty.getDefault](): android.content.res.ColorStateList {
		return this.nativeViewProtected.getLinkTextColors();
	}
	[linkColorProperty.setNative](value: Color | android.content.res.ColorStateList) {
		const color = value instanceof Color ? value.android : value;
		if (value instanceof Color) {
			this.nativeViewProtected.setLinkTextColor(value.android);
		} else {
			this.nativeViewProtected.setLinkTextColor(value);
		}
	}

	[fontInternalProperty.getDefault](): android.graphics.Typeface {
		return this.nativeViewProtected.getTypeface();
	}
	[fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
		const font = value instanceof Font ? value.getAndroidTypeface() : value;
		this.nativeViewProtected.setTypeface(font);
	}

	[fontSizeProperty.getDefault](): { nativeSize: number } {
		return { nativeSize: this.nativeViewProtected.getTextSize() };
	}
	[fontSizeProperty.setNative](value: number | { nativeSize: number }) {
		if (typeof value === 'number') {
			this.nativeViewProtected.setTextSize(value);
		} else {
			this.nativeViewProtected.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
		}
	}
}
