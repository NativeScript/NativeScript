import { WrapLayout as WrapLayoutDefinition } from '.';
import { LayoutBase } from '../layout-base';
import { CSSType } from '../../core/view';
import { Property, makeValidator, makeParser } from '../../core/properties';
import { Length } from '../../styling/style-properties';
import { CoreTypes } from '../../../core-types';

export * from '../layout-base';

@CSSType('WrapLayout')
export class WrapLayoutBase extends LayoutBase implements WrapLayoutDefinition {
	public orientation: CoreTypes.OrientationType;
	public itemWidth: CoreTypes.LengthType;
	public itemHeight: CoreTypes.LengthType;
	public effectiveItemWidth: number;
	public effectiveItemHeight: number;
}

WrapLayoutBase.prototype.recycleNativeView = 'auto';

export const itemWidthProperty = new Property<WrapLayoutBase, CoreTypes.LengthType>({
	name: 'itemWidth',
	defaultValue: 'auto',
	affectsLayout: global.isIOS,
	valueConverter: (v) => Length.parse(v),
	valueChanged: (target, oldValue, newValue) => (target.effectiveItemWidth = Length.toDevicePixels(newValue, -1)),
});
itemWidthProperty.register(WrapLayoutBase);

export const itemHeightProperty = new Property<WrapLayoutBase, CoreTypes.LengthType>({
	name: 'itemHeight',
	defaultValue: 'auto',
	affectsLayout: global.isIOS,
	valueConverter: (v) => Length.parse(v),
	valueChanged: (target, oldValue, newValue) => (target.effectiveItemHeight = Length.toDevicePixels(newValue, -1)),
});
itemHeightProperty.register(WrapLayoutBase);

const converter = makeParser<CoreTypes.OrientationType>(makeValidator<CoreTypes.OrientationType>(CoreTypes.Orientation.horizontal, CoreTypes.Orientation.vertical));
export const orientationProperty = new Property<WrapLayoutBase, CoreTypes.OrientationType>({
	name: 'orientation',
	defaultValue: CoreTypes.Orientation.horizontal,
	affectsLayout: global.isIOS,
	valueConverter: converter,
});
orientationProperty.register(WrapLayoutBase);
