import common = require("ui/search-bar/search-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

var SEARCHTEXT = "searchText";
var QUERY = "query";
var EMPTY = "";

function onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SearchBar>data.object;
    if (!bar.android) {
        return;
    }

    bar.android.setQuery(data.newValue, false);
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.SearchBar.textProperty.metadata).onSetNativeValue = onTextPropertyChanged;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class SearchBar extends common.SearchBar {
    private _android: android.widget.SearchView;

    public _createUI() {
        this._android = new android.widget.SearchView(this._context);

        var that = new WeakRef(this);
        this._android.setOnQueryTextListener(new android.widget.SearchView.OnQueryTextListener({
            get owner() {
                return that.get();
            },

            onQueryTextChange: function (newText: string) {
                if (this.owner) {
                    this.owner._onPropertyChangedFromNative(common.SearchBar.textProperty, newText);

                    // This code is needed since sometimes OnCloseListener is not called!
                    if (newText === EMPTY && this[SEARCHTEXT] !== newText) {
                        this.owner._emit(common.knownEvents.clear);
                    }

                    this[SEARCHTEXT] = newText;
                }
                return true;
            },

            onQueryTextSubmit: function (query: string) {
                if (this.owner) {
                    // This code is needed since onQueryTextSubmit is called twice with same query!
                    if (query !== EMPTY && this[QUERY] !== query) {
                        this.owner._emit(common.knownEvents.submit);
                    }
                    this[QUERY] = query;
                }
                return true;
            }
        }));

        this._android.setOnCloseListener(new android.widget.SearchView.OnCloseListener({
            get owner() {
                return that.get();
            },

            onClose: function () {
                if (this.owner) {
                    this.owner._emit(common.knownEvents.clear);
                }
                return true;
            }
        }));
    }

    get android(): android.widget.SearchView {
        return this._android;
    }
} 