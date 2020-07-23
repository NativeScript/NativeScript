import { SearchBar as SearchBarDefinition } from '.';
import { View, CSSType } from '../core/view';
import { Property } from '../core/properties';
import { Color } from '../../color';

@CSSType('SearchBar')
export abstract class SearchBarBase extends View implements SearchBarDefinition {
	public static submitEvent = 'submit';
	public static clearEvent = 'clear';
	public text: string;
	public hint: string;
	public textFieldBackgroundColor: Color;
	public textFieldHintColor: Color;

	public abstract dismissSoftInput();
}

SearchBarBase.prototype.recycleNativeView = 'auto';

export const textProperty = new Property<SearchBarBase, string>({
	name: 'text',
	defaultValue: '',
	affectsLayout: global.isIOS,
});
textProperty.register(SearchBarBase);

export const hintProperty = new Property<SearchBarBase, string>({
	name: 'hint',
	defaultValue: '',
});
hintProperty.register(SearchBarBase);

export const textFieldHintColorProperty = new Property<SearchBarBase, Color>({
	name: 'textFieldHintColor',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
textFieldHintColorProperty.register(SearchBarBase);

export const textFieldBackgroundColorProperty = new Property<SearchBarBase, Color>({
	name: 'textFieldBackgroundColor',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
textFieldBackgroundColorProperty.register(SearchBarBase);
