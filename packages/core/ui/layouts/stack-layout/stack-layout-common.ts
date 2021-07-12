import { StackLayout as StackLayoutDefinition } from '.';
import { LayoutBase } from '../layout-base';
import { CSSType } from '../../core/view';
import { Property, makeParser, makeValidator } from '../../core/properties';
import { CoreTypes } from '../../../core-types';

@CSSType('StackLayout')
export class StackLayoutBase extends LayoutBase implements StackLayoutDefinition {
	public orientation: CoreTypes.OrientationType;
}

StackLayoutBase.prototype.recycleNativeView = 'auto';

const converter = makeParser<CoreTypes.OrientationType>(makeValidator('horizontal', 'vertical'));

export const orientationProperty = new Property<StackLayoutBase, CoreTypes.OrientationType>({
	name: 'orientation',
	defaultValue: 'vertical',
	affectsLayout: global.isIOS,
	valueConverter: converter,
});
orientationProperty.register(StackLayoutBase);
