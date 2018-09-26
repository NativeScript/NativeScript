import { ActivityIndicatorBase, busyProperty, colorProperty, Color } from "./activity-indicator-common";

export * from "./activity-indicator-common";

export class ActivityIndicator extends ActivityIndicatorBase {
    nativeViewProtected: UIActivityIndicatorView;
    
    createNativeView() {
        const view = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.Gray);
        view.hidesWhenStopped = true;
        return view;
    }

    get ios(): UIActivityIndicatorView {
        return this.nativeViewProtected;
    }

    [busyProperty.getDefault](): boolean {
        if ((<any>this.nativeViewProtected).isAnimating) {
            return (<any>this.nativeViewProtected).isAnimating();
        }
        else {
            return this.nativeViewProtected.animating;
        }
    }
    [busyProperty.setNative](value: boolean) {
        let nativeView = this.nativeViewProtected;
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
}