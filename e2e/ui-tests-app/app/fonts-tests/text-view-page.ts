import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { View, unsetValue, eachDescendant } from "tns-core-modules/ui/core/view";

export function resetStyles(args) {
    var stackLayout = <StackLayout>args.object.parent;
    eachDescendant(stackLayout, function (v: View) {
        v.style.fontFamily = unsetValue;
        v.style.fontSize = unsetValue;
        v.style.fontStyle = unsetValue;
        v.style.fontWeight = unsetValue;
        v.style.color = unsetValue;
        v.style.textAlignment = unsetValue;

        return true;
    });
}
