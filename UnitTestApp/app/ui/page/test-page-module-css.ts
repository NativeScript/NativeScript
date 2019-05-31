import * as PageModule from "tns-core-modules/ui/page";
import * as LabelModule from "tns-core-modules/ui/label";

export class TestPageModule extends PageModule.Page {
    constructor() {
        super();

        var label = new LabelModule.Label();
        label.text = "Label created within a page module css.";

        this.content = label;
    }
}

export function createPage() {
    return new TestPageModule();
}

//export var Page = new TestPageModule();
