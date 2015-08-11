import observable = require("data/observable");
import view = require("ui/core/view");
import bindable = require("ui/core/bindable");
import dockLayoutDef = require("ui/layouts/dock-layout");
import gridLayoutModule = require("ui/layouts/grid-layout");
import absoluteLayoutDef = require("ui/layouts/absolute-layout");
import types = require("utils/types");
import definition = require("ui/builder/component-builder");
import fs = require("file-system");
import gestures = require("ui/gestures");
import bindingBuilder = require("ui/builder/binding-builder");
import platform = require("platform");

var EVENT = "Event";
var UI_PATH = "ui/";
var MODULES = {
    "TabViewItem": "ui/tab-view",
    "FormattedString": "text/formatted-string",
    "Span": "text/span",
    "ActionItem": "ui/action-bar",
    "NavigationButton": "ui/action-bar",
    "SegmentedBarItem": "ui/segmented-bar",
};

var ROW = "row";
var COL = "col";
var COL_SPAN = "colSpan";
var ROW_SPAN = "rowSpan";
var DOCK = "dock";
var LEFT = "left";
var TOP = "top";

var eventHandlers, gestureHandlers = {};

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
        throw new Error("Cannot create module " + moduleId + ". " + ex + ". StackTrace: " + ex.stack);
    }

    if (instance && instanceModule) {
        var bindings = new Array<bindable.BindingOptions>();

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

        eventHandlers, gestureHandlers = {};

        componentModule = { component: instance, exports: instanceModule, bindings: bindings };
    }

    return componentModule;
}

export function setPropertyValue(instance: view.View, instanceModule: Object, exports: Object, propertyName: string, propertyValue: string) {
    // Note: instanceModule can be null if we are loading custom compnenet with no code-behind.
    var isEvent: boolean = instanceModule && isKnownEvent(propertyName, instanceModule[instance.typeName]);

    if (isBinding(propertyValue) && instance.bind) {
        if (isEvent) {
            attachEventBinding(instance, propertyName, propertyValue);
        } else if (isGesture(propertyName, instance)) {
            attachGestureBinding(instance, propertyName, propertyValue);
        } else {
            var bindOptions = bindingBuilder.getBindingOptions(propertyName, getBindingExpressionFromAttribute(propertyValue));
            instance.bind({
                sourceProperty: bindOptions[bindingBuilder.bindingConstants.sourceProperty],
                targetProperty: bindOptions[bindingBuilder.bindingConstants.targetProperty],
                expression: bindOptions[bindingBuilder.bindingConstants.expression],
                twoWay: bindOptions[bindingBuilder.bindingConstants.twoWay]
            }, bindOptions[bindingBuilder.bindingConstants.source]);
        }
    } else if (isEvent) {
        // Get the event handler from page module exports.
        var handler = exports && exports[propertyValue];

        // Check if the handler is function and add it to the instance for specified event name.
        if (types.isFunction(handler)) {
            instance.on(propertyName, handler);
        }
    } else if (isGesture(propertyName, instance)) {
        // Get the event handler from page module exports.
        var gestureHandler = exports && exports[propertyValue];

        // Check if the handler is function and add it to the instance for specified gesture.
        if (types.isFunction(gestureHandler)) {
            instance.observe(gestures.fromString(propertyName.toLowerCase()), gestureHandler);
        }
    } else if (propertyName === ROW) {
        gridLayoutModule.GridLayout.setRow(instance, !isNaN(+propertyValue) && +propertyValue);
    } else if (propertyName === COL) {
        gridLayoutModule.GridLayout.setColumn(instance, !isNaN(+propertyValue) && +propertyValue);
    } else if (propertyName === COL_SPAN) {
        gridLayoutModule.GridLayout.setColumnSpan(instance, !isNaN(+propertyValue) && +propertyValue);
    } else if (propertyName === ROW_SPAN) {
        gridLayoutModule.GridLayout.setRowSpan(instance, !isNaN(+propertyValue) && +propertyValue);
    } else if (propertyName === LEFT) {
        absoluteLayoutDef.AbsoluteLayout.setLeft(instance, !isNaN(+propertyValue) && +propertyValue);
    } else if (propertyName === TOP) {
        absoluteLayoutDef.AbsoluteLayout.setTop(instance, !isNaN(+propertyValue) && +propertyValue);
    } else if (propertyName === DOCK) {
        dockLayoutDef.DockLayout.setDock(instance, propertyValue);
    } else {
        var attrHandled = false;

        if ((<any>instance)._applyXmlAttribute) {
            attrHandled = (<any>instance)._applyXmlAttribute(propertyName, propertyValue);
        }

        if (!attrHandled) {
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

function attachEventBinding(instance: view.View, eventName: string, value: string) {
    // Get the event handler from instance.bindingContext.
    eventHandlers[eventName] = (args: observable.PropertyChangeData) => {
        if (args.propertyName === "bindingContext") {
            var handler = instance.bindingContext && instance.bindingContext[getBindingExpressionFromAttribute(value)];
            // Check if the handler is function and add it to the instance for specified event name.
            if (types.isFunction(handler)) {
                instance.on(eventName, handler, instance.bindingContext);
            }
            instance.off(observable.Observable.propertyChangeEvent, eventHandlers[eventName]);
        }
    };

    instance.on(observable.Observable.propertyChangeEvent, eventHandlers[eventName]);
}

function attachGestureBinding(instance: view.View, gestureName: string, value: string) {
    // Get the event handler from instance.bindingContext.
    gestureHandlers[gestureName] = (args: observable.PropertyChangeData) => {
        if (args.propertyName === "bindingContext") {
            var handler = instance.bindingContext && instance.bindingContext[getBindingExpressionFromAttribute(value)];
            // Check if the handler is function and add it to the instance for specified event name.
            if (types.isFunction(handler)) {
                instance.observe(gestures.fromString(gestureName.toLowerCase()), handler, instance.bindingContext);
            }
            instance.off(observable.Observable.propertyChangeEvent, gestureHandlers[gestureName]);
        }
    };

    instance.on(observable.Observable.propertyChangeEvent, gestureHandlers[gestureName]);
}

function isGesture(name: string, instance: any): boolean {
    return gestures.fromString(name.toLowerCase()) !== undefined;
}

function isKnownEvent(name: string, exports: any): boolean {
    var nameEvent = name + EVENT;
    var result = !types.isNullOrUndefined(exports) ? nameEvent in exports : false;
    return result;
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