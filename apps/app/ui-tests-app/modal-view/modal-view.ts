import { Page } from "tns-core-modules/ui/page";
import { Label } from "tns-core-modules/ui/label";

export function onTap(args) {
    const page = <Page>args.object.page;
    const label = page.getViewById<Label>("label");
    var fullscreen = (<any>args.object).text.indexOf("(full-screen)") !== -1;
    page.showModal("ui-tests-app/modal-view/login-page", "context", function (username: string, password: string) {
        console.log(username + "/" + password);
        label.text = username + "/" + password;
    }, fullscreen);
}

export function onTapStretched(args) {
    const page = <Page>args.object.page;
    const label = page.getViewById<Label>("label");
    var fullscreen = false;
    var stretched = true;
    
    page.showModal("ui-tests-app/modal-view/login-page", "context", function (username: string, password: string) {
        console.log(username + "/" + password);
        label.text = username + "/" + password;
    }, fullscreen, false, stretched);
}
