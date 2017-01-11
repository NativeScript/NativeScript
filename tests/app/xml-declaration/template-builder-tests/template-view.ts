import { Property } from "ui/core/properties"
import { LayoutBase } from "ui/layouts/layout-base"
import { parse } from "ui/builder"

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
