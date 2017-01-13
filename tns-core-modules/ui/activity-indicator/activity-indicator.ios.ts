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

    get ios(): UIActivityIndicatorView {
        return this.nativeView;
    }

    get [busyProperty.native](): boolean {
        if ((<any>this.nativeView).isAnimating) {
            return (<any>this.nativeView).isAnimating();
        }
        else {
            return this.nativeView.animating;
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
        this.nativeView.color = value instanceof Color ? value.ios : value;
    }
}