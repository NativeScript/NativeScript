import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { topmost } from "tns-core-modules/ui/frame";

export function btnClick(args: EventData) {
    (<Page>args.object).page.showModal("ui-tests-app/action-bar/modal-page", "", function (arg: string) {
        // ...
    }, true);
}

export function btnBack(args: EventData) {
    topmost().goBack();
}