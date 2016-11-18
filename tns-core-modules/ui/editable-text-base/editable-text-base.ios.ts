import {
    EditableTextBase as EditableTextBaseCommon, keyboardTypeProperty,
    returnKeyTypeProperty, editableProperty, updateTextTriggerProperty,
    autocapitalizationTypeProperty, autocorrectProperty, hintProperty
} from "./editable-text-base-common";
import { textProperty } from "ui/text-base";

export * from "./editable-text-base-common";

import { UpdateTextTrigger, KeyboardType, ReturnKeyType, AutocapitalizationType } from "ui/enums";

export abstract class EditableTextBase extends EditableTextBaseCommon {
    public nativeView: UITextField | UITextView;
    public dismissSoftInput() {
        this.nativeView.resignFirstResponder();
    }

    get [keyboardTypeProperty.native](): string {
        let keyboardType = this.nativeView.keyboardType;
        switch (keyboardType) {
            case UIKeyboardType.NumbersAndPunctuation:
                return KeyboardType.number;

            case UIKeyboardType.PhonePad:
                return KeyboardType.phone;

            case UIKeyboardType.URL:
                return KeyboardType.url;

            case UIKeyboardType.EmailAddress:
                return KeyboardType.email;

            default:
                return keyboardType.toString();
        }
    }
    set [keyboardTypeProperty.native](value: string) {
        let newKeyboardType: UIKeyboardType;
        switch (value) {
            case KeyboardType.datetime:
                newKeyboardType = UIKeyboardType.NumbersAndPunctuation;
                break;
            case KeyboardType.phone:
                newKeyboardType = UIKeyboardType.PhonePad;
                break;
            case KeyboardType.number:
                newKeyboardType = UIKeyboardType.NumbersAndPunctuation;
                break;
            case KeyboardType.url:
                newKeyboardType = UIKeyboardType.URL;
                break;
            case KeyboardType.email:
                newKeyboardType = UIKeyboardType.EmailAddress;
                break;
            default:
                let kt = +value;
                if (!isNaN(kt)) {
                    newKeyboardType = <UIKeyboardType>kt;
                } else {
                    newKeyboardType = UIKeyboardType.Default;
                }
                break;
        }

        this.nativeView.keyboardType = newKeyboardType;
    }

    get [returnKeyTypeProperty.native](): string {
        let returnKeyType = this.nativeView.returnKeyType;
        switch (returnKeyType) {
            case UIReturnKeyType.Done:
                return ReturnKeyType.done;

            case UIReturnKeyType.Go:
                return ReturnKeyType.go;

            case UIReturnKeyType.Next:
                return ReturnKeyType.next;

            case UIReturnKeyType.Search:
                return ReturnKeyType.search;

            case UIReturnKeyType.Send:
                return ReturnKeyType.send;

            default:
                return returnKeyType.toString();
        }
    }
    set [returnKeyTypeProperty.native](value: string) {
        let newValue;
        switch (value) {
            case ReturnKeyType.done:
                newValue = UIReturnKeyType.Done;
                break;
            case ReturnKeyType.go:
                newValue = UIReturnKeyType.Go;
                break;
            case ReturnKeyType.next:
                newValue = UIReturnKeyType.Next;
                break;
            case ReturnKeyType.search:
                newValue = UIReturnKeyType.Search;
                break;
            case ReturnKeyType.send:
                newValue = UIReturnKeyType.Send;
                break;
            default:
                let rkt = +value;
                if (!isNaN(rkt)) {
                    newValue = <UIKeyboardType>rkt;
                } else {
                    newValue = UIKeyboardType.Default;
                }
                break;
        }

        this.nativeView.returnKeyType = newValue;
    }

    get [autocapitalizationTypeProperty.native](): string {
        let autocapitalizationType = this.nativeView.autocapitalizationType;
        switch (autocapitalizationType) {
            case UITextAutocapitalizationType.None:
                return AutocapitalizationType.none;

            case UITextAutocapitalizationType.Words:
                return AutocapitalizationType.words;

            case UITextAutocapitalizationType.Sentences:
                return AutocapitalizationType.sentences;

            case UITextAutocapitalizationType.AllCharacters:
                return AutocapitalizationType.allCharacters;

            default:
                throw new Error("Invalid autocapitalizationType value:" + autocapitalizationType);
        }
    }
    set [autocapitalizationTypeProperty.native](value: string) {
        let newValue: UITextAutocapitalizationType;
        switch (value) {
            case AutocapitalizationType.none:
                newValue = UITextAutocapitalizationType.None;
                break;
            case AutocapitalizationType.words:
                newValue = UITextAutocapitalizationType.Words;
                break;
            case AutocapitalizationType.sentences:
                newValue = UITextAutocapitalizationType.Sentences;
                break;
            case AutocapitalizationType.allCharacters:
                newValue = UITextAutocapitalizationType.AllCharacters;
                break;
            default:
                newValue = UITextAutocapitalizationType.Sentences;
                break;
        }

        this.nativeView.autocapitalizationType = newValue;
    }

    get [autocorrectProperty.native](): boolean | number {
        let autocorrectionType = this.nativeView.autocorrectionType;
        switch (autocorrectionType) {
            case UITextAutocorrectionType.Yes:
                return true;
            case UITextAutocorrectionType.No:
                return false;
            case UITextAutocorrectionType.Default:
                return autocorrectionType;
        }
    }
    set [autocorrectProperty.native](value: boolean | number) {
        let newValue: UITextAutocorrectionType;
        if (typeof value === "number") {
            newValue = UITextAutocorrectionType.Default;
        } else if (value) {
             newValue = UITextAutocorrectionType.Yes;
        } else {
            newValue = UITextAutocorrectionType.No;
        }

        this.nativeView.autocorrectionType = newValue;
    }
}