import { GridLayout as GridLayoutDefinition, ItemSpec as ItemSpecDefinition } from '.';
import { LayoutBase } from '../layout-base';
import { View, CSSType } from '../../core/view';
import { Property, makeParser, makeValidator } from '../../core/properties';
import { Observable } from '../../../data/observable';

function validateArgs(element: View): View {
	if (!element) {
		throw new Error('element cannot be null or undefined.');
	}

	return element;
}

View.prototype.row = 0;
View.prototype.col = 0;
View.prototype.rowSpan = 1;
View.prototype.colSpan = 1;

Object.defineProperty(View.prototype, 'column', {
	get(this: View): number {
		return this.col;
	},
	set(this: View, value: number) {
		this.col = value;
	},
	enumerable: true,
	configurable: true,
});

Object.defineProperty(View.prototype, 'columnSpan', {
	get(this: View): number {
		return this.colSpan;
	},
	set(this: View, value: number) {
		this.colSpan = value;
	},
	enumerable: true,
	configurable: true,
});

function validateItemSpec(itemSpec: ItemSpec): void {
	if (!itemSpec) {
		throw new Error('Value cannot be undefined.');
	}

	if (itemSpec.owner) {
		throw new Error('itemSpec is already added to GridLayout.');
	}
}

function convertGridLength(value: string): ItemSpec {
	if (value === GridUnitType.AUTO) {
		return ItemSpec.create(1, GridUnitType.AUTO);
	} else if (value.indexOf('*') !== -1) {
		const starCount = parseInt(value.replace('*', '') || '1');

		return ItemSpec.create(starCount, GridUnitType.STAR);
	} else if (!isNaN(parseInt(value))) {
		return ItemSpec.create(parseInt(value), GridUnitType.PIXEL);
	} else {
		throw new Error(`Cannot parse item spec from string: ${value}`);
	}
}

function parseAndAddItemSpecs(value: string, func: (itemSpec: ItemSpec) => void): void {
	// ensure value is a string since view bindings could be parsed as number/int's here
	const arr = `${value}`.split(/[\s,]+/);
	for (let i = 0, length = arr.length; i < length; i++) {
		const str = arr[i].trim();
		if (str.length > 0) {
			func(convertGridLength(arr[i].trim()));
		}
	}
}

export class ItemSpec extends Observable implements ItemSpecDefinition {
	private _value: number;
	private _unitType: GridUnitType;

	constructor() {
		super();

		if (arguments.length === 0) {
			this._value = 1;
			this._unitType = GridUnitType.STAR;
		} else if (arguments.length === 2) {
			const value = arguments[0];
			const type = arguments[1];
			if (typeof value === 'number' && typeof type === 'string') {
				if (value < 0 || isNaN(value) || !isFinite(value)) {
					throw new Error(`Value should not be negative, NaN or Infinity: ${value}`);
				}

				this._value = value;
				this._unitType = GridUnitType.parse(type);
			} else {
				throw new Error('First argument should be number, second argument should be string.');
			}
		} else {
			throw new Error('ItemSpec expects 0 or 2 arguments');
		}

		this.index = -1;
	}

	public owner: GridLayoutBase;
	public index: number;
	public _actualLength: number = 0;

	public static create(value: number, type: GridUnitType): ItemSpec {
		let spec = new ItemSpec();
		spec._value = value;
		spec._unitType = type;

		return spec;
	}

	public get actualLength(): number {
		return this._actualLength;
	}

	public static equals(value1: ItemSpec, value2: ItemSpec): boolean {
		return value1.gridUnitType === value2.gridUnitType && value1.value === value2.value && value1.owner === value2.owner && value1.index === value2.index;
	}

	get gridUnitType(): GridUnitType {
		return this._unitType;
	}

	get isAbsolute(): boolean {
		return this._unitType === GridUnitType.PIXEL;
	}

	get isAuto(): boolean {
		return this._unitType === GridUnitType.AUTO;
	}

	get isStar(): boolean {
		return this._unitType === GridUnitType.STAR;
	}

	get value(): number {
		return this._value;
	}
}

@CSSType('GridLayout')
export class GridLayoutBase extends LayoutBase implements GridLayoutDefinition {
	private _rows: Array<ItemSpec> = new Array<ItemSpec>();
	private _cols: Array<ItemSpec> = new Array<ItemSpec>();

	public static getColumn(element: View): number {
		return validateArgs(element).col;
	}

	public static setColumn(element: View, value: number): void {
		validateArgs(element).col = value;
	}

	public static getColumnSpan(element: View): number {
		return validateArgs(element).colSpan;
	}

	public static setColumnSpan(element: View, value: number): void {
		validateArgs(element).colSpan = value;
	}

	public static getRow(element: View): number {
		return validateArgs(element).row;
	}

	public static setRow(element: View, value: number): void {
		validateArgs(element).row = value;
	}

	public static getRowSpan(element: View): number {
		return validateArgs(element).rowSpan;
	}

	public static setRowSpan(element: View, value: number): void {
		validateArgs(element).rowSpan = value;
	}

	public addRow(itemSpec: ItemSpec) {
		validateItemSpec(itemSpec);
		itemSpec.owner = this;
		this._rows.push(itemSpec);
		this._onRowAdded(itemSpec);
		this.invalidate();
	}

	public addColumn(itemSpec: ItemSpec) {
		validateItemSpec(itemSpec);
		itemSpec.owner = this;
		this._cols.push(itemSpec);
		this._onColumnAdded(itemSpec);
		this.invalidate();
	}

