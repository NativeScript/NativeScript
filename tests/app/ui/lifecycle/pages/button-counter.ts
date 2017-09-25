import * as button from "tns-core-modules/ui/button";
import * as view from "tns-core-modules/ui/core/view";

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

    [view.backgroundInternalProperty.setNative](value) {
        this.backgroundInternalSetNativeCount++;
        return super[view.backgroundInternalProperty.setNative](value);
    }
    [view.fontInternalProperty.setNative](value) {
        this.fontInternalSetNativeCount++;
        return super[view.fontInternalProperty.setNative](value);
    }
    _redrawNativeBackground(value: any): void {
        this.nativeBackgroundRedraws++;
        super._redrawNativeBackground(value);
    }
    [view.colorProperty.setNative](value) {
        this.colorSetNativeCount++;
        return super[view.colorProperty.setNative](value);
    }
}
Button.prototype.recycleNativeView = "never";
