import { View } from '../core/view';

export type IOSIndicatorViewStyle = 'medium' | 'large';

/**
 * Represents a UI widget which displays a progress indicator hinting the user for some background operation running.
 *
 * @nsView ActivityIndicator
 */
export class ActivityIndicator extends View {
	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/ProgressBar.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.ProgressBar */;

	/**
	 * Gets the native iOS [UIActivityIndicatorView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIActivityIndicatorView_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIActivityIndicatorView */;

	/**
	 * Gets or sets a value indicating whether the widget is currently displaying progress.
	 *
	 * @nsProperty
	 */
	busy: boolean;

	/**
	 * Gets or sets the iOS indicator view style (e.g. medium, large).
	 */
	iosIndicatorViewStyle: IOSIndicatorViewStyle;
}
