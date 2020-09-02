import { StackLayout as StackLayoutDefinition } from '.';
import { LayoutBase } from '../layout-base';
import { CSSType } from '../../core/view';
import { Property, makeParser, makeValidator } from '../../core/properties';
import { OrientationType } from '../../enums';

@CSSType('StackLayout')
export class StackLayoutBase extends LayoutBase implements StackLayoutDefinition {
	public orientation: OrientationType;
}

StackLayoutBase.prototype.recycleNativeView = 'auto';

const converter = makeParser<OrientationType>(makeValidator('horizontal', 'vertical'));

export const orientationProperty = new Property<StackLayoutBase, OrientationType>({
	name: 'orientation',
	defaultValue: 'vertical',
	affectsLayout: global.isIOS,
	valueConverter: converter,
});
orientationProperty.register(StackLayoutBase);
