import * as TKUnit from '../tk-unit';
import * as animationFrame from '@nativescript/core/animation-frame';
import * as fpsNative from '@nativescript/core/fps-meter/fps-native';

export function test_requestAnimationFrame_isDefined() {
	TKUnit.assertNotEqual(animationFrame.requestAnimationFrame, undefined, 'Method animationFrame.requestAnimationFrame() should be defined!');
}

export function test_cancelAnimationFrame_isDefined() {
	TKUnit.assertNotEqual(animationFrame.cancelAnimationFrame, undefined, 'Method animationFrame.cancelAnimationFrame() should be defined!');
}

export function test_requestAnimationFrame() {
	let completed: boolean;

	const id = animationFrame.requestAnimationFrame(() => {
		completed = true;
	});

	TKUnit.waitUntilReady(() => completed, 0.5, false);
	animationFrame.cancelAnimationFrame(id);
	TKUnit.assert(completed, 'Callback should be called!');
}

export function test_requestAnimationFrame_callbackCalledInCurrentFrame() {
	let completed: boolean;
	let currentFrameTime = 0;
	const frameCb = new fpsNative.FPSCallback((time) => {
		currentFrameTime = time;
	});
	frameCb.start();

	TKUnit.waitUntilReady(() => currentFrameTime > 0, 0.5);
	let calledTime = 0;
	animationFrame.requestAnimationFrame((frameTime) => {
		calledTime = frameTime;
		completed = calledTime >= frameTime;
	});

	TKUnit.waitUntilReady(() => completed, 0.5, false);
	frameCb.stop();
	TKUnit.assert(completed, 'Callback should be called in current frame!');
}

export function test_requestAnimationFrame_nextCallbackCalledInNextFrame() {
	let completed: boolean;
	let currentFrameTime = 0;
	const frameCb = new fpsNative.FPSCallback((time) => {
		currentFrameTime = time;
	});
	frameCb.start();

	TKUnit.waitUntilReady(() => currentFrameTime > 0, 0.5);
	animationFrame.requestAnimationFrame((firstFrameTime) => {
		animationFrame.requestAnimationFrame((frameTime) => {
			frameCb.stop();
			completed = frameTime > firstFrameTime && frameTime === currentFrameTime;
		});
	});

	TKUnit.waitUntilReady(() => completed, 0.5, false);
	frameCb.stop();
	TKUnit.assert(completed, 'Callback should be called in next frame!');
}

export function test_requestAnimationFrame_shouldBeCancelled() {
	let completed: boolean;
	let currentFrameTime = 0;
	const frameCb = new fpsNative.FPSCallback((time) => {
		currentFrameTime = time;
	});
	frameCb.start();

	TKUnit.waitUntilReady(() => currentFrameTime > 0, 0.5);
	animationFrame.requestAnimationFrame((firstFrameTime) => {
		const cbId = animationFrame.requestAnimationFrame((frameTime) => {
			completed = true;
		});
		animationFrame.cancelAnimationFrame(cbId);
	});

	TKUnit.wait(1);
	frameCb.stop();
	TKUnit.assert(!completed, 'Callback should not be called');
}
