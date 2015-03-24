declare module "controls-page" {
    import pagesModule = require("ui/page");

    class ControlsPage extends pagesModule.Page {
        constructor(controlConstructor: () => void, count: number, controlsPerRow: number);
    }
}
