import common = require("ui/text-view/text-view-common");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class TextView extends common.TextView {
    public _configureEditText() {
        this.android.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE);
        this.android.setGravity(android.view.Gravity.TOP | android.view.Gravity.LEFT);
    }
}