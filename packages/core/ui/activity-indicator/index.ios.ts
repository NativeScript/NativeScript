import { ActivityIndicatorBase, busyProperty, iosIndicatorViewStyleProperty } from './activity-indicator-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { SDK_VERSION } from '../../utils/constants';
import { IOSIndicatorViewStyle } from '.';

export * from './activity-indicator-common';

export class ActivityIndicator extends ActivityIndicatorBase {
	nativeViewProtected: UIActivityIndicatorView;

	createNativeView() {
		const viewStyle = this._getNativeIndicatorViewStyle(this.iosIndicatorViewStyle);
		const view = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(viewStyle);
		view.hidesWhenStopped = true;

		return view;
	}

	// @ts-ignore
	get ios(): UIActivityIndicatorView {
		return this.nativeViewProtected;
	}

	private _getNativeIndicatorViewStyle(value: IOSIndicatorViewStyle): UIActivityIndicatorViewStyle {
		let viewStyle: UIActivityIndicatorViewStyle;

		switch (value) {
			case 'large':
				viewStyle = SDK_VERSION > 12 ? UIActivityIndicatorViewStyle.Large : UIActivityIndicatorViewStyle.WhiteLarge;
				break;
			default:
				viewStyle = SDK_VERSION > 12 ? UIActivityIndicatorViewStyle.Medium : UIActivityIndicatorViewStyle.Gray;
				break;
		}

		return viewStyle;
	}

	[busyProperty.getDefault](): boolean {
		return this.nativeViewProtected.animating;
	}
	[busyProperty.setNative](value: boolean) {
		const nativeView = this.nativeViewProtected;

		if (value) {
			nativeView.startAnimating();
		} else {
			nativeView.stopAnimating();
		}

		if (nativeView.hidesWhenStopped) {
			this.requestLayout();
		}
	}

	[colorProperty.getDefault](): UIColor {
		return this.nativeViewProtected.color;
	}
	[colorProperty.setNative](value: UIColor | Color) {
		this.nativeViewProtected.color = value instanceof Color ? value.ios : value;
	}

	[iosIndicatorViewStyleProperty.setNative](value: IOSIndicatorViewStyle) {
		this.nativeViewProtected.activityIndicatorViewStyle = this._getNativeIndicatorViewStyle(value);
	}
}
