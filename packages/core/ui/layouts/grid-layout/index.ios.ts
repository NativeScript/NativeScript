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
		const column = this.getColumnSpec(child);
		const columnIndex = this.getColumnIndex(child);
		const columnSpan = this.getColumnSpan(child, columnIndex);

		const row = this.getRowSpec(child);
		const rowIndex = this.getRowIndex(child);
		const rowSpan = this.getRowSpan(child, rowIndex);

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

		const infinityWidth = widthMode === layout.UNSPECIFIED;
		const infinityHeight = heightMode === layout.UNSPECIFIED;

		this.helper.width = Math.max(0, width - horizontalPaddingsAndMargins);
		this.helper.height = Math.max(0, height - verticalPaddingsAndMargins);

		this.helper.stretchedHorizontally = widthMode === layout.EXACTLY || (this.horizontalAlignment === 'stretch' && !infinityWidth);
		this.helper.stretchedVertically = heightMode === layout.EXACTLY || (this.verticalAlignment === 'stretch' && !infinityHeight);

		this.helper.setInfinityWidth(infinityWidth);
		this.helper.setInfinityHeight(infinityHeight);

		this.helper.clearMeasureSpecs();
		this.helper.init();

		this.eachLayoutChild((child, last) => {
			const measureSpecs = this.map.get(child);
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

		const paddingLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft + insets.left;
		const paddingTop = this.effectiveBorderTopWidth + this.effectivePaddingTop + insets.top;

		this.columnOffsets.length = 0;
		this.rowOffsets.length = 0;

		this.columnOffsets.push(paddingLeft);
		this.rowOffsets.push(paddingTop);

		let offset = this.columnOffsets[0];
		let roundedOffset = paddingLeft;
		let roundedLength = 0;
		let actualLength = 0;

		for (let i = 0, size = this.helper.columns.length; i < size; i++) {
			const columnGroup = this.helper.columns[i];
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
			const rowGroup = this.helper.rows[i];
			offset += rowGroup.length;

			actualLength = offset - roundedOffset;
			roundedLength = Math.round(actualLength);
			rowGroup.rowOrColumn._actualLength = layout.round(layout.toDeviceIndependentPixels(roundedLength));
			roundedOffset += roundedLength;

			this.rowOffsets.push(roundedOffset);
		}

		for (let i = 0, columns = this.helper.columns.length; i < columns; i++) {
			const columnGroup = this.helper.columns[i];
			for (let j = 0, children = columnGroup.children.length; j < children; j++) {
				const measureSpec = columnGroup.children[j];
				const childLeft = this.columnOffsets[measureSpec.getColumnIndex()];
				const childRight = this.columnOffsets[measureSpec.getColumnIndex() + measureSpec.getColumnSpan()];
				const childTop = this.rowOffsets[measureSpec.getRowIndex()];
				const childBottom = this.rowOffsets[measureSpec.getRowIndex() + measureSpec.getRowSpan()];

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
	private columnIndex = 0;
	private rowIndex = 0;

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

	width = 0;
	height = 0;
	stretchedHorizontally = false;
	stretchedVertically = false;

	infinityWidth = false;
	infinityHeight = false;

	private minColumnStarValue = 0;
	private maxColumnStarValue = 0;

	private minRowStarValue = 0;
	private maxRowStarValue = 0;

	measuredWidth = 0;
	measuredHeight = 0;

	private fakeRowAdded = false;
	private fakeColumnAdded = false;

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
			const columnGroup: ItemGroup = this.columns[i];
			columnGroup.setIsLengthInfinity(value);
		}
	}

	public setInfinityHeight(value: boolean): void {
		this.infinityHeight = value;
		for (let i = 0, size = this.rows.length; i < size; i++) {
			const rowGroup: ItemGroup = this.rows[i];
			rowGroup.setIsLengthInfinity(value);
		}
	}

	public addMeasureSpec(measureSpec: MeasureSpecs): void {
		const columnIndex = measureSpec.getColumnIndex();
		const rowIndex = measureSpec.getRowIndex();
		const columnSpan = measureSpec.getColumnSpan();
		const rowSpan = measureSpec.getRowSpan();

		const updateMeasureSpecCounts = (group: ItemGroup, measureSpec: MeasureSpecs, isColumn: boolean) => {
			if (group.getIsAuto()) {
				isColumn ? measureSpec.autoColumnsCount++ : measureSpec.autoRowsCount++;
			} else if (group.getIsStar()) {
				if (isColumn) {
					measureSpec.starColumnsCount += group.rowOrColumn.value;
				} else {
					measureSpec.starRowsCount += group.rowOrColumn.value;
				}
			} else if (group.getIsAbsolute()) {
				if (isColumn) {
					measureSpec.pixelWidth += layout.toDevicePixels(group.rowOrColumn.value);
				} else {
					measureSpec.pixelHeight += layout.toDevicePixels(group.rowOrColumn.value);
				}
			}
		};

		const updateAutoGroups = (index: number, size: number, groups: ItemGroup[], measureSpec: MeasureSpecs, isColumn: boolean) => {
			for (let i = index; i < size; i++) {
				const group: ItemGroup = groups[i];
				if (group.getIsAuto()) {
					group.measureToFix++;
				}
			}
		};

		// Process columns
		let size = columnIndex + columnSpan;
		for (let i = columnIndex; i < size; i++) {
			updateMeasureSpecCounts(this.columns[i], measureSpec, true);
		}

		if (measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
			updateAutoGroups(columnIndex, size, this.columns, measureSpec, true);
		}

		// Process rows
		size = rowIndex + rowSpan;
		for (let i = rowIndex; i < size; i++) {
			updateMeasureSpecCounts(this.rows[i], measureSpec, false);
		}

		if (measureSpec.autoRowsCount > 0 && measureSpec.starRowsCount === 0) {
			updateAutoGroups(rowIndex, size, this.rows, measureSpec, false);
		}

		// Add measureSpec to children
		this.columns[columnIndex].children.push(measureSpec);
		this.rows[rowIndex].children.push(measureSpec);
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
		const density = layout.getDisplayDensity();
		for (let i = 0, size = list.length; i < size; i++) {
			const item: ItemGroup = list[i];
			item.init(density);
		}
	}

	init(): void {
		const handleSingleGroup = (groups: ItemGroup[], singleGroup: ItemGroup, infinityLength: boolean, fakeGroupAdded: boolean, setFakeGroupAdded: (value: boolean) => void): void => {
			const length = groups.length;
			if (length === 0) {
				singleGroup.setIsLengthInfinity(infinityLength);
				groups.push(singleGroup);
				setFakeGroupAdded(true);
			} else if (length > 1 && fakeGroupAdded) {
				groups.splice(0, 1);
				setFakeGroupAdded(false);
			}
		};

		handleSingleGroup(this.rows, this.singleRowGroup, this.infinityHeight, this.fakeRowAdded, (value) => {
			this.fakeRowAdded = value;
		});

		handleSingleGroup(this.columns, this.singleColumnGroup, this.infinityWidth, this.fakeColumnAdded, (value) => {
			this.fakeColumnAdded = value;
		});

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

		const updateCurrentMeasureToFixCount = (index: number, span: number, groups: ItemGroup[], autoCount: number, starCount: number) => {
			if (autoCount > 0 && starCount === 0) {
				const size = index + span;
				for (let i = index; i < size; i++) {
					const group = groups[i];
					if (group.getIsAuto()) {
						group.currentMeasureToFixCount++;
					}
				}
			}
		};

		updateCurrentMeasureToFixCount(measureSpec.getColumnIndex(), measureSpec.getColumnSpan(), this.columns, measureSpec.autoColumnsCount, measureSpec.starColumnsCount);

		updateCurrentMeasureToFixCount(measureSpec.getRowIndex(), measureSpec.getRowSpan(), this.rows, measureSpec.autoRowsCount, measureSpec.starRowsCount);
	}

	private fixColumns(): void {
		let currentColumnWidth = 0;
		let columnStarCount = 0;

		const columnCount = this.columns.length;
		for (let i = 0; i < columnCount; i++) {
			const item: ItemGroup = this.columns[i];
			if (item.rowOrColumn.isStar) {
				columnStarCount += item.rowOrColumn.value;
			} else {
				// Star columns are still zeros (not calculated).
				currentColumnWidth += item.length;
			}
		}

		const widthForStarColumns = Math.max(0, this.width - currentColumnWidth);
		this.maxColumnStarValue = columnStarCount > 0 ? widthForStarColumns / columnStarCount : 0;

		MeasureHelper.updateStarLength(this.columns, this.maxColumnStarValue);
	}

	private fixRows(): void {
		let currentRowHeight = 0;
		let rowStarCount = 0;

		const rowCount = this.rows.length;
		for (let i = 0; i < rowCount; i++) {
			const item: ItemGroup = this.rows[i];
			if (item.rowOrColumn.isStar) {
				rowStarCount += item.rowOrColumn.value;
			} else {
				// Star rows are still zeros (not calculated).
				currentRowHeight += item.length;
			}
		}

		const heightForStarRows = Math.max(0, this.height - currentRowHeight);
		this.maxRowStarValue = rowStarCount > 0 ? heightForStarRows / rowStarCount : 0;

		MeasureHelper.updateStarLength(this.rows, this.maxRowStarValue);
	}

	private static updateStarLength(list: Array<ItemGroup>, starValue: number): void {
		let offset = 0;
		let roundedOffset = 0;
		for (let i = 0, rowCount = list.length; i < rowCount; i++) {
			const item = list[i];
			if (item.getIsStar()) {
				offset += item.rowOrColumn.value * starValue;

				const actualLength = offset - roundedOffset;
				const roundedLength = Math.round(actualLength);
				item.length = roundedLength;
				roundedOffset += roundedLength;
			}
		}
	}

	private fakeMeasure(): void {
		// Fake measure - measure all elements that have star rows and auto columns - with infinity Width and infinity Height
		for (let i = 0, size = this.columns.length; i < size; i++) {
			const columnGroup: ItemGroup = this.columns[i];
			if (columnGroup.getAllMeasured()) {
				continue;
			}

			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				const measureSpec: MeasureSpecs = columnGroup.children[j];
				if (measureSpec.starRowsCount > 0 && measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
					this.measureChild(measureSpec, true);
				}
			}
		}
	}

	private measureFixedColumnsNoStarRows(): void {
		for (let i = 0, size = this.columns.length; i < size; i++) {
			const columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				const measureSpec: MeasureSpecs = columnGroup.children[j];
				if (measureSpec.starColumnsCount > 0 && measureSpec.starRowsCount === 0) {
					this.measureChildFixedColumns(measureSpec);
				}
			}
		}
	}

	private measureNoStarColumnsFixedRows(): void {
		for (let i = 0, size = this.columns.length; i < size; i++) {
			const columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				const measureSpec: MeasureSpecs = columnGroup.children[j];
				if (measureSpec.starRowsCount > 0 && measureSpec.starColumnsCount === 0) {
					this.measureChildFixedRows(measureSpec);
				}
			}
		}
	}

	private static canFix(list: Array<ItemGroup>): boolean {
		for (let i = 0, size = list.length; i < size; i++) {
			const item: ItemGroup = list[i];
			if (!item.getCanBeFixed()) {
				return false;
			}
		}

		return true;
	}

	private static getMeasureLength(list: Array<ItemGroup>): number {
		let result = 0;
		for (let i = 0, size = list.length; i < size; i++) {
			const item: ItemGroup = list[i];
			result += item.length;
		}

		return result;
	}

	public measure(): void {
		// Measure auto & pixel columns and rows (no spans).
		let size = this.columns.length;
		for (let i = 0; i < size; i++) {
			const columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				const measureSpec: MeasureSpecs = columnGroup.children[j];
				if (measureSpec.getIsStar() || measureSpec.getSpanned()) {
					continue;
				}

				this.measureChild(measureSpec, false);
			}
		}

		// Measure auto & pixel columns and rows (with spans).
		for (let i = 0; i < size; i++) {
			const columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childrenCount = columnGroup.children.length; j < childrenCount; j++) {
				const measureSpec = columnGroup.children[j];
				if (measureSpec.getIsStar() || !measureSpec.getSpanned()) {
					continue;
				}

				this.measureChild(measureSpec, false);
			}
		}

		// try fix stars!
		const fixColumns: boolean = MeasureHelper.canFix(this.columns);
		const fixRows: boolean = MeasureHelper.canFix(this.rows);

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
			const columnGroup: ItemGroup = this.columns[i];
			for (let j = 0, childCount = columnGroup.children.length; j < childCount; j++) {
				const measureSpec: MeasureSpecs = columnGroup.children[j];
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
		const widthMeasureSpec = measureSpec.autoColumnsCount > 0 ? this.infinity : layout.makeMeasureSpec(measureSpec.pixelWidth, layout.EXACTLY);
		const heightMeasureSpec = isFakeMeasure || measureSpec.autoRowsCount > 0 ? this.infinity : layout.makeMeasureSpec(measureSpec.pixelHeight, layout.EXACTLY);

		const childSize = View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);
		const childMeasuredWidth: number = childSize.measuredWidth;
		const childMeasuredHeight: number = childSize.measuredHeight;

		const columnSpanEnd: number = measureSpec.getColumnIndex() + measureSpec.getColumnSpan();
		const rowSpanEnd: number = measureSpec.getRowIndex() + measureSpec.getRowSpan();

		if (measureSpec.autoColumnsCount > 0) {
			let remainingSpace = childMeasuredWidth;

			for (let i = measureSpec.getColumnIndex(); i < columnSpanEnd; i++) {
				const columnGroup: ItemGroup = this.columns[i];
				remainingSpace -= columnGroup.length;
			}

			if (remainingSpace > 0) {
				const growSize = remainingSpace / measureSpec.autoColumnsCount;
				for (let i = measureSpec.getColumnIndex(); i < columnSpanEnd; i++) {
					const columnGroup: ItemGroup = this.columns[i];
					if (columnGroup.getIsAuto()) {
						columnGroup.length += growSize;
					}
				}
			}
		}

		if (!isFakeMeasure && measureSpec.autoRowsCount > 0) {
			let remainingSpace: number = childMeasuredHeight;

			for (let i = measureSpec.getRowIndex(); i < rowSpanEnd; i++) {
				const rowGroup: ItemGroup = this.rows[i];
				remainingSpace -= rowGroup.length;
			}

			if (remainingSpace > 0) {
				const growSize = remainingSpace / measureSpec.autoRowsCount;
				for (let i = measureSpec.getRowIndex(); i < rowSpanEnd; i++) {
					const rowGroup: ItemGroup = this.rows[i];
					if (rowGroup.getIsAuto()) {
						rowGroup.length += growSize;
					}
				}
			}
		}

		this.itemMeasured(measureSpec, isFakeMeasure);
	}

	private measureChildFixedColumns(measureSpec: MeasureSpecs): void {
		const columnIndex = measureSpec.getColumnIndex();
		const columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
		const rowIndex = measureSpec.getRowIndex();
		const rowSpanEnd = rowIndex + measureSpec.getRowSpan();

		let measureWidth = 0;
		let growSize = 0;

		for (let i = columnIndex; i < columnSpanEnd; i++) {
			const columnGroup: ItemGroup = this.columns[i];
			measureWidth += columnGroup.length;
		}

		const widthMeasureSpec = layout.makeMeasureSpec(measureWidth, this.stretchedHorizontally ? layout.EXACTLY : layout.AT_MOST);
		const heightMeasureSpec = measureSpec.autoRowsCount > 0 ? this.infinity : layout.makeMeasureSpec(measureSpec.pixelHeight, layout.EXACTLY);

		const childSize = View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);
		const childMeasuredWidth = childSize.measuredWidth;
		const childMeasuredHeight = childSize.measuredHeight;

		this.updateMinColumnStarValueIfNeeded(measureSpec, childMeasuredWidth);

		// Distribute height over auto rows
		if (measureSpec.autoRowsCount > 0) {
			let remainingSpace = childMeasuredHeight;

			for (let i = rowIndex; i < rowSpanEnd; i++) {
				const rowGroup: ItemGroup = this.rows[i];
				remainingSpace -= rowGroup.length;
			}

			if (remainingSpace > 0) {
				growSize = remainingSpace / measureSpec.autoRowsCount;
				for (let i = rowIndex; i < rowSpanEnd; i++) {
					const rowGroup: ItemGroup = this.rows[i];
					if (rowGroup.getIsAuto()) {
						rowGroup.length += growSize;
					}
				}
			}
		}

		this.itemMeasured(measureSpec, false);
	}

	private measureChildFixedRows(measureSpec: MeasureSpecs): void {
		const columnIndex = measureSpec.getColumnIndex();
		const columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
		const rowIndex = measureSpec.getRowIndex();
		const rowSpanEnd = rowIndex + measureSpec.getRowSpan();
		let measureHeight = 0;

		for (let i = rowIndex; i < rowSpanEnd; i++) {
			const rowGroup: ItemGroup = this.rows[i];
			measureHeight += rowGroup.length;
		}

		const widthMeasureSpec = measureSpec.autoColumnsCount > 0 ? this.infinity : layout.makeMeasureSpec(measureSpec.pixelWidth, layout.EXACTLY);
		const heightMeasureSpec = layout.makeMeasureSpec(measureHeight, this.stretchedVertically ? layout.EXACTLY : layout.AT_MOST);

		const childSize = View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);
		const childMeasuredWidth = childSize.measuredWidth;
		const childMeasuredHeight = childSize.measuredHeight;

		let remainingSpace = 0;
		let growSize = 0;

		// Distribute width over auto columns
		if (measureSpec.autoColumnsCount > 0) {
			remainingSpace = childMeasuredWidth;

			for (let i = columnIndex; i < columnSpanEnd; i++) {
				const columnGroup: ItemGroup = this.columns[i];
				remainingSpace -= columnGroup.length;
			}

			if (remainingSpace > 0) {
				growSize = remainingSpace / measureSpec.autoColumnsCount;
				for (let i = columnIndex; i < columnSpanEnd; i++) {
					const columnGroup: ItemGroup = this.columns[i];

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
		const columnIndex = measureSpec.getColumnIndex();
		const columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
		const rowIndex = measureSpec.getRowIndex();
		const rowSpanEnd = rowIndex + measureSpec.getRowSpan();

		let measureWidth = 0;
		for (let i = columnIndex; i < columnSpanEnd; i++) {
			const columnGroup: ItemGroup = this.columns[i];
			measureWidth += columnGroup.length;
		}

		let measureHeight = 0;
		for (let i = rowIndex; i < rowSpanEnd; i++) {
			const rowGroup: ItemGroup = this.rows[i];
			measureHeight += rowGroup.length;
		}

		// if (have stars) & (not stretch) - at most
		const widthMeasureSpec = layout.makeMeasureSpec(measureWidth, measureSpec.starColumnsCount > 0 && !this.stretchedHorizontally ? layout.AT_MOST : layout.EXACTLY);

		const heightMeasureSpec = layout.makeMeasureSpec(measureHeight, measureSpec.starRowsCount > 0 && !this.stretchedVertically ? layout.AT_MOST : layout.EXACTLY);

		const childSize = View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);
		const childMeasuredWidth = childSize.measuredWidth;
		const childMeasuredHeight = childSize.measuredHeight;

		this.updateMinColumnStarValueIfNeeded(measureSpec, childMeasuredWidth);
		this.updateMinRowStarValueIfNeeded(measureSpec, childMeasuredHeight);
		this.itemMeasured(measureSpec, false);
	}

	private updateMinRowStarValueIfNeeded(measureSpec: MeasureSpecs, childMeasuredHeight: number): void {
		if (!this.stretchedVertically && measureSpec.starRowsCount > 0) {
			let remainingSpace = childMeasuredHeight;
			const rowIndex = measureSpec.getRowIndex();
			const rowSpanEnd = rowIndex + measureSpec.getRowSpan();
			for (let i = rowIndex; i < rowSpanEnd; i++) {
				const rowGroup = this.rows[i];
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
			const columnIndex = measureSpec.getColumnIndex();
			const columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
			for (let i = columnIndex; i < columnSpanEnd; i++) {
				const columnGroup = this.columns[i];
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
