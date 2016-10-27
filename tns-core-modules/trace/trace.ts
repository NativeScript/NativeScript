import definition = require("trace");
import * as types from "utils/types";

export var enabled = false;
var _categories = {};
var _writers: Array<definition.TraceWriter> = [];
var _eventListeners: Array<definition.EventListener> = [];

export function enable() {
    enabled = true;
}

export function disable() {
    enabled = false;
}

export function isCategorySet(category: string): boolean {
    return category in _categories;
}

export function addWriter(writer: definition.TraceWriter) {
    _writers.push(writer);
}

export function removeWriter(writer: definition.TraceWriter) {
    var index = _writers.indexOf(writer);
    if (index >= 0) {
        _writers.splice(index, 1);
    }
}

export function clearWriters() {
    if (_writers.length > 0) {
        _writers.splice(0, _writers.length);
    }
}

export function setCategories(categories: string) {
    _categories = {};
    addCategories(categories);
}

export function addCategories(categories: string) {
    var split = categories.split(",");
    for (let i = 0; i < split.length; i++) {
        _categories[split[i].trim()] = true;
    }
}

export function write(message: any, category: string, type?: number) {
    // print error no matter what
    var i;
    if (type === messageType.error) {
        for (i = 0; i < _writers.length; i++) {
            _writers[i].write(message, category, type);
        }
    }
    
    if (!enabled) {
        return;
    }

    if (!(category in _categories)) {
        return;
    }

    for (i = 0; i < _writers.length; i++) {
        _writers[i].write(message, category, type);
    }
}

export function notifyEvent(object: Object, name: string, data?: any) {
    if (!enabled) {
        return;
    }

    var i,
        listener: definition.EventListener,
        filters: Array<string>;
    for (i = 0; i < _eventListeners.length; i++) {
        listener = _eventListeners[i];
        if (listener.filter) {
            filters = listener.filter.split(",");
            filters.forEach((value: string) => {
                if (value.trim() === name) {
                    listener.on(object, name, data);
                }
            });
        } else {
            listener.on(object, name, data);
        }
    }
}

export function addEventListener(listener: definition.EventListener) {
    _eventListeners.push(listener);
}

export function removeEventListener(listener: definition.EventListener) {
    var index = _eventListeners.indexOf(listener);
    if (index >= 0) {
        _eventListeners.splice(index, 1);
    }
}

export module messageType {
    export var log = 0;
    export var info = 1;
    export var warn = 2;
    export var error = 3;
}

export module categories {
    export var VisualTreeEvents = "VisualTreeEvents";
    export var Layout = "Layout";
    export var Style = "Style";
    export var ViewHierarchy = "ViewHierarchy";
    export var NativeLifecycle = "NativeLifecycle";
    export var Debug = "Debug";
    export var Navigation = "Navigation";
    export var Test = "Test";
    export var Binding = "Binding";
    export var BindingError = "BindingError";
    export var Error = "Error";
    export var Animation = "Animation";
    export var Transition = "Transition";
    export var All = VisualTreeEvents + "," + Layout + "," + Style + "," + ViewHierarchy + "," + NativeLifecycle + "," + Debug + "," + Navigation + "," + Test + "," + Binding + "," + Error + "," + Animation + "," + Transition;

    export var separator = ",";

    export function concat(): string {
        var i;
        var result: string;
        for (i = 0; i < arguments.length; i++) {
            if (!result) {
                result = arguments[i];
                continue;
            }

            result = result.concat(separator, arguments[i]);
        }

        return result;
    }
}

class ConsoleWriter implements definition.TraceWriter {
    public write(message: any, category: string, type?: number) {
        if (!console) {
            return;
        }

        var msgType;
        if (types.isUndefined(type)) {
            msgType = messageType.log;
        } else {
            msgType = type;
        }

        switch (msgType) {
            case messageType.log:
                console.log(category + ": " + message);
                break;
            case messageType.info:
                console.info(category + ": " + message);
                break;
            case messageType.warn:
                console.warn(category + ": " + message);
                break;
            case messageType.error:
                console.error(category + ": " + message);
                break;
        }
    }
}

// register a ConsoleWriter by default
addWriter(new ConsoleWriter());