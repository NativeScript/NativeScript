import * as TKUnit from '../tk-unit';
import { Utils } from '@nativescript/core';

export function test_GC_isDefined() {
	TKUnit.assertNotEqual(Utils.GC, undefined, 'Method utils.GC() should be defined!');
}

export function test_releaseNativeObject_isDefined() {
	TKUnit.assertNotEqual(Utils.releaseNativeObject, undefined, 'Method utils.releaseNativeObject() should be defined!');
}

export function test_releaseNativeObject_canBeCalledWithNativeObject() {
	if (__APPLE__) {
		test_releaseNativeObject_canBeCalledWithNativeObject_iOS();
	} else {
		test_releaseNativeObject_canBeCalledWithNativeObject_Android();
	}
}

export function test_executeOnMainThread_Works(done: Function) {
	Utils.executeOnMainThread(() => {
		try {
			TKUnit.assertTrue(Utils.isMainThread());
			done();
		} catch (e) {
			done(e);
		}
	});
}

export function test_dispatchToMainThread_Works(done: Function) {
	Utils.dispatchToMainThread(() => {
		try {
			TKUnit.assertTrue(Utils.isMainThread());
			done();
		} catch (e) {
			done(e);
		}
	});
}

export function test_mainThreadify_PassesArgs(done: Function) {
	const expectedN = 434;
	const expectedB = true;
	const expectedS = 'string';
	const f = Utils.mainThreadify(function (n: number, b: boolean, s: string) {
		try {
			TKUnit.assertTrue(Utils.isMainThread());
			TKUnit.assertEqual(n, expectedN);
			TKUnit.assertEqual(b, expectedB);
			TKUnit.assertEqual(s, expectedS);
			done();
		} catch (e) {
			done(e);
		}
	});

	f(expectedN, expectedB, expectedS);
}

function test_releaseNativeObject_canBeCalledWithNativeObject_iOS() {
	let deallocated = false;
	const obj = new ((<any>NSObject).extend({
		dealloc: function () {
			deallocated = true;
		},
	}))();
	TKUnit.assertMatches(obj.description, /NSObject/, 'Object description should match!');

	Utils.releaseNativeObject(obj);

	// Need to sleep to make the delayed release get executed
	NSThread.sleepForTimeInterval(0);
	TKUnit.assertTrue(deallocated, 'NativeObject must have been deallocated!');
}

function test_releaseNativeObject_canBeCalledWithNativeObject_Android() {
	const obj = new java.lang.Object();
	TKUnit.assertMatches(obj.toString(), /java.lang.Object/, 'Object description should match!');

	Utils.releaseNativeObject(obj);

	TKUnit.assertThrowsRegExp(obj.toString.bind(obj), 'Should throw an error!', /Failed calling toString on a java\/lang\/Object instance/);
}
