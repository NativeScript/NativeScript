import common = require("./search-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import color = require("color");
import utils = require("utils/utils")
import * as typesModule from "utils/types";
import style = require("ui/styling/style");
import view = require("ui/core/view");
import font = require("ui/styling/font");

var types: typeof typesModule;
function ensureTypes() {
    if (!types) {
        types = require("utils/types");
    }
}

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

function onTextFieldBackgroundColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SearchBar>data.object;
    if (!bar.android) {
        return;
    }

    if (data.newValue instanceof color.Color) {
        _changeSearchViewBackgroundColor(bar.android, (<color.Color>data.newValue).android);
    }
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.SearchBar.textFieldBackgroundColorProperty.metadata).onSetNativeValue = onTextFieldBackgroundColorPropertyChanged;

function onTextFieldHintColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SearchBar>data.object;
    if (!bar.android) {
        return;
    }

    if (data.newValue instanceof color.Color) {
        _changeSearchViewHintColor(bar.android, (<color.Color>data.newValue).android);
    }
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.SearchBar.textFieldHintColorProperty.metadata).onSetNativeValue = onTextFieldHintColorPropertyChanged;

function onHintPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SearchBar>data.object;
    if (!bar.android) {
        return;
    }

    var newValue = data.newValue;
    ensureTypes();

    if (types.isString(newValue)) {
        bar.android.setQueryHint(newValue);
    }
}

(<proxy.PropertyMetadata>common.SearchBar.hintProperty.metadata).onSetNativeValue = onHintPropertyChanged;

function getTextView(bar: android.widget.SearchView): android.widget.TextView {
    if (bar) {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_src_text", null, null);
        if (id) {
            return <android.widget.TextView> bar.findViewById(id);
        }
    }

    return undefined;
}

function _changeSearchViewBackgroundColor(bar: android.widget.SearchView, color: number) {
    var textView = getTextView(bar);

    if (textView) {
        textView.setBackgroundColor(color);
    }
}

function _changeSearchViewHintColor(bar: android.widget.SearchView, color: number) {
    var textView = getTextView(bar);

    if (textView) {
        textView.setHintTextColor(color);
    }
}

global.moduleMerge(common, exports);

export class SearchBar extends common.SearchBar {
    private _android: android.widget.SearchView;

    public dismissSoftInput() {
        utils.ad.dismissSoftInput(this._nativeView);
    }

    public focus(): boolean {
        var result = super.focus();

        if (result) {
            utils.ad.showSoftInput(this._nativeView);
        }

        return result;
    }

    public _createUI() {
        this._android = new android.widget.SearchView(this._context);

        this._android.setIconified(false);

        var that = new WeakRef(this);
        this._android.setOnQueryTextListener(new android.widget.SearchView.OnQueryTextListener(<utils.Owned & android.widget.SearchView.IOnQueryTextListener>{
            get owner() {
                return that.get();
            },

            onQueryTextChange: function (newText: string) {
                if (this.owner) {
                    this.owner._onPropertyChangedFromNative(common.SearchBar.textProperty, newText);

                    // This code is needed since sometimes OnCloseListener is not called!
                    if (newText === EMPTY && this[SEARCHTEXT] !== newText) {
                        this.owner._emit(common.SearchBar.clearEvent);
                    }

                    this[SEARCHTEXT] = newText;
                }
                return true;
            },

            onQueryTextSubmit: function (query: string) {
                if (this.owner) {
                    // This code is needed since onQueryTextSubmit is called twice with same query!
                    if (query !== EMPTY && this[QUERY] !== query) {
                        this.owner._emit(common.SearchBar.submitEvent);
                    }
                    this[QUERY] = query;
                }
                return true;
            }
        }));

        this._android.setOnCloseListener(new android.widget.SearchView.OnCloseListener(<utils.Owned & android.widget.SearchView.IOnCloseListener>{
            get owner() {
                return that.get();
            },

            onClose: function () {
                if (this.owner) {
                    this.owner._emit(common.SearchBar.clearEvent);
                }
                return true;
            }
        }));

        if (this.textFieldBackgroundColor instanceof color.Color) {
            _changeSearchViewBackgroundColor(this._android, this.textFieldBackgroundColor.android);
        }
        if (this.textFieldHintColor instanceof color.Color) {
            _changeSearchViewHintColor(this._android, this.textFieldHintColor.android);
        }
    }

    get android(): android.widget.SearchView {
        return this._android;
    }
} 

export class SearchBarStyler implements style.Styler {

    private static getBackgroundColorProperty(v: view.View): any {
        var bar = <android.widget.SearchView>v._nativeView;
        return bar.getDrawingCacheBackgroundColor();
    }

    private static setBackgroundColorProperty(v: view.View, newValue: any) {
        var bar = <android.widget.SearchView>v._nativeView;
        bar.setBackgroundColor(newValue);
        SearchBarStyler._changeSearchViewPlateBackgroundColor(bar, newValue);
    }

    private static resetBackgroundColorProperty(v: view.View, nativeValue: any) {
        var bar = <android.widget.SearchView>v._nativeView;
        bar.setBackgroundColor(nativeValue);
        SearchBarStyler._changeSearchViewPlateBackgroundColor(bar, nativeValue);
    }

    private static getColorProperty(v: view.View): any {
        var bar = <android.widget.SearchView>v._nativeView;
        var textView = SearchBarStyler._getSearchViewTextView(bar);

        if (textView) {
            return textView.getCurrentTextColor();
        }

        return undefined;
    }

    private static setColorProperty(v: view.View, newValue: any) {
        var bar = <android.widget.SearchView>v._nativeView;
        SearchBarStyler._changeSearchViewTextColor(bar, newValue);
    }

    private static resetColorProperty(v: view.View, nativeValue: any) {
        var bar = <android.widget.SearchView>v._nativeView;
        SearchBarStyler._changeSearchViewTextColor(bar, nativeValue);
    }

    // font
    private static setFontInternalProperty(v: view.View, newValue: any, nativeValue?: any) {
        var bar = <android.widget.SearchView>v.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);

        var fontValue = <font.Font>newValue;

        var typeface = fontValue.getAndroidTypeface();
        if (typeface) {
            textView.setTypeface(typeface);
        }
        else {
            textView.setTypeface(nativeValue.typeface);
        }

        if (fontValue.fontSize) {
            textView.setTextSize(fontValue.fontSize);
        }
        else {
            textView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
        }
    }

    private static resetFontInternalProperty(v: view.View, nativeValue: any) {
        var bar = <android.widget.SearchView>v.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        textView.setTypeface(nativeValue.typeface);
        textView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
    }

    private static getNativeFontInternalValue(v: view.View): any {
        var bar = <android.widget.SearchView>v.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        return {
            typeface: textView.getTypeface(),
            size: textView.getTextSize()
        };
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

        style.registerHandler(style.backgroundInternalProperty, style.ignorePropertyHandler, "SearchBar");
    }

    private static _getSearchViewTextView(bar: android.widget.SearchView): android.widget.TextView {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_src_text", null, null);
        return <android.widget.TextView>bar.findViewById(id);
    }

    private static _changeSearchViewTextColor(bar: android.widget.SearchView, color: number) {
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        if (textView) {
            textView.setTextColor(color);
        }
    }

    private static _changeSearchViewPlateBackgroundColor(bar: android.widget.SearchView, color: number) {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_plate", null, null);
        var textView = <android.view.View>bar.findViewById(id);
        if (textView) {
            textView.setBackgroundColor(color);
        }
    }
}

SearchBarStyler.registerHandlers();
