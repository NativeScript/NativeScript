import { TextBase } from '../text-base';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';

export * from '../text-base';

@CSSType('Label')
export class Label extends TextBase {
	public createNativeView() {
		const label = gtk_label_new(null);
		gtk_label_set_xalign(label, 0);
		gtk_label_set_yalign(label, 0.5);
		return label;
	}

	public initNativeView(): void {
		super.initNativeView();
		(this as any)._applyWrapping();
	}

	get linux(): any {
		return this.nativeViewProtected;
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
