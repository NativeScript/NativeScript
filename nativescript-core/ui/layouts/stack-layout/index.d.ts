import { LayoutBase } from '../layout-base';
import { Property } from '../../core/properties';

/**
 * A Layout that arranges its children horizontally or vertically. The direction can be set by orientation property.
 */
export class StackLayout extends LayoutBase {
	/**
	 * Gets or sets if layout should be horizontal or vertical.
	 * The default value is vertical.
	 */
	orientation: Orientation;
}

export type Orientation = 'horizontal' | 'vertical';

/**
 * Represents the observable property backing the orientation property of each StackLayout instance.
 */
export const orientationProperty: Property<StackLayout, Orientation>;
