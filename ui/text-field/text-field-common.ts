import definition = require("ui/text-field");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import textBase = require("ui/text-base");
import editableTextBase = require("ui/editable-text-base");

export var secureProperty = new dependencyObservable.Property(
    "secure",
    "TextField",
    new proxy.PropertyMetadata(false)
    );

// merge the exports of the textBase file with the exports of this file
declare var exports;
require("utils/module-merge").merge(textBase, exports);

export class TextField extends editableTextBase.EditableTextBase implements definition.TextField {
    constructor(options?: definition.Options) {
        super(options);
    }

    get secure(): boolean {
        return this._getValue(secureProperty);
    }
    set secure(value: boolean) {
        this._setValue(secureProperty, value);
    }
} 