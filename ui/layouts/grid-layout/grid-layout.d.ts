declare module "ui/layouts/grid-layout" {
    import layout = require("ui/layouts/layout");
    import view = require("ui/core/view");

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
    export class GridLayout extends layout.Layout {

        ///**
        // * Initializes a new instance of GridLayout.
        // * @param options Options to configure this GridLayout instance.
        // */
        //constructor(options?: Options);

        /**
         * Gets the value of the Column attached property from a given View.
         */
        static getColumn(view: view.View): number;

        /**
         * Sets the value of the Column attached property to a given View. 
         */
        static setColumn(view: view.View, value: number): void;

        /**
         * Gets the value of the ColumnSpan attached property from a given View.
         */
        static getColumnSpan(view: view.View): number;

        /**
         * Sets the value of the ColumnSpan attached property to a given View. 
         */
        static setColumnSpan(view: view.View, value: number): void;

        /**
         * Gets the value of the Row attached property from a given View.
         */
        static getRow(view: view.View): number;

        /**
         * Sets the value of the Row attached property to a given View. 
         */
        static setRow(view: view.View, value: number): void;

        /**
         * Gets the value of the RowSpan attached property from a given View.
         */
        static getRowSpan(view: view.View): number;

        /**
         * Sets the value of the RowSpan attached property to a given View. 
         */
        static setRowSpan(view: view.View, value: number): void;

        /**
         * Adds a column specification to a GridLayout.
         */
        public addColumn(itemSpec: ItemSpec);

        /**
         * Adds a row specification to a GridLayout.
         */
        public addRow(itemSpec: ItemSpec);

        /**
         * Removes a column specification from a GridLayout.
         */
        public removeColumn(itemSpec: ItemSpec): void;

        /**
         * Removes a row specification from a GridLayout.
         */
        public removeRow(itemSpec: ItemSpec): void;

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