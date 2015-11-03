import observable = require("data/observable");
import pages = require("ui/page");
import labelModule = require("ui/label");
import frame = require("ui/frame");

var page: pages.Page;
var label: labelModule.Label;

export function onNavigatingTo(args: observable.EventData) {
    console.log(">>> main-page.onNavigatingTo");
    //console.trace();
}

export function onLoaded(args: observable.EventData) {
    console.log(">>> main-page.onLoaded");
    //console.trace();
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
    console.log(">>> main-page.onNavigatedTo");
    //console.trace();
}

export function onNavigatingFrom(args: observable.EventData) {
    console.log(">>> main-page.onNavigatingFrom");
}

export function onNavigatedFrom(args: observable.EventData) {
    console.log(">>> main-page.onNavigatedFrom");
}

export function onUnloaded(args: observable.EventData) {
    console.log(">>> main-page.onUnloaded");
}

export function onTap(args: observable.EventData) {
    if ((<any>args.object).text.indexOf("(navigate)") !== -1) {
        var entry: frame.NavigationEntry = {
            moduleName: "./login-page",
            context: "Context from navigate"
        };
        frame.topmost().navigate(entry);
    }
    else {
        var fullscreen = (<any>args.object).text.indexOf("(full-screen)") !== -1;
        showModal(fullscreen);
    }
}

function showModal(fullscreen?: boolean) {
    page.showModal("./modal-views-demo/login-page", "Context from showModal", function (username: string, password: string) {
        console.log(username + "/" + password);
        label.text = username + "/" + password;
    }, fullscreen);
}

export function onCloseModal(args: observable.EventData) {
    page.closeModal();
}