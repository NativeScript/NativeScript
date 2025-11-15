import { Color } from '../../color';
import { View, CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { Property } from '../core/properties';
import { Switch as SwitchDefinition } from '.';
import { colorConverter } from '../styling/style-properties';

@CSSType('Switch')
export class SwitchBase extends View implements SwitchDefinition {
	public static checkedChangeEvent = 'checkedChange';

	public checked: boolean;
	public offBackgroundColor: Color;

	_onCheckedPropertyChanged(newValue: boolean) {
		if (newValue) {
			this._addVisualState('checked');
		} else {
			this._removeVisualState('checked');
		}
	}
}

SwitchBase.prototype.recycleNativeView = 'auto';

function onCheckedPropertyChanged(target: SwitchBase, oldValue: boolean, newValue: boolean) {
	target._onCheckedPropertyChanged(newValue);
}

export const checkedProperty = new Property<SwitchBase, boolean>({
	name: 'checked',
	defaultValue: false,
	valueConverter: booleanConverter,
	valueChanged: onCheckedPropertyChanged,
});
checkedProperty.register(SwitchBase);

export const offBackgroundColorProperty = new Property<SwitchBase, Color>({
	name: 'offBackgroundColor',
	equalityComparer: Color.equals,
	valueConverter: colorConverter,
});
offBackgroundColorProperty.register(SwitchBase);
