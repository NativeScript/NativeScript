import observable = require("data/observable");
import pages = require("ui/page");
import labelModule = require("ui/label");
import frame = require("ui/frame");

var page: pages.Page;
var label: labelModule.Label;

export function onLoaded(args: observable.EventData) {
    console.log("main-page.onLoaded");
    if (args.object !== frame.topmost().currentPage) {
        throw new Error("args.object must equal frame.topmost().currentPage on page.loaded");
    }
    page = <pages.Page>args.object;
    label = frame.topmost().getViewById<labelModule.Label>("label");
    if (!label) {
        throw new Error("Could not find `label`");
    }
}

export function onNavigatedTo(args: observable.EventData) {
    console.log("main-page.onNavigatedTo");
}

export function onTap(args: observable.EventData) {
    var fullscreen = (<any>args.object).text.indexOf("(full-screen)") !== -1;
    page.showModal("./modal-views-demo/login-page", "some custom context", function (username: string, password: string) {
        console.log(username + "/" + password);
        label.text = username + "/" + password;
    }, fullscreen);
}

export function onCloseModal(args: observable.EventData) {
    page.closeModal();
}