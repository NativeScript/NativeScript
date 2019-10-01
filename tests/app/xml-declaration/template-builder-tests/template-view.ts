import { Property } from "tns-core-modules/ui/core/properties";
import { LayoutBase } from "tns-core-modules/ui/layouts/layout-base";
import { parse } from "tns-core-modules/ui/builder";

export module knownTemplates {
    export var template = "template";
}

export class TemplateView extends LayoutBase {
    public template: string;

    public static testEvent: string = "test";

    public parseTemplate() {
        this.addChild(parse(this.template));
    }
}

export const templateProperty = new Property<TemplateView, string>({
    name: "template",
    affectsLayout: true
});
templateProperty.register(TemplateView);
