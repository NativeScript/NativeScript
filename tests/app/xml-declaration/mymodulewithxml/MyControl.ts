import * as observable from "tns-core-modules/data/observable";
import * as view from "tns-core-modules/ui/core/view";
import * as label from "tns-core-modules/ui/label";

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
