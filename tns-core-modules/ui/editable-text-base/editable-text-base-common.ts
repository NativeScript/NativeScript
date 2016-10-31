import { EditableTextBase as EditableTextBaseDefinition } from "ui/editable-text-base";
import { Property } from "ui/core/properties";
import { TextBase } from "ui/text-base";

import {UpdateTextTrigger, AutocapitalizationType} from "ui/enums";

export let keyboardTypeProperty = new Property<EditableTextBase, string>({ name: "keyboardType" });
keyboardTypeProperty.register(EditableTextBase);

export let returnKeyTypeProperty = new Property<EditableTextBase, string>({ name: "returnKeyType" });
returnKeyTypeProperty.register(EditableTextBase);

export let editableProperty = new Property<EditableTextBase, boolean>({ name: "editable", defaultValue: true });
editableProperty.register(EditableTextBase);

export let updateTextTriggerProperty = new Property<EditableTextBase, string>({ name: "updateTextTrigger", defaultValue: UpdateTextTrigger.textChanged });
updateTextTriggerProperty.register(EditableTextBase);

export let autocapitalizationTypeProperty = new Property<EditableTextBase, string>({ name: "autocapitalizationType", defaultValue: AutocapitalizationType.sentences });
autocapitalizationTypeProperty.register(EditableTextBase);

export let autocorrectProperty = new Property<EditableTextBase, boolean>({ name: "autocorrect" });
autocorrectProperty.register(EditableTextBase);

export let hintProperty = new Property<EditableTextBase, string>({ name: "hint", defaultValue: "" });
hintProperty.register(EditableTextBase);

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

function onHintPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var editableTextBase = <EditableTextBase>data.object;
    editableTextBase._onHintPropertyChanged(data);
}

(<proxy.PropertyMetadata>hintProperty.metadata).onSetNativeValue = onHintPropertyChanged;

export abstract class EditableTextBase extends TextBase implements EditableTextBaseDefinition {

    public keyboardType: string;
    public returnKeyType: string;
    public editable: boolean;
    public updateTextTrigger: string;
    public autocapitalizationType: string;
    public autocorrect: boolean;
    public hint: string;

    public abstract dismissSoftInput();
} 