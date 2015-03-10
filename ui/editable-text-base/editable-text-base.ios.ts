import common = require("ui/editable-text-base/editable-text-base-common");
import textBase = require("ui/text-base");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");

export class EditableTextBase extends common.EditableTextBase {
    constructor(options?: textBase.Options) {
        super(options);
    }

    public dismissSoftInput() {
        (<UIResponder>this.ios).resignFirstResponder();
    }

    public _onKeyboardTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newKeyboardType;
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
        var newReturnKeyType;
        switch (data.newValue) {
            case enums.ReturnKeyType.done:
                newReturnKeyType = UIReturnKeyType.UIReturnKeyDone;
                break;
            case enums.ReturnKeyType.go:
                newReturnKeyType = UIReturnKeyType.UIReturnKeyGo;
                break;
            case enums.ReturnKeyType.next:
                newReturnKeyType = UIReturnKeyType.UIReturnKeyNext;
                break;
            case enums.ReturnKeyType.search:
                newReturnKeyType = UIReturnKeyType.UIReturnKeySearch;
                break;
            case enums.ReturnKeyType.send:
                newReturnKeyType = UIReturnKeyType.UIReturnKeySend;
                break;
            default:
                newReturnKeyType = UIReturnKeyType.UIReturnKeyDefault;
                break;
        }

        (<UITextInputTraits>this.ios).returnKeyType = newReturnKeyType;
    }

    public _onAutocapitalizationTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue;
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
}   