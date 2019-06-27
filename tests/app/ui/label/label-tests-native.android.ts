import * as labelModule from "tns-core-modules/ui/label";
import * as enums from "tns-core-modules/ui/enums";
import * as colorModule from "tns-core-modules/color";

export function getNativeTextAlignment(label: labelModule.Label): string {
    var gravity = label.android.getGravity();

    if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.LEFT) {
        return enums.TextAlignment.left;
    }

    if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.CENTER_HORIZONTAL) {
        return enums.TextAlignment.center;
    }

    if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.RIGHT) {
        return enums.TextAlignment.right;
    }

    return "unexpected value";
}

export function getNativeBackgroundColor(label: labelModule.Label): colorModule.Color {
    var bkg = <any>label.android.getBackground();
    if (bkg instanceof org.nativescript.widgets.BorderDrawable) {
        return new colorModule.Color((<org.nativescript.widgets.BorderDrawable>bkg).getBackgroundColor());
    }
    else {
        return new colorModule.Color(bkg.backgroundColor);
    }
}
