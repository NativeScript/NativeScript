import { Font } from "../styling/font";
import {
    SearchBarBase, Color, colorProperty, backgroundColorProperty, backgroundInternalProperty, fontInternalProperty,
    textProperty, hintProperty, textFieldHintColorProperty, textFieldBackgroundColorProperty, fontSizeProperty
} from "./search-bar-common";
import { ad } from "../../utils/utils";

export * from "./search-bar-common";

const SEARCHTEXT = Symbol("searchText");
const QUERY = Symbol("query");

interface QueryTextListener {
    new (owner: SearchBar): android.widget.SearchView.OnQueryTextListener;
}

interface CloseListener {
    new (owner: SearchBar): android.widget.SearchView.OnCloseListener;
}

let QueryTextListener: QueryTextListener;
let CloseListener: CloseListener;

function initializeNativeClasses(): void {
    if (QueryTextListener) {
        return;
    }

    @Interfaces([android.widget.SearchView.OnQueryTextListener])
    class QueryTextListenerImpl extends java.lang.Object implements android.widget.SearchView.OnQueryTextListener {
        constructor(private owner: SearchBar) {
            super();
            return global.__native(this);
        }

        onQueryTextChange(newText: string): boolean {
            const owner = this.owner;
            textProperty.nativeValueChange(owner, newText);

            // This code is needed since sometimes OnCloseListener is not called!
            if (newText === "" && this[SEARCHTEXT] !== newText) {
                owner._emit(SearchBarBase.clearEvent);
            }

            this[SEARCHTEXT] = newText;
            return true;
        }

        onQueryTextSubmit(query: string): boolean {
            const owner = this.owner;
            // This code is needed since onQueryTextSubmit is called twice with same query!
            if (query !== "" && this[QUERY] !== query) {
                owner._emit(SearchBarBase.submitEvent);
            }

            this[QUERY] = query;
            return true;
        }
    }

    @Interfaces([android.widget.SearchView.OnCloseListener])
    class CloseListenerImpl extends java.lang.Object implements android.widget.SearchView.OnCloseListener {
        constructor(private owner: SearchBar) {
            super();
            return global.__native(this);
        }

        onClose(): boolean {
            this.owner._emit(SearchBarBase.clearEvent);
            return true;
        }
    }

    QueryTextListener = QueryTextListenerImpl;
    CloseListener = CloseListenerImpl;
}

export class SearchBar extends SearchBarBase {
    nativeView: android.widget.SearchView;

    public dismissSoftInput() {
        ad.dismissSoftInput(this.nativeView);
    }

    public focus(): boolean {
        let result = super.focus();
        if (result) {
            ad.showSoftInput(this.nativeView);
        }

        return result;
    }

    public createNativeView() {
        initializeNativeClasses();
        const nativeView = new android.widget.SearchView(this._context);
        nativeView.setIconified(false);

        const queryTextListener = new QueryTextListener(this);
        nativeView.setOnQueryTextListener(queryTextListener);
        (<any>nativeView).queryTextListener = queryTextListener;

        const closeListener = new CloseListener(this);
        nativeView.setOnCloseListener(closeListener);
        (<any>nativeView).closeListener = closeListener;

        return nativeView;
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView: any = this.nativeView;
        nativeView.closeListener.owner = this;
        nativeView.queryTextListener.owner = this;
    }

    public disposeNativeView() {
        const nativeView: any = this.nativeView;
        nativeView.closeListener.owner = null;
        nativeView.queryTextListener.owner = null;
        super.disposeNativeView();
    }

    [backgroundColorProperty.getDefault](): number {
        // TODO: Why do we get DrawingCacheBackgroundColor but set backgroundColor?????
        const result = this.nativeView.getDrawingCacheBackgroundColor();
        return result;
    }
    [backgroundColorProperty.setNative](value: Color) {
        let color: number;
        if (typeof value === "number") {
            color = value;
        } else {
            color = value.android;
        }

        this.nativeView.setBackgroundColor(color);
        const searchPlate = this._getSearchPlate();
        searchPlate.setBackgroundColor(color);
    }

    [colorProperty.getDefault](): number {
        const textView = this._getTextView();
        return textView.getCurrentTextColor();
    }
    [colorProperty.setNative](value: Color) {
        const color: number = (typeof value === "number") ? value : value.android;
        const textView = this._getTextView();
        textView.setTextColor(color);
    }

    [fontSizeProperty.getDefault](): { nativeSize: number } {
        return { nativeSize: this._getTextView().getTextSize() };
    }
    [fontSizeProperty.setNative](value: number | { nativeSize: number }) {
        if (typeof value === "number") {
            this._getTextView().setTextSize(value);
        } else {
            this._getTextView().setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
        }
    }

    [fontInternalProperty.getDefault](): android.graphics.Typeface {
        return this._getTextView().getTypeface();
    }
    [fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
        this._getTextView().setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
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
        const text = (value === null || value === undefined) ? '' : value.toString();
        this.nativeView.setQuery(text, false);
    }
    [hintProperty.getDefault](): string {
        return "";
    }
    [hintProperty.setNative](value: string) {
        const text = (value === null || value === undefined) ? '' : value.toString();
        this.nativeView.setQueryHint(text);
    }
    [textFieldBackgroundColorProperty.getDefault](): number {
        const textView = this._getTextView();
        return textView.getCurrentTextColor();
    }
    [textFieldBackgroundColorProperty.setNative](value: Color) {
        const textView = this._getTextView();
        const color = value instanceof Color ? value.android : value;
        textView.setBackgroundColor(color);
    }
    [textFieldHintColorProperty.getDefault](): number {
        const textView = this._getTextView();
        return textView.getCurrentTextColor();
    }
    [textFieldHintColorProperty.setNative](value: Color) {
        const textView = this._getTextView();
        const color = value instanceof Color ? value.android : value;
        textView.setHintTextColor(color);
    }

    private _getTextView(): android.widget.TextView {
        const id = this.nativeView.getContext().getResources().getIdentifier("android:id/search_src_text", null, null);
        return <android.widget.TextView>this.nativeView.findViewById(id);
    }

    private _getSearchPlate(): android.widget.LinearLayout {
        const id = this.nativeView.getContext().getResources().getIdentifier("android:id/search_plate", null, null);
        return <android.widget.LinearLayout>this.nativeView.findViewById(id);
    }
}
