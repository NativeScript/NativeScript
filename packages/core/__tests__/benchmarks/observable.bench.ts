import { bench, describe } from 'vitest';
import { Observable, EventData } from '../../data/observable';

class TestObservable extends Observable {}

function noop(_data: EventData) {
	// listener body intentionally empty
}

describe('Observable.notify', () => {
	const singleListener = new TestObservable();
	singleListener.on('tick', noop);

	bench('notify - single listener (no thisArg)', () => {
		singleListener.notify({ eventName: 'tick', object: singleListener });
	});

	const singleListenerThisArg = new TestObservable();
	const ctx = { name: 'ctx' };
	singleListenerThisArg.on('tick', noop, ctx);

	bench('notify - single listener (with thisArg)', () => {
		singleListenerThisArg.notify({ eventName: 'tick', object: singleListenerThisArg });
	});

	const multiListener = new TestObservable();
	multiListener.on('tick', noop, { id: 1 });
	multiListener.on('tick', noop, { id: 2 });
	multiListener.on('tick', noop, { id: 3 });

	bench('notify - three listeners (with thisArg)', () => {
		multiListener.notify({ eventName: 'tick', object: multiListener });
	});

	const noListeners = new TestObservable();

	bench('notify - no listeners', () => {
		noListeners.notify({ eventName: 'tick', object: noListeners });
	});

	const propertyChangeTarget = new TestObservable();
	propertyChangeTarget.on(Observable.propertyChangeEvent, noop);

	bench('notifyPropertyChange', () => {
		propertyChangeTarget.notifyPropertyChange('value', 1, 0);
	});
});

const ctxLast = { id: 'last' };

describe('Observable listener management', () => {
	const observable = new TestObservable();

	bench('hasListeners - present', () => {
		observable.hasListeners('registered');
	});

	observable.on('registered', noop);

	bench('hasListeners - absent', () => {
		observable.hasListeners('unregistered');
	});

	bench('on/off cycle', () => {
		observable.on('cycle', noop);
		observable.off('cycle', noop);
	});

	const manyListeners = new TestObservable();
	for (let i = 0; i < 10; i++) {
		manyListeners.on('busy', noop, { id: i });
	}

	bench('on/off cycle - 10 existing listeners', () => {
		manyListeners.on('busy', noop, ctxLast);
		manyListeners.off('busy', noop, ctxLast);
	});
});
