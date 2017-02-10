import * as pages from "ui/page";
import * as labelModule from "ui/label";
import * as observable from "data/observable";

var page: pages.Page;
var label: labelModule.Label;

export function pageLoaded(args: observable.EventData) {
    page = <pages.Page>args.object;
    label = page.getViewById<labelModule.Label>("label");
}

export function onTap(args: observable.EventData) {
    var fullscreen = (<any>args.object).text.indexOf("(full-screen)") !== -1;
    page.showModal("ui-tests-app/modal-view/login-page", "context", function (username: string, password: string) {
        console.log(username + "/" + password);
        label.text = username + "/" + password;
    }, fullscreen);
}