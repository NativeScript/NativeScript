import { TextBase, maxLinesProperty, textOverflowProperty } from '../text-base';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';

@CSSType('Label')
export class Label extends TextBase {
	// nativeViewProtected is the Border wrapper — carries Background, CornerRadius, and border via CompositionBorderHandler.
	nativeViewProtected: Windows.UI.Xaml.Controls.Border;
	private _border: Windows.UI.Xaml.Controls.Border;
	private _textBlock: Windows.UI.Xaml.Controls.TextBlock;

	constructor() {
		super();
		this._textBlock = new Windows.UI.Xaml.Controls.TextBlock();
		this._border = new Windows.UI.Xaml.Controls.Border();
		(this._border as any).Child = this._textBlock;
	}

	public createNativeView(): Windows.UI.Xaml.Controls.Border {
		return this._border;
	}

	// TextBase routes all text/font/color setNative handlers through nativeTextViewProtected.
	get nativeTextViewProtected(): Windows.UI.Xaml.Controls.TextBlock {
		return this._textBlock;
	}

	public initNativeView(): void {
		super.initNativeView();
		// Center the TextBlock vertically within the Border so text appears centered.
		try { (this._textBlock as any).VerticalAlignment = 1; } catch (_e) {}
	}

	get windows(): Windows.UI.Xaml.Controls.TextBlock {
		return this._textBlock;
	}

	get textWrap(): boolean {
		return this.style.whiteSpace === 'normal';
	}

	set textWrap(value: boolean) {
		if (typeof value === 'string') {
			value = booleanConverter(value as any);
		}
		this.style.whiteSpace = value ? 'normal' : 'nowrap';
	}

	// MaxLines: 0 = unlimited
	//@ts-ignore
	[maxLinesProperty.setNative](value: number) {
		try { (this._textBlock as any).MaxLines = value <= 0 ? 0 : value; } catch (_e) {}
	}

	// TextTrimming: None=0, CharacterEllipsis=1, WordEllipsis=2, Clip=3
	//@ts-ignore
	[textOverflowProperty.setNative](value: string) {
		const nativeView = this._textBlock as any;
		if (!nativeView) return;
		switch (value) {
			case 'ellipsis': nativeView.TextTrimming = 1; break; // CharacterEllipsis
			case 'clip': nativeView.TextTrimming = 3; break;
			default: nativeView.TextTrimming = 0; break; // None
		}
	}
}
