import layouts = require("ui/layouts/layout");
import definition = require("ui/layouts/grid-layout");
import utils = require("utils/utils");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");
import view = require("ui/core/view");
import bindable = require("ui/core/bindable");
import types = require("utils/types");
import numberUtils = require("utils/number-utils");

export module GridUnitType {
    export var auto: string = "auto";
    export var pixel: string = "pixel";
    export var star: string = "star";
}

export class ItemSpec extends bindable.Bindable implements definition.ItemSpec {

    private _value: number;
    private _unitType: string;

    constructor() {
        super();

        if (arguments.length === 0) {
            this._value = 1;
            this._unitType = GridUnitType.star;

        }
        else if (arguments.length === 2) {
            if (types.isNumber(arguments[0]) && types.isString(arguments[1])) {
                if (arguments[0] < 0 || (arguments[1] !== GridUnitType.auto && arguments[1] !== GridUnitType.star && arguments[1] !== GridUnitType.pixel)) {
                    throw new Error("Invalid values.");
                }
                this._value = arguments[0];
                this._unitType = arguments[1];
            }
            else {
                throw new Error("Arguments must be number and string.");
            }
        }
        else {
            throw new Error("ItemSpec expects 0 or 2 arguments");
        }

        this.index = -1;
    }

    public owner: GridLayout;
    public index: number;
    public _actualLength: number = 0;

    public get actualLength(): number {
        return this._actualLength;
    }
    public set actualLength(value: number) {
        throw new Error("actualLength is read-only property");
    }

    public static equals(value1: ItemSpec, value2: ItemSpec): boolean {
        return (value1.gridUnitType === value2.gridUnitType) && (value1.value === value2.value) && (value1.owner === value2.owner) && (value1.index === value2.index);
    }

    get gridUnitType(): string {
        return this._unitType;
    }

    get isAbsolute(): boolean {
        return this._unitType === GridUnitType.pixel;
    }

    get isAuto(): boolean {
        return this._unitType === GridUnitType.auto;
    }

    get isStar(): boolean {
        return this._unitType === GridUnitType.star;
    }

    get value(): number {
        return this._value;
    }
}

export class GridLayout extends layouts.Layout implements definition.GridLayout, view.ApplyXmlAttributes {
    private _rows: Array<ItemSpec> = new Array<ItemSpec>();
    private _cols: Array<ItemSpec> = new Array<ItemSpec>();
    private _singleRow: ItemSpec = new ItemSpec();
    private _singleColumn: ItemSpec = new ItemSpec();

    private _isValid: boolean = false;

    private helper: MeasureHelper;