	public addChildAtCell(view: View, row: number, column: number, rowSpan?: number, columnSpan?: number): void {
		this.addChild(view);
		GridLayoutBase.setRow(view, row);
		GridLayoutBase.setColumn(view, column);
		if (rowSpan) {
			GridLayoutBase.setRowSpan(view, rowSpan);
		}
		if (columnSpan) {
			GridLayoutBase.setColumnSpan(view, columnSpan);
		}
	}

	public removeRow(itemSpec: ItemSpec): void {
		if (!itemSpec) {
			throw new Error('Value is null.');
		}

		const index = this._rows.indexOf(itemSpec);
		if (itemSpec.owner !== this || index < 0) {
			throw new Error('Row is not child of this GridLayout');
		}

		itemSpec.index = -1;
		this._rows.splice(index, 1);
		this._onRowRemoved(itemSpec, index);
		this.invalidate();
	}

	public removeColumn(itemSpec: ItemSpec): void {
		if (!itemSpec) {
			throw new Error('Value is null.');
		}

		const index = this._cols.indexOf(itemSpec);
		if (itemSpec.owner !== this || index < 0) {
			throw new Error('Column is not child of this GridLayout');
		}

		itemSpec.index = -1;
		this._cols.splice(index, 1);
		this._onColumnRemoved(itemSpec, index);
		this.invalidate();
	}

	public removeColumns() {
		for (let i = this._cols.length - 1; i >= 0; i--) {
			const colSpec = this._cols[i];
			this._onColumnRemoved(colSpec, i);
			colSpec.index = -1;
		}
		this._cols.length = 0;
		this.invalidate();
	}

	public removeRows() {
		for (let i = this._rows.length - 1; i >= 0; i--) {
			const rowSpec = this._rows[i];
			this._onRowRemoved(rowSpec, i);
			rowSpec.index = -1;
		}
		this._rows.length = 0;
		this.invalidate();
	}

	public onRowChanged(element: View, oldValue: number, newValue: number) {
		this.invalidate();
	}

	public onRowSpanChanged(element: View, oldValue: number, newValue: number) {
		this.invalidate();
	}

	public onColumnChanged(element: View, oldValue: number, newValue: number) {
		this.invalidate();
	}

	public onColumnSpanChanged(element: View, oldValue: number, newValue: number) {
		this.invalidate();
	}

	public _onRowAdded(itemSpec: ItemSpec) {
		//
	}

	public _onColumnAdded(itemSpec: ItemSpec) {
		//
	}

	public _onRowRemoved(itemSpec: ItemSpec, index: number): void {
		//
	}

	public _onColumnRemoved(itemSpec: ItemSpec, index: number): void {
		//
	}

	public getColumns(): Array<ItemSpec> {
		return this._cols.slice();
	}

	public getRows(): Array<ItemSpec> {
		return this._rows.slice();
	}

	protected get columnsInternal(): Array<ItemSpec> {
		return this._cols;
	}

	protected get rowsInternal(): Array<ItemSpec> {
		return this._rows;
	}

	protected invalidate(): void {
		// handled natively in android and overridden in ios.
	}

	set rows(value: string) {
		this.removeRows();
		parseAndAddItemSpecs(value, (spec: ItemSpec) => this.addRow(spec));
	}

	set columns(value: string) {
		this.removeColumns();
		parseAndAddItemSpecs(value, (spec: ItemSpec) => this.addColumn(spec));
	}
}

GridLayoutBase.prototype.recycleNativeView = 'auto';

export const columnProperty = new Property<View, number>({
	name: 'col',
	defaultValue: 0,
	valueChanged: (target, oldValue, newValue) => {
		const grid = target.parent;
		if (grid instanceof GridLayoutBase) {
			grid.onColumnChanged(target, oldValue, newValue);
		}
	},
	valueConverter: (v) => Math.max(0, parseInt(v)),
});
columnProperty.register(View);

export const columnSpanProperty = new Property<View, number>({
	name: 'colSpan',
	defaultValue: 1,
	valueChanged: (target, oldValue, newValue) => {
		const grid = target.parent;
		if (grid instanceof GridLayoutBase) {
			grid.onColumnSpanChanged(target, oldValue, newValue);
		}
	},
	valueConverter: (v) => Math.max(1, parseInt(v)),
});
columnSpanProperty.register(View);

export const rowProperty = new Property<View, number>({
	name: 'row',
	defaultValue: 0,
	valueChanged: (target, oldValue, newValue) => {
		const grid = target.parent;
		if (grid instanceof GridLayoutBase) {
			grid.onRowChanged(target, oldValue, newValue);
		}
	},
	valueConverter: (v) => Math.max(0, parseInt(v)),
});
rowProperty.register(View);

export const rowSpanProperty = new Property<View, number>({
	name: 'rowSpan',
	defaultValue: 1,
	valueChanged: (target, oldValue, newValue) => {
		const grid = target.parent;
		if (grid instanceof GridLayoutBase) {
			grid.onRowSpanChanged(target, oldValue, newValue);
		}
	},
	valueConverter: (v) => Math.max(1, parseInt(v)),
});
rowSpanProperty.register(View);

export type GridUnitType = 'pixel' | 'star' | 'auto';
export namespace GridUnitType {
	export const PIXEL: 'pixel' = 'pixel';
	export const STAR: 'star' = 'star';
	export const AUTO: 'auto' = 'auto';
	export const isValid = makeValidator<GridUnitType>(PIXEL, STAR, AUTO);
	export const parse = makeParser<GridUnitType>(isValid);
}
