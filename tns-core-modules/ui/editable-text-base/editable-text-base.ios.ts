import {
    EditableTextBase as EditableTextBaseCommon, keyboardTypeProperty,
    returnKeyTypeProperty,
    autocapitalizationTypeProperty, autocorrectProperty
} from "./editable-text-base-common";

export * from "./editable-text-base-common";

export abstract class EditableTextBase extends EditableTextBaseCommon {
    public nativeView: UITextField | UITextView;
    public dismissSoftInput() {
        this.nativeView.resignFirstResponder();
    }

    get [keyboardTypeProperty.native](): "datetime"| "phone" | "number" | "url" | "email" | string {
        let keyboardType = this.nativeView.keyboardType;
        switch (keyboardType) {
            case UIKeyboardType.NumbersAndPunctuation:
                return "number";

            case UIKeyboardType.PhonePad:
                return "phone";

            case UIKeyboardType.URL:
                return "url";

            case UIKeyboardType.EmailAddress:
                return "email";

            default:
                return keyboardType.toString();
        }
    }
    set [keyboardTypeProperty.native](value: "datetime"| "phone" | "number" | "url" | "email" | string) {
        let newKeyboardType: UIKeyboardType;
        switch (value) {
            case "datetime":
                newKeyboardType = UIKeyboardType.NumbersAndPunctuation;
                break;

            case "phone":
                newKeyboardType = UIKeyboardType.PhonePad;
                break;

            case "number":
                newKeyboardType = UIKeyboardType.NumbersAndPunctuation;
                break;

            case "url":
                newKeyboardType = UIKeyboardType.URL;
                break
                ;
            case "email":
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

    get [returnKeyTypeProperty.native](): "done" | "next" | "go" | "search" | "send" | string {
        let returnKeyType = this.nativeView.returnKeyType;
        switch (returnKeyType) {
            case UIReturnKeyType.Done:
                return "done";

            case UIReturnKeyType.Go:
                return "go";

            case UIReturnKeyType.Next:
                return "next";

            case UIReturnKeyType.Search:
                return "search";

            case UIReturnKeyType.Send:
                return "send";

            default:
                return returnKeyType.toString();
        }
    }
    set [returnKeyTypeProperty.native](value: "done" | "next" | "go" | "search" | "send" | string) {
        let newValue;
        switch (value) {
            case "done":
                newValue = UIReturnKeyType.Done;
                break;
            case "go":
                newValue = UIReturnKeyType.Go;
                break;
            case "next":
                newValue = UIReturnKeyType.Next;
                break;
            case "search":
                newValue = UIReturnKeyType.Search;
                break;
            case "send":
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

    get [autocapitalizationTypeProperty.native](): "none" | "words" | "sentences" | "allCharacters" {
        let autocapitalizationType = this.nativeView.autocapitalizationType;
        switch (autocapitalizationType) {
            case UITextAutocapitalizationType.None:
                return "none";

            case UITextAutocapitalizationType.Words:
                return "words";

            case UITextAutocapitalizationType.Sentences:
                return "sentences";

            case UITextAutocapitalizationType.AllCharacters:
                return "allCharacters";

            default:
                throw new Error("Invalid autocapitalizationType value:" + autocapitalizationType);
        }
    }
    set [autocapitalizationTypeProperty.native](value: "none" | "words" | "sentences" | "allCharacters") {
        let newValue: UITextAutocapitalizationType;
        switch (value) {
            case "none":
                newValue = UITextAutocapitalizationType.None;
                break;
            case "words":
                newValue = UITextAutocapitalizationType.Words;
                break;
            case "sentences":
                newValue = UITextAutocapitalizationType.Sentences;
                break;
            case "allCharacters":
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