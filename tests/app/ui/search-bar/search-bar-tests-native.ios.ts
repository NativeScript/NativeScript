import { SearchBar } from "ui/search-bar";
import { Color } from "color";
import * as utils from "utils/utils";

export function getNativeHintColor(searchBar: SearchBar): Color {
    return (<any>searchBar)._placeholderLabel ? utils.ios.getColor((<any>searchBar)._placeholderLabel.textColor) : undefined; 
}
export function getNativeFontSize(searchBar: SearchBar): number {
    return (<any>searchBar)._textField ? (<any>searchBar)._textField.font.pointSize : undefined;
}
