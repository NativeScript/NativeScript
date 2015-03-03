//@private
declare module "ui/builder/component-builder" {
    import view = require("ui/core/view");

    export function getComponentModule(elementName: string, namespace: string, attributes: Object, exports: Object): ComponentModule;

    export interface ComponentModule {
        component: view.View;
        exports: any;
    }
}
