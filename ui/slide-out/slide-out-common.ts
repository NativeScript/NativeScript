import definition = require("ui/slide-out");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onSlideContentWidthPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var slideOut = <SlideOutControl>data.object;
    slideOut._onSlideWidthChanged();
}

function onOptionsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var slideOut = <SlideOutControl>data.object;
    slideOut._onOptionsChanged();
}

export var slideContentWidthProperty = new dependencyObservable.Property(
    "slideContentWidth",
    "SlideOutControl",
    new proxy.PropertyMetadata(
        240,
        dependencyObservable.PropertyMetadataSettings.None,
        onSlideContentWidthPropertyChanged
        )
    );

export var optionsProperty = new dependencyObservable.Property(
    "options",
    "SlideOutControl",
    new proxy.PropertyMetadata(
        undefined,
        dependencyObservable.PropertyMetadataSettings.None,
        onOptionsPropertyChanged
        )
    );

export class SlideOutControl extends view.View implements definition.SlideOutControl {
    private _slideContent: view.View;
    private _mainContent: view.View;

    get options(): definition.Options {
        return this._getValue(optionsProperty);
    }
    set options(value: definition.Options) {
        this._setValue(optionsProperty, value);
    }

    get slideContentWidth(): number {
        return this._getValue(slideContentWidthProperty);
    }
    set slideContentWidth(value: number) {
        this._setValue(slideContentWidthProperty, value);
    }

    get slideContent(): view.View {
        return this._slideContent;
    }
    set slideContent(value: view.View) {
        if (this._slideContent === value) {
            return;
        }

        if (this._slideContent) {
            this._detachSlideContent();
        }

        this._slideContent = value;

        if (this._slideContent) {
            this._attachSlideContent();
        }
    }

    get mainContent(): view.View {
        return this._mainContent;
    }
    set mainContent(value: view.View) {
        if (this._mainContent === value) {
            return;
        }

        if (this._mainContent) {
            this._detachMainContent();
        }

        this._mainContent = value;

        if (this._mainContent) {
            this._attachMainContent();
        }
    }

    public openSlideContent(): void {
        //
    }

    public closeSlideContent(): void {
        //
    }

    get _childrenCount(): number {
        var count = 0;
        if (this._slideContent) {
            count++;
        }
        if (this._mainContent) {
            count++;
        }

        return count;
    }

    public _eachChildView(callback: (child: view.View) => boolean) {
        var res: boolean;
        if (this._slideContent) {
            res = callback(this._slideContent);
        }
        if (res && this._mainContent) {
            callback(this._mainContent);
        }
    }

    public _attachSlideContent() {
        this._slideContent.width = this.slideContentWidth;
        this._addView(this._slideContent);
    }

    public _detachSlideContent() {
        this._removeView(this._slideContent);
    }

    public _attachMainContent() {
        this._addView(this._mainContent);
    }

    public _detachMainContent() {
        this._removeView(this._mainContent);
    }

    public _onSlideWidthChanged() {
        //
    }

    public _onOptionsChanged() {
        //
    }

    //public _arrangeOverride(finalSize: geometry.Size): void {
    //    if (this.slideContent) {
    //        this.slideContent.arrange(new geometry.Rect(0, 0, this.slideContentWidth, finalSize.height));
    //    }

    //    if (this.mainContent) {
    //        this.mainContent.arrange(new geometry.Rect(0, 0, finalSize.width, finalSize.height));
    //    }
    //}
}