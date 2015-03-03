import definition = require("ui/search-bar");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

export module knownEvents {
    export var submit = "submit";
    export var clear = "clear";
}

export class SearchBar extends view.View implements definition.SearchBar {

    public static textProperty = new dependencyObservable.Property(
        "text",
        "SearchBar",
        new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataSettings.AffectsLayout)
        );

    get text(): string {
        return this._getValue(SearchBar.textProperty);
    }
    set text(value: string) {
        this._setValue(SearchBar.textProperty, value);
    }
} 