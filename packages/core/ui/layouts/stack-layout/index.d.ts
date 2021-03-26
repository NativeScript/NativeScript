import { LayoutBase } from '../layout-base';
import { Property } from '../../core/properties';
import { CoreTypes } from '../../../core-types';

/**
 * A Layout that arranges its children horizontally or vertically. The direction can be set by orientation property.
 */
export class StackLayout extends LayoutBase {
	/**
	 * Gets or sets if layout should be horizontal or vertical.
	 * The default value is vertical.
	 */
	orientation: CoreTypes.OrientationType;
}

/**
 * Represents the observable property backing the orientation property of each StackLayout instance.
 */
export const orientationProperty: Property<StackLayout, CoreTypes.OrientationType>;
