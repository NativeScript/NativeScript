import { StackLayout as StackLayoutDefinition, Orientation } from '.';
import { LayoutBase } from '../layout-base';
import { CSSType } from '../../core/view';
import { Property, makeParser, makeValidator } from '../../core/properties';

@CSSType('StackLayout')
export class StackLayoutBase extends LayoutBase implements StackLayoutDefinition {
	public orientation: Orientation;
}

StackLayoutBase.prototype.recycleNativeView = 'auto';

const converter = makeParser<Orientation>(makeValidator('horizontal', 'vertical'));

export const orientationProperty = new Property<StackLayoutBase, Orientation>({
	name: 'orientation',
	defaultValue: 'vertical',
	affectsLayout: global.isIOS,
	valueConverter: converter,
});
orientationProperty.register(StackLayoutBase);
