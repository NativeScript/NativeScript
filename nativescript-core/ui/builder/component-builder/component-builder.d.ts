/**
 * @module "ui/builder/component-builder"
 */ /** */

import { View } from "../../core/view";

export interface ComponentModule {
    component: View;
    exports: any;
}

export function getComponentModule(elementName: string, namespace: string, attributes: Object, exports: Object, moduleNamePath?: string, isRootComponent?: boolean): ComponentModule;
export function setPropertyValue(instance: View, instanceModuleExports: Object, pageExports: Object, propertyName: string, propertyValue: any): void;
