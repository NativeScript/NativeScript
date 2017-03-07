// Deifinitions.
import { ComponentModule } from "ui/builder/component-builder";
import { View } from "ui/core/view";

// Types.
import { isEventOrGesture } from "ui/core/bindable";
import { File, path, knownFolders } from "file-system";
import { getBindingOptions, bindingConstants } from "./binding-builder";
import { resolveFileName } from "file-system/file-name-resolver";
import * as debugModule from "utils/debug";
import * as platform from "platform";

const UI_PATH = "ui/";
const MODULES = {
    "TabViewItem": "ui/tab-view",
    "FormattedString": "text/formatted-string",
    "Span": "text/span",
    "ActionItem": "ui/action-bar",
    "NavigationButton": "ui/action-bar",
    "SegmentedBarItem": "ui/segmented-bar",
};

const CODEFILE = "codeFile";
const CSSFILE = "cssFile";
const IMPORT = "import";

export function getComponentModule(elementName: string, namespace: string, attributes: Object, exports: Object, moduleNamePath?: string): ComponentModule {
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
        if (typeof namespace === "string") {
            if (global.moduleExists(namespace)) {
                moduleId = namespace;
            } else {
                const pathInsideTNSModules = path.join(knownFolders.currentApp().path, "tns_modules", namespace);

                try {
                    // module inside tns_modules
                    instanceModule = global.require(pathInsideTNSModules);
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
        const instanceType = instanceModule[elementName] || Object;

        // Create instance of the component.
        instance = new instanceType();
    } catch (ex) {
        const debug: typeof debugModule = require("utils/debug");
        throw new debug.ScopeError(ex, "Module '" + moduleId + "' not found for element '" + (namespace ? namespace + ":" : "") + elementName + "'.");
    }

    let cssApplied = false;
    if (attributes) {
        if (attributes[IMPORT]) {
            let importPath = attributes[IMPORT].trim();

            if (importPath.indexOf("~/") === 0) {
                importPath = path.join(knownFolders.currentApp().path, importPath.replace("~/", ""));
            }

            exports = global.loadModule(importPath);
            (<any>instance).exports = exports;
        }

        // if (instance instanceof Page) {
            if (attributes[CODEFILE]) {
                let codeFilePath = attributes[CODEFILE].trim();
                if (codeFilePath.indexOf("~/") === 0) {
                    codeFilePath = path.join(knownFolders.currentApp().path, codeFilePath.replace("~/", ""));
                }

                const codeFilePathWithExt = codeFilePath.indexOf(".js") !== -1 ? codeFilePath : `${codeFilePath}.js`;
                if (File.exists(codeFilePathWithExt)) {
                    exports = global.loadModule(codeFilePath);
                    (<any>instance).exports = exports;
                } else {
                    throw new Error(`Code file with path "${codeFilePathWithExt}" cannot be found!`);
                }
            }

            if (attributes[CSSFILE] && typeof (<any>instance).addCssFile === "function") {
                let cssFilePath = attributes[CSSFILE].trim();
                if (cssFilePath.indexOf("~/") === 0) {
                    cssFilePath = path.join(knownFolders.currentApp().path, cssFilePath.replace("~/", ""));
                }
                if (File.exists(cssFilePath)) {
                    (<any>instance).addCssFile(cssFilePath);
                    cssApplied = true;
                } else {
                    throw new Error(`Css file with path "${cssFilePath}" cannot be found!`);
                }
            }
        // }
    }

    if (typeof (<any>instance).addCssFile === "function") {//instance instanceof Page) {
        if (moduleNamePath && !cssApplied) {
            let cssFilePath = resolveFileName(moduleNamePath, "css");
            if (cssFilePath) {
                (<any>instance).addCssFile(cssFilePath);
                cssApplied = true;
            }
        }

        if (!cssApplied) {
            // Called only to apply application css.
            // If we have page css (through file or cssAttribute) we have appCss applied.
            (<any>instance)._refreshCss();
        }
    }

    if (instance && instanceModule) {
        for (let attr in attributes) {

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
                let subObj = instance;
                const properties = attr.split(".");
                const subPropName = properties[properties.length - 1];

                for (let i = 0; i < properties.length - 1; i++) {
                    if (subObj !== undefined && subObj !== null) {
                        subObj = subObj[properties[i]];
                    }
                }

                if (subObj !== undefined && subObj !== null) {
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
    }
    else if (isEventOrGesture(propertyName, instance)) {
        // Get the event handler from page module exports.
        var handler = exports && exports[propertyValue];

        // Check if the handler is function and add it to the instance for specified event name.
        if (typeof handler === "function") {
            instance.on(propertyName, handler);
        }
    }
    else if (isKnownFunction(propertyName, instance) && exports && typeof exports[propertyValue] === "function") {
        instance[propertyName] = exports[propertyValue];
    }
    else {
        let attrHandled = false;
        if (!attrHandled && instance._applyXmlAttribute) {
            attrHandled = instance._applyXmlAttribute(propertyName, propertyValue);
        }
        if (!attrHandled) {
            instance[propertyName] = propertyValue;
        }
    }
}

function getBindingExpressionFromAttribute(value: string): string {
    return value.replace("{{", "").replace("}}", "").trim();
}

function isBinding(value: any): boolean {
    var isBinding;

    if (typeof value === "string") {
        var str = value.trim();
        isBinding = str.indexOf("{{") === 0 && str.lastIndexOf("}}") === str.length - 2;
    }

    return isBinding;
}

// For example, ListView.itemTemplateSelector
let KNOWN_FUNCTIONS = "knownFunctions";
function isKnownFunction(name: string, instance: View): boolean {
    return instance.constructor
        && KNOWN_FUNCTIONS in instance.constructor
        && instance.constructor[KNOWN_FUNCTIONS].indexOf(name) !== -1;
}