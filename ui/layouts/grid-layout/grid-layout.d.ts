declare module "ui/layouts/grid-layout" {
    import {LayoutBase} from "ui/layouts/layout-base";
    import {View} from "ui/core/view";
    import {Property} from "ui/core/dependency-observable";

    /**
     * GridUnitType enum is used to indicate what kind of value the ItemSpec is holding.
     */
    module GridUnitType {
        /**
         * The value indicates that content should be calculated without constraints.
         */
        export var auto: string;
        /**
         * The value is expressed as a pixel.
         */
        export var pixel: string;
        /**
         * The value is expressed as a weighted proportion of available space.
         */
        export var star: string;
    }

    /**
     * Defines row/column specific properties that apply to GridLayout elements.
     */
    export class ItemSpec {

        constructor();
        constructor(value: number, type: string);
        constructor(value: number, type: "pixel");
        constructor(value: number, type: "star");
        constructor(value: number, type: "auto");

        /**
         * Gets the actual length of an ItemSpec.
         */
        actualLength: number;

        /**
         * Returns unit type of this ItemSpec instance.
         */
        gridUnitType: string;

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
         * Returns true if this ItemSpec instance holds weighted propertion  
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

        ///**
        // * Initializes a new instance of GridLayout.
        // * @param options Options to configure this GridLayout instance.
        // */
        //constructor(options?: Options);

        /**
         * Represents the observable property backing the column property.
         */
        public static columnProperty: Property;

        /**
         * Represents the observable property backing the columnSpan property.
         */
        public static columnSpanProperty: Property;

        /**
         * Represents the observable property backing the row property.
         */
        public static rowProperty: Property;

        /**
         * Represents the observable property backing the rowSpan property.
         */
        public static rowSpanProperty: Property;
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
         * Removes a column specification from a GridLayout.
         */
        public removeColumn(itemSpec: ItemSpec): void;

        /**
         * Removes all columns specification from a GridLayout.
         */
        public removeColumns(): void;

        /**
         * Removes a row specification from a GridLayout.
         */
        public removeRow(itemSpec: ItemSpec): void;

        /**
         * Removes all rows specification from a GridLayout.
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
    }
}