import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { topmost } from "tns-core-modules/ui/frame";

export function btnClick(args: EventData) {
    (<Page>args.object).page.showModal("action-bar/modal-page-hidden-action-bar-page", {
        context: "",
        closeCallback: (arg: string) => console.log("Callback args: " + arg),
        fullscreen: true
    });
}

export function btnBack(args: EventData) {
    topmost().goBack();
}
