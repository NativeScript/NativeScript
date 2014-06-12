declare module "ui/frame" {
    import view = require("ui/core/view");

    // There is a cyclic reference here (pages module requires frame) but it is intented and needed.
    import pages = require("ui/pages");

    export class Frame extends view.View {
        goBack();
        canGoBack(): boolean;
        goForward();
        canGoForward(): boolean;
        navigate(entry: PageNavigationEntry);

        currentPage: pages.Page;

        backStack: Array<PageNavigationEntry>;
        forwardStack: Array<PageNavigationEntry>;
    }

    export interface PageNavigationEntry {
        pageModuleName: string;
        context?: any;
    }
} 