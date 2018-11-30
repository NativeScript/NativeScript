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

function openModal(page: Page, label: Label, context: string) {
    page.showModal("ui-tests-app/modal-view/login-page", context, function (username: string, password: string) {
        const result = context + "/" + username + "/" + password;
        console.log(result);
        label.text = result;
    }, false);
}

export function onTapSecondModalInCB(args) {
    const page = <Page>args.object.page;
    const label = page.getViewById<Label>("label");
    page.showModal("ui-tests-app/modal-view/login-page", "First", function (username: string, password: string) {
        const result = "First/" + username + "/" + password;
        console.log(result);
        label.text = result;

        // Open second modal in the close callback of the first one.
        openModal(page, label, "Second");
    });
}

export function onTapSecondModalInTimer(args) {
    const page = <Page>args.object.page;
    const label = page.getViewById<Label>("label");
    openModal(page, label, "First");

    // Open second modal 1s after the first one.
    setTimeout(() => openModal(page, label, "Second"), 1000);
}
