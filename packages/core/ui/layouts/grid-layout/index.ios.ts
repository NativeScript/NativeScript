import { GridLayoutBase, ItemSpec } from './grid-layout-common';
import { View } from '../../core/view';
import { layout } from '../../../utils';

export * from './grid-layout-common';

export class GridLayout extends GridLayoutBase {
	private helper: MeasureHelper;
	private columnOffsets = new Array<number>();
	private rowOffsets = new Array<number>();
	private map = new Map<View, MeasureSpecs>();

	constructor() {
		super();
		this.helper = new MeasureHelper(this);
	}

	public _onRowAdded(itemSpec: ItemSpec) {
		this.helper.rows.push(new ItemGroup(itemSpec));
	}

	public _onColumnAdded(itemSpec: ItemSpec) {
		this.helper.columns.push(new ItemGroup(itemSpec));
	}

	public _onRowRemoved(itemSpec: ItemSpec, index: number) {
		this.helper.rows[index].children.length = 0;
		this.helper.rows.splice(index, 1);
	}

	public _onColumnRemoved(itemSpec: ItemSpec, index: number) {
		this.helper.columns[index].children.length = 0;
		this.helper.columns.splice(index, 1);
	}

	public _registerLayoutChild(child: View) {
		this.addToMap(child);
	}

	public _unregisterLayoutChild(child: View) {
		this.removeFromMap(child);
	}

	protected invalidate(): void {
		super.invalidate();
		this.requestLayout();
	}

	private getColumnIndex(view: View): number {
		return Math.max(0, Math.min(GridLayout.getColumn(view), this.columnsInternal.length - 1));
	}

	private getRowIndex(view: View): number {
		return Math.max(0, Math.min(GridLayout.getRow(view), this.rowsInternal.length - 1));
	}

	private getColumnSpan(view: View, columnIndex: number): number {
		return Math.max(1, Math.min(GridLayout.getColumnSpan(view), this.columnsInternal.length - columnIndex));
	}

	private getRowSpan(view: View, rowIndex: number): number {
		return Math.max(1, Math.min(GridLayout.getRowSpan(view), this.rowsInternal.length - rowIndex));
	}

	private getColumnSpec(view: View): ItemSpec {
		return this.columnsInternal[this.getColumnIndex(view)] || this.helper.singleColumn;
	}

	private getRowSpec(view: View): ItemSpec {
		return this.rowsInternal[this.getRowIndex(view)] || this.helper.singleRow;
	}

	private updateMeasureSpecs(child: View, measureSpec: MeasureSpecs): void {
		let column = this.getColumnSpec(child);
		let columnIndex = this.getColumnIndex(child);
		let columnSpan = this.getColumnSpan(child, columnIndex);

		let row = this.getRowSpec(child);
		let rowIndex = this.getRowIndex(child);
		let rowSpan = this.getRowSpan(child, rowIndex);

		measureSpec.setColumn(column);
		measureSpec.setColumnIndex(columnIndex);
		measureSpec.setColumnSpan(columnSpan);

		measureSpec.setRow(row);
		measureSpec.setRowIndex(rowIndex);
		measureSpec.setRowSpan(rowSpan);

		measureSpec.autoColumnsCount = 0;
		measureSpec.autoRowsCount = 0;
		measureSpec.measured = false;
		measureSpec.pixelHeight = 0;
		measureSpec.pixelWidth = 0;
		measureSpec.starColumnsCount = 0;
		measureSpec.starRowsCount = 0;
	}

	private addToMap(child: View): void {
		this.map.set(child, new MeasureSpecs(child));
	}

	private removeFromMap(child: View): void {
		this.map.delete(child);
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);

		let measureWidth = 0;
		let measureHeight = 0;

		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const horizontalPaddingsAndMargins = this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
		const verticalPaddingsAndMargins = this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;

		let infinityWidth = widthMode === layout.UNSPECIFIED;
		let infinityHeight = heightMode === layout.UNSPECIFIED;

		this.helper.width = Math.max(0, width - horizontalPaddingsAndMargins);
		this.helper.height = Math.max(0, height - verticalPaddingsAndMargins);

