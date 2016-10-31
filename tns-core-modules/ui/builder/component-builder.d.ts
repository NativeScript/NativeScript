declare module "ui/builder/component-builder" {
    import {View} from "ui/core/view";

    export function getComponentModule(elementName: string, namespace: string, attributes: Object, exports: Object): ComponentModule;
    export function setPropertyValue(instance: View, instanceModuleExports: Object, pageExports: Object, propertyName: string, propertyValue: any) : void;

    export interface ComponentModule {
        component: View;
        exports: any;
    }
}