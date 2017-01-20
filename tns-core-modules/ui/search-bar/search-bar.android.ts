import {
    SearchBarBase, Font, Color, colorProperty, backgroundColorProperty, backgroundInternalProperty, fontInternalProperty,
    textProperty, hintProperty, textFieldHintColorProperty, textFieldBackgroundColorProperty, fontSizeProperty
} from "./search-bar-common";
import { ad } from "utils/utils";

export * from "./search-bar-common";

const SEARCHTEXT = Symbol("searchText");
const QUERY = Symbol("query");

@Interfaces([android.widget.SearchView.OnQueryTextListener])
class QueryTextListener extends java.lang.Object implements android.widget.SearchView.OnQueryTextListener {
    constructor(private owner: WeakRef<SearchBar>) {
        super();
        return global.__native(this);
    }

    onQueryTextChange(newText: string): boolean {
        let owner = this.owner.get();
        if (owner) {
            textProperty.nativeValueChange(owner, newText);

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
class CloseListener extends java.lang.Object implements android.widget.SearchView.OnCloseListener {
    constructor(private owner: WeakRef<SearchBar>) {
        super();
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

    public _createNativeView() {
        this._android = new android.widget.SearchView(this._context);

        this._android.setIconified(false);

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
        let result = this._android.getDrawingCacheBackgroundColor();
        return result;
    }
    set [backgroundColorProperty.native](value: Color) {
        let color: number;
        if (typeof value === "number") {
            color = value;
        } else {
            color = value.android;
        }

        this._android.setBackgroundColor(color);
        let searchPlate = this._getSearchPlate();
        searchPlate.setBackgroundColor(color);
    }

    get [colorProperty.native](): number {
        let textView = this._getTextView();
        return textView.getCurrentTextColor();
    }
    set [colorProperty.native](value: Color) {
        let color: number;
        if (typeof value === "number") {
            color = value;
        } else {
            color = value.android;
        }

        let textView = this._getTextView();
        textView.setTextColor(color);
    }

    get [fontSizeProperty.native](): { nativeSize: number } {
        return { nativeSize: this._getTextView().getTextSize() };
    }
    set [fontSizeProperty.native](value: number | { nativeSize: number }) {
        if (typeof value === "number") {
            this._getTextView().setTextSize(value);
        } else {
            this._getTextView().setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
        }
    }

    get [fontInternalProperty.native](): android.graphics.Typeface {
        return this._getTextView().getTypeface();
    }
    set [fontInternalProperty.native](value: Font | android.graphics.Typeface) {
        this._getTextView().setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
    }

    get [backgroundInternalProperty.native](): any {
        return null;
    }
    set [backgroundInternalProperty.native](value: any) {
        //
    }

    get [textProperty.native](): string {
        return "";
    }
    set [textProperty.native](value: string) {
        const text = (value === null || value === undefined) ? '' : value.toString();
        this._android.setQuery(text, false);
    }
    get [hintProperty.native](): string {
        return "";
    }
    set [hintProperty.native](value: string) {
        const text = (value === null || value === undefined) ? '' : value.toString();
        this._android.setQueryHint(text);
    }
    get [textFieldBackgroundColorProperty.native](): number {
        let textView = this._getTextView();
        return textView.getCurrentTextColor();
    }
    set [textFieldBackgroundColorProperty.native](value: Color) {
        let textView = this._getTextView();
        let color = value instanceof Color ? value.android : value;
        textView.setBackgroundColor(color);
    }
    get [textFieldHintColorProperty.native](): number {
        let textView = this._getTextView();
        return textView.getCurrentTextColor();
    }
    set [textFieldHintColorProperty.native](value: Color) {
        let textView = this._getTextView();
        let color = value instanceof Color ? value.android : value;
        textView.setHintTextColor(color);
    }

    private _getTextView(): android.widget.TextView {
        let id = this._android.getContext().getResources().getIdentifier("android:id/search_src_text", null, null);
        return <android.widget.TextView>this._android.findViewById(id);
    }

    private _getSearchPlate(): android.widget.LinearLayout {
        let id = this._android.getContext().getResources().getIdentifier("android:id/search_plate", null, null);
        return <android.widget.LinearLayout>this._android.findViewById(id);
    }
}