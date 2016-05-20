import common = require("./editable-text-base-common");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");

export class EditableTextBase extends common.EditableTextBase {
    public dismissSoftInput() {
        (<UIResponder>this.ios).resignFirstResponder();
    }

    public _onKeyboardTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newKeyboardType: UIKeyboardType;
        switch (data.newValue) {
            case enums.KeyboardType.datetime:
                newKeyboardType = UIKeyboardType.UIKeyboardTypeNumbersAndPunctuation;
                break;
            case enums.KeyboardType.phone:
                newKeyboardType = UIKeyboardType.UIKeyboardTypePhonePad;
                break;
            case enums.KeyboardType.number:
                newKeyboardType = UIKeyboardType.UIKeyboardTypeNumbersAndPunctuation;
                break;
            case enums.KeyboardType.url:
                newKeyboardType = UIKeyboardType.UIKeyboardTypeURL;
                break;
            case enums.KeyboardType.email:
                newKeyboardType = UIKeyboardType.UIKeyboardTypeEmailAddress;
                break;
            default:
                newKeyboardType = UIKeyboardType.UIKeyboardTypeDefault;
                break;
        }

        (<UITextInputTraits>this.ios).keyboardType = newKeyboardType;
    }

    public _onReturnKeyTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue;
        switch (data.newValue) {
            case enums.ReturnKeyType.done:
                newValue = UIReturnKeyType.UIReturnKeyDone;
                break;
            case enums.ReturnKeyType.go:
                newValue = UIReturnKeyType.UIReturnKeyGo;
                break;
            case enums.ReturnKeyType.next:
                newValue = UIReturnKeyType.UIReturnKeyNext;
                break;
            case enums.ReturnKeyType.search:
                newValue = UIReturnKeyType.UIReturnKeySearch;
                break;
            case enums.ReturnKeyType.send:
                newValue = UIReturnKeyType.UIReturnKeySend;
                break;
            default:
                newValue = UIReturnKeyType.UIReturnKeyDefault;
                break;
        }

        (<UITextInputTraits>this.ios).returnKeyType = newValue;
    }

    public _onAutocapitalizationTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue: UITextAutocapitalizationType;
        switch (data.newValue) {
            case enums.AutocapitalizationType.none:
                newValue = UITextAutocapitalizationType.UITextAutocapitalizationTypeNone;
                break;
            case enums.AutocapitalizationType.words:
                newValue = UITextAutocapitalizationType.UITextAutocapitalizationTypeWords;
                break;
            case enums.AutocapitalizationType.sentences:
                newValue = UITextAutocapitalizationType.UITextAutocapitalizationTypeSentences;
                break;
            case enums.AutocapitalizationType.allCharacters:
                newValue = UITextAutocapitalizationType.UITextAutocapitalizationTypeAllCharacters;
                break;
            default:
                newValue = UITextAutocapitalizationType.UITextAutocapitalizationTypeSentences;
                break;
        }

        (<UITextInputTraits>this.ios).autocapitalizationType = newValue;
    }

    public _onAutocorrectPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue: UITextAutocorrectionType;
        switch (data.newValue) {
            case true:
                newValue = UITextAutocorrectionType.UITextAutocorrectionTypeYes;
                break;
            case false:
                newValue = UITextAutocorrectionType.UITextAutocorrectionTypeNo;
                break;
            default:
                newValue = UITextAutocorrectionType.UITextAutocorrectionTypeDefault;
                break;
        }

        (<UITextInputTraits>this.ios).autocorrectionType = newValue;
    }
}   
