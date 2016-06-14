import definition = require("ui/search-bar");
import {View} from "ui/core/view";
import {Property, PropertyMetadataSettings} from "ui/core/dependency-observable";
import {PropertyMetadata} from "ui/core/proxy";
import {Color} from "color";
import {isAndroid} from "platform";

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
let AffectsLayout = isAndroid ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

export class SearchBar extends View implements definition.SearchBar {
    public static submitEvent = "submit";
    public static clearEvent = "clear";

    public static textFieldBackgroundColorProperty = new Property("textFieldBackgroundColor", "SearchBar", new PropertyMetadata(undefined));
    public static textFieldHintColorProperty = new Property("textFieldHintColor", "SearchBar", new PropertyMetadata(undefined));
    public static hintProperty = new Property("hint", "SearchBar", new PropertyMetadata(""));
    public static textProperty = new Property("text", "SearchBar", new PropertyMetadata("", AffectsLayout));

    get text(): string {
        return this._getValue(SearchBar.textProperty);
    }
    set text(value: string) {
        this._setValue(SearchBar.textProperty, value);
    }

    get hint(): string {
        return this._getValue(SearchBar.hintProperty);
    }
    set hint(value: string) {
        this._setValue(SearchBar.hintProperty, value);
    }

    get textFieldBackgroundColor(): Color {
        return this._getValue(SearchBar.textFieldBackgroundColorProperty);
    }
    set textFieldBackgroundColor(value: Color) {
        this._setValue(SearchBar.textFieldBackgroundColorProperty,
            value instanceof Color ? value : new Color(<any>value));
    }

    get textFieldHintColor(): Color {
        return this._getValue(SearchBar.textFieldHintColorProperty);
    }
    set textFieldHintColor(value: Color) {
        this._setValue(SearchBar.textFieldHintColorProperty,
            value instanceof Color ? value : new Color(<any>value));
    }

    public dismissSoftInput() {
        //
    }
} 