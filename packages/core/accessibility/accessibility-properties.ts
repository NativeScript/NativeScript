import { CssProperty, InheritedCssProperty, Property } from '../ui/core/properties';
import type { View } from '../ui/core/view';
import { booleanConverter } from '../ui/core/view-base';
import { Style } from '../ui/styling/style';
import { AccessibilityLiveRegion, AccessibilityRole, AccessibilityState, AccessibilityTrait } from './accessibility-types';

function makePropertyEnumConverter<T>(enumValues) {
	return (value: string): T | null => {
		if (!value || typeof value !== 'string') {
			return null;
		}

		for (const [enumKey, enumValue] of Object.entries<T>(enumValues)) {
			if (typeof enumKey !== 'string') {
				continue;
			}

			if (enumKey === value || `${enumValue}`.toLowerCase() === `${value}`.toLowerCase()) {
				return enumValue;
			}
		}

		return null;
	};
}

export const accessibilityEnabledProperty = new CssProperty<Style, boolean>({
	name: 'accessible',
	cssName: 'a11y-enabled',
	valueConverter: booleanConverter,
});
accessibilityEnabledProperty.register(Style);

const accessibilityHiddenPropertyName = 'accessibilityHidden';
const accessibilityHiddenCssName = 'a11y-hidden';

export const accessibilityHiddenProperty = global.isIOS
	? new InheritedCssProperty({
			name: accessibilityHiddenPropertyName,
			cssName: accessibilityHiddenCssName,
			valueConverter: booleanConverter,
	  })
	: new CssProperty({
			name: accessibilityHiddenPropertyName,
			cssName: accessibilityHiddenCssName,
			valueConverter: booleanConverter,
	  });
accessibilityHiddenProperty.register(Style);

export const accessibilityIdentifierProperty = new Property<View, string>({
	name: 'accessibilityIdentifier',
});

export const accessibilityRoleProperty = new CssProperty<Style, AccessibilityRole>({
	name: 'accessibilityRole',
	cssName: 'a11y-role',
	valueConverter: makePropertyEnumConverter<AccessibilityRole>(AccessibilityRole),
});
accessibilityRoleProperty.register(Style);

export const accessibilityStateProperty = new CssProperty<Style, AccessibilityState>({
	name: 'accessibilityState',
	cssName: 'a11y-state',
	valueConverter: makePropertyEnumConverter<AccessibilityState>(AccessibilityState),
});
accessibilityStateProperty.register(Style);

export const accessibilityLabelProperty = new Property<View, string>({
	name: 'accessibilityLabel',
});

export const accessibilityValueProperty = new Property<View, string>({
	name: 'accessibilityValue',
});

export const accessibilityHintProperty = new Property<View, string>({
	name: 'accessibilityHint',
});

export const accessibilityIgnoresInvertColorsProperty = new Property<View, boolean>({
	name: 'accessibilityIgnoresInvertColors',
	valueConverter: booleanConverter,
});

export const accessibilityLiveRegionProperty = new CssProperty<Style, AccessibilityLiveRegion>({
	name: 'accessibilityLiveRegion',
	cssName: 'a11y-live-region',
	defaultValue: AccessibilityLiveRegion.None,
	valueConverter: makePropertyEnumConverter<AccessibilityLiveRegion>(AccessibilityLiveRegion),
});
accessibilityLiveRegionProperty.register(Style);

export const accessibilityTraitsProperty = new Property<View, AccessibilityTrait | AccessibilityTrait[]>({
	name: 'accessibilityTraits',
});

export const accessibilityLanguageProperty = new CssProperty<Style, string>({
	name: 'accessibilityLanguage',
	cssName: 'a11y-lang',
});
accessibilityLanguageProperty.register(Style);

export const accessibilityMediaSessionProperty = new CssProperty({
	name: 'accessibilityMediaSession',
	cssName: 'a11y-media-session',
});
accessibilityMediaSessionProperty.register(Style);

/**
 * Represents the observable property backing the accessibilityStep property.
 */
export const accessibilityStepProperty = new CssProperty<Style, number>({
	name: 'accessibilityStep',
	cssName: 'a11y-step',
	defaultValue: 10,
	valueConverter: (v): number => {
		const step = parseFloat(v);

		if (isNaN(step) || step <= 0) {
			return 10;
		}

		return step;
	},
});
accessibilityStepProperty.register(Style);
