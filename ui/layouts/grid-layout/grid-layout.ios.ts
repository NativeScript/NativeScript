import utils = require("utils/utils");
import enums = require("ui/enums");
import view = require("ui/core/view");
import common = require("./grid-layout-common");

global.moduleMerge(common, exports);

export class GridLayout extends common.GridLayout {

    private _isValid: boolean = false;
    private helper: MeasureHelper;

    protected onRowAdded(itemSpec: common.ItemSpec) {
        this.invalidate();
    }

    protected onColumnAdded(itemSpec: common.ItemSpec) {
        this.invalidate();
    }

    protected onRowRemoved(itemSpec: common.ItemSpec, index: number) {
        this.invalidate();
    }

    protected onColumnRemoved(itemSpec: common.ItemSpec, index: number) {
        this.invalidate();
    }

    protected onRowChanged(element: view.View, oldValue: number, newValue: number) {
        this.invalidate();
    }

    protected onRowSpanChanged(element: view.View, oldValue: number, newValue: number) {
        this.invalidate();
    }

    protected onColumnChanged(element: view.View, oldValue: number, newValue: number) {
        this.invalidate();
    }

    protected onColumnSpanChanged(element: view.View, oldValue: number, newValue: number) {
        this.invalidate();
    }

    protected invalidate(): void {
        this._isValid = false;
        this.requestLayout();
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        let width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        let height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        let density = utils.layout.getDisplayDensity();
        let infinityWidth = widthMode === utils.layout.UNSPECIFIED;
        let infinityHeight = heightMode === utils.layout.UNSPECIFIED;

        let rows = this.getRows();
        let cols = this.getColumns();
        if (!this._isValid) {

            rows.forEach((value: common.ItemSpec, index: number, array: common.ItemSpec[]) => {
                value.index = index;
            });

            cols.forEach((value: common.ItemSpec, index: number, array: common.ItemSpec[]) => {
                value.index = index;
            });

            this.helper = new MeasureHelper();
            this.helper.grid = this;
            this.helper.width = width - (this.paddingLeft + this.paddingRight) * density;
            this.helper.height = height - (this.paddingTop + this.paddingBottom) * density;
            this.helper.infinityWidth = infinityWidth;
            this.helper.infinityHeight = infinityHeight;

            for (let i = 0; i < cols.length; i++) {
                let column = cols[i];
                let columnGroup = new ColumnGroup(column, this.helper);
                this.helper.columns.push(columnGroup);
                if (column.isAbsolute) {
                    columnGroup.width = column.value * density;
                }
            }

            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
                let rowGroup = new RowGroup(row, this.helper);
                this.helper.rows.push(rowGroup);
                if (row.isAbsolute) {
                    rowGroup.height = row.value * density;
                }
            }

            if (rows.length === 0) {
                this.helper.rows.push(new RowGroup(this._singleRow, this.helper));
            }

            if (cols.length === 0) {
                this.helper.columns.push(new ColumnGroup(this._singleColumn, this.helper));
            }
        }

        let childrenCount = this.getChildrenCount();
        for (let i = 0; i < childrenCount; i++) {
            let child = this.getChildAt(i);
            if (!child || !child._isVisible) {
                continue;
            }

            let column = this.getColumn(child);
            let row = this.getRow(child);
            let columnSpan = this.getColumnSpan(child, column.index);
            let rowSpan = this.getRowSpan(child, row.index);

            let measureSpec = new MeasureSpecs(child, column, row, columnSpan, rowSpan);

            this.helper.addMeasureSpec(measureSpec, density);
        }

        this.helper.measure();

        let measureWidth = this.helper.measuredWidth + (this.paddingLeft + this.paddingRight) * density;
        let measureHeight = this.helper.measuredHeight + (this.paddingTop + this.paddingBottom) * density;

        measureWidth = Math.max(measureWidth, this.minWidth * density);
        measureHeight = Math.max(measureHeight, this.minHeight * density);

