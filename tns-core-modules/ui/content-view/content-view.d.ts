/**
 * View that can host another view.
 */
declare module "ui/content-view" {
    import { View, AddChildFromBuilder } from "ui/core/view";

    /**
     * Represents a View that has a single child - content.
     * The View itself does not have visual representation and serves as a placeholder for its content in the logical tree.
     */
    class ContentView extends View implements AddChildFromBuilder {
        /**
         * Gets or sets the single child of the view.
         */
        content: View;

        //@private
        /**
         * Called when the content property has changed.
         * @param oldView The previous content.
         * @param newView The new content.
         */
        _onContentChanged(oldView: View, newView: View);
        //@endprivate

        _addChildFromBuilder(name: string, value: any): void;

        layoutView: View;
    }
} 