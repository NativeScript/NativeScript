import * as button from "tns-core-modules/ui/button";
import * as view from "tns-core-modules/ui/core/view";

export class Button extends button.Button {
    nativeBackgroundRedraws = 0;
    backgroundInternalSetNativeCount = 0;
    fontInternalSetNativeCount = 0;

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
}
Button.prototype.recycleNativeView = false;
