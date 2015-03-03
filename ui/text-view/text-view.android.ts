import common = require("ui/text-view/text-view-common");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class TextView extends common.TextView {
    public _createUI() {
        super._createUI();
        
        this.android.setGravity(android.view.Gravity.TOP | android.view.Gravity.LEFT);
        this.android.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE);
    }
}