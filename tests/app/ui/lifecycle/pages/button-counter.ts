import * as button from "tns-core-modules/ui/button";
import * as view from "tns-core-modules/ui/core/view";
import { colorProperty, backgroundInternalProperty, fontInternalProperty } from "tns-core-modules/ui/styling/style-properties";

export class Button extends button.Button {
    nativeBackgroundRedraws = 0;
    backgroundInternalSetNativeCount = 0;
    fontInternalSetNativeCount = 0;
    colorSetNativeCount = 0;
    colorPropertyChangeCount = 0;

    constructor() {
        super();
        this.style.on("colorChange", () => this.colorPropertyChangeCount++);
    }

    [backgroundInternalProperty.setNative](value) {
        this.backgroundInternalSetNativeCount++;
        return super[backgroundInternalProperty.setNative](value);
    }
    [fontInternalProperty.setNative](value) {
        this.fontInternalSetNativeCount++;
        return super[fontInternalProperty.setNative](value);
    }
    _redrawNativeBackground(value: any): void {
        this.nativeBackgroundRedraws++;
        super._redrawNativeBackground(value);
    }
    [colorProperty.setNative](value) {
        this.colorSetNativeCount++;
        return super[colorProperty.setNative](value);
    }
}
Button.prototype.recycleNativeView = "never";
