import layouts = require("ui/layouts/layout-base");
import definition = require("ui/layouts/grid-layout");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import bindable = require("ui/core/bindable");
import types = require("utils/types");
import numberUtils = require("utils/number-utils");
import proxy = require("ui/core/proxy");

function validateArgs(element: view.View): view.View {
    if (!element) {
        throw new Error("element cannot be null or undefinied.");
    }
    return element;
}

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

export class GridLayout extends layouts.LayoutBase implements definition.GridLayout, view.ApplyXmlAttributes {
    private _rows: Array<ItemSpec> = new Array<ItemSpec>();
    private _cols: Array<ItemSpec> = new Array<ItemSpec>();
    protected _singleRow: ItemSpec = new ItemSpec();
    protected _singleColumn: ItemSpec = new ItemSpec();

    public static columnProperty = new dependencyObservable.Property("Column", "GridLayout",
        new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.None, GridLayout.onColumnPropertyChanged, numberUtils.notNegative));

    public static columnSpanProperty = new dependencyObservable.Property("ColumnSpan", "GridLayout",
        new proxy.PropertyMetadata(1, dependencyObservable.PropertyMetadataSettings.None, GridLayout.onColumnSpanPropertyChanged, numberUtils.greaterThanZero));

    public static rowProperty = new dependencyObservable.Property("Row", "GridLayout",
        new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.None, GridLayout.onRowPropertyChanged, numberUtils.notNegative));

    public static rowSpanProperty = new dependencyObservable.Property("RowSpan", "GridLayout",
        new proxy.PropertyMetadata(1, dependencyObservable.PropertyMetadataSettings.None, GridLayout.onRowSpanPropertyChanged, numberUtils.greaterThanZero));

    public static getColumn(element: view.View): number {
        return validateArgs(element)._getValue(GridLayout.columnProperty);
    }

    public static setColumn(element: view.View, value: number): void {
        validateArgs(element)._setValue(GridLayout.columnProperty, value);
    }

    public static getColumnSpan(element: view.View): number {
        return validateArgs(element)._getValue(GridLayout.columnSpanProperty);
    }

    public static setColumnSpan(element: view.View, value: number): void {
        validateArgs(element)._setValue(GridLayout.columnSpanProperty, value);
    }

    public static getRow(element: view.View): number {
        return validateArgs(element)._getValue(GridLayout.rowProperty);
    }

    public static setRow(element: view.View, value: number): void {
        validateArgs(element)._setValue(GridLayout.rowProperty, value);
    }

    public static getRowSpan(element: view.View): number {
        return validateArgs(element)._getValue(GridLayout.rowSpanProperty);
    }

    public static setRowSpan(element: view.View, value: number): void {
        validateArgs(element)._setValue(GridLayout.rowSpanProperty, value);
    }

    constructor() {
        super();
        this._singleRow.index = 0
        this._singleColumn.index = 0;
    }

    public addRow(itemSpec: ItemSpec) {
        GridLayout.validateItemSpec(itemSpec);
        itemSpec.owner = this;
        this._rows.push(itemSpec);
        this.onRowAdded(itemSpec);
    }

    public addColumn(itemSpec: ItemSpec) {
        GridLayout.validateItemSpec(itemSpec);
        itemSpec.owner = this;
        this._cols.push(itemSpec);
        this.onColumnAdded(itemSpec);
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
        this.onRowRemoved(itemSpec, index);
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
        this.onColumnRemoved(itemSpec, index);
    }

    protected onRowChanged(element: view.View, oldValue: number, newValue: number) {
        //
    }

    protected onRowSpanChanged(element: view.View, oldValue: number, newValue: number) {
        //
    }

    protected onColumnChanged(element: view.View, oldValue: number, newValue: number) {
        //
    }

    protected onColumnSpanChanged(element: view.View, oldValue: number, newValue: number) {
        //
    }

    protected onRowAdded(itemSpec: ItemSpec) {
        //
    }

    protected onColumnAdded(itemSpec: ItemSpec) {
        //
    }

    protected onRowRemoved(itemSpec: ItemSpec, index: number) {
        //
    }

    protected onColumnRemoved(itemSpec: ItemSpec, index: number) {
        //
    }

    public getColumns(): Array<ItemSpec> {
        return this._cols.slice();
    }

    public getRows(): Array<ItemSpec> {
        return this._rows.slice();
    }

    protected getColumn(view: view.View): ItemSpec {
        if (this._cols.length === 0) {
            return this._singleColumn;
        }

        var columnIndex = Math.min(GridLayout.getColumn(view), this._cols.length - 1);
        return this._cols[columnIndex];
    }

    protected getRow(view: view.View): ItemSpec {
        if (this._rows.length === 0) {
            return this._singleRow;
        }

        var columnIndex = Math.min(GridLayout.getRow(view), this._rows.length - 1);
        return this._rows[columnIndex];
    }

    protected getColumnSpan(view: view.View, columnIndex: number): number {
        if (this._cols.length === 0) {
            return 1;
        }

        return Math.min(GridLayout.getColumnSpan(view), this._cols.length - columnIndex);
    }

    protected getRowSpan(view: view.View, rowIndex: number): number {
        if (this._rows.length === 0) {
            return 1;
        }

        return Math.min(GridLayout.getRowSpan(view), this._rows.length - rowIndex);
    }

    protected invalidate(): void {
        //
    }

    _applyXmlAttribute(attributeName: string, attributeValue: any): boolean {
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
        }
        else if (value.indexOf("*") !== -1) {
            var starCount = parseInt(value.replace("*", "") || "1");
            return <ItemSpec>new definition.ItemSpec(starCount, definition.GridUnitType.star);
        }
        else if (!isNaN(parseInt(value))) {
            return <ItemSpec>new definition.ItemSpec(parseInt(value), definition.GridUnitType.pixel);
        }
        else {
            throw new Error("Cannot parse item spec from string: " + value);
        }
    }

    private static onRowPropertyChanged(data: dependencyObservable.PropertyChangeData): void {
        var element = GridLayout.getView(data.object);
        var grid = element.parent;
        if (grid instanceof GridLayout) {
            grid.onRowChanged(element, data.oldValue, data.newValue);
        }
    }

    private static onColumnPropertyChanged(data: dependencyObservable.PropertyChangeData): void {
        var element = GridLayout.getView(data.object);
        var grid = element.parent;
        if (grid instanceof GridLayout) {
            grid.onColumnChanged(element, data.oldValue, data.newValue);
        }
    }

    private static onRowSpanPropertyChanged(data: dependencyObservable.PropertyChangeData): void {
        var element = GridLayout.getView(data.object);
        var grid = element.parent;
        if (grid instanceof GridLayout) {
            grid.onRowSpanChanged(element, data.oldValue, data.newValue);
        }
    }

    private static onColumnSpanPropertyChanged(data: dependencyObservable.PropertyChangeData): void {
        var element = GridLayout.getView(data.object);
        var grid = element.parent;
        if (grid instanceof GridLayout) {
            grid.onColumnSpanChanged(element, data.oldValue, data.newValue);
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

    private static getView(object: Object): view.View {
        if (object instanceof view.View) {
            return object;
        }

        throw new Error("Element is not View or its descendant.");
    }

    private setColumns(value: string) {
        this._cols = GridLayout.parseItemSpecs(value);
        this.invalidate();
    }

    private setRows(value: string) {
        this._rows = GridLayout.parseItemSpecs(value);
        this.invalidate();
    }
}