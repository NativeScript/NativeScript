import { ActivityIndicator as ActivityIndicatorDefinition, IOSIndicatorViewStyle } from '.';
import { View, CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { Property } from '../core/properties';

@CSSType('ActivityIndicator')
export class ActivityIndicatorBase extends View implements ActivityIndicatorDefinition {
	public busy: boolean;
	public iosIndicatorViewStyle: IOSIndicatorViewStyle;
}

ActivityIndicatorBase.prototype.recycleNativeView = 'auto';

export const busyProperty = new Property<ActivityIndicatorBase, boolean>({
	name: 'busy',
	defaultValue: false,
	valueConverter: booleanConverter,
});
busyProperty.register(ActivityIndicatorBase);

export const iosIndicatorViewStyleProperty = new Property<ActivityIndicatorBase, IOSIndicatorViewStyle>({
	name: 'iosIndicatorViewStyle',
	defaultValue: 'medium',
});
iosIndicatorViewStyleProperty.register(ActivityIndicatorBase);
