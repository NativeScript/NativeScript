import common = require("ui/search-bar/search-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import color = require("color");
import types = require("utils/types");

function onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SearchBar>data.object;
    bar.ios.text = data.newValue;
}

(<proxy.PropertyMetadata>common.SearchBar.textProperty.metadata).onSetNativeValue = onTextPropertyChanged;

function onTextFieldBackgroundColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SearchBar>data.object;
    if (data.newValue instanceof color.Color) {
        var tf = getUITextField(bar.ios);
        if (tf) {
            tf.backgroundColor = data.newValue.ios;
        }
    }
}

(<proxy.PropertyMetadata>common.SearchBar.textFieldBackgroundColorProperty.metadata).onSetNativeValue = onTextFieldBackgroundColorPropertyChanged;

function onHintPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SearchBar>data.object;
    if (!bar.ios) {
        return;
    }

    var newValue = data.newValue;

    if (types.isString(newValue)) {
        bar.ios.placeholder = newValue;
    }
}

(<proxy.PropertyMetadata>common.SearchBar.hintProperty.metadata).onSetNativeValue = onHintPropertyChanged;

function getUITextField(bar: UISearchBar): UITextField {
    if (bar) {
        return <UITextField> bar.valueForKey("_searchField");
    }

    return undefined;
}

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

class UISearchBarDelegateImpl extends NSObject implements UISearchBarDelegate {
    public static ObjCProtocols = [UISearchBarDelegate];

    static new(): UISearchBarDelegateImpl {
        return <UISearchBarDelegateImpl>super.new();
    }

    private _owner: SearchBar;
    private _searchText: string;

    public initWithOwner(owner: SearchBar): UISearchBarDelegateImpl {
        this._owner = owner;
        return this;
    }

    public searchBarTextDidChange(searchBar: UISearchBar, searchText: string) {
        this._owner._onPropertyChangedFromNative(common.SearchBar.textProperty, searchText);

        // This code is needed since sometimes searchBarCancelButtonClicked is not called!
        if (searchText === "" && this._searchText !== searchText) {
            this._owner._emit(common.knownEvents.clear);
        }

        this._searchText = searchText;
    }

    public searchBarCancelButtonClicked(searchBar: UISearchBar) {
        searchBar.resignFirstResponder();
        this._owner._emit(common.knownEvents.clear);
    }

    public searchBarSearchButtonClicked(searchBar: UISearchBar) {
        searchBar.resignFirstResponder();
        this._owner._emit(common.knownEvents.submit);
    }
}

export class SearchBar extends common.SearchBar {
    private _ios: UISearchBar;
    private _delegate;

    constructor() {
        super();
        this._ios = new UISearchBar();

        this._delegate = UISearchBarDelegateImpl.new().initWithOwner(this);
        this._ios.delegate = this._delegate;
    }

    get ios(): UISearchBar {
        return this._ios;
    }
}
