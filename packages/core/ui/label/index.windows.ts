import { TextBase } from '../text-base';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';

@CSSType('Label')
export class Label extends TextBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.TextBlock;
	private _windows: Windows.UI.Xaml.Controls.TextBlock;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.TextBlock();
	}

	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.TextBlock {
		return this._windows;
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
}
