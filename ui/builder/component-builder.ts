import view = require("ui/core/view");
import types = require("utils/types");
import definition = require("ui/builder/component-builder");
import fs = require("file-system");
import bindingBuilder = require("./binding-builder");
import platform = require("platform");
import pages = require("ui/page");
import debug = require("utils/debug");

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

export function getComponentModule(elementName: string, namespace: string, attributes: Object, exports: Object): definition.ComponentModule {
    var instance: view.View;
    var instanceModule: Object;
    var componentModule: definition.ComponentModule;

    // Support lower-case-dashed component declaration in the XML (https://github.com/NativeScript/NativeScript/issues/309).
    elementName = elementName.split("-").map(s => { return s[0].toUpperCase() + s.substring(1) }).join("");

    // Get module id.
    var moduleId = MODULES[elementName] || UI_PATH +
        (elementName.toLowerCase().indexOf("layout") !== -1 ? "layouts/" : "") +
        elementName.split(/(?=[A-Z])/).join("-").toLowerCase();

    try {
        if (types.isString(namespace)) {
            var pathInsideTNSModules = fs.path.join(fs.knownFolders.currentApp().path, "tns_modules", namespace);

            if (fs.Folder.exists(pathInsideTNSModules)) {
                moduleId = pathInsideTNSModules;
            } else {
                // We expect module at root level in the app.
                moduleId = fs.path.join(fs.knownFolders.currentApp().path, namespace);
            }
        }

        // Require module by module id.
        instanceModule = require(moduleId);

        // Get the component type from module.
        var instanceType = instanceModule[elementName] || Object;

        // Create instance of the component.
        instance = new instanceType();
    } catch (ex) {
        throw new debug.ScopeError(ex, "Module '" + moduleId + "' not found for element '" + (namespace ? namespace + ":" : "") + elementName + "'.");
    }

    if (attributes) {
        if (attributes[CODEFILE]) {
            if (instance instanceof pages.Page) {
                var codeFilePath = attributes[CODEFILE].trim();
                if (codeFilePath.indexOf("~/") === 0) {
                    codeFilePath = fs.path.join(fs.knownFolders.currentApp().path, codeFilePath.replace("~/", ""));
                }
                try {
                    exports = require(codeFilePath);
                    (<any>instance).exports = exports;
                } catch (ex) {
                    throw new Error(`Code file with path "${codeFilePath}" cannot be found!`);
                }
            } else {
                throw new Error("Code file atribute is valid only for pages!");
            }
        }

        if (attributes[CSSFILE]) {
            if (instance instanceof pages.Page) {
                var cssFilePath = attributes[CSSFILE].trim();
                if (cssFilePath.indexOf("~/") === 0) {
                    cssFilePath = fs.path.join(fs.knownFolders.currentApp().path, cssFilePath.replace("~/", ""));
                }
                if (fs.File.exists(cssFilePath)) {
                    (<pages.Page>instance).addCssFile(cssFilePath);
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
                    if (types.isDefined(subObj)) {
                        subObj = subObj[properties[i]];
                    }
                }

                if (types.isDefined(subObj)) {
                    setPropertyValue(subObj, instanceModule, exports, subPropName, attrValue);
                }
            } else {
                setPropertyValue(instance, instanceModule, exports, attr, attrValue);
            }
        }

        componentModule = {component: instance, exports: instanceModule};
    }

    return componentModule;
}

export function setPropertyValue(instance: view.View, instanceModule: Object, exports: Object, propertyName: string, propertyValue: string) {
    // Note: instanceModule can be null if we are loading custom compnenet with no code-behind.

    if (isBinding(propertyValue) && instance.bind) {
        var bindOptions = bindingBuilder.getBindingOptions(propertyName, getBindingExpressionFromAttribute(propertyValue));
        instance.bind({
            sourceProperty: bindOptions[bindingBuilder.bindingConstants.sourceProperty],
            targetProperty: bindOptions[bindingBuilder.bindingConstants.targetProperty],
            expression: bindOptions[bindingBuilder.bindingConstants.expression],
            twoWay: bindOptions[bindingBuilder.bindingConstants.twoWay]
        }, bindOptions[bindingBuilder.bindingConstants.source]);
    } else if (view.isEventOrGesture(propertyName, instance)) {
        // Get the event handler from page module exports.
        var handler = exports && exports[propertyValue];

        // Check if the handler is function and add it to the instance for specified event name.
        if (types.isFunction(handler)) {
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
            if (propertyValue.trim() === "") {
                instance[propertyName] = propertyValue;
            } else {
                // Try to convert value to number.
                var valueAsNumber = +propertyValue;
                if (!isNaN(valueAsNumber)) {
                    instance[propertyName] = valueAsNumber;
                } else if (propertyValue && (propertyValue.toLowerCase() === "true" || propertyValue.toLowerCase() === "false")) {
                    instance[propertyName] = propertyValue.toLowerCase() === "true" ? true : false;
                } else {
                    instance[propertyName] = propertyValue;
                }
            }
        }
    }
}

function getBindingExpressionFromAttribute(value: string): string {
    return value.replace("{{", "").replace("}}", "").trim();
}

function isBinding(value: string): boolean {
    var isBinding;

    if (types.isString(value)) {
        var str = value.trim();
        isBinding = str.indexOf("{{") === 0 && str.lastIndexOf("}}") === str.length - 2;
    }

    return isBinding;
}
