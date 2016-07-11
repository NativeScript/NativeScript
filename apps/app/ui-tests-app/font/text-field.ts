import stack = require("ui/layouts/stack-layout");
import style = require("ui/styling/style");
import view = require("ui/core/view");
export function resetStyles(args) {
    var stackLayout = <stack.StackLayout>args.object.parent;
    view.eachDescendant(stackLayout, function (v: view.View) {
        v.style._resetValue(style.fontFamilyProperty);
        v.style._resetValue(style.fontSizeProperty);
        v.style._resetValue(style.fontStyleProperty);
        v.style._resetValue(style.fontWeightProperty);
        v.style._resetValue(style.colorProperty);
        v.style._resetValue(style.textAlignmentProperty);
        return true;
    });
}
