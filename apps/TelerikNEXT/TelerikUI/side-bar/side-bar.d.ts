/**
 * 
 */
declare module "side-bar" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    export class SideBar extends view.View {
        android: any;
        ios: any;

        slideContentWidth: number;

        slideContent: view.View;
        mainContent: view.View;

        openSlideContent(): void;
        closeSlideContent(): void;

        public static slideContentProperty: dependencyObservable.Property;
        public static mainContentProperty: dependencyObservable.Property;
   }
} 