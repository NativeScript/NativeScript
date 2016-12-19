import * as stack from "ui/layouts/stack-layout";
import * as style from "ui/styling/style";
import * as view from "ui/core/view";
import { unsetValue } from "ui/core/view";

export function resetStyles(args) {
    var stackLayout = <stack.StackLayout>args.object.parent.parent;
    view.eachDescendant(stackLayout, function (v: view.View) {
        v.style.fontFamily = unsetValue;
        v.style.fontSize = unsetValue;
        v.style.fontStyle = unsetValue;
        v.style.fontWeight = unsetValue;
        v.style.color = unsetValue;
        v.style.textAlignment = unsetValue;
        v.style.paddingLeft = unsetValue;
        v.style.paddingRight = unsetValue;
        v.style.paddingTop = unsetValue;
        v.style.paddingBottom = unsetValue;
        v.style.borderTopColor = unsetValue;
        v.style.borderRightColor = unsetValue;
        v.style.borderBottomColor = unsetValue;
        v.style.borderLeftColor = unsetValue;
        v.style.borderTopWidth = unsetValue;
        v.style.borderRightWidth = unsetValue;
        v.style.borderBottomWidth = unsetValue;
        v.style.borderLeftWidth = unsetValue;
        v.style.borderTopLeftRadius = unsetValue;
        v.style.borderTopRightRadius = unsetValue;
        v.style.borderBottomRightRadius = unsetValue;
        v.style.borderBottomLeftRadius = unsetValue;
        return true;
    });
}