		this.helper.stretchedHorizontally = widthMode === layout.EXACTLY || (this.horizontalAlignment === 'stretch' && !infinityWidth);
		this.helper.stretchedVertically = heightMode === layout.EXACTLY || (this.verticalAlignment === 'stretch' && !infinityHeight);

		this.helper.setInfinityWidth(infinityWidth);
		this.helper.setInfinityHeight(infinityHeight);

		this.helper.clearMeasureSpecs();
		this.helper.init();

		this.eachLayoutChild((child, last) => {
			let measureSpecs = this.map.get(child);
			if (!measureSpecs) {
				return;
			}

			this.updateMeasureSpecs(child, measureSpecs);
			this.helper.addMeasureSpec(measureSpecs);
		});

		this.helper.measure();

		// Add in our padding
		measureWidth = this.helper.measuredWidth + horizontalPaddingsAndMargins;
		measureHeight = this.helper.measuredHeight + verticalPaddingsAndMargins;

		// Check against our minimum sizes
		measureWidth = Math.max(measureWidth, this.effectiveMinWidth);
		measureHeight = Math.max(measureHeight, this.effectiveMinHeight);

		const widthSizeAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
		const heightSizeAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

		this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);

		const insets = this.getSafeAreaInsets();

		let paddingLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft + insets.left;
		let paddingTop = this.effectiveBorderTopWidth + this.effectivePaddingTop + insets.top;

		this.columnOffsets.length = 0;
		this.rowOffsets.length = 0;

		this.columnOffsets.push(paddingLeft);
		this.rowOffsets.push(paddingTop);

		let offset = this.columnOffsets[0];
		let roundedOffset = paddingLeft;
		let roundedLength = 0;
		let actualLength = 0;

		for (let i = 0, size = this.helper.columns.length; i < size; i++) {
			let columnGroup = this.helper.columns[i];
			offset += columnGroup.length;

			actualLength = offset - roundedOffset;
			roundedLength = Math.round(actualLength);
			columnGroup.rowOrColumn._actualLength = layout.round(layout.toDeviceIndependentPixels(roundedLength));
			roundedOffset += roundedLength;

			this.columnOffsets.push(roundedOffset);
		}

		offset = this.rowOffsets[0];
		roundedOffset = paddingTop;
		roundedLength = 0;
		actualLength = 0;

		for (let i = 0, size = this.helper.rows.length; i < size; i++) {
			let rowGroup = this.helper.rows[i];
			offset += rowGroup.length;

			actualLength = offset - roundedOffset;
			roundedLength = Math.round(actualLength);
			rowGroup.rowOrColumn._actualLength = layout.round(layout.toDeviceIndependentPixels(roundedLength));
			roundedOffset += roundedLength;

			this.rowOffsets.push(roundedOffset);
		}

		for (let i = 0, columns = this.helper.columns.length; i < columns; i++) {
			let columnGroup = this.helper.columns[i];
			for (let j = 0, children = columnGroup.children.length; j < children; j++) {
				let measureSpec = columnGroup.children[j];
				let childLeft = this.columnOffsets[measureSpec.getColumnIndex()];
				let childRight = this.columnOffsets[measureSpec.getColumnIndex() + measureSpec.getColumnSpan()];
				let childTop = this.rowOffsets[measureSpec.getRowIndex()];
				let childBottom = this.rowOffsets[measureSpec.getRowIndex() + measureSpec.getRowSpan()];

				// No need to include margins in the width, height
				View.layoutChild(this, measureSpec.child, childLeft, childTop, childRight, childBottom);
			}
		}
	}
}

class MeasureSpecs {
	private _columnSpan = 1;
	private _rowSpan = 1;

	public pixelWidth = 0;
	public pixelHeight = 0;

	public starColumnsCount = 0;
	public starRowsCount = 0;

	public autoColumnsCount = 0;
	public autoRowsCount = 0;

	public measured = false;

	public child: View;
	private column: ItemSpec;
	private row: ItemSpec;
	private columnIndex: number = 0;
	private rowIndex: number = 0;

	constructor(child: View) {
		this.child = child;
	}

