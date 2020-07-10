import { FPSCallback } from '../fps-meter/fps-native';
import { getTimeInFrameBase } from './animation-native';

export interface FrameRequestCallback {
	(time: number): void;
}

let animationId = 0;
let nextFrameAnimationCallbacks: { [key: string]: FrameRequestCallback } = {};
let shouldStop = true;
let inAnimationFrame = false;
let fpsCallback: FPSCallback;
let lastFrameTime = 0;

function getNewId() {
	return animationId++;
}

function ensureNative() {
	if (fpsCallback) {
		return;
	}
	fpsCallback = new FPSCallback(doFrame);
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
		fpsCallback.stop(); // TODO: check performance without stopping to allow consistent frame times
	}
}

export function requestAnimationFrame(cb: FrameRequestCallback): number {
	if (!inAnimationFrame) {
		inAnimationFrame = true;
		zonedCallback(cb)(getTimeInFrameBase()); // TODO: store and use lastFrameTime
		inAnimationFrame = false;

		return getNewId();
	}
	ensureNative();
	const animId = getNewId();
	nextFrameAnimationCallbacks[animId] = zonedCallback(cb) as FrameRequestCallback;
	shouldStop = false;
	fpsCallback.start();

	return animId;
}

export function cancelAnimationFrame(id: number) {
	delete nextFrameAnimationCallbacks[id];
}
