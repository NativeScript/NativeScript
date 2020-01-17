import { EventData, Observable } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import * as frame from "tns-core-modules/ui/frame";

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new TestPage();
}

export function onNavBtnTap(args) {
    frame.topmost().goBack();
}

export class TestPage extends Observable {
    constructor() {
        super();
    }

    // new line of span can be set with \n from code behind
    get test(): string {
        return "\ntest";
    }
}