	public getSpanned(): boolean {
		return this._columnSpan > 1 || this._rowSpan > 1;
	}

	public getIsStar(): boolean {
		return this.starRowsCount > 0 || this.starColumnsCount > 0;
	}

	public getColumnSpan(): number {
		return this._columnSpan;
	}

	public getRowSpan(): number {
		return this._rowSpan;
	}

	public setRowSpan(value: number): void {
		// cannot have zero rowSpan.
		this._rowSpan = Math.max(1, value);
	}

	public setColumnSpan(value: number): void {
		// cannot have zero colSpan.
		this._columnSpan = Math.max(1, value);
	}

	public getRowIndex(): number {
		return this.rowIndex;
	}

	public getColumnIndex(): number {
		return this.columnIndex;
	}

	public setRowIndex(value: number): void {
		this.rowIndex = value;
	}

	public setColumnIndex(value: number): void {
		this.columnIndex = value;
	}

	public getRow(): ItemSpec {
		return this.row;
	}

	public getColumn(): ItemSpec {
		return this.column;
	}

	public setRow(value: ItemSpec): void {
		this.row = value;
	}

	public setColumn(value: ItemSpec): void {
		this.column = value;
	}
}

class ItemGroup {
	public length = 0;
	public measuredCount = 0;
	public rowOrColumn: ItemSpec;
	public children: Array<MeasureSpecs> = new Array<MeasureSpecs>();

	public measureToFix = 0;
	public currentMeasureToFixCount = 0;
	private infinityLength = false;

	constructor(spec: ItemSpec) {
		this.rowOrColumn = spec;
	}

	public setIsLengthInfinity(infinityLength: boolean): void {
		this.infinityLength = infinityLength;
	}

	public init(density): void {
		this.measuredCount = 0;
		this.currentMeasureToFixCount = 0;
		this.length = this.rowOrColumn.isAbsolute ? this.rowOrColumn.value * density : 0;
	}

	public getAllMeasured(): boolean {
		return this.measuredCount === this.children.length;
	}

	public getCanBeFixed(): boolean {
		return this.currentMeasureToFixCount === this.measureToFix;
	}

	public getIsAuto(): boolean {
		return this.rowOrColumn.isAuto || (this.rowOrColumn.isStar && this.infinityLength);
	}

	public getIsStar(): boolean {
		return this.rowOrColumn.isStar && !this.infinityLength;
	}

	public getIsAbsolute(): boolean {
		return this.rowOrColumn.isAbsolute;
	}
}

class MeasureHelper {
	singleRow: ItemSpec;
	singleColumn: ItemSpec;
	grid: GridLayout;

	infinity: number = layout.makeMeasureSpec(0, layout.UNSPECIFIED);
	rows: Array<ItemGroup> = new Array<ItemGroup>();
	columns: Array<ItemGroup> = new Array<ItemGroup>();

	width: number = 0;
	height: number = 0;
	stretchedHorizontally: boolean = false;
	stretchedVertically: boolean = false;

	infinityWidth: boolean = false;
	infinityHeight: boolean = false;

	private minColumnStarValue: number = 0;
	private maxColumnStarValue: number = 0;

	private minRowStarValue: number = 0;
	private maxRowStarValue: number = 0;

	measuredWidth: number = 0;
	measuredHeight: number = 0;

	private fakeRowAdded: boolean = false;
	private fakeColumnAdded: boolean = false;

	private singleRowGroup: ItemGroup;
	private singleColumnGroup: ItemGroup;

	constructor(grid: GridLayout) {
		this.grid = grid;
		this.singleRow = new ItemSpec();
		this.singleColumn = new ItemSpec();
		this.singleRowGroup = new ItemGroup(this.singleRow);
		this.singleColumnGroup = new ItemGroup(this.singleColumn);
	}

	public setInfinityWidth(value: boolean): void {
		this.infinityWidth = value;
		for (let i = 0, size = this.columns.length; i < size; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			columnGroup.setIsLengthInfinity(value);
		}
	}

	public setInfinityHeight(value: boolean): void {
		this.infinityHeight = value;
		for (let i = 0, size = this.rows.length; i < size; i++) {
			let rowGroup: ItemGroup = this.rows[i];
			rowGroup.setIsLengthInfinity(value);
		}
	}

