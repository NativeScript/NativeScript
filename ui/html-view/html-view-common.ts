import definition = require("ui/html-view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");

export class HtmlView extends view.View implements definition.HtmlView {
    public static htmlProperty = new dependencyObservable.Property(
        "html",
        "HtmlView",
        new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.AffectsLayout)
        );

    constructor(options?: definition.Options) {
        super(options);
    }

    get html(): string {
        return this._getValue(HtmlView.htmlProperty);
    }
    set html(value: string) {
        this._setValue(HtmlView.htmlProperty, value);
    }
}