import { Font } from '../styling/font';
import { SearchBarBase, textProperty, hintProperty, textFieldHintColorProperty, textFieldBackgroundColorProperty } from './search-bar-common';
import { isUserInteractionEnabledProperty, isEnabledProperty } from '../core/view';
import { ad } from '../../utils';
import { Color } from '../../color';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty, fontInternalProperty, fontSizeProperty } from '../styling/style-properties';

export * from './search-bar-common';

const SEARCHTEXT = Symbol('searchText');
const QUERY = Symbol('query');

interface QueryTextListener {
	new (owner: SearchBar): androidx.appcompat.widget.SearchView.OnQueryTextListener;
}

interface CloseListener {
	new (owner: SearchBar): androidx.appcompat.widget.SearchView.OnCloseListener;
}

let QueryTextListener: QueryTextListener;
let CloseListener: CloseListener;

function initializeNativeClasses(): void {
	if (QueryTextListener) {
		return;
	}

	@NativeClass
	@Interfaces([androidx.appcompat.widget.SearchView.OnQueryTextListener])
	class CompatQueryTextListenerImpl extends java.lang.Object implements androidx.appcompat.widget.SearchView.OnQueryTextListener {
		constructor(private owner: SearchBar) {
			super();

			return global.__native(this);
		}

		onQueryTextChange(newText: string): boolean {
			const owner = this.owner;
			textProperty.nativeValueChange(owner, newText);

			// This code is needed since sometimes OnCloseListener is not called!
			if (newText === '' && this[SEARCHTEXT] !== newText) {
				owner._emit(SearchBarBase.clearEvent);
			}

			this[SEARCHTEXT] = newText;
			this[QUERY] = undefined;

			return true;
		}

		onQueryTextSubmit(query: string): boolean {
			const owner = this.owner;
			// This code is needed since onQueryTextSubmit is called twice with same query!
			if (query !== '' && this[QUERY] !== query) {
				owner._emit(SearchBarBase.submitEvent);
			}

			this[QUERY] = query;

			return true;
		}
	}

	@NativeClass
	@Interfaces([androidx.appcompat.widget.SearchView.OnCloseListener])
	class CompatCloseListenerImpl extends java.lang.Object implements androidx.appcompat.widget.SearchView.OnCloseListener {
		constructor(private owner: SearchBar) {
			super();

			return global.__native(this);
		}

		onClose(): boolean {
			this.owner._emit(SearchBarBase.clearEvent);

			return true;
		}
	}

	QueryTextListener = CompatQueryTextListenerImpl;
	CloseListener = CompatCloseListenerImpl;
}

function enableSearchView(nativeView: any, value: boolean) {
	nativeView.setEnabled(value);

	if (!(nativeView instanceof android.view.ViewGroup)) {
		return;
	}

	for (let i = 0; i < nativeView.getChildCount(); i++) {
		let child = nativeView.getChildAt(i);
		enableSearchView(child, value);
	}
}

function enableUserInteractionSearchView(nativeView: any, value: boolean) {
	nativeView.setClickable(value);
	nativeView.setFocusable(value);

	if (!(nativeView instanceof android.view.ViewGroup)) {
		return;
	}

	for (let i = 0; i < nativeView.getChildCount(); i++) {
		let child = nativeView.getChildAt(i);
		enableUserInteractionSearchView(child, value);
	}
}

export class SearchBar extends SearchBarBase {
	nativeViewProtected: androidx.appcompat.widget.SearchView;
	private _searchTextView: android.widget.TextView;
	private _searchPlate: android.widget.LinearLayout;

	public dismissSoftInput() {
		ad.dismissSoftInput(this.nativeViewProtected);
	}

	public focus(): boolean {
		let result = super.focus();
		if (result) {
			ad.showSoftInput(this.nativeViewProtected);
		}

		return result;
	}

	public createNativeView() {
		const nativeView = new androidx.appcompat.widget.SearchView(this._context);
		nativeView.setIconified(false);

		return nativeView;
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		initializeNativeClasses();
		const queryTextListener = new QueryTextListener(this);
		nativeView.setOnQueryTextListener(queryTextListener);
		(<any>nativeView).queryTextListener = queryTextListener;

		const closeListener = new CloseListener(this);
		nativeView.setOnCloseListener(closeListener);
		(<any>nativeView).closeListener = closeListener;
	}

	public disposeNativeView() {
		const nativeView: any = this.nativeViewProtected;
		nativeView.closeListener.owner = null;
		nativeView.queryTextListener.owner = null;
		this._searchPlate = null;
		this._searchTextView = null;
		super.disposeNativeView();
	}

	[isEnabledProperty.setNative](value: boolean) {
		enableSearchView(this.nativeViewProtected, value);
	}

	[isUserInteractionEnabledProperty.setNative](value: boolean) {
		enableUserInteractionSearchView(this.nativeViewProtected, value);
	}

	[backgroundColorProperty.getDefault](): number {
		// TODO: Why do we get DrawingCacheBackgroundColor but set backgroundColor?????
		const result = this.nativeViewProtected.getDrawingCacheBackgroundColor();

		return result;
	}
	[backgroundColorProperty.setNative](value: Color) {
		let color: number;
		if (typeof value === 'number') {
			color = value;
		} else {
			color = value.android;
		}

		this.nativeViewProtected.setBackgroundColor(color);
		const searchPlate = this._getSearchPlate();
		searchPlate.setBackgroundColor(color);
	}

	[colorProperty.getDefault](): number {
		const textView = this._getTextView();

		return textView.getCurrentTextColor();
	}
	[colorProperty.setNative](value: Color) {
		const color: number = typeof value === 'number' ? value : value.android;
		const textView = this._getTextView();
		textView.setTextColor(color);
	}

	[fontSizeProperty.getDefault](): { nativeSize: number } {
		return { nativeSize: this._getTextView().getTextSize() };
	}
	[fontSizeProperty.setNative](value: number | { nativeSize: number }) {
		if (typeof value === 'number') {
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
		return '';
	}
	[textProperty.setNative](value: string) {
		const text = value === null || value === undefined ? '' : value.toString();
		this.nativeViewProtected.setQuery(text, false);
	}
	[hintProperty.getDefault](): string {
		return null;
	}
	[hintProperty.setNative](value: string) {
		if (value === null || value === undefined) {
			this.nativeViewProtected.setQueryHint(null);
		} else {
			this.nativeViewProtected.setQueryHint(value.toString());
		}
	}
	[textFieldBackgroundColorProperty.getDefault](): android.graphics.drawable.Drawable {
		const textView = this._getTextView();

		return textView.getBackground();
	}
	[textFieldBackgroundColorProperty.setNative](value: Color) {
		const textView = this._getTextView();
		if (value instanceof Color) {
			textView.setBackgroundColor(value.android);
		} else {
			textView.setBackground(value);
		}
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
		if (!this._searchTextView) {
			const pkgName = this.nativeViewProtected.getContext().getPackageName();
			const id = this.nativeViewProtected.getContext().getResources().getIdentifier('search_src_text', 'id', pkgName);
			this._searchTextView = <android.widget.TextView>this.nativeViewProtected.findViewById(id);
		}

		return this._searchTextView;
	}

	private _getSearchPlate(): android.widget.LinearLayout {
		if (!this._searchPlate) {
			const pkgName = this.nativeViewProtected.getContext().getPackageName();
			const id = this.nativeViewProtected.getContext().getResources().getIdentifier('search_plate', 'id', pkgName);
			this._searchPlate = <android.widget.LinearLayout>this.nativeViewProtected.findViewById(id);
		}

		return this._searchPlate;
	}
}
