import {isString, isDefined, isFunction} from "utils/types";
import {Page} from "ui/page";
import {View, isEventOrGesture} from "ui/core/view";
import {ComponentModule} from "ui/builder/component-builder";
import {File, Folder, path, knownFolders} from "file-system";
import {getBindingOptions, bindingConstants} from "./binding-builder";
import * as debugModule from "utils/debug";
import * as platformModule from "platform";
import {convertString} from "utils/utils";

//the imports below are needed for special property registration
import "ui/layouts/dock-layout";
import "ui/layouts/grid-layout";
import "ui/layouts/absolute-layout";

import {getSpecialPropertySetter} from "ui/builder/special-properties";

var UI_PATH = "ui/";
var MODULES = {
    "TabViewItem": "ui/tab-view",
    "FormattedString": "text/formatted-string",
    "Span": "text/span",
    "ActionItem": "ui/action-bar",
    "NavigationButton": "ui/action-bar",
    "SegmentedBarItem": "ui/segmented-bar",
};

var CODEFILE = "codeFile";
var CSSFILE = "cssFile";

var platform: typeof platformModule;
function ensurePlatform() {
    if (!platform) {
        platform = require("platform");
    }
}

export function getComponentModule(elementName: string, namespace: string, attributes: Object, exports: Object): ComponentModule {
    var instance: View;
    var instanceModule: Object;
    var componentModule: ComponentModule;

    // Support lower-case-dashed component declaration in the XML (https://github.com/NativeScript/NativeScript/issues/309).
    elementName = elementName.split("-").map(s => { return s[0].toUpperCase() + s.substring(1) }).join("");

    // Get module id.
    var moduleId = MODULES[elementName] || UI_PATH +
        (elementName.toLowerCase().indexOf("layout") !== -1 ? "layouts/" : "") +
        elementName.split(/(?=[A-Z])/).join("-").toLowerCase();

    try {
        if (isString(namespace)) {
            if (global.moduleExists(namespace)) {
                moduleId = namespace;
            } else {
                var pathInsideTNSModules = path.join(knownFolders.currentApp().path, "tns_modules", namespace);

                try {
                    // module inside tns_modules
                    instanceModule = require(pathInsideTNSModules);
                    moduleId = pathInsideTNSModules;
                } catch (e) {
                    // module at root level in the app.
                    moduleId = path.join(knownFolders.currentApp().path, namespace);
                }
            }
        }

        if (!instanceModule) {
            // Require module by module id.
            instanceModule = global.loadModule(moduleId);
        }

        // Get the component type from module.
        var instanceType = instanceModule[elementName] || Object;

        // Create instance of the component.
        instance = new instanceType();
    } catch (ex) {
        var debug: typeof debugModule = require("utils/debug");
        throw new debug.ScopeError(ex, "Module '" + moduleId + "' not found for element '" + (namespace ? namespace + ":" : "") + elementName + "'.");
    }

    if (attributes) {
        if (attributes[CODEFILE]) {
            if (instance instanceof Page) {
                var codeFilePath = attributes[CODEFILE].trim();
                if (codeFilePath.indexOf("~/") === 0) {
                    codeFilePath = path.join(knownFolders.currentApp().path, codeFilePath.replace("~/", ""));
                }

                let codeFilePathWithExt = codeFilePath.indexOf(".js") !== -1 ? codeFilePath : `${codeFilePath}.js`;
                if (File.exists(codeFilePathWithExt)) {
                    exports = global.loadModule(codeFilePath);
                    (<any>instance).exports = exports;
                } else {
                    throw new Error(`Code file with path "${codeFilePathWithExt}" cannot be found!`);
                }
            } else {
                throw new Error("Code file atribute is valid only for pages!");
            }
        }

        if (attributes[CSSFILE]) {
            if (instance instanceof Page) {
                var cssFilePath = attributes[CSSFILE].trim();
                if (cssFilePath.indexOf("~/") === 0) {
                    cssFilePath = path.join(knownFolders.currentApp().path, cssFilePath.replace("~/", ""));
                }
                if (File.exists(cssFilePath)) {
                    (<Page>instance).addCssFile(cssFilePath);
                    instance[CSSFILE] = true;
                } else {
                    throw new Error(`Css file with path "${cssFilePath}" cannot be found!`);
                }
            } else {
                throw new Error("Css file atribute is valid only for pages!");
            }
        }
    }

    if (instance && instanceModule) {
        for (var attr in attributes) {

            var attrValue = <string>attributes[attr];

            if (attr.indexOf(":") !== -1) {
                var platformName = attr.split(":")[0].trim();

                ensurePlatform();

                if (platformName.toLowerCase() === platform.device.os.toLowerCase()) {
                    attr = attr.split(":")[1].trim();
                } else {
                    continue;
                }
            }

            if (attr.indexOf(".") !== -1) {
                var subObj = instance;
                var properties = attr.split(".");
                var subPropName = properties[properties.length - 1];

                var i: number;
                for (i = 0; i < properties.length - 1; i++) {
                    if (isDefined(subObj)) {
                        subObj = subObj[properties[i]];
                    }
                }

                if (isDefined(subObj)) {
                    setPropertyValue(subObj, instanceModule, exports, subPropName, attrValue);
                }
            } else {
                setPropertyValue(instance, instanceModule, exports, attr, attrValue);
            }
        }

        componentModule = { component: instance, exports: instanceModule };
    }

    return componentModule;
}

export function setPropertyValue(instance: View, instanceModule: Object, exports: Object, propertyName: string, propertyValue: any) {
    // Note: instanceModule can be null if we are loading custom compnenet with no code-behind.

    if (isBinding(propertyValue) && instance.bind) {
        var bindOptions = getBindingOptions(propertyName, getBindingExpressionFromAttribute(propertyValue));
        instance.bind({
            sourceProperty: bindOptions[bindingConstants.sourceProperty],
            targetProperty: bindOptions[bindingConstants.targetProperty],
            expression: bindOptions[bindingConstants.expression],
            twoWay: bindOptions[bindingConstants.twoWay]
        }, bindOptions[bindingConstants.source]);
    } else if (isEventOrGesture(propertyName, instance)) {
        // Get the event handler from page module exports.
        var handler = exports && exports[propertyValue];

        // Check if the handler is function and add it to the instance for specified event name.
        if (isFunction(handler)) {
            instance.on(propertyName, handler);
        }
    } else {
        let attrHandled = false;
        let specialSetter = getSpecialPropertySetter(propertyName);
        if (!attrHandled && specialSetter) {
            specialSetter(instance, propertyValue);
            attrHandled = true;
        }
        if (!attrHandled && (<any>instance)._applyXmlAttribute) {
            attrHandled = (<any>instance)._applyXmlAttribute(propertyName, propertyValue);
        }
        if (!attrHandled) {
            instance[propertyName] = convertString(propertyValue);
        }
    }
}

function getBindingExpressionFromAttribute(value: string): string {
    return value.replace("{{", "").replace("}}", "").trim();
}

function isBinding(value: any): boolean {
    var isBinding;

    if (isString(value)) {
        var str = value.trim();
        isBinding = str.indexOf("{{") === 0 && str.lastIndexOf("}}") === str.length - 2;
    }

    return isBinding;
}
