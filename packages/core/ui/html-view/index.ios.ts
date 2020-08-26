import { Color } from '../../color';
import { Font } from '../styling/font';
import { colorProperty, fontInternalProperty } from '../styling/style-properties';
import { HtmlViewBase, htmlProperty, linkColorProperty } from './html-view-common';
import { View } from '../core/view';
import { iOSNativeHelper, layout } from '../../utils';

export * from './html-view-common';

const majorVersion = iOSNativeHelper.MajorVersion;

export class HtmlView extends HtmlViewBase {
	nativeViewProtected: UITextView;
	private currentHtml: string;

	public createNativeView() {
		const view = UITextView.new();
		view.scrollEnabled = false;
		view.editable = false;
		view.selectable = true;
		view.userInteractionEnabled = true;
		view.dataDetectorTypes = UIDataDetectorTypes.All;

		return view;
	}

	public initNativeView(): void {
		super.initNativeView();

		// Remove extra padding
		this.nativeViewProtected.textContainer.lineFragmentPadding = 0;
		this.nativeViewProtected.textContainerInset = (UIEdgeInsets as any).zero;
	}

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

	[htmlProperty.getDefault](): string {
		return '';
	}

	private renderWithStyles() {
		let html = this.currentHtml;
		const styles = [];
		if (this.nativeViewProtected.font) {
			styles.push(`font-family: '${this.nativeViewProtected.font.fontName}';`);
			styles.push(`font-size: ${this.nativeViewProtected.font.pointSize}px;`);
		}
		if (this.nativeViewProtected.textColor) {
			const textColor = Color.fromIosColor(this.nativeViewProtected.textColor);
			styles.push(`color: ${textColor.hex};`);
		}
		if (styles.length > 0) {
			html += `<style>body {${styles.join('')}}</style>`;
		}
		const htmlString = NSString.stringWithString(html + '');
		const nsData = htmlString.dataUsingEncoding(NSUnicodeStringEncoding);
		this.nativeViewProtected.attributedText = NSAttributedString.alloc().initWithDataOptionsDocumentAttributesError(nsData, <any>{ [NSDocumentTypeDocumentAttribute]: NSHTMLTextDocumentType }, null);

		if (majorVersion >= 13 && UIColor.labelColor) {
			this.nativeViewProtected.textColor = UIColor.labelColor;
		}
	}

	[htmlProperty.setNative](value: string) {
		this.currentHtml = value;
		this.renderWithStyles();
	}

	[colorProperty.getDefault](): UIColor {
		return this.nativeViewProtected.textColor;
	}
	[colorProperty.setNative](value: Color | UIColor) {
		const color = value instanceof Color ? value.ios : value;
		this.nativeViewProtected.textColor = color;
		this.renderWithStyles();
	}

	[linkColorProperty.getDefault](): UIColor {
		return this.nativeViewProtected.linkTextAttributes[NSForegroundColorAttributeName];
	}
	[linkColorProperty.setNative](value: Color | UIColor) {
		const color = value instanceof Color ? value.ios : value;
		const linkTextAttributes = NSDictionary.dictionaryWithObjectForKey(color, NSForegroundColorAttributeName);
		this.nativeViewProtected.linkTextAttributes = linkTextAttributes;
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
