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

var KNOWNEVENTS = "knownEvents";
var UI_PATH = "ui/";
var MODULES = {
    "ActivityIndicator": "ui/activity-indicator",
    "ListView": "ui/list-view",
    "GridLayout": "ui/layouts/grid-layout",
    "DockLayout": "ui/layouts/dock-layout",
    "WrapLayout": "ui/layouts/wrap-layout",
    "AbsoluteLayout": "ui/layouts/absolute-layout",
    "StackLayout": "ui/layouts/stack-layout",
    "ScrollView": "ui/scroll-view",
    "SearchBar": "ui/search-bar",
    "SlideOut": "ui/slide-out",
    "TabView": "ui/tab-view",
    "TabViewItem": "ui/tab-view",
    "TextField": "ui/text-field",
    "TextView": "ui/text-view",
    "FormattedString": "text/formatted-string",
    "Span": "text/span",
    "WebView": "ui/web-view",
    "SegmentedBar": "ui/segmented-bar",
    "SegmentedBarItem": "ui/segmented-bar",
    "ToolBar": "ui/tool-bar",
    "ToolBarItem": "ui/tool-bar",
    "TimePicker": "ui/time-picker",
    "DatePicker": "ui/date-picker",
    "ListPicker": "ui/list-picker",
    "MenuItem": "ui/page",
};

var ROW = "row";
var COL = "col";
var COL_SPAN = "colSpan";
var ROW_SPAN = "rowSpan";
var DOCK = "dock";
var LEFT = "left";
var TOP = "top";

export function getComponentModule(elementName: string, namespace: string, attributes: Object, exports: Object): definition.ComponentModule {
    var instance: view.View;
    var instanceModule: Object;
    var componentModule: definition.ComponentModule;

    // Get module id.
    var moduleId = MODULES[elementName] || UI_PATH + elementName.toLowerCase();

    try {
        // Require module by module id.
        instanceModule = require(types.isString(namespace) && fs.path.join(fs.knownFolders.currentApp().path, namespace) || moduleId);

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

            var attrValue = attributes[attr];

            if (isBinding(attrValue) && instance.bind) {
                if (isKnownEvent(attr, instanceModule)) {
                    attachEventBinding(instance, attr, attrValue);
                } else {
                    var bindOptions = bindingBuilder.getBindingOptions(attr, getBindingExpressionFromAttribute(attrValue));
                    instance.bind({
                        sourceProperty : bindOptions[bindingBuilder.bindingConstants.sourceProperty], 
                        targetProperty: bindOptions[bindingBuilder.bindingConstants.targetProperty],
                        expression: bindOptions[bindingBuilder.bindingConstants.expression],
                        twoWay: bindOptions[bindingBuilder.bindingConstants.twoWay]
                    }, bindOptions[bindingBuilder.bindingConstants.source]);
                }
            } else if (isKnownEvent(attr, instanceModule)) {
                // Get the event handler from page module exports.
                var handler = exports && exports[attrValue];

                // Check if the handler is function and add it to the instance for specified event name.
                if (types.isFunction(handler)) {
                    instance.on(attr, handler);
                }
            } else if (isGesture(attr, instance)) {
                // Get the event handler from page module exports.
                var gestureHandler = exports && exports[attrValue];

                // Check if the handler is function and add it to the instance for specified gesture.
                if (types.isFunction(gestureHandler)) {
                    instance.observe(gestures.fromString(attr.toLowerCase()), gestureHandler);
                }
            } else if (attr === ROW) {
                gridLayoutModule.GridLayout.setRow(instance, !isNaN(+attrValue) && +attrValue);
            } else if (attr === COL) {
                gridLayoutModule.GridLayout.setColumn(instance, !isNaN(+attrValue) && +attrValue);
            } else if (attr === COL_SPAN) {
                gridLayoutModule.GridLayout.setColumnSpan(instance, !isNaN(+attrValue) && +attrValue);
            } else if (attr === ROW_SPAN) {
                gridLayoutModule.GridLayout.setRowSpan(instance, !isNaN(+attrValue) && +attrValue);
            } else if (attr === LEFT) {
                absoluteLayoutDef.AbsoluteLayout.setLeft(instance, !isNaN(+attrValue) && +attrValue);
            } else if (attr === TOP) {
                absoluteLayoutDef.AbsoluteLayout.setTop(instance, !isNaN(+attrValue) && +attrValue);
            } else if (attr === DOCK) {
                dockLayoutDef.DockLayout.setDock(instance, attrValue);
            } else {
                var attrHandled = false;

                if ((<any>instance).applyXmlAttribute) {
                    attrHandled = (<any>instance).applyXmlAttribute(attr, attrValue);
                }

                if (!attrHandled) {
                    // Try to convert value to number.
                    var valueAsNumber = +attrValue;
                    if (!isNaN(valueAsNumber)) {
                        instance[attr] = valueAsNumber;
                    } else if (attrValue && (attrValue.toLowerCase() === "true" || attrValue.toLowerCase() === "false")) {
                        instance[attr] = attrValue.toLowerCase() === "true" ? true : false;
                    } else {
                        instance[attr] = attrValue;
                    }
                }
            }
        }

        componentModule = { component: instance, exports: instanceModule, bindings: bindings };
    }

    return componentModule;
}

function attachEventBinding(instance: view.View, eventName: string, value:string) {
    // Get the event handler from instance.bindingContext.
    var propertyChangeHandler = (args: observable.PropertyChangeData) => {
        if (args.propertyName === "bindingContext") {
            var handler = instance.bindingContext && instance.bindingContext[getBindingExpressionFromAttribute(value)];
            // Check if the handler is function and add it to the instance for specified event name.
            if (types.isFunction(handler)) {
                instance.on(eventName, handler, instance.bindingContext);
            }
            instance.off(observable.knownEvents.propertyChange, propertyChangeHandler);
        }
    };

    instance.on(observable.knownEvents.propertyChange, propertyChangeHandler);
}

function isGesture(name: string, instance: any): boolean {
    return gestures.fromString(name.toLowerCase()) !== undefined;
}

function isKnownEvent(name: string, exports: any): boolean {
    return (KNOWNEVENTS in exports && name in exports[KNOWNEVENTS]) ||
        (KNOWNEVENTS in view && name in view[KNOWNEVENTS]);
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
