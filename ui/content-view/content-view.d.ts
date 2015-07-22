/**
 * 
 */
declare module "ui/content-view" {
    import view = require("ui/core/view");

    /**
     * Represents a View that has a single child - content.
     * The View itself does not have visual representation and serves as a placeholder for its content in the logical tree.
     */
    class ContentView extends view.View implements view.AddChildFromBuilder  {
        /**
         * Gets or sets the single child of the view.
         */
        content: view.View;

        //@private
        /**
         * Called when the content property has changed.
         * @param oldView The previous content.
         * @param newView The new content.
         */
        _onContentChanged(oldView: view.View, newView: view.View);
        //@endprivate

        _addChildFromBuilder(name: string, value: any): void;
    }
} 