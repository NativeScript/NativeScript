import labelModule = require("ui/label");
import enums = require("ui/enums");

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