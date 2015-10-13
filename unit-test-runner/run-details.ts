import vmModule = require("./main-view-model");
export function pageLoaded(args) {
    var page = args.object;
    var broker = vmModule.mainViewModel;
    page.bindingContext = broker;
}
