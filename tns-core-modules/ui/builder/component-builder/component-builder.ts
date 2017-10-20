// Deifinitions.
import { ComponentModule } from ".";
import { View } from "../../core/view";

// Types.
import { isEventOrGesture } from "../../core/bindable";
import { File, path, knownFolders } from "../../../file-system";
import { getBindingOptions, bindingConstants } from "../binding-builder";
import { resolveFileName } from "../../../file-system/file-name-resolver";
import { profile } from "../../../profiling";
import * as debugModule from "../../../utils/debug";
import * as platform from "../../../platform";

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

const createComponentInstance = profile("createComponentInstance", (elementName: string, namespace: string): { instance: View, instanceModule: Object } => {
    var instance: View;
    var instanceModule: Object;
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

    return { instance, instanceModule };
});

const getComponentModuleExports = profile("getComponentModuleExports", (instance: View, moduleExports: Object, attributes: Object): Object => {
    if (attributes) {
        if (attributes[IMPORT]) {
            let importPath = attributes[IMPORT].trim();

            if (importPath.indexOf("~/") === 0) {
                importPath = path.join(knownFolders.currentApp().path, importPath.replace("~/", ""));
            }

            moduleExports = global.loadModule(importPath);
            (<any>instance).exports = moduleExports;
        }

        if (attributes[CODEFILE]) {
            let codeFilePath = attributes[CODEFILE].trim();
            if (codeFilePath.indexOf("~/") === 0) {
                codeFilePath = path.join(knownFolders.currentApp().path, codeFilePath.replace("~/", ""));
            }

            const codeFilePathWithExt = codeFilePath.indexOf(".js") !== -1 ? codeFilePath : `${codeFilePath}.js`;
            if (File.exists(codeFilePathWithExt)) {
                moduleExports = global.loadModule(codeFilePath);
                (<any>instance).exports = moduleExports;
            } else {
                throw new Error(`Code file with path "${codeFilePathWithExt}" cannot be found!`);
            }
        }
    }
    return moduleExports;
});

const applyComponentCss = profile("applyComponentCss", (instance: View, moduleNamePath: string, attributes: Object) => {
    let cssApplied = false;
    if (attributes) {
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
    }

    if (typeof (<any>instance).addCssFile === "function") {//instance instanceof Page) {
        if (moduleNamePath && !cssApplied) {
            let cssFilePath = resolveFileName(moduleNamePath, "css");
            if (cssFilePath) {
                (<any>instance).addCssFile(cssFilePath);
                cssApplied = true;
            }
        }
    }
});

const applyComponentAttributes = profile("applyComponentAttributes", (instance: View, instanceModule: Object, moduleExports: Object, attributes: Object) => {
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
                    setPropertyValue(subObj, instanceModule, moduleExports, subPropName, attrValue);
                }
            } else {
                setPropertyValue(instance, instanceModule, moduleExports, attr, attrValue);
            }
        }
    }
});

export function getComponentModule(elementName: string, namespace: string, attributes: Object, moduleExports: Object, moduleNamePath?: string): ComponentModule {
    // Support lower-case-dashed component declaration in the XML (https://github.com/NativeScript/NativeScript/issues/309).
    elementName = elementName.split("-").map(s => { return s[0].toUpperCase() + s.substring(1) }).join("");

    const { instance, instanceModule } = createComponentInstance(elementName, namespace);
    moduleExports = getComponentModuleExports(instance, moduleExports, attributes);
    applyComponentCss(instance, moduleNamePath, attributes);
    applyComponentAttributes(instance, instanceModule, moduleExports, attributes);

    var componentModule;
    if (instance && instanceModule) {
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
        instance[propertyName] = propertyValue;
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
