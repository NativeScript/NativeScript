import stack = require("ui/layouts/stack-layout");
import style = require("ui/styling/style");

export function buttonTap(args) {
    var stackLayout = <stack.StackLayout>args.object.parent;

    for (var i = 0; i < stackLayout.getChildrenCount(); i++){
        var v = stackLayout.getChildAt(i);
        v.style._resetValue(style.fontFamilyProperty);
        v.style._resetValue(style.fontSizeProperty);
        v.style._resetValue(style.fontStyleProperty);
        v.style._resetValue(style.fontWeightProperty);
        v.style._resetValue(style.fontProperty);

        v.style._resetValue(style.colorProperty);
        v.style._resetValue(style.textAlignmentProperty);
    }
}
