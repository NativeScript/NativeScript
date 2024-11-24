import { Color } from '../../color';
import { View, CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { Property } from '../core/properties';
import { Switch as SwitchDefinition } from '.';

@CSSType('Switch')
export class SwitchBase extends View implements SwitchDefinition {
	public static checkedChangeEvent = 'checkedChange';

	public checked: boolean;
	public offBackgroundColor: Color;
}

SwitchBase.prototype.recycleNativeView = 'auto';

export const checkedProperty = new Property<SwitchBase, boolean>({
	name: 'checked',
	defaultValue: false,
	valueConverter: booleanConverter,
	valueChanged: (target: SwitchBase, oldValue: boolean, newValue: boolean) => {
		if (newValue) {
			target._addVisualState('checked');
		} else {
			target._removeVisualState('checked');
		}
	},
});
checkedProperty.register(SwitchBase);

export const offBackgroundColorProperty = new Property<SwitchBase, Color>({
	name: 'offBackgroundColor',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
offBackgroundColorProperty.register(SwitchBase);
