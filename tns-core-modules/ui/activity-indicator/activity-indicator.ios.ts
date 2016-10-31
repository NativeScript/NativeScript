import {ActivityIndicatorBase, busyProperty} from "./activity-indicator-common";
import {Visibility} from "ui/enums";
import {colorProperty, visibilityProperty} from "ui/styling/style";
import * as utils from "utils/utils";

export * from "./activity-indicator-common";

export class ActivityIndicator extends ActivityIndicatorBase {
    nativeView: UIActivityIndicatorView;

    constructor() {
        super();
        this.nativeView = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.Gray);
        this.nativeView.hidesWhenStopped = true;
    }

    get [busyProperty.native](): boolean {
        if (utils.ios.MajorVersion > 9) {
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

    get [visibilityProperty.native](): string {
        return this.nativeView.hidden ? Visibility.collapse : Visibility.visible;
    }
    set [visibilityProperty.native](value: string) {
        this.nativeView.hidden = value !== Visibility.visible;
    }

    get [colorProperty.native](): UIColor {
        return this.nativeView.color;
    }
    set [colorProperty.native](value: UIColor) {
        this.nativeView.color = value;
    }
}