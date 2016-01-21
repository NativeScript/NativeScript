declare module "ui/layouts/wrap-layout" {
    import {LayoutBase} from "ui/layouts/layout-base";
    import {Property} from "ui/core/dependency-observable";

    /**
     * WrapLayout position children in rows or columns depending on orientation property
     * until space is filled and then wraps them on new row or column.
     */
    class WrapLayout extends LayoutBase {

        /**
         * Represents the observable property backing the orientation property of each WrapLayout instance.
         */
        public static orientationProperty: Property;

        /**
         * Represents the observable property backing the itemWidth property of each WrapLayout instance.
         */
        public static itemWidthProperty: Property;

        /**
         * Represents the observable property backing the itemHeight property of each WrapLayout instance.
         */
        public static itemHeightProperty: Property;

        /**
         * Gets or sets the flow direction. Default value is horizontal.
         * If orientation is horizontal items are arranged in rows, else items are arranged in columns.
         */
        orientation: string;

        /**
         * Gets or sets the width used to measure and layout each child.
         * Default value is Number.NaN which does not restrict children.
         */
        itemWidth: number;
        
        /**
         * Gets or sets the height used to measure and layout each child.
         * Default value is Number.NaN which does not restrict children.
         */
        itemHeight: number;
    }
}