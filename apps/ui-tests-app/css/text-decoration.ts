import view = require("ui/core/view");
import observable = require("data/observable");
import label = require("ui/label");
import button = require("ui/button");
import textField = require("ui/text-field");
import textView = require("ui/text-view");

export function butonTap(args) {
    var btnChange = <view.View>args.object;
    var lbl = <label.Label>btnChange.parent.getViewById("Label");
    var btn = <button.Button>btnChange.parent.getViewById("Button");
    var textField = <textField.TextField>btnChange.parent.getViewById("TextField");
    var textView = <textView.TextView>btnChange.parent.getViewById("TextView");

    if (lbl.style.textDecoration === "none") {
        lbl.style.textDecoration = "underline";
        btn.style.textDecoration = "underline";
        textField.style.textDecoration = "underline";
        textView.style.textDecoration = "underline";
    } else if (lbl.style.textDecoration === "underline") {
        lbl.style.textDecoration = "line-through";
        btn.style.textDecoration = "line-through";
        textField.style.textDecoration = "line-through";
        textView.style.textDecoration = "line-through";
    } else if (lbl.style.textDecoration === "line-through") {
        lbl.style.textDecoration = "line-through underline";
        btn.style.textDecoration = "line-through underline";
        textField.style.textDecoration = "line-through underline";
        textView.style.textDecoration = "line-through underline";
    } else if (lbl.style.textDecoration === "line-through underline") {
        lbl.style.textDecoration = "line-through underline none";
        btn.style.textDecoration = "line-through underline none";
        textField.style.textDecoration = "line-through underline none";
        textView.style.textDecoration = "line-through underline none";
    } else if (lbl.style.textDecoration === "line-through underline none") {
        lbl.style.textDecoration = "none";
        btn.style.textDecoration = "none";
        textField.style.textDecoration = "none";
        textView.style.textDecoration = "none";
    }
}