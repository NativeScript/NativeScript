import { LayoutBase } from '../layout-base';
import { Property } from '../../core/properties';
import { Enums } from '../../enums';

/**
 * A Layout that arranges its children horizontally or vertically. The direction can be set by orientation property.
 */
export class StackLayout extends LayoutBase {
	/**
	 * Gets or sets if layout should be horizontal or vertical.
	 * The default value is vertical.
	 */
	orientation: Enums.OrientationType;
}

/**
 * Represents the observable property backing the orientation property of each StackLayout instance.
 */
export const orientationProperty: Property<StackLayout, Enums.OrientationType>;