        let widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        let heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);

        let density = utils.layout.getDisplayDensity();

        let columnOffsets = new Array<number>();
        columnOffsets.push(this.paddingLeft * density);

        let rowOffsets = new Array<number>();
        rowOffsets.push(this.paddingTop * density);

        let offset = columnOffsets[0];
        let roundedOffset: number = this.paddingLeft;
        let roundedLength: number = 0;
        let actualLength: number = 0;
        for (let i = 0; i < this.helper.columns.length; i++) {
            let columnGroup = this.helper.columns[i];
            offset += columnGroup.width;
            columnOffsets.push(offset);

            actualLength = offset / density - roundedOffset;
            roundedLength = Math.round(actualLength);
            columnGroup.column._actualLength = roundedLength;
            roundedOffset += roundedLength;
        }

        offset = rowOffsets[0];
        roundedOffset = this.paddingTop;
        roundedLength = 0;
        actualLength = 0;
        for (let i = 0; i < this.helper.rows.length; i++) {
            let rowGroup = this.helper.rows[i];
            offset += rowGroup.height;
            rowOffsets.push(offset);

            actualLength = offset / density - roundedOffset;
            roundedLength = Math.round(actualLength);
            rowGroup.row._actualLength = roundedLength;
            roundedOffset += roundedLength;
        }

        for (let i = 0; i < this.helper.columns.length; i++) {
            let columnGroup = this.helper.columns[i];
            for (let j = 0; j < columnGroup.children.length; j++) {

                let measureSpec = columnGroup.children[j];
                let childLeft = columnOffsets[measureSpec.columnIndex];
                let childRight = columnOffsets[measureSpec.columnIndex + measureSpec.columnSpan];
                let childTop = rowOffsets[measureSpec.rowIndex];
                let childBottom = rowOffsets[measureSpec.rowIndex + measureSpec.rowSpan];

                // No need to include margins in the width, height
                view.View.layoutChild(this, measureSpec.child, childLeft, childTop, childRight, childBottom);
            }
        }
    }
}

class MeasureSpecs {

    private _columnSpan: number = 1;
    private _rowSpan: number = 1;

    public pixelWidth: number = 0;
    public pixelHeight: number = 0;

    public starColumnsCount: number = 0;
    public starRowsCount: number = 0;

    public autoColumnsCount: number = 0;
    public autoRowsCount: number = 0;

    public measured: boolean = false;

    constructor(
        public child: view.View,
        public column: common.ItemSpec,
        public row: common.ItemSpec,
        columnSpan?: number,
        rowSpan?: number) {
        // cannot have zero colSpan.
        if (columnSpan) {
            this._columnSpan = columnSpan;
        }

        // cannot have zero rowSpan.
        if (rowSpan) {
            this._rowSpan = rowSpan;
        }
    }

    get columnIndex(): number {
        return this.column.index;
    }

    get rowIndex(): number {
        return this.row.index;
    }

    get spanned(): boolean {
        return this._columnSpan > 1 || this._rowSpan > 1;
    }

    get columnSpan(): number {
        return this._columnSpan;
    }

    get rowSpan(): number {
        return this._rowSpan;
    }

    get isStar(): boolean {
        return this.starRowsCount > 0 || this.starColumnsCount > 0;
    }
}

class ColumnGroup {
    width: number = 0;
    measuredCount = 0;
    column: common.ItemSpec;
    children: Array<MeasureSpecs> = new Array<MeasureSpecs>();
    owner: MeasureHelper;

    public measureToFix: number = 0;
    public currentMeasureToFixCount: number = 0;

    constructor(column: common.ItemSpec, owner: MeasureHelper) {
        this.owner = owner;
        this.column = column;
    }

    init() {
        this.measuredCount = 0;
        this.currentMeasureToFixCount = 0;
    }

    get allMeasured(): boolean {
        return this.measuredCount === this.children.length;
    }

    get isAuto(): boolean {
        return this.column.isAuto || (this.column.isStar && this.owner.infinityWidth);
    }

    get isStar(): boolean {
        return this.column.isStar && !this.owner.infinityWidth;
    }

