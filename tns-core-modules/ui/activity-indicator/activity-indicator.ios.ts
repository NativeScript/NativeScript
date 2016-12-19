import { ActivityIndicatorBase, busyProperty, colorProperty, visibilityProperty, Visibility } from "./activity-indicator-common";
import { ios } from "utils/utils";

export * from "./activity-indicator-common";

export class ActivityIndicator extends ActivityIndicatorBase {
    nativeView: UIActivityIndicatorView;

    constructor() {
        super();
        this.nativeView = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.Gray);
        this.nativeView.hidesWhenStopped = true;
    }

    get [busyProperty.native](): boolean {
        if (ios.MajorVersion > 9) {
            return this.nativeView.animating;
        }
        else {
            return (<any>this.nativeView).isAnimating();
        }
    }
    set [busyProperty.native](value: boolean) {
        let nativeView = this.nativeView;
        if (value) {
            nativeView.startAnimating();
        } else {
            nativeView.stopAnimating();
        }

        if (nativeView.hidesWhenStopped) {
            this.requestLayout();
        }
    }

    get [visibilityProperty.native](): Visibility {
        return this.nativeView.hidden ? Visibility.COLLAPSE : Visibility.VISIBLE;
    }
    set [visibilityProperty.native](value: Visibility) {
        this.nativeView.hidden = value !== Visibility.VISIBLE;
    }

    get [colorProperty.native](): UIColor {
        return this.nativeView.color;
    }
    set [colorProperty.native](value: UIColor) {
        this.nativeView.color = value;
    }
}