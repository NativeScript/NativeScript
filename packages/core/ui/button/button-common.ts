import { Button as ButtonDefinition } from '.';
import { TextBase } from '../text-base';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';

@CSSType('Button')
export abstract class ButtonBase extends TextBase implements ButtonDefinition {
	public static tapEvent = 'tap';

	get textWrap(): boolean {
		return this.style.whiteSpace === 'normal';
	}
	set textWrap(value: boolean) {
		if (typeof value === 'string') {
			value = booleanConverter(value);
		}

		this.style.whiteSpace = value ? 'normal' : 'nowrap';
	}
}

ButtonBase.prototype.recycleNativeView = 'auto';
