import definition = require("ui/gestures");
import view = require("ui/core/view");

export enum GestureTypes {
    tap = 1 << 0,
    doubleTap = 1 << 1,
    pinch = 1 << 2,
    pan = 1 << 3,
    swipe = 1 << 4,
    rotation = 1 << 5,
    longPress = 1 << 6
}

export enum GestureStateTypes {
    possible = 1 << 0,
    recognized = 1 << 1,
    failed = 1 << 2,
    cancelled = 1 << 3,
    began = 1 << 4,
    changed = 1 << 5,
    ended = 1 << 6
}

export enum SwipeDirection {
    right = 1 << 0,
    left = 1 << 1,
    up = 1 << 2,
    down = 1 << 3
}

export function observe(target: view.View, type: number, callback: (args: definition.GestureEventData) => void, thisArg?: any): definition.GesturesObserver {
    var observer = new definition.GesturesObserver(callback);
    observer.observe(target, type, thisArg);
    return observer;
}

export function toString(type: GestureTypes, separator?: string): string {
    var types = new Array<string>();

    if (type & definition.GestureTypes.tap) {
        types.push("tap");
    }

    if (type & definition.GestureTypes.doubleTap) {
        types.push("doubleTap");
    }

    if (type & definition.GestureTypes.pinch) {
        types.push("pinch");
    }

    if (type & definition.GestureTypes.pan) {
        types.push("pan");
    }

    if (type & definition.GestureTypes.swipe) {
        types.push("swipe");
    }

    if (type & definition.GestureTypes.rotation) {
        types.push("rotation");
    }

    if (type & definition.GestureTypes.longPress) {
        types.push("longPress");
    }

    return types.join(separator);
}

export function fromString(type: string): definition.GestureTypes {
    var t = type.trim().toLowerCase();

    if (t === "tap") {
        return definition.GestureTypes.tap;
    } else if (t === "doubletap") {
        return definition.GestureTypes.doubleTap;
    } else if (t === "pinch") {
        return definition.GestureTypes.pinch;
    } else if (t === "pan") {
        return definition.GestureTypes.pan;
    } else if (t === "swipe") {
        return definition.GestureTypes.swipe;
    } else if (t === "rotation") {
        return definition.GestureTypes.rotation;
    } else if (t === "longpress") {
        return definition.GestureTypes.longPress;
    }

    return undefined;
}