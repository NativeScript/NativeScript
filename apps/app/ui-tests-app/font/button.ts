import stack = require("ui/layouts/stack-layout");
import style = require("ui/styling/style");
import view = require("ui/core/view");
export function resetStyles(args) {
    var stackLayout = <stack.StackLayout>args.object.parent.parent;
    view.eachDescendant(stackLayout, function (v: view.View) {
        v.style._resetValue(style.fontFamilyProperty);
        v.style._resetValue(style.fontSizeProperty);
        v.style._resetValue(style.fontStyleProperty);
        v.style._resetValue(style.fontWeightProperty);
        v.style._resetValue(style.colorProperty);
        v.style._resetValue(style.textAlignmentProperty);
        v.style._resetValue(style.paddingLeftProperty);
        v.style._resetValue(style.paddingRightProperty);
        v.style._resetValue(style.paddingTopProperty);
        v.style._resetValue(style.paddingBottomProperty);
        v.style._resetValue(style.borderTopColorProperty);
        v.style._resetValue(style.borderRightColorProperty);
        v.style._resetValue(style.borderBottomColorProperty);
        v.style._resetValue(style.borderLeftColorProperty);
        v.style._resetValue(style.borderTopWidthProperty);
        v.style._resetValue(style.borderRightWidthProperty);
        v.style._resetValue(style.borderBottomWidthProperty);
        v.style._resetValue(style.borderLeftWidthProperty);
        v.style._resetValue(style.borderTopLeftRadiusProperty);
        v.style._resetValue(style.borderTopRightRadiusProperty);
        v.style._resetValue(style.borderBottomRightRadiusProperty);
        v.style._resetValue(style.borderBottomLeftRadiusProperty);
        return true;
    });
}
