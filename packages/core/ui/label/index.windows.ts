import { TextBase, maxLinesProperty, textOverflowProperty } from '../text-base';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';

@CSSType('Label')
export class Label extends TextBase {
	// nativeViewProtected is the Border wrapper — carries Background, CornerRadius, and border via CompositionBorderHandler.
	nativeViewProtected: Microsoft.UI.Xaml.Controls.Border;
	private _border: Microsoft.UI.Xaml.Controls.Border;
	private _textBlock: Microsoft.UI.Xaml.Controls.TextBlock;

	constructor() {
		super();
		// WinRT objects deferred to createNativeView() so the XML-parse constructor is pure-JS.
		// This eliminates wasted bridge calls for the orphaned page created by _resolvePageFromEntry
		// on every cache-hit navigation (the orphaned page is GC'd without ever calling createNativeView).
	}

	public createNativeView(): Microsoft.UI.Xaml.Controls.Border {
		this._textBlock = new Microsoft.UI.Xaml.Controls.TextBlock();
		this._border = new Microsoft.UI.Xaml.Controls.Border();
		(this._border as any).Child = this._textBlock;
		return this._border;
	}

	get nativeTextViewProtected(): Microsoft.UI.Xaml.Controls.TextBlock {
		return this._textBlock;
	}

	public initNativeView(): void {
		super.initNativeView();
		this._textBlock.VerticalAlignment = 1 as never;
	}

	get windows(): Microsoft.UI.Xaml.Controls.TextBlock {
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
		(this._textBlock as any).MaxLines = value <= 0 ? 0 : value;
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
