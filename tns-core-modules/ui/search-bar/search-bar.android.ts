import {
    SearchBarBase, Font, Color, colorProperty, backgroundColorProperty, backgroundInternalProperty, fontInternalProperty,
    textProperty, hintProperty, textFieldHintColorProperty, textFieldBackgroundColorProperty
} from "./search-bar-common";
import { ad } from "utils/utils";

export * from "./search-bar-common";

const SEARCHTEXT = Symbol("searchText");
const QUERY = Symbol("query");

@Interfaces([android.widget.SearchView.OnQueryTextListener])
class QueryTextListener implements android.widget.SearchView.OnQueryTextListener {
    constructor(private owner: WeakRef<SearchBar>) {
        return global.__native(this);
    }

    onQueryTextChange(newText: string): boolean {
        let owner = this.owner.get();
        if (owner) {
            owner.nativePropertyChanged(textProperty, newText);

            // This code is needed since sometimes OnCloseListener is not called!
            if (newText === "" && this[SEARCHTEXT] !== newText) {
                owner._emit(SearchBarBase.clearEvent);
            }

            this[SEARCHTEXT] = newText;
        }
        return true;
    }

    onQueryTextSubmit(query: string): boolean {
        let owner = this.owner.get();
        if (owner) {
            // This code is needed since onQueryTextSubmit is called twice with same query!
            if (query !== "" && this[QUERY] !== query) {
                owner._emit(SearchBarBase.submitEvent);
            }
            this[QUERY] = query;
        }
        return true;
    }
}

@Interfaces([android.widget.SearchView.OnCloseListener])
class CloseListener implements android.widget.SearchView.OnCloseListener {
    constructor(private owner: WeakRef<SearchBar>) {
        return global.__native(this);
    }

    onClose(): boolean {
        let owner = this.owner.get();
        if (owner) {
            owner._emit(SearchBarBase.clearEvent);
        }
        return true;
    }
}

export class SearchBar extends SearchBarBase {
    private _android: android.widget.SearchView;
    private _closeListener: android.widget.SearchView.OnCloseListener;
    private _queryTextListener: android.widget.SearchView.OnQueryTextListener;

    public dismissSoftInput() {
        ad.dismissSoftInput(this._nativeView);
    }

    public focus(): boolean {
        let result = super.focus();
        if (result) {
            ad.showSoftInput(this._nativeView);
        }

        return result;
    }

    public _createUI() {
        this._android = new android.widget.SearchView(this._context);

        this._android.setIconified(false);

        var that = new WeakRef(this);
        this._queryTextListener = this._queryTextListener || new QueryTextListener(new WeakRef(this));
        this._android.setOnQueryTextListener(this._queryTextListener);

        this._closeListener = this._closeListener || new CloseListener(new WeakRef(this));
        this._android.setOnCloseListener(this._closeListener);
    }

    get android(): android.widget.SearchView {
        return this._android;
    }

    get [backgroundColorProperty.native](): number {
        // TODO: Why do we get DrawingCacheBackgroundColor but set backgroundColor?????
        return this._android.getDrawingCacheBackgroundColor();
    }
    set [backgroundColorProperty.native](value: Color) {
        let color: number;
        if (typeof value === "number") {
            color = value;
        } else {
            color = value.android;
        }

        this._android.setBackgroundColor(color);
        changeSearchViewPlateBackgroundColor(this._android, color);
    }

    get [colorProperty.native](): number {
        let textView = getSearchViewTextView(this._android);
        if (textView) {
            return textView.getCurrentTextColor();
        }

        throw new Error("TextView not founf in android.widget.SearchView.");
    }
    set [colorProperty.native](value: Color) {
        let color: number;
        if (typeof value === "number") {
            color = value;
        } else {
            color = value.android;
        }

        let textView = getSearchViewTextView(this._android);
        if (textView) {
            textView.setTextColor(color);
        }
    }

    get [fontInternalProperty.native](): { typeface: android.graphics.Typeface, fontSize: number } {
        let textView = getSearchViewTextView(this._android);
        return {
            typeface: textView.getTypeface(),
            fontSize: textView.getTextSize()
        };
    }
    set [fontInternalProperty.native](value: Font | { typeface: android.graphics.Typeface, fontSize: number }) {
        let textView = getSearchViewTextView(this._android);

        let typeface: android.graphics.Typeface;
        let fontSize: number;
        if (value instanceof Font) {
            typeface = value.getAndroidTypeface();
            textView.setTextSize(value.fontSize);
        } else {
            typeface = value.typeface;
            textView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.fontSize);
        }

        textView.setTypeface(typeface);
    }

    get [backgroundInternalProperty.native](): Font {
        return null;
    }
    set [backgroundInternalProperty.native](value: Font) {
        //
    }

    get [textProperty.native](): string {
        return "";
    }
    set [textProperty.native](value: string) {
        this._android.setQuery(value, false);
    }
    get [hintProperty.native](): string {
        return "";
    }
    set [hintProperty.native](value: string) {
        this._android.setQueryHint(value);
    }
    get [textFieldBackgroundColorProperty.native](): number {
        let textView = getTextView(this._android);
        return textView.getCurrentTextColor();
    }
    set [textFieldBackgroundColorProperty.native](value: Color) {
        let textView = getTextView(this._android);
        let color = value instanceof Color ? value.android : value;
        textView.setBackgroundColor(color);
    }
    get [textFieldHintColorProperty.native](): number {
        let textView = getTextView(this._android);
        return textView.getCurrentTextColor();
    }
    set [textFieldHintColorProperty.native](value: Color) {
        let textView = getTextView(this._android);
        let color = value instanceof Color ? value.android : value;
        textView.setHintTextColor(color);
    }
}

function changeSearchViewPlateBackgroundColor(searchView: android.widget.SearchView, color: number) {
    let textView = getSearchViewTextView(searchView);
    if (textView) {
        textView.setBackgroundColor(color);
    }
}

function getSearchViewTextView(searchView: android.widget.SearchView): android.widget.TextView {
    let id = searchView.getContext().getResources().getIdentifier("android:id/search_plate", null, null);
    return <android.widget.TextView>searchView.findViewById(id);
}

function getTextView(bar: android.widget.SearchView): android.widget.TextView {
    if (bar) {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_src_text", null, null);
        if (id) {
            return <android.widget.TextView>bar.findViewById(id);
        }
    }

    return undefined;
}