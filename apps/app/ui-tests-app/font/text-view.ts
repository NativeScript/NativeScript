import * as stack from "ui/layouts/stack-layout";
import * as style from "ui/styling/style";
import * as view from "ui/core/view";
export function resetStyles(args) {
    var stackLayout = <stack.StackLayout>args.object.parent;
    view.eachDescendant(stackLayout, function (v: view.View) {
        v.style.fontFamily = unsetValue;
        v.style.fontSize = unsetValue;
        v.style.fontStyle = unsetValue;
        v.style.fontWeight = unsetValue;
        v.style.color = unsetValue;
        v.style.textAlignment = unsetValue;
        return true;
    });
}
