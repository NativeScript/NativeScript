import { FPSCallback } from "./fps-native";
import { time } from "../profiling";

export interface FrameRequestCallback {
    (time: number): void;
}

let animationId = 0;
let nextFrameAnimationCallbacks: {[key: string]: FrameRequestCallback} = {};
let shouldStop = true;
let inAnimationFrame = false;
let native: FPSCallback;
let lastFrameTime = 0;

function getNewId() {
    return animationId++;
}

function ensureNative() {
    if (native) {
        return;
    }
    native = new FPSCallback(doFrame);
}

function doFrame(currentTimeMillis: number) {
    lastFrameTime = currentTimeMillis;
    shouldStop = true;
    const thisFrameCbs = nextFrameAnimationCallbacks;
    nextFrameAnimationCallbacks = {};
    inAnimationFrame = true;
    for (const animationId in thisFrameCbs) {
        if (thisFrameCbs[animationId]) {
            thisFrameCbs[animationId](lastFrameTime);
        }
    }
    inAnimationFrame = false;
    if (shouldStop) {
        native.stop(); // TODO: check performance without stopping to allow consistent frame times
    }
}

export function requestAnimationFrame(cb: (frameTime: number) => any): number {
    if(!inAnimationFrame) {
        inAnimationFrame = true;
        zonedCallback(cb)(time()); // TODO: store and use lastFrameTime
        inAnimationFrame = false;
        return getNewId();
    }
    ensureNative();
    const animId = getNewId();
    nextFrameAnimationCallbacks[animId] = zonedCallback(cb) as FrameRequestCallback;
    shouldStop = false;
    native.start();
    return animId;
};
export function cancelAnimationFrame(id: number) {
    delete nextFrameAnimationCallbacks[id];
};
