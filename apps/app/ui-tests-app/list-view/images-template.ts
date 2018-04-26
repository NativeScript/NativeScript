import { EventData, Observable } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";

export function navigatingTo(args: EventData) {
    let page = <Page>args.object;
    page.bindingContext = new ImagesTemplateViewModel();
}

export class ImagesTemplateViewModel extends Observable {
    public items: Array<string> = ["res://icon", null, "~/ui-tests-app/resources/images/no-image.png", null, "~/ui-tests-app/resources/images/no-image.png", null, "res://icon", null];
    constructor() {
        super();
    }
}