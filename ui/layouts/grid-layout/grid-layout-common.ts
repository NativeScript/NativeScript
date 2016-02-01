import definition = require("ui/layouts/grid-layout");
import {LayoutBase} from "ui/layouts/layout-base";
import {View, ApplyXmlAttributes} from "ui/core/view";
import {Bindable} from "ui/core/bindable";
import {PropertyMetadata} from "ui/core/proxy";
import {Property, PropertyMetadataSettings, PropertyChangeData} from "ui/core/dependency-observable";
import {registerSpecialProperty} from "ui/builder/special-properties";
import numberUtils = require("../../../utils/number-utils");
import * as typesModule from "utils/types";

var types: typeof typesModule;
function ensureTypes() {
    if (!types) {
        types = require("utils/types");
    }
}

function validateArgs(element: View): View {
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

registerSpecialProperty("row", (instance, propertyValue) => {
    GridLayout.setRow(instance, !isNaN(+propertyValue) && +propertyValue);
});
registerSpecialProperty("col", (instance, propertyValue) => {
    GridLayout.setColumn(instance, !isNaN(+propertyValue) && +propertyValue);
});
registerSpecialProperty("colSpan", (instance, propertyValue) => {
    GridLayout.setColumnSpan(instance, !isNaN(+propertyValue) && +propertyValue);
});
registerSpecialProperty("rowSpan", (instance, propertyValue) => {
    GridLayout.setRowSpan(instance, !isNaN(+propertyValue) && +propertyValue);
});

export class ItemSpec extends Bindable implements definition.ItemSpec {
    private _value: number;
    private _unitType: string;

    constructor() {
        super();

        if (arguments.length === 0) {
            this._value = 1;
            this._unitType = GridUnitType.star;

        }
        else if (arguments.length === 2) {
            ensureTypes();

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

    public static create(value: number, type: string): ItemSpec {
        let spec = new ItemSpec();
        spec._value = value;
        spec._unitType = type;
        return spec;
    }

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

export class GridLayout extends LayoutBase implements definition.GridLayout, ApplyXmlAttributes {
    private _rows: Array<ItemSpec> = new Array<ItemSpec>();
    private _cols: Array<ItemSpec> = new Array<ItemSpec>();

    public static columnProperty = new Property("Column", "GridLayout",
        new PropertyMetadata(0, PropertyMetadataSettings.None, GridLayout.onColumnPropertyChanged, numberUtils.notNegative));

    public static columnSpanProperty = new Property("ColumnSpan", "GridLayout",
        new PropertyMetadata(1, PropertyMetadataSettings.None, GridLayout.onColumnSpanPropertyChanged, numberUtils.greaterThanZero));

    public static rowProperty = new Property("Row", "GridLayout",
        new PropertyMetadata(0, PropertyMetadataSettings.None, GridLayout.onRowPropertyChanged, numberUtils.notNegative));

    public static rowSpanProperty = new Property("RowSpan", "GridLayout",
        new PropertyMetadata(1, PropertyMetadataSettings.None, GridLayout.onRowSpanPropertyChanged, numberUtils.greaterThanZero));

    public static getColumn(element: View): number {
        return validateArgs(element)._getValue(GridLayout.columnProperty);
    }

    public static setColumn(element: View, value: number): void {
        validateArgs(element)._setValue(GridLayout.columnProperty, value);
    }

    public static getColumnSpan(element: View): number {
        return validateArgs(element)._getValue(GridLayout.columnSpanProperty);
    }

    public static setColumnSpan(element: View, value: number): void {
        validateArgs(element)._setValue(GridLayout.columnSpanProperty, value);
    }

    public static getRow(element: View): number {
        return validateArgs(element)._getValue(GridLayout.rowProperty);
    }

    public static setRow(element: View, value: number): void {
        validateArgs(element)._setValue(GridLayout.rowProperty, value);
    }

    public static getRowSpan(element: View): number {
        return validateArgs(element)._getValue(GridLayout.rowSpanProperty);
    }

    public static setRowSpan(element: View, value: number): void {
        validateArgs(element)._setValue(GridLayout.rowSpanProperty, value);
    }

    public addRow(itemSpec: ItemSpec) {
        GridLayout.validateItemSpec(itemSpec);
        itemSpec.owner = this;
        this._rows.push(itemSpec);
        this.onRowAdded(itemSpec);
        this.invalidate();
    }

    public addColumn(itemSpec: ItemSpec) {
        GridLayout.validateItemSpec(itemSpec);
        itemSpec.owner = this;
        this._cols.push(itemSpec);
        this.onColumnAdded(itemSpec);
        this.invalidate();
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
        this.onColumnRemoved(itemSpec, index);
        this.invalidate();
    }

    public removeColumns() {
        for (var i = 0; i < this._cols.length; i++) {
            this._cols[i].index = -1;
        }
        this._cols.length = 0;
        this.invalidate();
    }

    public removeRows() {
        for (var i = 0; i < this._rows.length; i++) {
            this._rows[i].index = -1;
        }
        this._rows.length = 0;
        this.invalidate();
    }

    protected onRowChanged(element: View, oldValue: number, newValue: number) {
        this.invalidate();
    }

    protected onRowSpanChanged(element: View, oldValue: number, newValue: number) {
        this.invalidate();
    }

    protected onColumnChanged(element: View, oldValue: number, newValue: number) {
        this.invalidate();
    }

    protected onColumnSpanChanged(element: View, oldValue: number, newValue: number) {
        this.invalidate();
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

    protected get columnsInternal(): Array<ItemSpec> {
        return this._cols;
    }

    protected get rowsInternal(): Array<ItemSpec> {
        return this._rows;
    }
    
    protected invalidate(): void {
        this.requestLayout();
    }

    _applyXmlAttribute(attributeName: string, attributeValue: any): boolean {
        if (attributeName === "columns") {
            this._setColumns(attributeValue);
            return true;
        }
        else if (attributeName === "rows") {
            this._setRows(attributeValue);
            return true;
        }

        return super._applyXmlAttribute(attributeName, attributeValue);
    }

    private static parseItemSpecs(value: string): Array<ItemSpec> {
        var result = new Array<ItemSpec>();
        var arr = value.split(/[\s,]+/);
        for (var i = 0; i < arr.length; i++) {
            let str = arr[i].trim();
            if (str.length > 0) {
                result.push(GridLayout.convertGridLength(arr[i].trim()));
            }
        }

        return result;
    }

    private static convertGridLength(value: string): ItemSpec {
        if (value === "auto") {
            return ItemSpec.create(1, GridUnitType.auto);
        }
        else if (value.indexOf("*") !== -1) {
            var starCount = parseInt(value.replace("*", "") || "1");
            return ItemSpec.create(starCount, GridUnitType.star);
        }
        else if (!isNaN(parseInt(value))) {
            return ItemSpec.create(parseInt(value), GridUnitType.pixel);
        }
        else {
            throw new Error("Cannot parse item spec from string: " + value);
        }
    }

    private static onRowPropertyChanged(data: PropertyChangeData): void {
        var element = GridLayout.getView(data.object);
        var grid = element.parent;
        if (grid instanceof GridLayout) {
            grid.onRowChanged(element, data.oldValue, data.newValue);
        }
    }

    private static onColumnPropertyChanged(data: PropertyChangeData): void {
        var element = GridLayout.getView(data.object);
        var grid = element.parent;
        if (grid instanceof GridLayout) {
            grid.onColumnChanged(element, data.oldValue, data.newValue);
        }
    }

    private static onRowSpanPropertyChanged(data: PropertyChangeData): void {
        var element = GridLayout.getView(data.object);
        var grid = element.parent;
        if (grid instanceof GridLayout) {
            grid.onRowSpanChanged(element, data.oldValue, data.newValue);
        }
    }

    private static onColumnSpanPropertyChanged(data: PropertyChangeData): void {
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

    private static getView(object: Object): View {
        if (object instanceof View) {
            return object;
        }

        throw new Error("Element is not View or its descendant.");
    }

    private _setColumns(value: string) {
        this.removeColumns();
        let columns = GridLayout.parseItemSpecs(value);
        for (let i = 0, count = columns.length; i < count; i++) {
            this.addColumn(columns[i]);
        }
    }

    private _setRows(value: string) {
        this.removeRows();
        let rows = GridLayout.parseItemSpecs(value);
        for (let i = 0, count = rows.length; i < count; i++) {
            this.addRow(rows[i]);
        }
    }
}