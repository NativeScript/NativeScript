import { AbsoluteLayout as AbsoluteLayoutDefinition } from '.';
import { LayoutBase } from '../layout-base';
import { View, CSSType } from '../../core/view';
import { Property } from '../../core/properties';
import { Length, zeroLength } from '../../styling/style-properties';

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
	public static getLeft(element: View): Length {
		return validateArgs(element).left;
	}

	// TODO: Do we still need this? it can be set like view.left=value
	public static setLeft(element: View, value: Length): void {
		validateArgs(element).left = value;
	}

	// TODO: Do we still need this? it can be get like view.top
	public static getTop(element: View): Length {
		return validateArgs(element).top;
	}

	// TODO: Do we still need this? it can be set like view.top=value
	public static setTop(element: View, value: Length): void {
		validateArgs(element).top = value;
	}

	onLeftChanged(view: View, oldValue: Length, newValue: Length) {
		//
	}

	onTopChanged(view: View, oldValue: Length, newValue: Length) {
		//
	}
}

AbsoluteLayoutBase.prototype.recycleNativeView = 'auto';

export const leftProperty = new Property<View, Length>({
	name: 'left',
	defaultValue: zeroLength,
	valueChanged: (target, oldValue, newValue) => {
		target.effectiveLeft = Length.toDevicePixels(newValue, 0);
		const layout = target.parent;
		if (layout instanceof AbsoluteLayoutBase) {
			layout.onLeftChanged(target, oldValue, newValue);
		}
	},
	valueConverter: (v) => Length.parse(v),
});
leftProperty.register(View);

export const topProperty = new Property<View, Length>({
	name: 'top',
	defaultValue: zeroLength,
	valueChanged: (target, oldValue, newValue) => {
		target.effectiveTop = Length.toDevicePixels(newValue, 0);
		const layout = target.parent;
		if (layout instanceof AbsoluteLayoutBase) {
			layout.onTopChanged(target, oldValue, newValue);
		}
	},
	valueConverter: (v) => Length.parse(v),
});
topProperty.register(View);
