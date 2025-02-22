import { Color } from '../../color';
import { Font } from '../styling/font';
import { colorProperty, fontInternalProperty } from '../styling/style-properties';
import { HtmlViewBase, htmlProperty, selectableProperty, linkColorProperty } from './html-view-common';
import { View } from '../core/view';
import { iOSNativeHelper, layout } from '../../utils';

export * from './html-view-common';

const majorVersion = iOSNativeHelper.MajorVersion;

export class HtmlView extends HtmlViewBase {
	nativeViewProtected: UITextView;

	public createNativeView() {
		const nativeView = UITextView.new();
		nativeView.scrollEnabled = false;
		nativeView.editable = false;
		nativeView.selectable = true;
		nativeView.userInteractionEnabled = true;
		nativeView.dataDetectorTypes = UIDataDetectorTypes.All;

		return nativeView;
	}

	public initNativeView(): void {
		super.initNativeView();

		// Remove extra padding
		this.nativeViewProtected.textContainer.lineFragmentPadding = 0;
		this.nativeViewProtected.textContainerInset = UIEdgeInsetsZero;
	}

	// @ts-ignore
	get ios(): UITextView {
		return this.nativeViewProtected;
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			const width = layout.getMeasureSpecSize(widthMeasureSpec);
			const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

			const height = layout.getMeasureSpecSize(heightMeasureSpec);
			const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

			const desiredSize = layout.measureNativeView(nativeView, width, widthMode, height, heightMode);

			const labelWidth = widthMode === layout.AT_MOST ? Math.min(desiredSize.width, width) : desiredSize.width;
			const measureWidth = Math.max(labelWidth, this.effectiveMinWidth);
			const measureHeight = Math.max(desiredSize.height, this.effectiveMinHeight);

			const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
			const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

			this.setMeasuredDimension(widthAndState, heightAndState);
		}
	}

	private renderWithStyles() {
		const bodyStyles: string[] = [];

		let htmlContent = this.html ?? '';

		htmlContent += '<style>';

		bodyStyles.push(`font-size: ${this.style.fontSize}px;`);

		if (this.style.fontFamily) {
			bodyStyles.push(`font-family: '${this.style.fontFamily}';`);
		}

		if (this.style.color) {
			bodyStyles.push(`color: ${this.style.color.hex};`);
		}

		htmlContent += `body {${bodyStyles.join('')}}`;

		if (this.linkColor) {
			htmlContent += `a, a:link, a:visited { color: ${this.linkColor.hex}; }`;
		}

		htmlContent += '</style>';

		const htmlString = NSString.stringWithString(htmlContent);
		const nsData = htmlString.dataUsingEncoding(NSUnicodeStringEncoding);
		const attributes = NSDictionary.dictionaryWithObjectForKey(NSHTMLTextDocumentType, NSDocumentTypeDocumentAttribute);

		this.nativeViewProtected.attributedText = NSAttributedString.alloc().initWithDataOptionsDocumentAttributesError(nsData, attributes, null);

		if (!this.style.color && majorVersion >= 13 && UIColor.labelColor) {
			this.nativeViewProtected.textColor = UIColor.labelColor;
		}
	}

	[htmlProperty.getDefault](): string {
		return '';
	}
	[htmlProperty.setNative](value: string) {
		this.renderWithStyles();
	}

	[selectableProperty.getDefault](): boolean {
		return true;
	}
	[selectableProperty.setNative](value: boolean) {
		this.nativeViewProtected.selectable = value;
	}

	[colorProperty.getDefault](): UIColor {
		return this.nativeViewProtected.textColor;
	}
	[colorProperty.setNative](value: Color | UIColor) {
		const color = value instanceof Color ? value.ios : value;
		this.nativeViewProtected.textColor = color;
		this.renderWithStyles();
	}

	[linkColorProperty.setNative](value: Color | UIColor) {
		this.renderWithStyles();
	}

	[fontInternalProperty.getDefault](): UIFont {
		return this.nativeViewProtected.font;
	}
	[fontInternalProperty.setNative](value: Font | UIFont) {
		const font = value instanceof Font ? value.getUIFont(this.nativeViewProtected.font) : value;
		this.nativeViewProtected.font = font;
		this.renderWithStyles();
	}
}
