import definition = require("ui/gestures");
import view = require("ui/core/view");

export enum GestureTypes {
    Tap = 1 << 0,
    DoubleTap = 1 << 1,
    Pinch = 1 << 2,
    Pan = 1 << 3,
    Swipe = 1 << 4,
    Rotation = 1 << 5,
    LongPress = 1 << 6
}

export enum GestureStateTypes {
    Possible = 1 << 0,
    Recognized = 1 << 1,
    Failed = 1 << 2,
    Cancelled = 1 << 3,
    Began = 1 << 4,
    Changed = 1 << 5,
    Ended = 1 << 6
}

export enum SwipeDirection {
    Right = 1 << 0,
    Left = 1 << 1,
    Up = 1 << 2,
    Down = 1 << 3
}

export function observe(target: view.View, type: number, callback: (args: definition.GestureEventData) => void): definition.GesturesObserver {
    var observer = new definition.GesturesObserver(callback);
    observer.observe(target, type);
    return observer;
}

export function toString(type: GestureTypes, separator?: string): string {
    var types = new Array<string>();

    if (type & definition.GestureTypes.Tap) {
        types.push("Tap");
    }

    if (type & definition.GestureTypes.DoubleTap) {
        types.push("DoubleTap");
    }

    if (type & definition.GestureTypes.Pinch) {
        types.push("Pinch");
    }

    if (type & definition.GestureTypes.Pan) {
        types.push("Pan");
    }

    if (type & definition.GestureTypes.Swipe) {
        types.push("Swipe");
    }

    if (type & definition.GestureTypes.Rotation) {
        types.push("Rotation");
    }

    if (type & definition.GestureTypes.LongPress) {
        types.push("LongPress");
    }

    return types.join(separator);
}

export function fromString(type: string): definition.GestureTypes {
    var t = type.trim().toLowerCase();

    if (t === "tap") {
        return definition.GestureTypes.Tap;
    } else if (t === "doubletap") {
        return definition.GestureTypes.DoubleTap;
    } else if (t === "pinch") {
        return definition.GestureTypes.Pinch;
    } else if (t === "pan") {
        return definition.GestureTypes.Pan;
    } else if (t === "swipe") {
        return definition.GestureTypes.Swipe;
    } else if (t === "rotation") {
        return definition.GestureTypes.Rotation;
    } else if (t === "longpress") {
        return definition.GestureTypes.LongPress;
    }

    return undefined;
}