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
                newKeyboardType = UIKeyboardType.NumbersAndPunctuation;
                break;
            case enums.KeyboardType.phone:
                newKeyboardType = UIKeyboardType.PhonePad;
                break;
            case enums.KeyboardType.number:
                newKeyboardType = UIKeyboardType.NumbersAndPunctuation;
                break;
            case enums.KeyboardType.url:
                newKeyboardType = UIKeyboardType.URL;
                break;
            case enums.KeyboardType.email:
                newKeyboardType = UIKeyboardType.EmailAddress;
                break;
            default:
                newKeyboardType = UIKeyboardType.Default;
                break;
        }

        (<UITextInputTraits>this.ios).keyboardType = newKeyboardType;
    }

    public _onReturnKeyTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue;
        switch (data.newValue) {
            case enums.ReturnKeyType.done:
                newValue = UIReturnKeyType.Done;
                break;
            case enums.ReturnKeyType.go:
                newValue = UIReturnKeyType.Go;
                break;
            case enums.ReturnKeyType.next:
                newValue = UIReturnKeyType.Next;
                break;
            case enums.ReturnKeyType.search:
                newValue = UIReturnKeyType.Search;
                break;
            case enums.ReturnKeyType.send:
                newValue = UIReturnKeyType.Send;
                break;
            default:
                newValue = UIReturnKeyType.Default;
                break;
        }

        (<UITextInputTraits>this.ios).returnKeyType = newValue;
    }

    public _onAutocapitalizationTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue: UITextAutocapitalizationType;
        switch (data.newValue) {
            case enums.AutocapitalizationType.none:
                newValue = UITextAutocapitalizationType.None;
                break;
            case enums.AutocapitalizationType.words:
                newValue = UITextAutocapitalizationType.Words;
                break;
            case enums.AutocapitalizationType.sentences:
                newValue = UITextAutocapitalizationType.Sentences;
                break;
            case enums.AutocapitalizationType.allCharacters:
                newValue = UITextAutocapitalizationType.AllCharacters;
                break;
            default:
                newValue = UITextAutocapitalizationType.Sentences;
                break;
        }

        (<UITextInputTraits>this.ios).autocapitalizationType = newValue;
    }

    public _onAutocorrectPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue: UITextAutocorrectionType;
        switch (data.newValue) {
            case true:
                newValue = UITextAutocorrectionType.Yes;
                break;
            case false:
                newValue = UITextAutocorrectionType.No;
                break;
            default:
                newValue = UITextAutocorrectionType.Default;
                break;
        }

        (<UITextInputTraits>this.ios).autocorrectionType = newValue;
    }
}   