    get isAbsolute(): boolean {
        return this.column.isAbsolute;
    }

    get canBeFixed(): boolean {
        return this.currentMeasureToFixCount === this.measureToFix;
    }
}

class RowGroup {
    height: number = 0;
    measuredCount = 0;
    row: common.ItemSpec;
    children: Array<MeasureSpecs> = new Array<MeasureSpecs>();
    owner: MeasureHelper;

    public measureToFix: number = 0;
    public currentMeasureToFixCount: number = 0;

    constructor(row: common.ItemSpec, owner: MeasureHelper) {
        this.row = row;
        this.owner = owner;
    }

    init() {
        this.measuredCount = 0;
        this.currentMeasureToFixCount = 0;
    }

    get allMeasured(): boolean {
        return this.measuredCount === this.children.length;
    }

    get canBeFixed(): boolean {
        return this.measuredCount === this.measureToFix;
    }

    get isAuto(): boolean {
        return this.row.isAuto || (this.row.isStar && this.owner.infinityHeight);
    }

    get isStar(): boolean {
        return this.row.isStar && !this.owner.infinityHeight;
    }

    get isAbsolute(): boolean {
        return this.row.isAbsolute;
    }
}

class MeasureHelper {
    infinity: number = utils.layout.makeMeasureSpec(0, utils.layout.UNSPECIFIED);
    rows: Array<RowGroup> = new Array<RowGroup>();
    columns: Array<ColumnGroup> = new Array<ColumnGroup>();
    grid: GridLayout;
    width: number;
    height: number;
    infinityWidth: boolean;
    infinityHeight: boolean;
    measuredWidth: number;
    measuredHeight: number;

    columnStarValue: number;
    rowStarValue: number;

    get horizontalStretch(): boolean {
        return this.grid.horizontalAlignment === enums.HorizontalAlignment.stretch && !this.infinityWidth;
    }

    get verticalStretch(): boolean {
        return this.grid.verticalAlignment === enums.VerticalAlignment.stretch && !this.infinityHeight;
    }

    get columnsFixed(): boolean {
        return !isNaN(this.columnStarValue);
    }

    public addMeasureSpec(measureSpec: MeasureSpecs, density: number) {
        // Get column stats
        for (let i = measureSpec.columnIndex; i < measureSpec.columnIndex + measureSpec.columnSpan; i++) {
            let columnGroup = this.columns[i];
            if (columnGroup.isAuto) {
                measureSpec.autoColumnsCount++;
            }
            else if (columnGroup.isStar) {
                measureSpec.starColumnsCount += columnGroup.column.value;
            }
            else if (columnGroup.isAbsolute) {
                measureSpec.pixelWidth += columnGroup.column.value * density;
            }
        }

        if (measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
            // Determine which auto columns are affected by this element
            for (let i = measureSpec.columnIndex; i < measureSpec.columnIndex + measureSpec.columnSpan; i++) {
                let columnGroup = this.columns[i];
                if (columnGroup.isAuto) {
                    columnGroup.measureToFix++;
                }
            }
        }

        // Get row stats
        for (let i = measureSpec.rowIndex; i < measureSpec.rowIndex + measureSpec.rowSpan; i++) {
            let rowGroup = this.rows[i];
            if (rowGroup.isAuto) {
                measureSpec.autoRowsCount++;
            }
            else if (rowGroup.isStar) {
                measureSpec.starRowsCount += rowGroup.row.value;
            }
            else if (rowGroup.isAbsolute) {
                measureSpec.pixelHeight += rowGroup.row.value * density;
            }
        }

        if (measureSpec.autoRowsCount > 0 && measureSpec.starRowsCount === 0) {
            // Determine which auto rows are affected by this element
            for (let i = measureSpec.rowIndex; i < measureSpec.rowIndex + measureSpec.rowSpan; i++) {
                let rowGroup = this.rows[i];
                if (rowGroup.isAuto) {
                    rowGroup.measureToFix++;
                }
            }
        }

        this.columns[measureSpec.columnIndex].children.push(measureSpec);
        this.rows[measureSpec.rowIndex].children.push(measureSpec);
    }

