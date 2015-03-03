//@private
declare module "ui/builder/template-builder" {
    import componentBuilder = require("ui/builder/component-builder");

    class TemplateBuilder {
        constructor(templateProperty: TemplateProperty);

        elementName: string;
        addStartElement(elementName: string, attributes: Object);
        addEndElement(elementName: string);
        build();
    }

    export function isKnownTemplate(name: string, exports: any): boolean;

    interface TemplateProperty {
        parent: componentBuilder.ComponentModule;
        name: string;
        elementName: string;
        templateItems: Array<string>
    }
}