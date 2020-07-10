import { LayoutBase } from '../layout-base';
import { View } from '../../core/view';
import { Property } from '../../core/properties';

/**
 * Defines row/column specific properties that apply to GridLayout elements.
 */
export class ItemSpec {
	constructor();
	constructor(value: number, type: GridUnitType);

	/**
	 * Gets the actual length of an ItemSpec.
	 */
	actualLength: number;

	/**
	 * Returns unit type of this ItemSpec instance.
	 */
	gridUnitType: GridUnitType;

	/**
	 * Returns true if this ItemSpec instance holds
	 * an absolute (pixel) value.
	 */
	isAbsolute: boolean;

	/**
	 * Returns true if this GridLength instance is
	 * automatic (not specified).
	 */
	isAuto: boolean;

	/**
	 * Returns true if this ItemSpec instance holds weighted proportion
	 * of available space.
	 */
	isStar: boolean;

	/**
	 * Returns value part of this ItemSpec instance.
	 */
	value: number;
}

/**
 * Defines a rectangular layout area that consists of columns and rows.
 */
export class GridLayout extends LayoutBase {
	/**
	 * Gets the value of the Column attached property from a given View.
	 */
	static getColumn(view: View): number;

	/**
	 * Sets the value of the Column attached property to a given View.
	 */
	static setColumn(view: View, value: number): void;

	/**
	 * Gets the value of the ColumnSpan attached property from a given View.
	 */
	static getColumnSpan(view: View): number;

	/**
	 * Sets the value of the ColumnSpan attached property to a given View.
	 */
	static setColumnSpan(view: View, value: number): void;

	/**
	 * Gets the value of the Row attached property from a given View.
	 */
	static getRow(view: View): number;

	/**
	 * Sets the value of the Row attached property to a given View.
	 */
	static setRow(view: View, value: number): void;

	/**
	 * Gets the value of the RowSpan attached property from a given View.
	 */
	static getRowSpan(view: View): number;

	/**
	 * Sets the value of the RowSpan attached property to a given View.
	 */
	static setRowSpan(view: View, value: number): void;

	/**
	 * Adds a column specification to a GridLayout.
	 */
	public addColumn(itemSpec: ItemSpec): void;

	/**
	 * Adds a row specification to a GridLayout.
	 */
	public addRow(itemSpec: ItemSpec): void;

	/**
	 * Adds a child at specific cell in GridLayout. Optional rowSpan and columnSpan attributes
	 */
	public addChildAtCell(view: View, row: number, column: number, rowSpan?: number, columnSpan?: number): void;

	/**
	 * Removes a column specification from a GridLayout.
	 */
	public removeColumn(itemSpec: ItemSpec): void;

	/**
	 * Removes all column specifications from a GridLayout.
	 */
	public removeColumns(): void;

	/**
	 * Removes a row specification from a GridLayout.
	 */
	public removeRow(itemSpec: ItemSpec): void;

	/**
	 * Removes all row specifications from a GridLayout.
	 */
	public removeRows(): void;

	/**
	 * Gets array of column specifications defined on this instance of GridLayout.
	 */
	public getColumns(): Array<ItemSpec>;

	/**
	 * Gets array of row specifications defined on this instance of GridLayout.
	 */
	public getRows(): Array<ItemSpec>;

	//@private
	/**
	 * @private
	 */
	public _onRowAdded(itemSpec: ItemSpec): void;
	/**
	 * @private
	 */
	public _onColumnAdded(itemSpec: ItemSpec): void;
	/**
	 * @private
	 */
	public _onRowRemoved(itemSpec: ItemSpec, index: number): void;
	/**
	 * @private
	 */
	public _onColumnRemoved(itemSpec: ItemSpec, index: number): void;
	//@endprivate
}

/**
 * Represents the observable property backing the column property.
 */
export const columnProperty: Property<View, number>;

/**
 * Represents the observable property backing the columnSpan property.
 */
export const columnSpanProperty: Property<View, number>;

/**
 * Represents the observable property backing the row property.
 */
export const rowProperty: Property<View, number>;

/**
 * Represents the observable property backing the rowSpan property.
 */
export const rowSpanProperty: Property<View, number>;

export type GridUnitType = 'pixel' | 'star' | 'auto';
export namespace GridUnitType {
	export const PIXEL: 'pixel';
	export const STAR: 'star';
	export const AUTO: 'auto';
	export function isValid(value: any): boolean;
	export function parse(value: string): GridUnitType;
}
