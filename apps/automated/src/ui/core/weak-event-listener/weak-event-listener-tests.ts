import * as TKUnit from '../../../tk-unit';
import { Observable, EventData } from '@nativescript/core';
import { addWeakEventListener, removeWeakEventListener } from '@nativescript/core/ui/core/weak-event-listener';
import { forceGC } from '../../../ui-helper';

class Target {
	public counter: number = 0;
	public onEvent(data: EventData) {
		this.counter++;
	}
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_source() {
	TKUnit.assertThrows(() => {
		addWeakEventListener(undefined, 'eventName', emptyHandler, {});
	});
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_target() {
	TKUnit.assertThrows(() => {
		addWeakEventListener(new Observable(), 'eventName', emptyHandler, undefined);
	});
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_handler() {
	TKUnit.assertThrows(() => {
		addWeakEventListener(new Observable(), 'eventName', undefined, {});
	});
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_name() {
	TKUnit.assertThrows(() => {
		addWeakEventListener(new Observable(), undefined, emptyHandler, {});
	});
}

export function test_addWeakEventListener_listensForEvent() {
	const source = new Observable();
	const target = new Target();

	addWeakEventListener(source, Observable.propertyChangeEvent, target.onEvent, target);

	source.set('testProp', 'some value');

	TKUnit.assertEqual(target.counter, 1, 'Handler not called.');
}

export function test_addWeakEventListener_listensForEven_multipleTargetst() {
	const source = new Observable();
	const target1 = new Target();
	const target2 = new Target();

	addWeakEventListener(source, Observable.propertyChangeEvent, target1.onEvent, target1);
	addWeakEventListener(source, Observable.propertyChangeEvent, target2.onEvent, target2);

	source.set('testProp', 'some value');

	TKUnit.assertEqual(target1.counter, 1, 'Handler not called.');
	TKUnit.assertEqual(target2.counter, 1, 'Handler not called.');
}

export function test_removeWeakEventListener_StopsListeningForEvent() {
	const source = new Observable();
	const target = new Target();

	addWeakEventListener(source, Observable.propertyChangeEvent, target.onEvent, target);
	removeWeakEventListener(source, Observable.propertyChangeEvent, target.onEvent, target);

	source.set('testProp', 'some value');
	TKUnit.assertEqual(target.counter, 0, 'Handler should not be called.');
}

export function test_handlerIsCalled_WithTargetAsThis() {
	const source = new Observable();
	const target = new Object();
	let callbackCalled = false;
	const handler = function (args: EventData) {
		TKUnit.assertEqual(this, target, 'this should be the target');
		callbackCalled = true;
	};

	addWeakEventListener(source, Observable.propertyChangeEvent, handler, target);

	source.set('testProp', 'some value');
	TKUnit.assert(callbackCalled, 'Handler not called.');
}

function getSourceAsWeakRef(): WeakRef<Observable> {
	return new WeakRef(new Observable());
}

function getTargetAsWeakRef(): WeakRef<Target> {
	return new WeakRef(new Target());
}

export function test_listenerDoesNotRetainTarget(done) {
	const sourceRef = getSourceAsWeakRef();
	const targetRef = getTargetAsWeakRef();

	// with the v8 6.5 the GC does not release WeakRefs so fast if you pass them to a method
	// that's why we are making the call to the addWeakEventListener in a closure so that the WeakRef will be easier released
	(function () {
		addWeakEventListener(sourceRef.get(), Observable.propertyChangeEvent, emptyHandler, targetRef.get());
	})();
	forceGC();

	try {
		TKUnit.assert(!targetRef.get(), 'Target should be released after GC');
		done(null);
	} catch (e) {
		done(e);
	}
}

export function test_listenerDoesNotRetainSource(done) {
	const sourceRef = getSourceAsWeakRef();
	const targetRef = getTargetAsWeakRef();

	// with the v8 6.5 the GC does not release WeakRefs so fast if you pass them to a method
	// that's why we are making the call to the addWeakEventListener in a closure so that the WeakRef will be easier released
	(function () {
		addWeakEventListener(sourceRef.get(), Observable.propertyChangeEvent, targetRef.get().onEvent, targetRef.get());
	})();
	forceGC();

	try {
		TKUnit.assert(!sourceRef.get(), 'Source should be released after GC');
		done(null);
	} catch (e) {
		done(e);
	}
}

export function test_handlerIsDetached_WhenAllListenersAreRemoved() {
	const source = new Observable();

	const target1 = new Target();
	const target2 = new Target();

	addWeakEventListener(source, Observable.propertyChangeEvent, target1.onEvent, target1);
	addWeakEventListener(source, Observable.propertyChangeEvent, target2.onEvent, target2);

	removeWeakEventListener(source, Observable.propertyChangeEvent, target1.onEvent, target1);
	removeWeakEventListener(source, Observable.propertyChangeEvent, target2.onEvent, target2);

	TKUnit.assert(!source.hasListeners(Observable.propertyChangeEvent), 'All events should be detached');
}

export function test_autoDetachingOfDeadReferences(done) {
	const source = new Observable();

	for (let i = 0; i < 100; i++) {
		addListenerWithSource(source);
	}

	try {
		const target = new Target();

		addWeakEventListener(source, Observable.propertyChangeEvent, emptyHandler, target);
		removeWeakEventListener(source, Observable.propertyChangeEvent, emptyHandler, target);

		forceGC();

		const testPass = (<any>source)._observers[Observable.propertyChangeEvent] ? (<any>source)._observers[Observable.propertyChangeEvent].length <= 1 : true;
		TKUnit.assert(testPass, 'All events should be detached');
		done(null);
	} catch (e) {
		done(e);
	}
}

function addListenerWithSource(source: Observable) {
	const target = new Target();
	addWeakEventListener(source, Observable.propertyChangeEvent, target.onEvent, target);
}

function emptyHandler(data: EventData) {
	// Do nothing.
}
