import fpsNative = require("fps-meter/fps-native");

var callbacks = {},
    idCounter = 0,
    _minFps = 1000,
    framesRendered = 0,
    frameStartTime = 0;

function doFrame(currentTimeMillis: number) {
    var fps = 0;
    if (frameStartTime > 0) {
        // take the span in milliseconds        
        var timeSpan = (currentTimeMillis - frameStartTime);
        framesRendered++;

        if (timeSpan > 1000) {
            fps = framesRendered * 1000 / timeSpan;
            if (fps < _minFps) {
                _minFps = fps;
            }

            notify(fps);

            frameStartTime = currentTimeMillis;
            framesRendered = 0;
        }
    } else {
        frameStartTime = currentTimeMillis;
    }
}

var native = new fpsNative.FPSCallback(doFrame);

export function reset() {
    _minFps = 1000;
    frameStartTime = 0;
    framesRendered = 0;
}

export function running(): boolean {
    return native.running;
}

export function minFps(): number {
    return _minFps;
}

export function start() {
    native.start();
}

export function stop() {
    native.stop();
    reset();
}

export function addCallback(callback: (fps: number, minFps?: number) => void): number {
    var id = idCounter;

    callbacks[id] = callback;
    idCounter++;

    return id;
}

export function removeCallback(id: number) {
    if (id in callbacks) {
        delete callbacks[id];
    }
}

function notify(fps) {
    var callback: Function;
    for (var id in callbacks) {
        callback = callbacks[id];
        callback(fps, _minFps);
    }
}