import * as fpsNative from './fps-native';

const callbacks = {};
let idCounter = 0;
let _minFps = 1000;
let framesRendered = 0;
let frameStartTime = 0;

function doFrame(currentTimeMillis: number) {
	let fps = 0;
	if (frameStartTime > 0) {
		// take the span in milliseconds
		const timeSpan = currentTimeMillis - frameStartTime;
		framesRendered++;

		if (timeSpan > 1000) {
			fps = (framesRendered * 1000) / timeSpan;
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

let native: fpsNative.FPSCallback;
function ensureNative() {
	if (!native) {
		native = new fpsNative.FPSCallback(doFrame);
	}
}

export function reset() {
	_minFps = 1000;
	frameStartTime = 0;
	framesRendered = 0;
}

export function running(): boolean {
	if (!native) {
		return false;
	}

	return native.running;
}

export function minFps(): number {
	return _minFps;
}

export function start() {
	ensureNative();
	native.start();
}

export function stop() {
	if (!native) {
		return;
	}

	native.stop();
	reset();
}

export function addCallback(callback: (fps: number, minFps?: number) => void): number {
	const id = idCounter;

	// Wrap all calback in zonedCallback so that they work with the current zone.
	callbacks[id] = zonedCallback(callback);
	idCounter++;

	return id;
}

export function removeCallback(id: number) {
	if (id in callbacks) {
		delete callbacks[id];
	}
}

function notify(fps) {
	let callback: Function;
	for (let id in callbacks) {
		callback = callbacks[id];
		callback(fps, _minFps);
	}
}