	public addMeasureSpec(measureSpec: MeasureSpecs): void {
		// Get column stats
		let size = measureSpec.getColumnIndex() + measureSpec.getColumnSpan();
		for (let i = measureSpec.getColumnIndex(); i < size; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			if (columnGroup.getIsAuto()) {
				measureSpec.autoColumnsCount++;
			} else if (columnGroup.getIsStar()) {
				measureSpec.starColumnsCount += columnGroup.rowOrColumn.value;
			} else if (columnGroup.getIsAbsolute()) {
				measureSpec.pixelWidth += layout.toDevicePixels(columnGroup.rowOrColumn.value);
			}
		}

		if (measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
			// Determine which auto columns are affected by this element
			for (let i = measureSpec.getColumnIndex(); i < size; i++) {
				let columnGroup: ItemGroup = this.columns[i];
				if (columnGroup.getIsAuto()) {
					columnGroup.measureToFix++;
				}
			}
		}

		// Get row stats
		size = measureSpec.getRowIndex() + measureSpec.getRowSpan();
		for (let i = measureSpec.getRowIndex(); i < size; i++) {
			let rowGroup: ItemGroup = this.rows[i];
			if (rowGroup.getIsAuto()) {
				measureSpec.autoRowsCount++;
			} else if (rowGroup.getIsStar()) {
				measureSpec.starRowsCount += rowGroup.rowOrColumn.value;
			} else if (rowGroup.getIsAbsolute()) {
				measureSpec.pixelHeight += layout.toDevicePixels(rowGroup.rowOrColumn.value);
			}
		}

		if (measureSpec.autoRowsCount > 0 && measureSpec.starRowsCount === 0) {
			// Determine which auto rows are affected by this element
			for (let i = measureSpec.getRowIndex(); i < size; i++) {
				let rowGroup: ItemGroup = this.rows[i];
				if (rowGroup.getIsAuto()) {
					rowGroup.measureToFix++;
				}
			}
		}

		this.columns[measureSpec.getColumnIndex()].children.push(measureSpec);
		this.rows[measureSpec.getRowIndex()].children.push(measureSpec);
	}

	public clearMeasureSpecs(): void {
		for (let i = 0, size = this.columns.length; i < size; i++) {
			this.columns[i].children.length = 0;
		}

		for (let i = 0, size = this.rows.length; i < size; i++) {
			this.rows[i].children.length = 0;
		}
	}

	private static initList(list: Array<ItemGroup>): void {
		let density = layout.getDisplayDensity();
		for (let i = 0, size = list.length; i < size; i++) {
			let item: ItemGroup = list[i];
			item.init(density);
		}
	}

	init(): void {
		let rows = this.rows.length;
		if (rows === 0) {
			this.singleRowGroup.setIsLengthInfinity(this.infinityHeight);
			this.rows.push(this.singleRowGroup);
			this.fakeRowAdded = true;
		} else if (rows > 1 && this.fakeRowAdded) {
			this.rows.splice(0, 1);
			this.fakeRowAdded = false;
		}

		let cols = this.columns.length;
		if (cols === 0) {
			this.fakeColumnAdded = true;
			this.singleColumnGroup.setIsLengthInfinity(this.infinityWidth);
			this.columns.push(this.singleColumnGroup);
		} else if (cols > 1 && this.fakeColumnAdded) {
			this.columns.splice(0, 1);
			this.fakeColumnAdded = false;
		}

		MeasureHelper.initList(this.rows);
		MeasureHelper.initList(this.columns);

		this.minColumnStarValue = -1;
		this.minRowStarValue = -1;
		this.maxColumnStarValue = -1;
		this.maxRowStarValue = -1;
	}

