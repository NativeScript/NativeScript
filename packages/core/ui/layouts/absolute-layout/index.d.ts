import { LayoutBase } from '../layout-base';
import { Property } from '../../core/properties';
import { View } from '../../core/view';
import { Length } from '../../styling/style-properties';

/**
 *  A layout that lets you specify exact locations (left/top coordinates) of its children.
 */
export class AbsoluteLayout extends LayoutBase {
	/**
	 * Gets the value of the Left property from a given View.
	 */
	static getLeft(view: View): Length;

	/**
	 * Sets the value of the Left property from a given View.
	 */
	static setLeft(view: View, value: Length): void;

	/**
	 * Gets the value of the Top property from a given View.
	 */
	static getTop(view: View): Length;

	/**
	 * Sets the value of the Top property from a given View.
	 */
	static setTop(view: View, value: Length): void;
}

/**
 * Represents the observable property backing the left property.
 */
export const leftProperty: Property<View, Length>;

/**
 * Represents the observable property backing the top property.
 */
export const topProperty: Property<View, Length>;
