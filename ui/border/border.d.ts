/**
 * Contains the Border class, which represents a UI border component.
 */
declare module "ui/border" {
    import {ContentView} from "ui/content-view";
    import {Color} from "color";

    /**
     * Represents a UI border component.
     */
    export class Border extends ContentView {
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
        borderColor: Color;
    }
}