	private itemMeasured(measureSpec: MeasureSpecs, isFakeMeasure: boolean): void {
		if (!isFakeMeasure) {
			this.columns[measureSpec.getColumnIndex()].measuredCount++;
			this.rows[measureSpec.getRowIndex()].measuredCount++;
			measureSpec.measured = true;
		}

		if (measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
			let size = measureSpec.getColumnIndex() + measureSpec.getColumnSpan();
			for (let i = measureSpec.getColumnIndex(); i < size; i++) {
				let columnGroup: ItemGroup = this.columns[i];
				if (columnGroup.getIsAuto()) {
					columnGroup.currentMeasureToFixCount++;
				}
			}
		}

		if (measureSpec.autoRowsCount > 0 && measureSpec.starRowsCount === 0) {
			let size = measureSpec.getRowIndex() + measureSpec.getRowSpan();
			for (let i = measureSpec.getRowIndex(); i < size; i++) {
				let rowGroup: ItemGroup = this.rows[i];
				if (rowGroup.getIsAuto()) {
					rowGroup.currentMeasureToFixCount++;
				}
			}
		}
	}

	private fixColumns(): void {
		let currentColumnWidth = 0;
		let columnStarCount = 0;

		let columnCount = this.columns.length;
		for (let i = 0; i < columnCount; i++) {
			let item: ItemGroup = this.columns[i];
			if (item.rowOrColumn.isStar) {
				columnStarCount += item.rowOrColumn.value;
			} else {
				// Star columns are still zeros (not calculated).
				currentColumnWidth += item.length;
			}
		}

		let widthForStarColumns = Math.max(0, this.width - currentColumnWidth);
		this.maxColumnStarValue = columnStarCount > 0 ? widthForStarColumns / columnStarCount : 0;

		MeasureHelper.updateStarLength(this.columns, this.maxColumnStarValue);
	}

	private fixRows(): void {
		let currentRowHeight = 0;
		let rowStarCount = 0;

		let rowCount = this.rows.length;
		for (let i = 0; i < rowCount; i++) {
			let item: ItemGroup = this.rows[i];
			if (item.rowOrColumn.isStar) {
				rowStarCount += item.rowOrColumn.value;
			} else {
				// Star rows are still zeros (not calculated).
				currentRowHeight += item.length;
			}
		}

		let heightForStarRows = Math.max(0, this.height - currentRowHeight);
		this.maxRowStarValue = rowStarCount > 0 ? heightForStarRows / rowStarCount : 0;

		MeasureHelper.updateStarLength(this.rows, this.maxRowStarValue);
	}

	private static updateStarLength(list: Array<ItemGroup>, starValue: number): void {
		let offset = 0;
		let roundedOffset = 0;
		for (let i = 0, rowCount = list.length; i < rowCount; i++) {
			let item = list[i];
			if (item.getIsStar()) {
				offset += item.rowOrColumn.value * starValue;

				let actualLength = offset - roundedOffset;
				let roundedLength = Math.round(actualLength);
				item.length = roundedLength;
				roundedOffset += roundedLength;
			}
		}
	}

