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

    if (lbl.style.textTransform === "none") {
        lbl.style.textTransform = "capitalize";
        btn.style.textTransform = "capitalize";
        textField.style.textTransform = "capitalize";
        textView.style.textTransform = "capitalize";
    } else if (lbl.style.textTransform === "capitalize") {
        lbl.style.textTransform = "uppercase";
        btn.style.textTransform = "uppercase";
        textField.style.textTransform = "uppercase";
        textView.style.textTransform = "uppercase";
    } else if (lbl.style.textTransform === "uppercase" && lbl.style.textDecoration !== "line-through underline") {
        lbl.style.textTransform = "lowercase";
        btn.style.textTransform = "lowercase";
        textField.style.textTransform = "lowercase";
        textView.style.textTransform = "lowercase";
    } else if (lbl.style.textTransform === "lowercase") {
    //    lbl.style.textTransform = "uppercase";
    //    btn.style.textTransform = "uppercase";
    //    textField.style.textTransform = "uppercase";
    //    textView.style.textTransform = "uppercase";

    //    lbl.style.textDecoration = "line-through underline";
    //    btn.style.textDecoration = "line-through underline";
    //    textField.style.textDecoration = "line-through underline";
    //    textView.style.textDecoration = "line-through underline";
    //} else if (lbl.style.textTransform === "uppercase" && lbl.style.textDecoration === "line-through underline") {
        lbl.style.textTransform = "none";
        btn.style.textTransform = "none";
        textField.style.textTransform = "none";
        textView.style.textTransform = "none";

        lbl.style.textDecoration = "none";
        btn.style.textDecoration = "none";
        textField.style.textDecoration = "none";
        textView.style.textDecoration = "none";
    }
}