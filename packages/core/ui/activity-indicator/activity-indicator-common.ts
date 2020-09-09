import { ActivityIndicator as ActivityIndicatorDefinition } from '.';
import { View, CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { Property } from '../core/properties';

@CSSType('ActivityIndicator')
export class ActivityIndicatorBase extends View implements ActivityIndicatorDefinition {
	public busy: boolean;
}

ActivityIndicatorBase.prototype.recycleNativeView = 'auto';

export const busyProperty = new Property<ActivityIndicatorBase, boolean>({
	name: 'busy',
	defaultValue: false,
	valueConverter: booleanConverter,
});
busyProperty.register(ActivityIndicatorBase);
