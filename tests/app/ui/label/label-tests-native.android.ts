import labelModule = require("ui/label");
import enums = require("ui/enums");
import colorModule = require("color");
import background = require("ui/styling/background");

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
    if (bkg instanceof background.ad.BorderDrawable) {
        return (<background.ad.BorderDrawable>bkg).background.color;
    }
    else {
        return new colorModule.Color(bkg.backgroundColor)
    }
}