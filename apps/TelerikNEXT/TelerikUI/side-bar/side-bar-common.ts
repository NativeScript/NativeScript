import definition = require("side-bar");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

export class SideBar extends view.View implements definition.SideBar {
    public static slideContentWidthProperty = new dependencyObservable.Property("slideContentWidth", "SideBar", new proxy.PropertyMetadata(280, dependencyObservable.PropertyMetadataSettings.AffectsLayout));

    public static slideContentProperty = new dependencyObservable.Property("slideContent", "SideBar", new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsLayout));
    public static mainContentProperty = new dependencyObservable.Property("mainContent", "SideBar", new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsLayout));

    get slideContentWidth(): number {
        return this._getValue(SideBar.slideContentWidthProperty);
    }
    set slideContentWidth(value: number) {
        this._setValue(SideBar.slideContentWidthProperty, value);
    }

    get slideContent(): view.View {
        return this._getValue(SideBar.slideContentProperty);
    }
    set slideContent(value: view.View) {
        this._setValue(SideBar.slideContentProperty, value);
    }

    get mainContent(): view.View {
        return this._getValue(SideBar.mainContentProperty);
    }
    set mainContent(value: view.View) {
        this._setValue(SideBar.mainContentProperty, value);
    }

    public openSlideContent(): void {
        //
    }

    public closeSlideContent(): void {
        //
    }

    get _childrenCount(): number {
        var count = 0;
        if (this.slideContent) {
            count++;
        }
        if (this.mainContent) {
            count++;
        }

        return count;
    }

    public _eachChildView(callback: (child: view.View) => boolean) {
        if (this.mainContent) {
            callback(this.mainContent);
        }

        if (this.slideContent) {
            callback(this.slideContent);
        }
    }
}