import definition = require("ui/text-view");
import textBase = require("ui/text-base");
import editableTextBase = require("ui/editable-text-base");

// merge the exports of the textBase file with the exports of this file
declare var exports;
require("utils/module-merge").merge(textBase, exports);

export class TextView extends editableTextBase.EditableTextBase implements definition.TextView {
    constructor(options?: editableTextBase.Options) {
        super(options);
    }
}  