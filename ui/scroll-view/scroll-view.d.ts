/**
 * Contains the ScrollView class, which represents a scrollable area that can have content that is larger than its bounds.
 */
declare module "ui/scroll-view" {
    import contentView = require("ui/content-view");

    /**
     * Represents a scrollable area that can have content that is larger than its bounds.
     */
    class ScrollView extends contentView.ContentView {
        /**
         * Gets a value that contains the vertical offset of the scrolled content.
         */
        verticalOffset: number;

        /**
         * Gets a value that contains the horizontal offset of the scrolled content.
         */
        horizontalOffset: number;

        /**
         * Gets the maximum value for the verticalOffset.
         */
        scrollableHeight: number;
        
        /**
         * Gets the maximum value for the horizontalOffset.
         */        
        scrollableWidth: number;

        /**
         * Scrolls the content the specified vertical offset position.
         * @param value The offset value
         * @param animated true for animated scroll, false for immediate scroll.
         */
        scrollToVerticalOffset(value: number, animated: boolean);
        
        /**
         * Scrolls the content the specified horizontal offset position.
         * @param value The offset value
         * @param animated true for animated scroll, false for immediate scroll.
         */
        scrollToHorizontalOffset(value: number, animated: boolean);

        /**
         * Gets or sets direction in which the content can be scrolled.
         */
        orientation: string;
    }
}