    public static columnProperty = new dependencyObservable.Property("Column", "GridLayout",
        new dependencyObservable.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.None, GridLayout.attachedPropertyChanged, numberUtils.notNegative));
    public static columnSpanProperty = new dependencyObservable.Property("ColumnSpan", "GridLayout",
        new dependencyObservable.PropertyMetadata(1, dependencyObservable.PropertyMetadataSettings.None, GridLayout.attachedPropertyChanged, numberUtils.greaterThanZero));

    public static rowProperty = new dependencyObservable.Property("Row", "GridLayout",
        new dependencyObservable.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.None, GridLayout.attachedPropertyChanged, numberUtils.notNegative));
    public static rowSpanProperty = new dependencyObservable.Property("RowSpan", "GridLayout",
        new dependencyObservable.PropertyMetadata(1, dependencyObservable.PropertyMetadataSettings.None, GridLayout.attachedPropertyChanged, numberUtils.greaterThanZero));

    public static getColumn(element: view.View): number {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }

        return element._getValue(GridLayout.columnProperty);
    }

    public static setColumn(element: view.View, value: number): void {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        element._setValue(GridLayout.columnProperty, value);
    }

    public static getColumnSpan(element: view.View): number {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        return element._getValue(GridLayout.columnSpanProperty);
    }

    public static setColumnSpan(element: view.View, value: number): void {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        element._setValue(GridLayout.columnSpanProperty, value);
    }

    public static getRow(element: view.View): number {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        return <number>element._getValue(GridLayout.rowProperty);
    }

    public static setRow(element: view.View, value: number): void {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        element._setValue(GridLayout.rowProperty, value);
    }

    public static getRowSpan(element: view.View): number {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        return element._getValue(GridLayout.rowSpanProperty);
    }

    public static setRowSpan(element: view.View, value: number): void {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        element._setValue(GridLayout.rowSpanProperty, value);
    }

    private static attachedPropertyChanged(data: dependencyObservable.PropertyChangeData): void {
        if (data.object instanceof view.View) {
            var element = <view.View>data.object;
            if (!element) {
                throw new Error("Element is not View.");
            }

            var grid = element.parent;
            if (grid instanceof GridLayout) {
                grid.invalidate();
            }
        }
    }

    private static validateItemSpec(itemSpec: ItemSpec): void {
        if (!itemSpec) {
            throw new Error("Value cannot be undefined.");
        }

        if (itemSpec.owner) {
            throw new Error("itemSpec is already added to GridLayout.");
        }
    }

    constructor() {
        super();
        this._singleRow.index = 0
        this._singleColumn.index = 0;
    }

    public addRow(itemSpec: ItemSpec): void {
        GridLayout.validateItemSpec(itemSpec);
        itemSpec.owner = this;
        this._rows.push(itemSpec);
        this.invalidate();
    }

    public addColumn(itemSpec: ItemSpec): void {
        GridLayout.validateItemSpec(itemSpec);
        itemSpec.owner = this;
        this._cols.push(itemSpec);
        this.invalidate();
    }

    public removeColumn(itemSpec: ItemSpec): void {
        if (!itemSpec) {
            throw new Error("Value is null.");
        }

        var index = this._cols.indexOf(itemSpec);
        if (itemSpec.owner !== this || index < 0) {
            throw new Error("Column is not child of this GridLayout");
        }

        itemSpec.index = -1;
        this._cols.splice(index, 1);
        this.invalidate();
    }

    public removeColumns(): void {
        if (this._cols.length !== 0) {
            for (var i = 0; i < this._cols.length; i++) {
                this._cols[i].index = -1;
            }
            this._cols.length = 0;
            this.invalidate();
        }
    }

    public removeRow(itemSpec: ItemSpec): void {
        if (!itemSpec) {
            throw new Error("Value is null.");
        }

        var index = this._rows.indexOf(itemSpec);
        if (itemSpec.owner !== this || index < 0) {
            throw new Error("Row is not child of this GridLayout");
        }

        itemSpec.index = -1;
        this._rows.splice(index, 1);
        this.invalidate();
    }

    public removeRows(): void {
        if (this._rows.length !== 0) {
            for (var i = 0; i < this._rows.length; i++) {
                this._rows[i].index = -1;
            }
            this._rows.length = 0;
            this.invalidate();
        }
    }

    public getColumns(): Array<ItemSpec> {
        return this._cols.slice();
    }

    public getRows(): Array<ItemSpec> {
        return this._rows.slice();
    }

    private setColumns(value: string) {
        this._cols = GridLayout.parseItemSpecs(value);
        this.invalidate();
    }

    private setRows(value: string) {
        this._rows = GridLayout.parseItemSpecs(value);
        this.invalidate();
    }

    public invalidate(): void {
        this._isValid = false;
        this.requestLayout();
    }

    private getColumn(view: view.View): ItemSpec {
        if (this._cols.length === 0) {
            return this._singleColumn;
        }

        var columnIndex = Math.min(GridLayout.getColumn(view), this._cols.length - 1);
        return this._cols[columnIndex];
    }

    private getRow(view: view.View): ItemSpec {
        if (this._rows.length === 0) {
            return this._singleRow;
        }

        var columnIndex = Math.min(GridLayout.getRow(view), this._rows.length - 1);
        return this._rows[columnIndex];
    }

    private getColumnSpan(view: view.View, columnIndex: number): number {
        if (this._cols.length === 0) {
            return 1;
        }

        return Math.min(GridLayout.getColumnSpan(view), this._cols.length - columnIndex);
    }

    private getRowSpan(view: view.View, rowIndex: number): number {
        if (this._rows.length === 0) {
            return 1;
        }

        return Math.min(GridLayout.getRowSpan(view), this._rows.length - rowIndex);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        var measureWidth = 0;
        var measureHeight = 0;

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var density = utils.layout.getDisplayDensity();
        var infinityWidth = widthMode === utils.layout.UNSPECIFIED;
        var infinityHeight = heightMode === utils.layout.UNSPECIFIED;

        var column: ItemSpec;
        var columnGroup: ColumnGroup;
        var row: ItemSpec;
        var rowGroup: RowGroup;
        if (!this._isValid) {

            this._rows.forEach((value: ItemSpec, index: number, array: ItemSpec[]) => {
                value.index = index;
            });

            this._cols.forEach((value: ItemSpec, index: number, array: ItemSpec[]) => {
                value.index = index;
            });

            this.helper = new MeasureHelper();
            this.helper.grid = this;
            this.helper.width = width - (this.paddingLeft + this.paddingRight) * density;
            this.helper.height = height - (this.paddingTop + this.paddingBottom) * density;
            this.helper.infinityWidth = infinityWidth;
            this.helper.infinityHeight = infinityHeight;

            for (i = 0; i < this._cols.length; i++) {
                column = this._cols[i];
                columnGroup = new ColumnGroup(column, this.helper);
                this.helper.columns.push(columnGroup);
                if (column.isAbsolute) {
                    columnGroup.width = column.value * density;
                }
            }

            for (i = 0; i < this._rows.length; i++) {
                row = this._rows[i];
                rowGroup = new RowGroup(row, this.helper);
                this.helper.rows.push(rowGroup);
                if (row.isAbsolute) {
                    rowGroup.height = row.value * density;
                }
            }

            if (this._rows.length === 0) {
                this.helper.rows.push(new RowGroup(this._singleRow, this.helper));
            }

            if (this._cols.length === 0) {
                this.helper.columns.push(new ColumnGroup(this._singleColumn, this.helper));
            }
        }

        var i: number = 0;
        var childrenCount = this.getChildrenCount();
        for (i = 0; i < childrenCount; i++) {
            var child = this.getChildAt(i);
            if (!child || !child._isVisible) {
                continue;
            }

            column = this.getColumn(child);
            row = this.getRow(child);
            var columnSpan = this.getColumnSpan(child, column.index);
            var rowSpan = this.getRowSpan(child, row.index);

            var measureSpec = new MeasureSpecs(child, column, row, columnSpan, rowSpan);

            this.helper.addMeasureSpec(measureSpec, density);
        }

        this.helper.measure();

        measureWidth = this.helper.measuredWidth + (this.paddingLeft + this.paddingRight) * density;
        measureHeight = this.helper.measuredHeight + (this.paddingTop + this.paddingBottom) * density;

        measureWidth = Math.max(measureWidth, this.minWidth * density);
        measureHeight = Math.max(measureHeight, this.minHeight * density);

        var widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);

        var density = utils.layout.getDisplayDensity();

        var columnOffsets = new Array<number>();
        columnOffsets.push(this.paddingLeft * density);

        var rowOffsets = new Array<number>();
        rowOffsets.push(this.paddingTop * density);

        var offset = columnOffsets[0];
        var i: number = 0;
        var j: number = 0;
        var columnGroup: ColumnGroup;
        var roundedOffset: number = this.paddingLeft;
        var roundedLength: number = 0;
        var actualLength: number  = 0;
        for (i = 0; i < this.helper.columns.length; i++) {
            columnGroup = this.helper.columns[i];
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
        for (i = 0; i < this.helper.rows.length; i++) {
            var rowGroup = this.helper.rows[i];
            offset += rowGroup.height;
            rowOffsets.push(offset);

            actualLength = offset / density - roundedOffset;
            roundedLength = Math.round(actualLength);
            rowGroup.row._actualLength = roundedLength;
            roundedOffset += roundedLength;
        }

        for (i = 0; i < this.helper.columns.length; i++) {
            columnGroup = this.helper.columns[i];
            for (j = 0; j < columnGroup.children.length; j++) {

                var measureSpec = columnGroup.children[j];
                var childLeft = columnOffsets[measureSpec.columnIndex];
                var childRight = columnOffsets[measureSpec.columnIndex + measureSpec.columnSpan];
                var childTop = rowOffsets[measureSpec.rowIndex];
                var childBottom = rowOffsets[measureSpec.rowIndex + measureSpec.rowSpan];

                // No need to include margins in the width, height
                view.View.layoutChild(this, measureSpec.child, childLeft, childTop, childRight, childBottom);
            }
        }
    }

    applyXmlAttribute(attributeName: string, attributeValue: any): boolean {
        if (attributeName === "columns") {
            this.setColumns(attributeValue);
            return true;
        }
        else if (attributeName === "rows") {
            this.setRows(attributeValue);
            return true;
        }

        return false;
    }

    private static parseItemSpecs(value: string): Array<ItemSpec> {
        var result = new Array<ItemSpec>();
        var arr = value.split(",");
        for (var i = 0; i < arr.length; i++) {
            result.push(GridLayout.convertGridLength(arr[i].trim()));
        }

        return result;
    }

    private static convertGridLength(value: string): ItemSpec {

        if (value === "auto") {
            return <ItemSpec>new definition.ItemSpec(1, definition.GridUnitType.auto);
        } else if (value.indexOf("*") !== -1) {
            var starCount = parseInt(value.replace("*", "") || "1");
            return <ItemSpec>new definition.ItemSpec(starCount, definition.GridUnitType.star);
        } else if (!isNaN(parseInt(value))) {
            return <ItemSpec>new definition.ItemSpec(parseInt(value), definition.GridUnitType.pixel);
        }
        else {
            throw new Error("Cannot parse item spec from string: " + value);
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
        public column: ItemSpec,
        public row: ItemSpec,
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
    column: ItemSpec;
    children: Array<MeasureSpecs> = new Array<MeasureSpecs>();
    owner: MeasureHelper;

    public measureToFix: number = 0;
    public currentMeasureToFixCount: number = 0;

    constructor(column: ItemSpec, owner: MeasureHelper) {
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
    row: ItemSpec;
    children: Array<MeasureSpecs> = new Array<MeasureSpecs>();
    owner: MeasureHelper;

    public measureToFix: number = 0;
    public currentMeasureToFixCount: number = 0;

    constructor(row: ItemSpec, owner: MeasureHelper) {
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
        var i: number = 0;

        // Get column stats
        var columnGroup: ColumnGroup;
        for (i = measureSpec.columnIndex; i < measureSpec.columnIndex + measureSpec.columnSpan; i++) {
            columnGroup = this.columns[i];
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
            for (i = measureSpec.columnIndex; i < measureSpec.columnIndex + measureSpec.columnSpan; i++) {
                columnGroup = this.columns[i];
                if (columnGroup.isAuto) {
                    columnGroup.measureToFix++;
                }
            }
        }

        // Get row stats
        var rowGroup: RowGroup;
        for (i = measureSpec.rowIndex; i < measureSpec.rowIndex + measureSpec.rowSpan; i++) {
            rowGroup = this.rows[i];
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
            for (i = measureSpec.rowIndex; i < measureSpec.rowIndex + measureSpec.rowSpan; i++) {
                rowGroup = this.rows[i];
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

        var i: number = 0;
        if (measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
            var columnGroup: ColumnGroup;
            for (i = measureSpec.columnIndex; i < measureSpec.columnIndex + measureSpec.columnSpan; i++) {
                columnGroup = this.columns[i];
                if (columnGroup.isAuto) {
                    columnGroup.currentMeasureToFixCount++;
                }
            }
        }

        if (measureSpec.autoRowsCount > 0 && measureSpec.starRowsCount === 0) {
            var rowGroup: RowGroup;
            for (i = measureSpec.rowIndex; i < measureSpec.rowIndex + measureSpec.rowSpan; i++) {
                rowGroup = this.rows[i];
                if (rowGroup.isAuto) {
                    rowGroup.currentMeasureToFixCount++;
                }
            }
        }
    }

    private fixColumns() {
        var currentColumnWidth = 0;
        var columnStarCount = 0;
        this.columns.forEach((value: ColumnGroup, index: number, array: ColumnGroup[]) => {
            // Star columns are still zeros (not calculated).
            currentColumnWidth += value.width;
            if (value.column.isStar) {
                columnStarCount += value.column.value;
            }
        });

        this.columnStarValue = columnStarCount > 0 ? (this.width - currentColumnWidth) / columnStarCount : 0;

        this.columns.forEach((value: ColumnGroup, index: number, array: ColumnGroup[]) => {
            if (value.isStar) {
                value.width = value.column.value * this.columnStarValue;
            }
        });
    }

    private fixRows() {
        var currentRowHeight = 0;
        var rowStarCount = 0;
        this.rows.forEach((value: RowGroup, index: number, array: RowGroup[]) => {
            // Star rows are still zeros (not calculated).
            currentRowHeight += value.height;
            if (value.row.isStar) {
                rowStarCount += value.row.value;
            }
        });

        this.rowStarValue = rowStarCount > 0 ? (this.height - currentRowHeight) / rowStarCount : 0;

        this.rows.forEach((value: RowGroup, index: number, array: RowGroup[]) => {
            if (value.isStar) {
                value.height = value.row.value * this.rowStarValue;
            }
        });
    }

    private fakeMeasure() {
        // Fake measure - measure all elemtns that have star rows and auto columns - with infinity Width and infinity Height
        for (var i = 0; i < this.columns.length; i++) {
            var columnGroup = this.columns[i];
            if (columnGroup.allMeasured) {
                continue;
            }

            for (var j = 0; j < columnGroup.children.length; j++) {
                var measureSpec = columnGroup.children[j];
                if (measureSpec.starRowsCount > 0 && measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount === 0) {
                    this.measureChild(measureSpec, true);
                }
            }
        }
    }

    private measureFixedColumnsNoStarRows() {
        for (var i = 0; i < this.columns.length; i++) {
            var columnGroup = this.columns[i];
            for (var j = 0; j < columnGroup.children.length; j++) {
                var measureSpec = columnGroup.children[j];
                if (measureSpec.starColumnsCount > 0 && measureSpec.starRowsCount === 0) {
                    this.measureChildFixedColumns(measureSpec);
                }
            }
        }
    }

    private measureNoStarColumnsFixedRows() {
        for (var i = 0; i < this.columns.length; i++) {
            var columnGroup = this.columns[i];
            for (var j = 0; j < columnGroup.children.length; j++) {
                var measureSpec = columnGroup.children[j];
                if (measureSpec.starRowsCount > 0 && measureSpec.starColumnsCount === 0) {
                    this.measureChildFixedRows(measureSpec);
                }
            }
        }
    }

    public measure() {
        this.init();
        var i: number = 0;
        var j: number = 0;
        var columnGroup: ColumnGroup;
        var measureSpec: MeasureSpecs;
        // Measure auto & pixel columns and rows (no spans).
        for (i = 0; i < this.columns.length; i++) {
            columnGroup = this.columns[i];
            for (j = 0; j < columnGroup.children.length; j++) {
                measureSpec = columnGroup.children[j];
                if (measureSpec.isStar || measureSpec.spanned) {
                    continue;
                }

                this.measureChild(measureSpec);
            }
        }

        // Measure auto & pixel columns and rows (with spans).
        for (i = 0; i < this.columns.length; i++) {
            columnGroup = this.columns[i];
            for (j = 0; j < columnGroup.children.length; j++) {
                measureSpec = columnGroup.children[j];
                if (measureSpec.isStar || !measureSpec.spanned) {
                    continue;
                }

                this.measureChild(measureSpec);
            }
        }

        // try fix stars!
        var fixColumns: boolean = this.columns.every((colGroup, i, a) => colGroup.canBeFixed);
        var fixRows: boolean = this.rows.every((rowGroup, i, a) => rowGroup.canBeFixed);

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
        for (i = 0; i < this.columns.length; i++) {
            columnGroup = this.columns[i];
            for (j = 0; j < columnGroup.children.length; j++) {
                measureSpec = columnGroup.children[j];
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
        var widthMeasureSpec: number = (measureSpec.autoColumnsCount > 0) ? this.infinity : utils.layout.makeMeasureSpec(measureSpec.pixelWidth, utils.layout.EXACTLY);
        var heightMeasureSpec: number = (isFakeMeasure || measureSpec.autoRowsCount > 0) ? this.infinity : utils.layout.makeMeasureSpec(measureSpec.pixelHeight, utils.layout.EXACTLY);

        var childSize = view.View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);

        var i;
        var columnSpanEnd = measureSpec.columnIndex + measureSpec.columnSpan;
        var rowSpanEnd = measureSpec.rowIndex + measureSpec.rowSpan;

        var columnGroup: ColumnGroup;
        var rowGroup: RowGroup;
        var growSize: number;

        var remainingSpace = 0;
        if (measureSpec.autoColumnsCount > 0) {
            remainingSpace = childSize.measuredWidth;

            for (i = measureSpec.columnIndex; i < columnSpanEnd; i++) {
                columnGroup = this.columns[i];
                remainingSpace -= columnGroup.width;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.autoColumnsCount;
                for (i = measureSpec.columnIndex; i < columnSpanEnd; i++) {
                    columnGroup = this.columns[i];
                    if (columnGroup.isAuto) {
                        columnGroup.width += growSize;
                    }
                }
            }
        }

        if (!isFakeMeasure && measureSpec.autoRowsCount > 0) {
            remainingSpace = childSize.measuredHeight;

            for (i = measureSpec.rowIndex; i < rowSpanEnd; i++) {
                rowGroup = this.rows[i];
                remainingSpace -= rowGroup.height;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.autoRowsCount;
                for (i = measureSpec.rowIndex; i < rowSpanEnd; i++) {
                    rowGroup = this.rows[i];
                    if (rowGroup.isAuto) {
                        rowGroup.height += growSize;
                    }
                }
            }
        }

        this.itemMeasured(measureSpec, isFakeMeasure);
    }

    measureChildFixedColumns(measureSpec: MeasureSpecs) {
        var columnIndex = measureSpec.columnIndex;
        var columnSpanEnd = columnIndex + measureSpec.columnSpan;
        var rowIndex = measureSpec.rowIndex;
        var rowSpanEnd = rowIndex + measureSpec.rowSpan;

        var i = 0;
        var columnsWidth: number = 0;
        var columnGroup: ColumnGroup;
        var rowGroup: RowGroup;
        var growSize: number;

        for (i = columnIndex; i < columnSpanEnd; i++) {
            columnGroup = this.columns[i];
            if (!columnGroup.isStar) {
                columnsWidth += columnGroup.width;
            }
        }

        var measureWidth = columnsWidth + measureSpec.starColumnsCount * this.columnStarValue;

        var widthMeasureSpec = utils.layout.makeMeasureSpec(measureWidth, this.horizontalStretch ? utils.layout.EXACTLY : utils.layout.AT_MOST);
        var heightMeasureSpec: number = (measureSpec.autoRowsCount > 0) ? this.infinity : utils.layout.makeMeasureSpec(measureSpec.pixelHeight, utils.layout.EXACTLY);
        var childSize = view.View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);

        var remainingSpace = 0;

        // Distribute width over star columns
        if (!this.horizontalStretch) {
            remainingSpace = childSize.measuredWidth;
            for (i = columnIndex; i < columnSpanEnd; i++) {
                columnGroup = this.columns[i];
                remainingSpace -= columnGroup.width;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.starColumnsCount;
                for (i = columnIndex; i < columnSpanEnd; i++) {
                    columnGroup = this.columns[i];
                    if (columnGroup.isStar) {
                        columnGroup.width += growSize;
                    }
                }
            }
        }

        // Distribute height over auto rows
        if (measureSpec.autoRowsCount > 0) {
            remainingSpace = childSize.measuredHeight;

            for (i = rowIndex; i < rowSpanEnd; i++) {
                rowGroup = this.rows[i];
                remainingSpace -= rowGroup.height;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.autoRowsCount;
                for (i = rowIndex; i < rowSpanEnd; i++) {
                    rowGroup = this.rows[i];
                    if (rowGroup.isAuto) {
                        rowGroup.height += growSize;
                    }
                }
            }
        }

        this.itemMeasured(measureSpec);
    }

    measureChildFixedRows(measureSpec: MeasureSpecs) {
        var i = 0;
        var columnIndex = measureSpec.columnIndex;
        var columnSpanEnd = columnIndex + measureSpec.columnSpan;
        var rowIndex = measureSpec.rowIndex;
        var rowSpanEnd = rowIndex + measureSpec.rowSpan;
        var rowsHeight: number = 0;
        var rowGroup: RowGroup;

        for (i = rowIndex; i < rowSpanEnd; i++) {
            rowGroup = this.rows[i];
            if (!rowGroup.isStar) {
                rowsHeight += rowGroup.height;
            }
        }

        var measureHeight = rowsHeight + measureSpec.starRowsCount * this.rowStarValue;

        var widthMeasureSpec: number = (measureSpec.autoColumnsCount > 0) ? this.infinity : utils.layout.makeMeasureSpec(measureSpec.pixelWidth, utils.layout.EXACTLY);
        var heightMeasureSpec = utils.layout.makeMeasureSpec(measureHeight, this.verticalStretch ? utils.layout.EXACTLY : utils.layout.AT_MOST);
        var childSize = view.View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);

        var remainingSpace = 0;
        var columnGroup: ColumnGroup;
        var growSize: number;

        // Distribute width over auto columns
        if (measureSpec.autoColumnsCount > 0) {
            remainingSpace = childSize.measuredWidth;

            for (i = columnIndex; i < columnSpanEnd; i++) {
                columnGroup = this.columns[i];
                remainingSpace -= columnGroup.width;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.autoColumnsCount;
                for (i = columnIndex; i < columnSpanEnd; i++) {
                    columnGroup = this.columns[i];

                    if (columnGroup.isAuto) {
                        columnGroup.width += growSize;
                    }
                }
            }
        }

        // Distribute height over star rows
        if (!this.verticalStretch) {
            remainingSpace = childSize.measuredHeight;
            for (i = rowIndex; i < rowSpanEnd; i++) {
                rowGroup = this.rows[i];
                remainingSpace -= rowGroup.height;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.starRowsCount;
                for (i = rowIndex; i < rowSpanEnd; i++) {
                    rowGroup = this.rows[i];
                    if (rowGroup.isStar) {
                        rowGroup.height += growSize;
                    }
                }
            }
        }

        this.itemMeasured(measureSpec);
    }

    measureChildFixedColumnsAndRows(measureSpec: MeasureSpecs): void {
        var i = 0;
        var columnIndex = measureSpec.columnIndex;
        var columnSpanEnd = columnIndex + measureSpec.columnSpan;
        var rowIndex = measureSpec.rowIndex;
        var rowSpanEnd = rowIndex + measureSpec.rowSpan;

        var columnGroup: ColumnGroup;
        var rowGroup: RowGroup;

        var columnsWidth: number = 0;
        for (i = columnIndex; i < columnSpanEnd; i++) {
            columnGroup = this.columns[i];
            if (!columnGroup.isStar) {
                columnsWidth += columnGroup.width;
            }
        }

        var rowsHeight: number = 0;
        for (i = rowIndex; i < rowSpanEnd; i++) {
            rowGroup = this.rows[i];
            if (!rowGroup.isStar) {
                rowsHeight += rowGroup.height;
            }
        }

        var measureWidth = columnsWidth + measureSpec.starColumnsCount * this.columnStarValue;
        var measureHeight = rowsHeight + measureSpec.starRowsCount * this.rowStarValue;

        // if (have stars) & (not stretch) - at most
        var widthMeasureSpec = utils.layout.makeMeasureSpec(measureWidth, (measureSpec.starColumnsCount > 0 && !this.horizontalStretch) ? utils.layout.AT_MOST : utils.layout.EXACTLY);
        var heightMeasureSpec = utils.layout.makeMeasureSpec(measureHeight, (measureSpec.starRowsCount > 0 && !this.verticalStretch) ? utils.layout.AT_MOST : utils.layout.EXACTLY);

        var childSize = view.View.measureChild(this.grid, measureSpec.child, widthMeasureSpec, heightMeasureSpec);

        var remainingSpace = childSize.measuredWidth;
        var growSize: number;

        if (!this.horizontalStretch) {
            for (i = columnIndex; i < columnSpanEnd; i++) {
                columnGroup = this.columns[i];
                remainingSpace -= columnGroup.width;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.starColumnsCount;
                for (i = columnIndex; i < columnSpanEnd; i++) {
                    columnGroup = this.columns[i];
                    if (columnGroup.isStar) {
                        columnGroup.width += growSize;
                    }
                }
            }
        }

        remainingSpace = childSize.measuredHeight;

        if (!this.verticalStretch) {
            for (i = rowIndex; i < rowSpanEnd; i++) {
                rowGroup = this.rows[i];
                remainingSpace -= rowGroup.height;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.starRowsCount;
                for (i = rowIndex; i < rowSpanEnd; i++) {
                    rowGroup = this.rows[i];
                    if (rowGroup.isStar) {
                        rowGroup.height += growSize;
                    }
                }
            }
        }

        this.itemMeasured(measureSpec);
    }
}