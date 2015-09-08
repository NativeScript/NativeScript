declare module "ui/builder/component-builder" {
    import view = require("ui/core/view");

    export function getComponentModule(elementName: string, namespace: string, attributes: Object, exports: Object): ComponentModule;
    export function setPropertyValue(instance: view.View, instanceModuleExports: Object, pageExports: Object, propertyName: string, propertyValue: string) : void;

    export var specialProperties: Array<string>;
    export function setSpecialPropertyValue(instance: view.View, propertyName: string, propertyValue: string): boolean;

    export interface ComponentModule {
        component: view.View;
        exports: any;
    }
}
