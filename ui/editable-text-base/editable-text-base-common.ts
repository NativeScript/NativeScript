import definition = require("ui/editable-text-base");
import textBase = require("ui/text-base");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");

var keyboardTypeProperty = new dependencyObservable.Property(
    "keyboardType",
    "EditableTextBase",
    new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None)
    );

var returnKeyTypeProperty = new dependencyObservable.Property(
    "returnKeyType",
    "EditableTextBase",
    new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None)
    );

var editableProperty = new dependencyObservable.Property(
    "editable",
    "EditableTextBase",
    new proxy.PropertyMetadata(true, dependencyObservable.PropertyMetadataSettings.None)
    );

var updateTextTriggerProperty = new dependencyObservable.Property(
    "updateTextTrigger",
    "EditableTextBase",
    new proxy.PropertyMetadata(enums.UpdateTextTrigger.textChanged, dependencyObservable.PropertyMetadataSettings.None)
    );

var autocapitalizationTypeProperty = new dependencyObservable.Property(
    "autocapitalizationType",
    "EditableTextBase",
    new proxy.PropertyMetadata(enums.AutocapitalizationType.sentences, dependencyObservable.PropertyMetadataSettings.None)
    );

var autocorrectProperty = new dependencyObservable.Property(
    "autocorrect",
    "EditableTextBase",
    new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None)
    );

function onKeyboardTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var editableTextBase = <EditableTextBase>data.object;
    editableTextBase._onKeyboardTypePropertyChanged(data);
}

(<proxy.PropertyMetadata>keyboardTypeProperty.metadata).onSetNativeValue = onKeyboardTypePropertyChanged;

function onReturnKeyTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var editableTextBase = <EditableTextBase>data.object;
    editableTextBase._onReturnKeyTypePropertyChanged(data);
}

(<proxy.PropertyMetadata>returnKeyTypeProperty.metadata).onSetNativeValue = onReturnKeyTypePropertyChanged;

function onEditablePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var editableTextBase = <EditableTextBase>data.object;
    editableTextBase._onEditablePropertyChanged(data);
}

(<proxy.PropertyMetadata>editableProperty.metadata).onSetNativeValue = onEditablePropertyChanged;

function onAutocapitalizationTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var editableTextBase = <EditableTextBase>data.object;
    editableTextBase._onAutocapitalizationTypePropertyChanged(data);
}

(<proxy.PropertyMetadata>autocapitalizationTypeProperty.metadata).onSetNativeValue = onAutocapitalizationTypePropertyChanged;

function onAutocorrectPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var editableTextBase = <EditableTextBase>data.object;
    editableTextBase._onAutocorrectPropertyChanged(data);
}

(<proxy.PropertyMetadata>autocorrectProperty.metadata).onSetNativeValue = onAutocorrectPropertyChanged;

export class EditableTextBase extends textBase.TextBase implements definition.EditableTextBase {

    public static keyboardTypeProperty = keyboardTypeProperty;

    public static returnKeyTypeProperty = returnKeyTypeProperty;

    public static editableProperty = editableProperty;

    public static updateTextTriggerProperty = updateTextTriggerProperty;

    public static autocapitalizationTypeProperty = autocapitalizationTypeProperty;

    public static autocorrectProperty = autocorrectProperty;

    constructor(options?: definition.Options) {
        super(options);
    }

    get keyboardType(): string {
        return this._getValue(EditableTextBase.keyboardTypeProperty);
    }

    set keyboardType(value: string) {
        this._setValue(EditableTextBase.keyboardTypeProperty, value);
    }

    get returnKeyType(): string {
        return this._getValue(EditableTextBase.returnKeyTypeProperty);
    }

    set returnKeyType(value: string) {
        this._setValue(EditableTextBase.returnKeyTypeProperty, value);
    }

    get editable(): boolean {
        return this._getValue(EditableTextBase.editableProperty);
    }

    set editable(value: boolean) {
        this._setValue(EditableTextBase.editableProperty, value);
    }

    get updateTextTrigger(): string {
        return this._getValue(EditableTextBase.updateTextTriggerProperty);
    }

    set updateTextTrigger(value: string) {
        this._setValue(EditableTextBase.updateTextTriggerProperty, value);
    }

    get autocapitalizationType(): string {
        return this._getValue(EditableTextBase.autocapitalizationTypeProperty);
    }

    set autocapitalizationType(value: string) {
        this._setValue(EditableTextBase.autocapitalizationTypeProperty, value);
    }

    get autocorrect(): boolean {
        return this._getValue(EditableTextBase.autocorrectProperty);
    }

    set autocorrect(value: boolean) {
        this._setValue(EditableTextBase.autocorrectProperty, value);
    }

    public dismissSoftInput() {
        //
    }

    // TODO: Why we have methods rather than propertyChanged handlers on a per ObservableProperty basis?
    public _onKeyboardTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        //
    }

    public _onReturnKeyTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        //
    }

    public _onEditablePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        //
    }
    
    public _onAutocapitalizationTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        //
    }
    
    public _onAutocorrectPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        //
    }
} 