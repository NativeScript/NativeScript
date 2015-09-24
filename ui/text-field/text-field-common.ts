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

global.moduleMerge(textBase, exports);

export class TextField extends editableTextBase.EditableTextBase implements definition.TextField {
    public static returnPressEvent = "returnPress";

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