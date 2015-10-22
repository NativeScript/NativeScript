import common = require("./search-bar-common");
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
        var tf = (<any>bar)._textField;
        if (tf) {
            tf.backgroundColor = data.newValue.ios;
        }
    }
}

(<proxy.PropertyMetadata>common.SearchBar.textFieldBackgroundColorProperty.metadata).onSetNativeValue = onTextFieldBackgroundColorPropertyChanged;

function onTextFieldHintColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    // This should be in a Try Catch in case Apple eliminates which ever method in the future; 
    try {
        // TODO; convert this code into NativeScript Code		
		/* if ([textField respondsToSelector:@selector(setAttributedPlaceholder:)]) {
			textField.attributedPlaceholder = [[NSAttributedString alloc] initWithString:textField.placeholder attributes:@{NSForegroundColorAttributeName: [UIColor whiteColor]}];
		} */
    } catch (Err) {
        // Do Nothing 
    }
}

(<proxy.PropertyMetadata>common.SearchBar.textFieldHintColorProperty.metadata).onSetNativeValue = onTextFieldHintColorPropertyChanged;

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

global.moduleMerge(common, exports);

class UISearchBarDelegateImpl extends NSObject implements UISearchBarDelegate {
    public static ObjCProtocols = [UISearchBarDelegate];

    private _owner: WeakRef<SearchBar>;
    private _searchText: string;

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
        if (searchText === "" && this._searchText !== searchText) {
            owner._emit(common.SearchBar.clearEvent);
        }

        this._searchText = searchText;
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
    public _textField: UITextField;

    constructor() {
        super();

        this._ios = new UISearchBar();

        this._delegate = UISearchBarDelegateImpl.initWithOwner(new WeakRef(this));
    }

    public onLoaded() {
        super.onLoaded();
        this._ios.delegate = this._delegate;
        this._textField = SearchBar.findTextField(this.ios);
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

    private static findTextField(view: UIView) {
        for (let i = 0, l = view.subviews.count; i < l; i++) {
            let v: UIView = view.subviews[i];
            if (v instanceof UITextField) {
                return v;
            } else if (v.subviews.count > 0) {
                return SearchBar.findTextField(v);
            }
        }

        return undefined;
    }
}
