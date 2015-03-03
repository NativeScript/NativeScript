import observable = require("data/observable");
import pages = require("ui/page");
import dialogs = require("ui/dialogs");
import vmModule = require("./view-model");

var viewModel = vmModule.settingsViewModel;
// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // The page has loaded.
    var page = <pages.Page>args.object;
    page.bindingContext = viewModel;
}

export function promptName(args: observable.EventData) {
    dialogs.prompt("Enter your name:", viewModel.name).then((promptResult) => {
        if (promptResult.result) {
            viewModel.set("name", promptResult.text);
        }
    });
}
