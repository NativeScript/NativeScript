import view = require("ui/core/view");
import observable = require("data/observable");
import label = require("ui/label");

export function butonTap(args) {
    var btn = <view.View>args.object;
    var lbl = <label.Label>btn.parent.getViewById("Label1");

    if (lbl.style.textDecoration === "underline") {
        lbl.style.textDecoration = "line-through";
    } else if (lbl.style.textDecoration === "line-through") {
        lbl.style.textDecoration = "line-through underline";
    } else if (lbl.style.textDecoration === "line-through underline") {
        lbl.style.textDecoration = "none";
    } else if (lbl.style.textDecoration === "none") {
        lbl.style.textDecoration = "underline";
    }
}