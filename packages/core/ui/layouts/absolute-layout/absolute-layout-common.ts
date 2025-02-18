import { AbsoluteLayout as AbsoluteLayoutDefinition } from '.';
import { LayoutBase } from '../layout-base';
import { CoreTypes } from '../../../core-types';
import { View, CSSType } from '../../core/view';
import { Property } from '../../core/properties';
import { Length } from '../../styling/style-properties';

export * from '../layout-base';

View.prototype.effectiveLeft = 0;
View.prototype.effectiveTop = 0;

function validateArgs(element: View): View {
	if (!element) {
		throw new Error('element cannot be null or undefinied.');
	}

	return element;
}

@CSSType('AbsoluteLayout')
export class AbsoluteLayoutBase extends LayoutBase implements AbsoluteLayoutDefinition {
	// TODO: Do we still need this? it can be get like view.left
	public static getLeft(element: View): CoreTypes.LengthType {
		return validateArgs(element).left;
	}

	// TODO: Do we still need this? it can be set like view.left=value
	public static setLeft(element: View, value: CoreTypes.LengthType): void {
		validateArgs(element).left = value;
	}

	// TODO: Do we still need this? it can be get like view.top
	public static getTop(element: View): CoreTypes.LengthType {
		return validateArgs(element).top;
	}

	// TODO: Do we still need this? it can be set like view.top=value
	public static setTop(element: View, value: CoreTypes.LengthType): void {
		validateArgs(element).top = value;
	}

	onLeftChanged(view: View, oldValue: CoreTypes.LengthType, newValue: CoreTypes.LengthType) {
		//
	}

	onTopChanged(view: View, oldValue: CoreTypes.LengthType, newValue: CoreTypes.LengthType) {
		//
	}
}

AbsoluteLayoutBase.prototype.recycleNativeView = 'auto';

export const leftProperty = new Property<View, CoreTypes.LengthType>({
	name: 'left',
	defaultValue: CoreTypes.zeroLength,
	valueChanged: (target, oldValue, newValue) => {
		target.effectiveLeft = Length.toDevicePixels(newValue, 0);
		const layout = target.parent;
		if (layout instanceof AbsoluteLayoutBase) {
			layout.onLeftChanged(target, oldValue, newValue);
		}
	},
	equalityComparer: Length.equals,
	valueConverter: Length.parse,
});
leftProperty.register(View);

export const topProperty = new Property<View, CoreTypes.LengthType>({
	name: 'top',
	defaultValue: CoreTypes.zeroLength,
	valueChanged: (target, oldValue, newValue) => {
		target.effectiveTop = Length.toDevicePixels(newValue, 0);
		const layout = target.parent;
		if (layout instanceof AbsoluteLayoutBase) {
			layout.onTopChanged(target, oldValue, newValue);
		}
	},
	equalityComparer: Length.equals,
	valueConverter: Length.parse,
});
topProperty.register(View);
