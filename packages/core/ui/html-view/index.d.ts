import { View } from '../core/view';
import { Property } from '../core/properties';
import { Color } from '../../color';

/**
 * Represents a view with html content. Use this component instead WebView when you want to show just static HTML content.
 * [iOS support](https://developer.apple.com/documentation/foundation/nsattributedstring/1524613-initwithdata)
 * [android support](http://developer.android.com/reference/android/text/Html.html)
 *
 * @nsView HtmlView
 */
export class HtmlView extends View {
	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/TextView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.TextView */;

	/**
	 * Gets the native [UITextView](https://developer.apple.com/documentation/uikit/uitextview) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITextView */;

	/** Gets or sets html string for the HtmlView.
	 *
	 * @nsProperty
	 */
	html: string;

	/** Gets or sets a value indicating whether HtmlView is selectable.
	 *
	 * @nsProperty
	 */
	selectable: boolean;
	/**
	 * Gets of sets color of links in the rendered HTML.
	 *
	 * @nsProperty
	 */
	linkColor: Color;
}

export const htmlProperty: Property<HtmlView, string>;
export const selectableProperty: Property<HtmlView, boolean>;
export const linkColorProperty: Property<HtmlView, Color>;
