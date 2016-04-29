import {EventData} from "data/observable";
import {Page} from "ui/page";
import {Label} from "ui/label";
import frame = require("ui/frame");

export function onNavigatingTo(args: EventData) {
    console.log(">>> main-page.onNavigatingTo");
    //console.trace();
}

export function onLoaded(args: EventData) {
    console.log(">>> main-page.onLoaded");
    //console.trace();
}

export function onNavigatedTo(args: EventData) {
    console.log(">>> main-page.onNavigatedTo");
    //console.trace();
}

export function onNavigatingFrom(args: EventData) {
    console.log(">>> main-page.onNavigatingFrom");
}

export function onNavigatedFrom(args: EventData) {
    console.log(">>> main-page.onNavigatedFrom");
}

export function onUnloaded(args: EventData) {
    console.log(">>> main-page.onUnloaded");
}

export function onTap(args: EventData) {
    let page = (<any>args.object).page;
    if ((<any>args.object).text.indexOf("(navigate)") !== -1) {
        var entry: frame.NavigationEntry = {
            moduleName: "./login-page",
            context: "Context from navigate"
        };
       
        page.frame.navigate(entry);
    }
    else {
        var fullscreen = (<any>args.object).text.indexOf("(full-screen)") !== -1;
        showModal(page, fullscreen);
    }
}

function showModal(page: Page, fullscreen?: boolean) {
    page.showModal("./modal-views-demo/login-page", "Context from showModal", function (username: string, password: string) {
        console.log(username + "/" + password);
        let label = page.getViewById<Label>("label");
        if (label) {
            label.text = username + "/" + password;
        }
    }, fullscreen);
}

export function onCloseModal(args: EventData) {
    let page = (<any>args.object).page;
    page.closeModal();
}