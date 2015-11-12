import view = require("ui/core/view");
import observable = require("data/observable");
import label = require("ui/label");

export function butonTap(args: observable.EventData) {
    var btn = <view.View>args.object;
    var lbl = <label.Label>btn.parent.getViewById("Label1");

    if (lbl.style.whiteSpace === "normal") {
        lbl.style.whiteSpace = "nowrap";
    } else if (lbl.style.whiteSpace === "nowrap") {
        lbl.style.whiteSpace = "normal";
    }
}