/**
 * Contains the HtmlView class, which represents a standard html view widget.
 */
declare module "ui/html-view" {
    import { View, Property } from "ui/core/view";

    /**
     * Represents a view with html content. Use this component instead WebView when you want to show just static HTML content.
     * [iOS support](https://developer.apple.com/library/ios/documentation/UIKit/Reference/NSAttributedString_UIKit_Additions/#//apple_ref/occ/instm/NSAttributedString/initWithData:options:documentAttributes:error:)
     * [android support](http://developer.android.com/reference/android/text/Html.html)
     */
    export class HtmlView extends View {
        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/TextView.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.widget.TextView */;

        /**
         * Gets the native [UILabel](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UILabel_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: any /* UILabel */;

        /**
         * Gets or sets html string for the HtmlView.
         */
        html: string;
    }

    export const htmlProperty: Property<HtmlView, string>;
}