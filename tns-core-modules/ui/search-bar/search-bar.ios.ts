import { Font } from "../styling/font";
import {
    SearchBarBase, Color, colorProperty, backgroundColorProperty, backgroundInternalProperty, fontInternalProperty,
    textProperty, hintProperty, textFieldHintColorProperty, textFieldBackgroundColorProperty
} from "./search-bar-common";
import { ios as iosUtils } from "../../utils/utils";

export * from "./search-bar-common";

const majorVersion = iosUtils.MajorVersion;

class UISearchBarDelegateImpl extends NSObject implements UISearchBarDelegate {
    public static ObjCProtocols = [UISearchBarDelegate];

    private _owner: WeakRef<SearchBar>;

    public static initWithOwner(owner: WeakRef<SearchBar>): UISearchBarDelegateImpl {
        let delegate = <UISearchBarDelegateImpl>UISearchBarDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    public searchBarTextDidChange(searchBar: UISearchBar, searchText: string) {
        let owner = this._owner.get();
        if (!owner) {
            return;
        }

        textProperty.nativeValueChange(owner, searchText);

        // This code is needed since sometimes searchBarCancelButtonClicked is not called!
        if (searchText === "") {
            owner._emit(SearchBarBase.clearEvent);
        }
    }

    public searchBarCancelButtonClicked(searchBar: UISearchBar) {
        searchBar.resignFirstResponder();
        let owner = this._owner.get();
        if (!owner) {
            return;
        }

        owner._emit(SearchBarBase.clearEvent);
    }

    public searchBarSearchButtonClicked(searchBar: UISearchBar) {
        searchBar.resignFirstResponder();
        let owner = this._owner.get();
        if (!owner) {
            return;
        }

        owner._emit(SearchBarBase.submitEvent);
    }
}

class UISearchBarImpl extends UISearchBar {
    sizeThatFits(size: CGSize): CGSize {
        // iOS11 SDK does not support passing sizeThatFits(...) non-finite width value;
        // iOS layout system will take care to size the element properly when passed 0
        if (majorVersion >= 11 && size.width === Number.POSITIVE_INFINITY) {
            size.width = 0;
        }

        return super.sizeThatFits(size);
    }
}

export class SearchBar extends SearchBarBase {
    private _ios: UISearchBar;
    private _delegate;
    private __textField: UITextField;
    private __placeholderLabel: UILabel;

    constructor() {
        super();

        this.nativeViewProtected = this._ios = UISearchBarImpl.new();
        this._delegate = UISearchBarDelegateImpl.initWithOwner(new WeakRef(this));
    }

    public onLoaded() {
        super.onLoaded();
        this._ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this._ios.delegate = null;
        super.onUnloaded();
    }

    public dismissSoftInput() {
        (<UIResponder>this.ios).resignFirstResponder();
    }

    get ios(): UISearchBar {
        return this._ios;
    }

    get _textField(): UITextField {
        if (!this.__textField) {
            this.__textField = this.ios.valueForKey("searchField");
        }

        return this.__textField;
    }

    get _placeholderLabel(): UILabel {
        if (!this.__placeholderLabel) {
            if (this._textField) {
                this.__placeholderLabel = this._textField.valueForKey("placeholderLabel");
            }
        }

        return this.__placeholderLabel;
    }

    [backgroundColorProperty.getDefault](): UIColor {
        return this._ios.barTintColor;
    }
    [backgroundColorProperty.setNative](value: UIColor | Color) {
        let color: UIColor = value instanceof Color ? value.ios : value;
        this._ios.barTintColor = color;
    }

    [colorProperty.getDefault](): UIColor {
        let sf = this._textField;
        if (sf) {
            return sf.textColor;
        }
        return null;
    }
    [colorProperty.setNative](value: UIColor | Color) {
        let sf = this._textField;
        let color = value instanceof Color ? value.ios : value;
        if (sf) {
            sf.textColor = color;
            sf.tintColor = color;
        }
    }

    [fontInternalProperty.getDefault](): UIFont {
        let sf = this._textField;
        return sf ? sf.font : null;
    }
    [fontInternalProperty.setNative](value: UIFont | Font) {
        let sf = this._textField;
        if (sf) {
            sf.font = value instanceof Font ? value.getUIFont(sf.font) : value;
        }
    }

    [backgroundInternalProperty.getDefault](): any {
        return null;
    }
    [backgroundInternalProperty.setNative](value: any) {
        //
    }

    [textProperty.getDefault](): string {
        return "";
    }
    [textProperty.setNative](value: string) {
        const text = (value === null || value === undefined) ? "" : value.toString();
        this._ios.text = text;
    }

    [hintProperty.getDefault](): string {
        return "";
    }
    [hintProperty.setNative](value: string) {
        const text = (value === null || value === undefined) ? "" : value.toString();
        this._ios.placeholder = text;
    }

    [textFieldBackgroundColorProperty.getDefault](): UIColor {
        const textField = this._textField;
        if (textField) {
            return textField.backgroundColor;
        }

        return null;
    }
    [textFieldBackgroundColorProperty.setNative](value: Color | UIColor) {
        const color = value instanceof Color ? value.ios : value
        const textField = this._textField;
        if (textField) {
            textField.backgroundColor = color;
        }
    }

    [textFieldHintColorProperty.getDefault](): UIColor {
        const placeholderLabel = this._placeholderLabel;
        if (placeholderLabel) {
            return placeholderLabel.textColor;
        }

        return null;
    }
    [textFieldHintColorProperty.setNative](value: Color | UIColor) {
        const color = value instanceof Color ? value.ios : value
        const placeholderLabel = this._placeholderLabel;
        if (placeholderLabel) {
            placeholderLabel.textColor = color;
        }
    }
}
