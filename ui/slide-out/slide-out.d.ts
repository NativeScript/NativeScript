//@private
/**
 * 
 */
declare module "ui/slide-out" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    export var slideContentWidthProperty: dependencyObservable.Property;
    export var optionsProperty: dependencyObservable.Property;

    export class SlideOutControl extends view.View {
        android: android.support.v4.widget.DrawerLayout;
        ios: UIViewController;

        slideContent: view.View;
        mainContent: view.View;

        slideContentWidth: number;
        options: Options;

        openSlideContent(): void;
        closeSlideContent(): void;

        //@private
        _attachSlideContent(): void;
        _attachMainContent(): void;
        _detachSlideContent(): void;
        _detachMainContent(): void;
        //@endprivate
    }

    export interface Options {
        android: AndroidOptions;
    }

    export interface AndroidOptions {
        toggleImageResourceId: number;
        openDescriptionResourceId: number;
        closeDescriptionResourceId: number;
    }
} 