import view = require("ui/core/view");
import observable = require("data/observable");
import label = require("ui/label");

export function butonTap(args) {
    var btn = <view.View>args.object;
    var lbl = <label.Label>btn.parent.getViewById("Label1");

    if (lbl.style.textTransform === "none") {
        lbl.style.textTransform = "uppercase";
    } else if (lbl.style.textTransform === "uppercase") {
        lbl.style.textTransform = "lowercase";
    } else if (lbl.style.textTransform === "lowercase") {
        lbl.style.textTransform = "capitalize";
    } else if (lbl.style.textTransform === "capitalize") {
        lbl.style.textTransform = "none";
    }
}