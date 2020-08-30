import { SearchBar } from '@nativescript/core/ui/search-bar';
import { Color } from '@nativescript/core/color';
import { getColor } from '../../ui-helper';

export function getNativeHintColor(searchBar: SearchBar): Color {
	if ((<any>searchBar)._textField) {
		const placeholder = (<any>searchBar)._textField.valueForKey('placeholderLabel');

		return getColor(placeholder.textColor);
	}

	return undefined;
}

export function getNativeTextFieldBackgroundColor(searchBar: SearchBar): Color {
	return (<any>searchBar)._textField ? getColor((<any>searchBar)._textField.backgroundColor) : undefined;
}

export function getNativeFontSize(searchBar: SearchBar): number {
	return (<any>searchBar)._textField ? (<any>searchBar)._textField.font.pointSize : undefined;
}
