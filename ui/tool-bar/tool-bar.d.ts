/**
 * Contains the ToolBar class, which represents a ToolBar component.
 */
declare module "ui/tool-bar" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Represents a ToolBar item.
     */
    interface ToolBarItem {
        /**
         * Gets or sets the title of the ToolBar.
         */
        view: view.View;
    }

    /**
     * Represents a UI ToolBar component.
     */
    export class ToolBar extends view.View {
        /**
         * Gets or sets the items of the ToolBar.
         */
        items: Array<ToolBarItem>;

        /**
         * Gets or sets the items dependency property of the ToolBar.
         */
        public static itemsProperty: dependencyObservable.Property;
    }
}