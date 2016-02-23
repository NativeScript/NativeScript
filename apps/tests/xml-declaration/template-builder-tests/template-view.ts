import {Template} from "ui/core/view"
import {Property, PropertyMetadataSettings} from "ui/core/dependency-observable"
import * as proxy from "ui/core/proxy"
import { LayoutBase } from "ui/layouts/layout-base"
import { parse } from "ui/builder"

export module knownTemplates {
    export var template = "template";
}

export class TemplateView extends LayoutBase {
	public static templateProperty = new Property(
        "template",
        "TemplateView",
        new proxy.PropertyMetadata(
            undefined,
            PropertyMetadataSettings.AffectsLayout,
            null
            )
        );
        
    public static testEvent: string = "test";
	
    get template(): string | Template {
        return this._getValue(TemplateView.templateProperty);
    }
	
    set template(value: string | Template) {
        this._setValue(TemplateView.templateProperty, value);
    }
	
    public parseTemplate() {
        this.addChild(parse(this.template));
    }
}