    private init() {
        this.rows.forEach((row, i, a) => row.init());
        this.columns.forEach((col, i, a) => col.init());

        this.columnStarValue = Number.NaN;
        this.rowStarValue = Number.NaN;
    }

    private itemMeasured(measureSpec: MeasureSpecs, isFakeMeasure: boolean = false) {
        if (!isFakeMeasure) {
            this.columns[measureSpec.columnIndex].measuredCount++;
            this.rows[measureSpec.rowIndex].measuredCount++;
            measureSpec.measured = true;
        }

        if (measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
            for (let i = measureSpec.columnIndex; i < measureSpec.columnIndex + measureSpec.columnSpan; i++) {
                let columnGroup = this.columns[i];
                if (columnGroup.isAuto) {
                    columnGroup.currentMeasureToFixCount++;
                }
            }
        }

        if (measureSpec.autoRowsCount > 0 && measureSpec.starRowsCount === 0) {
            for (let i = measureSpec.rowIndex; i < measureSpec.rowIndex + measureSpec.rowSpan; i++) {
                let rowGroup = this.rows[i];
                if (rowGroup.isAuto) {
                    rowGroup.currentMeasureToFixCount++;
                }
            }
        }
    }

    private fixColumns() {
        let currentColumnWidth = 0;
        let columnStarCount = 0;
        this.columns.forEach((value: ColumnGroup, index: number, array: ColumnGroup[]) => {
            // Star columns are still zeros (not calculated).
            currentColumnWidth += value.width;
            // Should we use value.isStar instead? It returns star only if space is not infinity.
            if (value.column.isStar) {
                columnStarCount += value.column.value;
            }
        });

        this.columnStarValue = columnStarCount > 0 ? (this.width - currentColumnWidth) / columnStarCount : 0;

        if (this.horizontalStretch) {
            this.columns.forEach((value: ColumnGroup, index: number, array: ColumnGroup[]) => {
                if (value.isStar) {
                    value.width = value.column.value * this.columnStarValue;
                }
            });
        }
    }

    private fixRows() {
        let currentRowHeight = 0;
        let rowStarCount = 0;
        this.rows.forEach((value: RowGroup, index: number, array: RowGroup[]) => {
            // Star rows are still zeros (not calculated).
            currentRowHeight += value.height;
            // Should we use value.isStar instead? It returns star only if space is not infinity.
            if (value.row.isStar) {
                rowStarCount += value.row.value;
            }
        });

        this.rowStarValue = rowStarCount > 0 ? (this.height - currentRowHeight) / rowStarCount : 0;

        if (this.verticalStretch) {
            this.rows.forEach((value: RowGroup, index: number, array: RowGroup[]) => {
                if (value.isStar) {
                    value.height = value.row.value * this.rowStarValue;
                }
            });
        }
    }

    private fakeMeasure() {
        // Fake measure - measure all elemtns that have star rows and auto columns - with infinity Width and infinity Height
        for (let i = 0; i < this.columns.length; i++) {
            let columnGroup = this.columns[i];
            if (columnGroup.allMeasured) {
                continue;
            }

            for (let j = 0; j < columnGroup.children.length; j++) {
                let measureSpec = columnGroup.children[j];
                if (measureSpec.starRowsCount > 0 && measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
                    this.measureChild(measureSpec, true);
                }
            }
        }
    }

    private measureFixedColumnsNoStarRows() {
        for (let i = 0; i < this.columns.length; i++) {
            let columnGroup = this.columns[i];
            for (let j = 0; j < columnGroup.children.length; j++) {
                let measureSpec = columnGroup.children[j];
                if (measureSpec.starColumnsCount > 0 && measureSpec.starRowsCount === 0) {
                    this.measureChildFixedColumns(measureSpec);
                }
            }
        }
    }

