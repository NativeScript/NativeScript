import { ActivityIndicatorBase, busyProperty, colorProperty } from "./activity-indicator-common";
import { ios } from "utils/utils";
import { Color } from "color";

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

    get [colorProperty.native](): UIColor {
        return this.nativeView.color;
    }
    set [colorProperty.native](value: UIColor | Color) {
        this.nativeView.color = value instanceof Color ? value.ios : value;;
    }
}