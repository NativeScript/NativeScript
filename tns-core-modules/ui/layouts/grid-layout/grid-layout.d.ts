declare module "ui/layouts/grid-layout" {
    import { LayoutBase, Property, View } from "ui/layouts/layout-base";

    /**
     * Defines row/column specific properties that apply to GridLayout elements.
     */
    export class ItemSpec {

        constructor();
        constructor(value: number, type: "pixel" | "star" | "auto");

        /**
         * Gets the actual length of an ItemSpec.
         */
        actualLength: number;

        /**
         * Returns unit type of this ItemSpec instance.
         */
        gridUnitType: "pixel" | "star" | "auto";

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

        //@private
        public _onRowAdded(itemSpec: ItemSpec): void;
        public _onColumnAdded(itemSpec: ItemSpec): void;
        public _onRowRemoved(itemSpec: ItemSpec, index: number): void;
        public _onColumnRemoved(itemSpec: ItemSpec, index: number): void;
        //@endprivate
    }

    /**
     * Represents the observable property backing the column property.
     */
    export const columnProperty: Property<GridLayout, number>;

    /**
     * Represents the observable property backing the columnSpan property.
     */
    export const columnSpanProperty: Property<GridLayout, number>;

    /**
     * Represents the observable property backing the row property.
     */
    export const rowProperty: Property<GridLayout, number>;

    /**
     * Represents the observable property backing the rowSpan property.
     */
    export const rowSpanProperty: Property<GridLayout, number>;
}