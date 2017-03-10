import { SearchBar } from "tns-core-modules/ui/search-bar";
import { Color } from "tns-core-modules/color";
import { getColor } from "../helper";

export function getNativeHintColor(searchBar: SearchBar): Color {
    return (<any>searchBar)._placeholderLabel ? getColor((<any>searchBar)._placeholderLabel.textColor) : undefined; 
}
export function getNativeFontSize(searchBar: SearchBar): number {
    return (<any>searchBar)._textField ? (<any>searchBar)._textField.font.pointSize : undefined;
}