    private measureNoStarColumnsFixedRows() {
        for (let i = 0; i < this.columns.length; i++) {
            let columnGroup = this.columns[i];
            for (let j = 0; j < columnGroup.children.length; j++) {
                let measureSpec = columnGroup.children[j];
                if (measureSpec.starRowsCount > 0 && measureSpec.starColumnsCount === 0) {
                    this.measureChildFixedRows(measureSpec);
                }
            }
        }
    }

    public measure() {
        this.init();

        // Measure auto & pixel columns and rows (no spans).
        for (let i = 0; i < this.columns.length; i++) {
            let columnGroup = this.columns[i];
            for (let j = 0; j < columnGroup.children.length; j++) {
                let measureSpec = columnGroup.children[j];
                if (measureSpec.isStar || measureSpec.spanned) {
                    continue;
                }

                this.measureChild(measureSpec);
            }
        }

        // Measure auto & pixel columns and rows (with spans).
        for (let i = 0; i < this.columns.length; i++) {
            let columnGroup = this.columns[i];
            for (let j = 0; j < columnGroup.children.length; j++) {
                let measureSpec = columnGroup.children[j];
                if (measureSpec.isStar || !measureSpec.spanned) {
                    continue;
                }

                this.measureChild(measureSpec);
            }
        }

        // try fix stars!
        let fixColumns: boolean = this.columns.every((colGroup, i, a) => colGroup.canBeFixed);
        let fixRows: boolean = this.rows.every((rowGroup, i, a) => rowGroup.canBeFixed);

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
        }
        else if (fixColumns && !fixRows) {
            // Measure all elements that have star columns(already fixed) but no stars at the rows
            this.measureFixedColumnsNoStarRows();

            // Then
            this.fixRows();
        }
        else if (!fixColumns && fixRows) {
            // Measure all elements that have star rows(already fixed) but no star at the columns 
            this.measureNoStarColumnsFixedRows();

            // Then
            this.fixColumns();
        }

        // Rows and columns are fixed here - measure remaining elements
        for (let i = 0; i < this.columns.length; i++) {
            let columnGroup = this.columns[i];
            for (let j = 0; j < columnGroup.children.length; j++) {
                let measureSpec = columnGroup.children[j];
                if (!measureSpec.measured) {
                    this.measureChildFixedColumnsAndRows(measureSpec);
                }
            }
        }

        this.measuredWidth = 0;
        this.columns.forEach((value: ColumnGroup, index: number, array: ColumnGroup[]) => {
            this.measuredWidth += value.width;
        });