	private fakeMeasure(): void {
		// Fake measure - measure all elements that have star rows and auto columns - with infinity Width and infinity Height
		for (let i = 0, size = this.columns.length; i < size; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			if (columnGroup.getAllMeasured()) {
				continue;
			}

			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				let measureSpec: MeasureSpecs = columnGroup.children[j];
				if (measureSpec.starRowsCount > 0 && measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
					this.measureChild(measureSpec, true);
				}
			}
		}
	}

	private measureFixedColumnsNoStarRows(): void {
		for (let i = 0, size = this.columns.length; i < size; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				let measureSpec: MeasureSpecs = columnGroup.children[j];
				if (measureSpec.starColumnsCount > 0 && measureSpec.starRowsCount === 0) {
					this.measureChildFixedColumns(measureSpec);
				}
			}
		}
	}

	private measureNoStarColumnsFixedRows(): void {
		for (let i = 0, size = this.columns.length; i < size; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				let measureSpec: MeasureSpecs = columnGroup.children[j];
				if (measureSpec.starRowsCount > 0 && measureSpec.starColumnsCount === 0) {
					this.measureChildFixedRows(measureSpec);
				}
			}
		}
	}

	private static canFix(list: Array<ItemGroup>): boolean {
		for (let i = 0, size = list.length; i < size; i++) {
			let item: ItemGroup = list[i];
			if (!item.getCanBeFixed()) {
				return false;
			}
		}

		return true;
	}

	private static getMeasureLength(list: Array<ItemGroup>): number {
		let result = 0;
		for (let i = 0, size = list.length; i < size; i++) {
			let item: ItemGroup = list[i];
			result += item.length;
		}

		return result;
	}

	public measure(): void {
		// Measure auto & pixel columns and rows (no spans).
		let size = this.columns.length;
		for (let i = 0; i < size; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				let measureSpec: MeasureSpecs = columnGroup.children[j];
				if (measureSpec.getIsStar() || measureSpec.getSpanned()) {
					continue;
				}

				this.measureChild(measureSpec, false);
			}
		}

		// Measure auto & pixel columns and rows (with spans).
		for (let i = 0; i < size; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				let measureSpec = columnGroup.children[j];
				if (measureSpec.getIsStar() || !measureSpec.getSpanned()) {
					continue;
				}

				this.measureChild(measureSpec, false);
			}
		}

		// try fix stars!
		let fixColumns: boolean = MeasureHelper.canFix(this.columns);
		let fixRows: boolean = MeasureHelper.canFix(this.rows);

		if (fixColumns) {
			this.fixColumns();
		}

		if (fixRows) {
			this.fixRows();
		}

		if (!fixColumns && !fixRows) {
			// Fake measure - measure all elements that have star rows and auto columns - with infinity Width and infinity Height
			// should be able to fix rows after that
			this.fakeMeasure();

			this.fixColumns();

			// Measure all elements that have star columns(already fixed), but no stars at the rows
			this.measureFixedColumnsNoStarRows();

			this.fixRows();
		} else if (fixColumns && !fixRows) {
			// Measure all elements that have star columns(already fixed) but no stars at the rows
			this.measureFixedColumnsNoStarRows();

			// Then
			this.fixRows();
		} else if (!fixColumns && fixRows) {
			// Measure all elements that have star rows(already fixed) but no star at the columns
			this.measureNoStarColumnsFixedRows();

			// Then
			this.fixColumns();
		}

		// Rows and columns are fixed here - measure remaining elements
		size = this.columns.length;
		for (let i = 0; i < size; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childCount = columnGroup.children.length; j < childCount; j++) {
				let measureSpec: MeasureSpecs = columnGroup.children[j];
				if (!measureSpec.measured) {
					this.measureChildFixedColumnsAndRows(measureSpec);
				}
			}
		}

		// If we are not stretched and minColumnStarValue is less than maxColumnStarValue
		// we need to reduce the width of star columns.
		if (!this.stretchedHorizontally && this.minColumnStarValue !== -1 && this.minColumnStarValue < this.maxColumnStarValue) {
			MeasureHelper.updateStarLength(this.columns, this.minColumnStarValue);
		}

		// If we are not stretched and minRowStarValue is less than maxRowStarValue
		// we need to reduce the height of star maxRowStarValue.
		if (!this.stretchedVertically && this.minRowStarValue !== -1 && this.minRowStarValue < this.maxRowStarValue) {
			MeasureHelper.updateStarLength(this.rows, this.minRowStarValue);
		}

		this.measuredWidth = MeasureHelper.getMeasureLength(this.columns);
		this.measuredHeight = MeasureHelper.getMeasureLength(this.rows);
	}

	private measureChild(measureSpec: MeasureSpecs, isFakeMeasure: boolean): void {
		let widthMeasureSpec = measureSpec.autoColumnsCount > 0 ? this.infinity : layout.makeMeasureSpec(measureSpec.pixelWidth, layout.EXACTLY);
		let heightMeasureSpec = isFakeMeasure || measureSpec.autoRowsCount > 0 ? this.infinity : layout.makeMeasureSpec(measureSpec.pixelHeight, layout.EXACTLY);

		let childSize = View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);
		let childMeasuredWidth: number = childSize.measuredWidth;
		let childMeasuredHeight: number = childSize.measuredHeight;

		let columnSpanEnd: number = measureSpec.getColumnIndex() + measureSpec.getColumnSpan();
		let rowSpanEnd: number = measureSpec.getRowIndex() + measureSpec.getRowSpan();

		if (measureSpec.autoColumnsCount > 0) {
			let remainingSpace = childMeasuredWidth;

			for (let i = measureSpec.getColumnIndex(); i < columnSpanEnd; i++) {
				let columnGroup: ItemGroup = this.columns[i];
				remainingSpace -= columnGroup.length;
			}

			if (remainingSpace > 0) {
				let growSize = remainingSpace / measureSpec.autoColumnsCount;
				for (let i = measureSpec.getColumnIndex(); i < columnSpanEnd; i++) {
					let columnGroup: ItemGroup = this.columns[i];
					if (columnGroup.getIsAuto()) {
						columnGroup.length += growSize;
					}
				}
			}
		}

		if (!isFakeMeasure && measureSpec.autoRowsCount > 0) {
			let remainingSpace: number = childMeasuredHeight;

			for (let i = measureSpec.getRowIndex(); i < rowSpanEnd; i++) {
				let rowGroup: ItemGroup = this.rows[i];
				remainingSpace -= rowGroup.length;
			}

			if (remainingSpace > 0) {
				let growSize = remainingSpace / measureSpec.autoRowsCount;
				for (let i = measureSpec.getRowIndex(); i < rowSpanEnd; i++) {
					let rowGroup: ItemGroup = this.rows[i];
					if (rowGroup.getIsAuto()) {
						rowGroup.length += growSize;
					}
				}
			}
		}

		this.itemMeasured(measureSpec, isFakeMeasure);
	}

	private measureChildFixedColumns(measureSpec: MeasureSpecs): void {
		let columnIndex = measureSpec.getColumnIndex();
		let columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
		let rowIndex = measureSpec.getRowIndex();
		let rowSpanEnd = rowIndex + measureSpec.getRowSpan();

		let measureWidth = 0;
		let growSize = 0;

		for (let i = columnIndex; i < columnSpanEnd; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			measureWidth += columnGroup.length;
		}

		let widthMeasureSpec = layout.makeMeasureSpec(measureWidth, this.stretchedHorizontally ? layout.EXACTLY : layout.AT_MOST);
		let heightMeasureSpec = measureSpec.autoRowsCount > 0 ? this.infinity : layout.makeMeasureSpec(measureSpec.pixelHeight, layout.EXACTLY);

		let childSize = View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);
		let childMeasuredWidth = childSize.measuredWidth;
		let childMeasuredHeight = childSize.measuredHeight;

		this.updateMinColumnStarValueIfNeeded(measureSpec, childMeasuredWidth);

		// Distribute height over auto rows
		if (measureSpec.autoRowsCount > 0) {
			let remainingSpace = childMeasuredHeight;

			for (let i = rowIndex; i < rowSpanEnd; i++) {
				let rowGroup: ItemGroup = this.rows[i];
				remainingSpace -= rowGroup.length;
			}

			if (remainingSpace > 0) {
				growSize = remainingSpace / measureSpec.autoRowsCount;
				for (let i = rowIndex; i < rowSpanEnd; i++) {
					let rowGroup: ItemGroup = this.rows[i];
					if (rowGroup.getIsAuto()) {
						rowGroup.length += growSize;
					}
				}
			}
		}

		this.itemMeasured(measureSpec, false);
	}

	private measureChildFixedRows(measureSpec: MeasureSpecs): void {
		let columnIndex = measureSpec.getColumnIndex();
		let columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
		let rowIndex = measureSpec.getRowIndex();
		let rowSpanEnd = rowIndex + measureSpec.getRowSpan();
		let measureHeight = 0;

		for (let i = rowIndex; i < rowSpanEnd; i++) {
			let rowGroup: ItemGroup = this.rows[i];
			measureHeight += rowGroup.length;
		}

		let widthMeasureSpec = measureSpec.autoColumnsCount > 0 ? this.infinity : layout.makeMeasureSpec(measureSpec.pixelWidth, layout.EXACTLY);
		let heightMeasureSpec = layout.makeMeasureSpec(measureHeight, this.stretchedVertically ? layout.EXACTLY : layout.AT_MOST);

		let childSize = View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);
		let childMeasuredWidth = childSize.measuredWidth;
		let childMeasuredHeight = childSize.measuredHeight;

		let remainingSpace = 0;
		let growSize = 0;

		// Distribute width over auto columns
		if (measureSpec.autoColumnsCount > 0) {
			remainingSpace = childMeasuredWidth;

			for (let i = columnIndex; i < columnSpanEnd; i++) {
				let columnGroup: ItemGroup = this.columns[i];
				remainingSpace -= columnGroup.length;
			}

			if (remainingSpace > 0) {
				growSize = remainingSpace / measureSpec.autoColumnsCount;
				for (let i = columnIndex; i < columnSpanEnd; i++) {
					let columnGroup: ItemGroup = this.columns[i];

					if (columnGroup.getIsAuto()) {
						columnGroup.length += growSize;
					}
				}
			}
		}

		this.updateMinRowStarValueIfNeeded(measureSpec, childMeasuredHeight);
		this.itemMeasured(measureSpec, false);
	}

	private measureChildFixedColumnsAndRows(measureSpec: MeasureSpecs): void {
		let columnIndex = measureSpec.getColumnIndex();
		let columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
		let rowIndex = measureSpec.getRowIndex();
		let rowSpanEnd = rowIndex + measureSpec.getRowSpan();

		let measureWidth = 0;
		for (let i = columnIndex; i < columnSpanEnd; i++) {
			let columnGroup: ItemGroup = this.columns[i];
			measureWidth += columnGroup.length;
		}

		let measureHeight = 0;
		for (let i = rowIndex; i < rowSpanEnd; i++) {
			let rowGroup: ItemGroup = this.rows[i];
			measureHeight += rowGroup.length;
		}

		// if (have stars) & (not stretch) - at most
		let widthMeasureSpec = layout.makeMeasureSpec(measureWidth, measureSpec.starColumnsCount > 0 && !this.stretchedHorizontally ? layout.AT_MOST : layout.EXACTLY);

		let heightMeasureSpec = layout.makeMeasureSpec(measureHeight, measureSpec.starRowsCount > 0 && !this.stretchedVertically ? layout.AT_MOST : layout.EXACTLY);

		let childSize = View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);
		let childMeasuredWidth = childSize.measuredWidth;
		let childMeasuredHeight = childSize.measuredHeight;

		this.updateMinColumnStarValueIfNeeded(measureSpec, childMeasuredWidth);
		this.updateMinRowStarValueIfNeeded(measureSpec, childMeasuredHeight);
		this.itemMeasured(measureSpec, false);
	}

	private updateMinRowStarValueIfNeeded(measureSpec: MeasureSpecs, childMeasuredHeight: number): void {
		if (!this.stretchedVertically && measureSpec.starRowsCount > 0) {
			let remainingSpace = childMeasuredHeight;
			let rowIndex = measureSpec.getRowIndex();
			let rowSpanEnd = rowIndex + measureSpec.getRowSpan();
			for (let i = rowIndex; i < rowSpanEnd; i++) {
				let rowGroup = this.rows[i];
				if (!rowGroup.getIsStar()) {
					remainingSpace -= rowGroup.length;
				}
			}

			if (remainingSpace > 0) {
				this.minRowStarValue = Math.max(remainingSpace / measureSpec.starRowsCount, this.minRowStarValue);
			}
		}
	}

	private updateMinColumnStarValueIfNeeded(measureSpec: MeasureSpecs, childMeasuredWidth: number): void {
		// When not stretched star columns are not fixed so we may grow them here
		// if there is an element that spans on multiple columns
		if (!this.stretchedHorizontally && measureSpec.starColumnsCount > 0) {
			let remainingSpace = childMeasuredWidth;
			let columnIndex = measureSpec.getColumnIndex();
			let columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
			for (let i = columnIndex; i < columnSpanEnd; i++) {
				let columnGroup = this.columns[i];
				if (!columnGroup.getIsStar()) {
					remainingSpace -= columnGroup.length;
				}
			}

			if (remainingSpace > 0) {
				this.minColumnStarValue = Math.max(remainingSpace / measureSpec.starColumnsCount, this.minColumnStarValue);
			}
		}
	}
}
