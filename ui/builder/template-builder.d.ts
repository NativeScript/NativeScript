//@private
declare module "ui/builder/template-builder" {
    import xml = require("xml");
    import componentBuilder = require("ui/builder/component-builder");

    class TemplateBuilder {
        constructor(templateProperty: TemplateProperty);

        elementName: string;

        /*
	     * Returns true if the template builder has finished parsing template and the parsing should continue.
	     * @param args - ParserEvent argument to handle.
	     */
        handleElement(args: xml.ParserEvent): boolean;
    }

    export function isKnownTemplate(name: string, exports: any): boolean;

    interface TemplateProperty {
        parent: componentBuilder.ComponentModule;
        name: string;
        elementName: string;
        templateItems: Array<string>
    }
}