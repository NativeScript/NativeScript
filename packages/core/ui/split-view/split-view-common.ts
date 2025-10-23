import { LayoutBase } from '../layouts/layout-base';
import { View, CSSType } from '../core/view';
import { Property, makeParser, makeValidator } from '../core/properties';

export type SplitRole = 'primary' | 'secondary' | 'supplementary';
const splitRoleConverter = makeParser<SplitRole>(makeValidator<SplitRole>('primary', 'secondary', 'supplementary'));

export type SplitStyle = 'automatic' | 'double' | 'triple';

export type SplitDisplayMode = 'automatic' | 'secondaryOnly' | 'oneBesideSecondary' | 'oneOverSecondary' | 'twoBesideSecondary' | 'twoOverSecondary' | 'twoDisplaceSecondary';
const splitDisplayModeConverter = makeParser<SplitDisplayMode>(makeValidator<SplitDisplayMode>('automatic', 'secondaryOnly', 'oneBesideSecondary', 'oneOverSecondary', 'twoBesideSecondary', 'twoOverSecondary', 'twoDisplaceSecondary'));

export type SplitBehavior = 'automatic' | 'tile' | 'overlay' | 'displace';
const splitBehaviorConverter = makeParser<SplitBehavior>(makeValidator<SplitBehavior>('automatic', 'tile', 'overlay', 'displace'));

// Default child roles (helps authoring without setting splitRole on children)
const ROLE_ORDER: SplitRole[] = ['primary', 'secondary', 'supplementary'];

@CSSType('SplitView')
export class SplitViewBase extends LayoutBase {
	/**
	 * The master display split style display settings.
	 * Must be set before bootstrapping the app.
	 */
	static SplitStyle: SplitStyle;

	static getInstance(): SplitViewBase | null {
		// Platform-specific implementations may override
		return null;
	}

	/** Child role (primary, secondary, supplementary) */
	splitRole: SplitRole;
	/** Preferred display mode */
	displayMode: SplitDisplayMode;
	/** Preferred split behavior (iOS 14+) */
	splitBehavior: SplitBehavior;
	/** Primary column width fraction (0..1) */
	preferredPrimaryColumnWidthFraction: number;
	/** Supplementary column width fraction (0..1, iOS 14+ triple) */
	preferredSupplementaryColumnWidthFraction: number;

	/**
	 * Get child role (primary, secondary, supplementary)
	 */
	public static getRole(element: SplitViewBase): SplitRole {
		return element.splitRole;
	}

	/**
	 * Set child role (primary, secondary, supplementary)
	 */
	public static setRole(element: SplitViewBase, value: SplitRole): void {
		element.splitRole = value;
	}

	// Called when a child's role changes; platform impls may override
	public onRoleChanged(view: View, oldValue: SplitRole, newValue: SplitRole) {
		this.requestLayout();
	}

	showPrimary() {
		// Platform-specific implementations may override
	}

	hidePrimary() {
		// Platform-specific implementations may override
	}

	showSecondary() {
		// Platform-specific implementations may override
	}

	hideSecondary() {
		// Platform-specific implementations may override
	}

	showSupplementary() {
		// Platform-specific implementations may override
	}

	// Utility to infer a role by index when none specified
	protected _roleByIndex(index: number): SplitRole {
		return ROLE_ORDER[Math.max(0, Math.min(index, ROLE_ORDER.length - 1))];
	}
}

SplitViewBase.prototype.recycleNativeView = 'auto';

export const splitRoleProperty = new Property<View, SplitRole>({
	name: 'splitRole',
	defaultValue: 'primary',
	valueChanged: (target, oldValue, newValue) => {
		const parent = target.parent;
		if (parent instanceof SplitViewBase) {
			parent.onRoleChanged(target, oldValue, newValue);
		}
	},
	valueConverter: splitRoleConverter,
});
splitRoleProperty.register(View);

export const displayModeProperty = new Property<SplitViewBase, SplitDisplayMode>({
	name: 'displayMode',
	defaultValue: 'automatic',
	affectsLayout: __APPLE__,
	valueConverter: splitDisplayModeConverter,
});
displayModeProperty.register(SplitViewBase);

export const splitBehaviorProperty = new Property<SplitViewBase, SplitBehavior>({
	name: 'splitBehavior',
	defaultValue: 'automatic',
	affectsLayout: __APPLE__,
	valueConverter: splitBehaviorConverter,
});
splitBehaviorProperty.register(SplitViewBase);

export const preferredPrimaryColumnWidthFractionProperty = new Property<SplitViewBase, number>({
	name: 'preferredPrimaryColumnWidthFraction',
	defaultValue: 0,
	affectsLayout: __APPLE__,
	valueConverter: (v) => Math.max(0, Math.min(1, parseFloat(v))),
});
preferredPrimaryColumnWidthFractionProperty.register(SplitViewBase);

export const preferredSupplementaryColumnWidthFractionProperty = new Property<SplitViewBase, number>({
	name: 'preferredSupplementaryColumnWidthFraction',
	defaultValue: 0,
	affectsLayout: __APPLE__,
	valueConverter: (v) => Math.max(0, Math.min(1, parseFloat(v))),
});
preferredSupplementaryColumnWidthFractionProperty.register(SplitViewBase);
