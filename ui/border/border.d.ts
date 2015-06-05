/**
 * Contains the Border class, which represents a UI border component.
 */
declare module "ui/border" {
    import contentView = require("ui/content-view");
    import color = require("color");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Represents a UI border component.
     */
    export class Border extends contentView.ContentView {
        public static cornerRadiusProperty : dependencyObservable.Property;
        public static borderWidthProperty: dependencyObservable.Property;
        public static borderColorProperty: dependencyObservable.Property;

        /**
         * Gets or sets the corner radius of the border component.
         */
        cornerRadius: number;

        /**
         * Gets or sets the border width of the border component.
         */
        borderWidth: number;

        /**
         * Gets or sets the border color of the border component.
         */
        borderColor: color.Color;

        //@private
        _updateAndroidBorder(bmp?: android.graphics.Bitmap);
        //@endprivate
    }
}