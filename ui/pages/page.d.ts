declare module "ui/pages" {
    import view = require("ui/core/view");
    import frame = require("ui/frame");

    export class Page extends view.View {
        contentView: view.View;
        android: AndroidPage;

        /**
        * Gets the Frame object controlling this instance.
        */
        frame: frame.Frame;

        onNavigatedTo(context: any): void;
        onNavigatedFrom(): void;

        onLoaded: () => void;
    }

    export interface AndroidPage {
        activity: android.app.Activity;
        activityBody: any;
        getActivityExtends(): any;
    }
} 