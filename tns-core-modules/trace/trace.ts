import { EventListener, TraceWriter, ErrorHandler } from ".";

let enabled = false;
let _categories = {};
let _writers: Array<TraceWriter> = [];
let _eventListeners: Array<EventListener> = [];
let _errorHandler: ErrorHandler;

export function enable() {
    enabled = true;
}

export function disable() {
    enabled = false;
}

export function isEnabled() {
    return enabled;
}

export function isCategorySet(category: string): boolean {
    return category in _categories;
}

export function addWriter(writer: TraceWriter) {
    _writers.push(writer);
}

export function removeWriter(writer: TraceWriter) {
    let index = _writers.indexOf(writer);
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
    let split = categories.split(",");
    for (let i = 0; i < split.length; i++) {
        _categories[split[i].trim()] = true;
    }
}

export function write(message: any, category: string, type?: number) {
    // print error no matter what
    let i;
    if (type === messageType.error) {
        for (i = 0; i < _writers.length; i++) {
            _writers[i].write(message, category, type);
        }
        return;
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

    let i,
        listener: EventListener,
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

export function addEventListener(listener: EventListener) {
    _eventListeners.push(listener);
}

export function removeEventListener(listener: EventListener) {
    const index = _eventListeners.indexOf(listener);
    if (index >= 0) {
        _eventListeners.splice(index, 1);
    }
}

export module messageType {
    export const log = 0;
    export const info = 1;
    export const warn = 2;
    export const error = 3;
}

export module categories {
    export const VisualTreeEvents = "VisualTreeEvents";
    export const Layout = "Layout";
    export const Style = "Style";
    export const ViewHierarchy = "ViewHierarchy";
    export const NativeLifecycle = "NativeLifecycle";
    export const Debug = "Debug";
    export const Navigation = "Navigation";
    export const Test = "Test";
    export const Binding = "Binding";
    export const BindingError = "BindingError";
    export const Error = "Error";
    export const Animation = "Animation";
    export const Transition = "Transition";
    export const All = VisualTreeEvents + "," + Layout + "," + Style + "," + ViewHierarchy + "," + NativeLifecycle + "," + Debug + "," + Navigation + "," + Test + "," + Binding + "," + Error + "," + Animation + "," + Transition;

    export const separator = ",";

    export function concat(): string {
        let result: string;
        for (let i = 0; i < arguments.length; i++) {
            if (!result) {
                result = arguments[i];
                continue;
            }

            result = result.concat(separator, arguments[i]);
        }

        return result;
    }
}

class ConsoleWriter implements TraceWriter {
    public write(message: any, category: string, type?: number) {
        if (!console) {
            return;
        }

        let msgType;
        if (type === undefined) {
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

export class DefaultErrorHandler implements ErrorHandler {
    handlerError(error) {
        throw error;
    }
}
setErrorHandler(new DefaultErrorHandler());

export function getErrorHandler(): ErrorHandler {
    return _errorHandler;
}

export function setErrorHandler(handler: ErrorHandler) {
    _errorHandler = handler;
}
export function error(error: string | Error) {
    if (!_errorHandler) {
        return;
    }

    if (typeof error === "string") {
        error = new Error(error);
    }

    _errorHandler.handlerError(error);
}
