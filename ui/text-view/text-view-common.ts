import definition = require("ui/text-view");
import textBase = require("ui/text-base");
import editableTextBase = require("ui/editable-text-base");

global.moduleMerge(textBase, exports);

export class TextView extends editableTextBase.EditableTextBase implements definition.TextView {
    // TSLint error if empty.
}