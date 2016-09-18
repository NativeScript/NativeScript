/**
 * Contains the Border class, which represents a UI border component.
 */
declare module "ui/border" {
    import {Color} from "color";
    import {ContentView} from "ui/content-view";

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
        borderWidth: string | number;

        /**
         * Gets or sets the border color of the border component.
         */
        borderColor: string | Color;
    }
}