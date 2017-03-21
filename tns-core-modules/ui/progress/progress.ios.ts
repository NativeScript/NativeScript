import {
    ProgressBase, Color, valueProperty, maxValueProperty,
    colorProperty, backgroundColorProperty, backgroundInternalProperty
} from "./progress-common";

export * from "./progress-common";

export class Progress extends ProgressBase {
    private _ios = UIProgressView.new();

    get ios(): UIProgressView {
        return this._ios;
    }

    get nativeView(): UIProgressView {
        return this._ios;
    }

    get _nativeView(): UIProgressView {
        return this._ios;
    }

    [valueProperty.getDefault](): number {
        return 0;
    }
    [valueProperty.setNative](value: number) {
        this._ios.progress = value / this.maxValue;
    }

    [maxValueProperty.getDefault](): number {
        return 100;
    }
    [maxValueProperty.setNative](value: number) {
        this._ios.progress = this.value / value;
    }

    [colorProperty.getDefault](): UIColor {
        return this._ios.progressTintColor;
    }
    [colorProperty.setNative](value: Color | UIColor) {
        this._ios.progressTintColor = value instanceof Color ? value.ios : value;
    }

    [backgroundColorProperty.getDefault](): UIColor {
        return this._ios.trackTintColor;
    }
    [backgroundColorProperty.setNative](value: UIColor | Color) {
        let color = value instanceof Color ? value.ios : value;
        this._ios.trackTintColor = color;
    }

    [backgroundInternalProperty.getDefault](): UIColor {
        return null;
    }
    [backgroundInternalProperty.setNative](value: Color) {
        //
    }
}