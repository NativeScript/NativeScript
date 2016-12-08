/**
 * Contains the Border class, which represents a UI border component.
 */
declare module "ui/border" {
    import { ContentView } from "ui/content-view";

    /**
     * Represents a UI border component.
     */
    export class Border extends ContentView {
        /**
         * Gets or sets the corner radius of the border component.
         */
        cornerRadius: number;
    }
}