        this.measuredHeight = 0;
        this.rows.forEach((value: RowGroup, index: number, array: RowGroup[]) => {
            this.measuredHeight += value.height;
        });
    }

    measureChild(measureSpec: MeasureSpecs, isFakeMeasure: boolean = false) {
        let widthMeasureSpec: number = (measureSpec.autoColumnsCount > 0) ? this.infinity : utils.layout.makeMeasureSpec(measureSpec.pixelWidth, utils.layout.EXACTLY);
        let heightMeasureSpec: number = (isFakeMeasure || measureSpec.autoRowsCount > 0) ? this.infinity : utils.layout.makeMeasureSpec(measureSpec.pixelHeight, utils.layout.EXACTLY);

        let childSize = view.View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);

        let columnSpanEnd = measureSpec.columnIndex + measureSpec.columnSpan;
        let rowSpanEnd = measureSpec.rowIndex + measureSpec.rowSpan;

        if (measureSpec.autoColumnsCount > 0) {
            let remainingSpace = childSize.measuredWidth;

            for (let i = measureSpec.columnIndex; i < columnSpanEnd; i++) {
                let columnGroup = this.columns[i];
                remainingSpace -= columnGroup.width;
            }

            if (remainingSpace > 0) {
                let growSize = remainingSpace / measureSpec.autoColumnsCount;
                for (let i = measureSpec.columnIndex; i < columnSpanEnd; i++) {
                    let columnGroup = this.columns[i];
                    if (columnGroup.isAuto) {
                        columnGroup.width += growSize;
                    }
                }
            }
        }

        if (!isFakeMeasure && measureSpec.autoRowsCount > 0) {
            let remainingSpace = childSize.measuredHeight;

            for (let i = measureSpec.rowIndex; i < rowSpanEnd; i++) {
                let rowGroup = this.rows[i];
                remainingSpace -= rowGroup.height;
            }

            if (remainingSpace > 0) {
                let growSize = remainingSpace / measureSpec.autoRowsCount;
                for (let i = measureSpec.rowIndex; i < rowSpanEnd; i++) {
                    let rowGroup = this.rows[i];
                    if (rowGroup.isAuto) {
                        rowGroup.height += growSize;
                    }
                }
            }
        }

        this.itemMeasured(measureSpec, isFakeMeasure);
    }

    measureChildFixedColumns(measureSpec: MeasureSpecs) {
        let columnIndex = measureSpec.columnIndex;
        let columnSpanEnd = columnIndex + measureSpec.columnSpan;
        let rowIndex = measureSpec.rowIndex;
        let rowSpanEnd = rowIndex + measureSpec.rowSpan;

        let columnsWidth: number = 0;
        for (let i = columnIndex; i < columnSpanEnd; i++) {
            let columnGroup = this.columns[i];
            if (!columnGroup.isStar) {
                columnsWidth += columnGroup.width;
            }
        }

        let measureWidth = columnsWidth + measureSpec.starColumnsCount * this.columnStarValue;

        let widthMeasureSpec = utils.layout.makeMeasureSpec(measureWidth, this.horizontalStretch ? utils.layout.EXACTLY : utils.layout.AT_MOST);
        let heightMeasureSpec: number = (measureSpec.autoRowsCount > 0) ? this.infinity : utils.layout.makeMeasureSpec(measureSpec.pixelHeight, utils.layout.EXACTLY);
        let childSize = view.View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);

        this.updateColumnGroupWidth(measureSpec, childSize.measuredWidth);

        // Distribute height over auto rows
        if (measureSpec.autoRowsCount > 0) {
            let remainingSpace = childSize.measuredHeight;

            for (let i = rowIndex; i < rowSpanEnd; i++) {
                let rowGroup = this.rows[i];
                remainingSpace -= rowGroup.height;
            }

            if (remainingSpace > 0) {
                let growSize = remainingSpace / measureSpec.autoRowsCount;
                for (let i = rowIndex; i < rowSpanEnd; i++) {
                    let rowGroup = this.rows[i];
                    if (rowGroup.isAuto) {
                        rowGroup.height += growSize;
                    }
                }
            }
        }

        this.itemMeasured(measureSpec);
    }

    measureChildFixedRows(measureSpec: MeasureSpecs) {
        let columnIndex = measureSpec.columnIndex;
        let columnSpanEnd = columnIndex + measureSpec.columnSpan;
        let rowIndex = measureSpec.rowIndex;
        let rowSpanEnd = rowIndex + measureSpec.rowSpan;
        let rowsHeight: number = 0;

        for (let i = rowIndex; i < rowSpanEnd; i++) {
            let rowGroup = this.rows[i];
            if (!rowGroup.isStar) {
                rowsHeight += rowGroup.height;
            }
        }

        let measureHeight = rowsHeight + measureSpec.starRowsCount * this.rowStarValue;

        let widthMeasureSpec: number = (measureSpec.autoColumnsCount > 0) ? this.infinity : utils.layout.makeMeasureSpec(measureSpec.pixelWidth, utils.layout.EXACTLY);
        let heightMeasureSpec = utils.layout.makeMeasureSpec(measureHeight, this.verticalStretch ? utils.layout.EXACTLY : utils.layout.AT_MOST);
        let childSize = view.View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);
        
        // Distribute width over auto columns
        if (measureSpec.autoColumnsCount > 0) {
            let remainingSpace = childSize.measuredWidth;

            for (let i = columnIndex; i < columnSpanEnd; i++) {
                let columnGroup = this.columns[i];
                remainingSpace -= columnGroup.width;
            }

            if (remainingSpace > 0) {
                let growSize = remainingSpace / measureSpec.autoColumnsCount;
                for (let i = columnIndex; i < columnSpanEnd; i++) {
                    let columnGroup = this.columns[i];
                    if (columnGroup.isAuto) {
                        columnGroup.width += growSize;
                    }
                }
            }
        }

        this.updateRowGroupHeight(measureSpec, childSize.measuredHeight);

        this.itemMeasured(measureSpec);
    }

    measureChildFixedColumnsAndRows(measureSpec: MeasureSpecs): void {
        let columnIndex = measureSpec.columnIndex;
        let columnSpanEnd = columnIndex + measureSpec.columnSpan;
        let rowIndex = measureSpec.rowIndex;
        let rowSpanEnd = rowIndex + measureSpec.rowSpan;

        let columnGroup: ColumnGroup;
        let rowGroup: RowGroup;

        let columnsWidth: number = 0;
        for (let i = columnIndex; i < columnSpanEnd; i++) {
            columnGroup = this.columns[i];
            if (!columnGroup.isStar) {
                columnsWidth += columnGroup.width;
            }
        }

        let rowsHeight: number = 0;
        for (let i = rowIndex; i < rowSpanEnd; i++) {
            rowGroup = this.rows[i];
            if (!rowGroup.isStar) {
                rowsHeight += rowGroup.height;
            }
        }

        let measureWidth = columnsWidth + measureSpec.starColumnsCount * this.columnStarValue;
        let measureHeight = rowsHeight + measureSpec.starRowsCount * this.rowStarValue;

        // if (have stars) & (not stretch) - at most
        let widthMeasureSpec = utils.layout.makeMeasureSpec(measureWidth, (measureSpec.starColumnsCount > 0 && !this.horizontalStretch) ? utils.layout.AT_MOST : utils.layout.EXACTLY);
        let heightMeasureSpec = utils.layout.makeMeasureSpec(measureHeight, (measureSpec.starRowsCount > 0 && !this.verticalStretch) ? utils.layout.AT_MOST : utils.layout.EXACTLY);

        let childSize = view.View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);

        this.updateColumnGroupWidth(measureSpec, childSize.measuredWidth);
        this.updateRowGroupHeight(measureSpec, childSize.measuredHeight);

        this.itemMeasured(measureSpec);
    }

    private updateRowGroupHeight(measureSpec: MeasureSpecs, remainingSpace: number): void {
        // Distribute height over star rows
        if (!this.verticalStretch) {
            let rowIndex = measureSpec.rowIndex;
            let rowSpanEnd = rowIndex + measureSpec.rowSpan;

            for (let i = rowIndex; i < rowSpanEnd; i++) {
                let rowGroup = this.rows[i];
                remainingSpace -= rowGroup.height;
            }

            if (remainingSpace > 0) {
                let growSize = remainingSpace / measureSpec.starRowsCount;
                for (let i = rowIndex; i < rowSpanEnd; i++) {
                    let rowGroup = this.rows[i];
                    if (rowGroup.isStar) {
                        rowGroup.height += growSize;
                    }
                }
            }
        }
    }

    private updateColumnGroupWidth(measureSpec: MeasureSpecs, remainingSpace: number): void {

        // Distribute width over star columns
        if (!this.horizontalStretch) {
            let columnIndex = measureSpec.columnIndex;
            let columnSpanEnd = columnIndex + measureSpec.columnSpan;

            for (let i = columnIndex; i < columnSpanEnd; i++) {
                let columnGroup = this.columns[i];
                remainingSpace -= columnGroup.width;
            }

            if (remainingSpace > 0) {
                let growSize = remainingSpace / measureSpec.starColumnsCount;
                for (let i = columnIndex; i < columnSpanEnd; i++) {
                    let columnGroup = this.columns[i];
                    if (columnGroup.isStar) {
                        columnGroup.width += growSize;
                    }
                }
            }
        }
    }
}