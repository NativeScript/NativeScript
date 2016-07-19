import common = require("./search-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import * as typesModule from "utils/types";
import style = require("ui/styling/style");
import view = require("ui/core/view");
import font = require("ui/styling/font");
import { Color } from "color";

var types: typeof typesModule;
function ensureTypes() {
    if (!types) {
        types = require("utils/types");
    }
}

function onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SearchBar>data.object;
    bar.ios.text = data.newValue;
}

(<proxy.PropertyMetadata>common.SearchBar.textProperty.metadata).onSetNativeValue = onTextPropertyChanged;

function onTextFieldBackgroundColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    if (data.newValue instanceof Color) {
        let bar = <SearchBar>data.object;
        if (bar._textField) {
            bar._textField.backgroundColor = data.newValue.ios;
        }
    }
}

(<proxy.PropertyMetadata>common.SearchBar.textFieldBackgroundColorProperty.metadata).onSetNativeValue = onTextFieldBackgroundColorPropertyChanged;

function onTextFieldHintColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    if (data.newValue instanceof Color) {
        let bar = <SearchBar>data.object;
        if (bar._placeholderLabel) {
            bar._placeholderLabel.textColor = data.newValue.ios;        
        }
    }
}

(<proxy.PropertyMetadata>common.SearchBar.textFieldHintColorProperty.metadata).onSetNativeValue = onTextFieldHintColorPropertyChanged;

function onHintPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SearchBar>data.object;
    if (!bar.ios) {
        return;
    }

    var newValue = data.newValue;
    ensureTypes();

    if (types.isString(newValue)) {
        bar.ios.placeholder = newValue;
    }
}

(<proxy.PropertyMetadata>common.SearchBar.hintProperty.metadata).onSetNativeValue = onHintPropertyChanged;

global.moduleMerge(common, exports);

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

        owner._onPropertyChangedFromNative(common.SearchBar.textProperty, searchText);

        // This code is needed since sometimes searchBarCancelButtonClicked is not called!
        if (searchText === "") {
            owner._emit(common.SearchBar.clearEvent);
        }
    }

    public searchBarCancelButtonClicked(searchBar: UISearchBar) {
        searchBar.resignFirstResponder();
        let owner = this._owner.get();
        if (!owner) {
            return;
        }

        owner._emit(common.SearchBar.clearEvent);
    }

    public searchBarSearchButtonClicked(searchBar: UISearchBar) {
        searchBar.resignFirstResponder();
        let owner = this._owner.get();
        if (!owner) {
            return;
        }

        owner._emit(common.SearchBar.submitEvent);
    }
}

export class SearchBar extends common.SearchBar {
    private _ios: UISearchBar;
    private _delegate;
    private __textField: UITextField;
    private __placeholderLabel: UILabel;

    constructor() {
        super();

        this._ios = UISearchBar.new();

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
            if (this._textField){
                this.__placeholderLabel = this._textField.valueForKey("placeholderLabel");   
            }
        }

        return this.__placeholderLabel;
    }
}

export class SearchBarStyler implements style.Styler {

    private static setBackgroundColorProperty(v: view.View, newValue: any) {
        var bar = <UISearchBar>v.ios;
        bar.barTintColor = newValue;
    }

    private static getBackgroundColorProperty(v: view.View): any {
        var bar = <UISearchBar>v.ios;
        return bar.barTintColor;
    }

    private static resetBackgroundColorProperty(v: view.View, nativeValue: any) {
        var bar = <UISearchBar>v.ios;
        bar.barTintColor = nativeValue;
    }

    private static getColorProperty(v: view.View): any {
        var sf = <UITextField>(<any>v)._textField;
        if (sf) {
            return sf.textColor;
        }

        return undefined;
    }

    private static setColorProperty(v: view.View, newValue: any) {
        var sf = <UITextField>(<any>v)._textField;
        if (sf) {
            sf.textColor = newValue;
            sf.tintColor = newValue;
        }
    }

    private static resetColorProperty(v: view.View, nativeValue: any) {
        var sf = <UITextField>(<any>v)._textField;
        if (sf) {
            sf.textColor = nativeValue;
            sf.tintColor = nativeValue;
        }
    }

    // font
    private static setFontInternalProperty(v: view.View, newValue: any, nativeValue?: any) {
        var sf = <UITextField>(<any>v)._textField;
        if (sf) {
            sf.font = (<font.Font>newValue).getUIFont(nativeValue);
        }
    }

    private static resetFontInternalProperty(v: view.View, nativeValue: any) {
        var sf = <UITextField>(<any>v)._textField;
        if (sf) {
            sf.font = nativeValue;
        }
    }

    private static getNativeFontInternalValue(v: view.View): any {
        var sf = <UITextField>(<any>v)._textField;
        if (sf) {
            return sf.font;
        }

        return undefined;
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, new style.StylePropertyChangedHandler(
            SearchBarStyler.setBackgroundColorProperty,
            SearchBarStyler.resetBackgroundColorProperty,
            SearchBarStyler.getBackgroundColorProperty), "SearchBar");

        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            SearchBarStyler.setColorProperty,
            SearchBarStyler.resetColorProperty,
            SearchBarStyler.getColorProperty), "SearchBar");

        style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
            SearchBarStyler.setFontInternalProperty,
            SearchBarStyler.resetFontInternalProperty,
            SearchBarStyler.getNativeFontInternalValue), "SearchBar");
    }
}

SearchBarStyler.registerHandlers();
