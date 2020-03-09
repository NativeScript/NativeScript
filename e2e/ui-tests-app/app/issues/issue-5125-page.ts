import { NavigatedData } from "tns-core-modules/ui/page";
import { Page } from "tns-core-modules/ui/page";
import { Observable } from "tns-core-modules/data/observable";

export class HomeViewModel extends Observable {
    public stringValue = "test";
    public stringNumericValue = "12345";
    public numericValue = 12345;

    constructor() {
        super();
    }
}

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new HomeViewModel();
}
