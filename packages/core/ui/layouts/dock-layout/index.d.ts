import { LayoutBase } from '../layout-base';
import { Property } from '../../core/properties';
import { View } from '../../core/view';

/**
 * A Layout that arranges its children at its outer edges, and allows its last child to take up the remaining space.
 */
export class DockLayout extends LayoutBase {
	/**
	 * Gets the value of the Dock property from a given View.
	 */
	static getDock(view: View): Dock;

	/**
	 * Sets the value of the Dock property from a given View.
	 */
	static setDock(view: View, value: Dock): void;

	/**
	 * Gets or sets a value that indicates whether the last child element within a DockLayout stretches to fill the remaining available space.
	 * The default value is true.
	 */
	stretchLastChild: boolean;
}

export type Dock = 'left' | 'top' | 'right' | 'bottom';
/**
 * Represents the observable property backing the dock property.
 */
export const dockProperty: Property<DockLayout, Dock>;

/**
 * Represents the observable property backing the stretchLastChild property of each DockLayout instance.
 */
export const stretchLastChildProperty: Property<DockLayout, boolean>;
