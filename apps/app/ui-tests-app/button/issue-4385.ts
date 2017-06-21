import { EventData, Observable } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new TestPage();
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