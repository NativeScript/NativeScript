import { queueMacrotask } from '../utils/macrotask-scheduler';
import { FPSCallback } from '../fps-meter/fps-native';
import { getTimeInFrameBase } from './animation-native';
import { Trace } from '../trace';
import { time } from '../profiling';

export interface FrameRequestCallback {
	(time: number): void;
}

type AnimationFrameCallbacks = { [key: string]: FrameRequestCallback };

let animationId = 0;
let currentFrameAnimationCallbacks: AnimationFrameCallbacks = {}; // requests that were scheduled in this frame and must be called ASAP
let currentFrameScheduled = false;
let nextFrameAnimationCallbacks: AnimationFrameCallbacks = {}; // requests there were scheduled in another request and must be called in the next frame
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

function callAnimationCallbacks(thisFrameCbs: AnimationFrameCallbacks, frameTime: number): void {
	inAnimationFrame = true;
	for (const animationId in thisFrameCbs) {
		if (thisFrameCbs[animationId]) {
			try {
				thisFrameCbs[animationId](frameTime);
			} catch (err) {
				const msg = err ? err.stack || err : err;
				Trace.write(`Error in requestAnimationFrame: ${msg}`, Trace.categories.Error, Trace.messageType.error);
			}
		}
	}
	inAnimationFrame = false;
}

function doCurrentFrame() {
	// if we're not getting accurate frame times
	// set last frame time as the current time
	if (!fpsCallback || !fpsCallback.running) {
		lastFrameTime = getTimeInFrameBase();
	}
	currentFrameScheduled = false;
	const thisFrameCbs = currentFrameAnimationCallbacks;
	currentFrameAnimationCallbacks = {};
	callAnimationCallbacks(thisFrameCbs, lastFrameTime);
}

function doFrame(currentMonotonicTimeMs: number) {
	lastFrameTime = currentMonotonicTimeMs;
	shouldStop = true;
	const thisFrameCbs = nextFrameAnimationCallbacks;
	nextFrameAnimationCallbacks = {};
	callAnimationCallbacks(thisFrameCbs, lastFrameTime);
	if (shouldStop) {
		fpsCallback.stop(); // TODO: check performance without stopping to allow consistent frame times
	}
}

function ensureCurrentFrameScheduled() {
	if (!currentFrameScheduled) {
		currentFrameScheduled = true;
		queueMacrotask(doCurrentFrame);
	}
}

export function requestAnimationFrame(cb: FrameRequestCallback): number {
	const animId = getNewId();
	if (!inAnimationFrame) {
		ensureCurrentFrameScheduled();
		currentFrameAnimationCallbacks[animId] = zonedCallback(cb) as FrameRequestCallback;
		return animId;
	}
	ensureNative();
	nextFrameAnimationCallbacks[animId] = zonedCallback(cb) as FrameRequestCallback;
	shouldStop = false;
	fpsCallback.start();

	return animId;
}

export function cancelAnimationFrame(id: number): void {
	delete currentFrameAnimationCallbacks[id];
	delete nextFrameAnimationCallbacks[id];
}

// ensure window exists and so does performances so that svelte and others work correctly
// we cant do it in globals because then vue would think we are web and would try to access navigator in window which does not exist
if (!global.window) {
	const window = global as any;
	window.window = global;
}

global.window.requestAnimationFrame = requestAnimationFrame;
global.window.cancelAnimationFrame = cancelAnimationFrame;

if (!global.performance) {
	global.performance = {
		now: time,
	} as any;
}
