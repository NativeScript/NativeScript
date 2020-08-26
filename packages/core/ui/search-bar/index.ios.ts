import { Font } from '../styling/font';
import { SearchBarBase, textProperty, hintProperty, textFieldHintColorProperty, textFieldBackgroundColorProperty } from './search-bar-common';
import { isEnabledProperty } from '../core/view';
import { Color } from '../../color';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty, fontInternalProperty } from '../styling/style-properties';
import { iOSNativeHelper } from '../../utils';

export * from './search-bar-common';

const majorVersion = iOSNativeHelper.MajorVersion;

@NativeClass
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
		if (searchText === '') {
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

@NativeClass
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
	nativeViewProtected: UISearchBar;
	private _delegate;
	private __textField: UITextField;

	createNativeView() {
		return UISearchBarImpl.new();
	}

	initNativeView() {
		super.initNativeView();
		this._delegate = UISearchBarDelegateImpl.initWithOwner(new WeakRef(this));
	}

	disposeNativeView() {
		this._delegate = null;
		super.disposeNativeView();
	}

	public onLoaded() {
		super.onLoaded();
		this.ios.delegate = this._delegate;
	}

	public onUnloaded() {
		this.ios.delegate = null;
		super.onUnloaded();
	}

	public dismissSoftInput() {
		(<UIResponder>this.ios).resignFirstResponder();
	}

	get ios(): UISearchBar {
		return this.nativeViewProtected;
	}

	get _textField(): UITextField {
		if (!this.__textField) {
			this.__textField = this.ios.valueForKey('searchField');
		}

		return this.__textField;
	}

	[isEnabledProperty.setNative](value: boolean) {
		const nativeView = this.nativeViewProtected;
		if (nativeView instanceof UIControl) {
			nativeView.enabled = value;
		}

		const textField = this._textField;
		if (textField) {
			textField.enabled = value;
		}
	}

	[backgroundColorProperty.getDefault](): UIColor {
		return this.ios.barTintColor;
	}
	[backgroundColorProperty.setNative](value: UIColor | Color) {
		let color: UIColor = value instanceof Color ? value.ios : value;
		this.ios.barTintColor = color;
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
		return '';
	}
	[textProperty.setNative](value: string) {
		const text = value === null || value === undefined ? '' : value.toString();
		this.ios.text = text;
	}

	[hintProperty.getDefault](): string {
		return '';
	}
	[hintProperty.setNative](value: string) {
		this._updateAttributedPlaceholder();
	}

	[textFieldBackgroundColorProperty.getDefault](): UIColor {
		const textField = this._textField;
		if (textField) {
			return textField.backgroundColor;
		}

		return null;
	}
	[textFieldBackgroundColorProperty.setNative](value: Color | UIColor) {
		const color = value instanceof Color ? value.ios : value;
		const textField = this._textField;
		if (textField) {
			textField.backgroundColor = color;
		}
	}

	[textFieldHintColorProperty.getDefault](): UIColor {
		return null;
	}
	[textFieldHintColorProperty.setNative](value: Color | UIColor) {
		this._updateAttributedPlaceholder();
	}

	// Very similar to text-field.ios.ts implementation. Maybe unify APIs and base classes?
	_updateAttributedPlaceholder(): void {
		let stringValue = this.hint;
		if (stringValue === null || stringValue === void 0) {
			stringValue = '';
		} else {
			stringValue = stringValue + '';
		}
		if (stringValue === '') {
			// we do not use empty string since initWithStringAttributes does not return proper value and
			// nativeView.attributedPlaceholder will be null
			stringValue = ' ';
		}
		const attributes: any = {};
		if (this.textFieldHintColor) {
			attributes[NSForegroundColorAttributeName] = this.textFieldHintColor.ios;
		}
		const attributedPlaceholder = NSAttributedString.alloc().initWithStringAttributes(stringValue, attributes);
		this._textField.attributedPlaceholder = attributedPlaceholder;
	}
}
