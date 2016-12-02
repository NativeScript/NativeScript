import { SearchBar as SearchBarDefinition } from "ui/search-bar";
import { View } from "ui/core/view";
import { Property } from "ui/core/properties";
import { Color } from "color";
import { isIOS } from "platform";

export abstract class SearchBarBase extends View implements SearchBarDefinition {
    public static submitEvent = "submit";
    public static clearEvent = "clear";
    public text: string;
    public hint: string;
    public textFieldBackgroundColor: Color;
    public textFieldHintColor: Color;

    public abstract dismissSoftInput();
}

export const textProperty = new Property<SearchBarBase, string>({ name: "text", defaultValue: "", affectsLayout: isIOS });
textProperty.register(SearchBarBase);

export const hintProperty = new Property<SearchBarBase, string>({ name: "hint", defaultValue: "" });
hintProperty.register(SearchBarBase);

export const textFieldHintColorProperty = new Property<SearchBarBase, Color>({ name: "textFieldHintColor", valueConverter: (v) => new Color(v) });
textFieldHintColorProperty.register(SearchBarBase);

export const textFieldBackgroundColorProperty = new Property<SearchBarBase, Color>({ name: "textFieldBackgroundColor", valueConverter: (v) => new Color(v) });
textFieldBackgroundColorProperty.register(SearchBarBase);