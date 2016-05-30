import observable = require("data/observable");
import view = require("ui/core/view");
import label = require("ui/label");

var count = 0;
export function buttonTap2(args: observable.EventData) {
    count++;

    var parent = (<view.View>args.object).parent;
    if (parent) {
        var lbl = parent.getViewById<label.Label>("Label1");
        if (lbl) {
            lbl.text = "You clicked " + count + " times!";
        }
    }
}