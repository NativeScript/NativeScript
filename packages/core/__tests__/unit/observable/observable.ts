import { Observable } from '@nativescript/core/data/observable';
import { assert } from 'chai';

describe('observable', () => {
	describe('once', () => {
		let observable: Observable;
		let handler: () => void;
		let callCount: number = 0;

		beforeEach('create handlers', () => {
			handler = function () {
				callCount++;
			};
			observable = new Observable();
			observable.once('test', handler);
		});
		afterEach('reset handlers', () => {
			callCount = 0;
			handler = null;
			observable = null;
		});

		function notify() {
			observable.notify({ eventName: 'test', object: observable });
		}
		function notifyWrong() {
			observable.notify({ eventName: 'test2', object: observable });
		}

		it('fires just once', () => {
			notify();
			notify();
			assert.equal(callCount, 1, 'Expected the handler to be called exactly once');
		});
		it('does not fire for other events', () => {
			notifyWrong();
			assert.equal(callCount, 0, 'Expected the handler to not be called, when other events fire');
		});
	});

	describe('once', () => {
		it('fire once when fired recursively', () => {
			const observable = new Observable();
			let callCount1 = 0;
			let callCount2 = 0;
			const handler2 = function () {
				callCount2++;
			};
			const handler1 = function () {
				callCount1++;
				observable.once('test', handler2);
				observable.notify({ eventName: 'test', object: observable });
			};
			observable.once('test', handler1);
			observable.notify({ eventName: 'test', object: observable });
			assert.equal(callCount1, 1, 'Expected the first handler to unsubscribe before being fired and to notify just once');
			assert.equal(callCount2, 1, 'Expected the second handler to be fired once when recursively notified by the first handler');
		});
	});
});
