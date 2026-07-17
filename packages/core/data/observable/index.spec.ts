import { Observable } from '.';

describe('Observable', () => {
	describe('once', () => {
		let observable: Observable;
		let handler: () => void;
		let callCount = 0;

		beforeEach(() => {
			handler = function () {
				callCount++;
			};
			observable = new Observable();
			observable.once('test', handler);
		});
		afterEach(() => {
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
			expect(callCount).toBe(1);
		});
		it('does not fire for other events', () => {
			notifyWrong();
			expect(callCount).toBe(0);
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
			expect(callCount1).toBe(1);
			expect(callCount2).toBe(1);
		});

		it('fires just once when registered after a listener that removes itself', () => {
			const observable = new Observable();
			let selfRemovingCallCount = 0;
			let onceCallCount = 0;
			let regularCallCount = 0;
			const selfRemovingHandler = function () {
				selfRemovingCallCount++;
				observable.off('test', selfRemovingHandler);
			};
			const onceHandler = function () {
				onceCallCount++;
			};
			const regularHandler = function () {
				regularCallCount++;
			};
			observable.on('test', selfRemovingHandler);
			observable.once('test', onceHandler);
			observable.on('test', regularHandler);
			observable.notify({ eventName: 'test', object: observable });
			observable.notify({ eventName: 'test', object: observable });
			expect(selfRemovingCallCount).toBe(1);
			expect(onceCallCount).toBe(1);
			expect(regularCallCount).toBe(2);
		});

		it('fires each of two once listeners just once', () => {
			const observable = new Observable();
			let callCount1 = 0;
			let callCount2 = 0;
			observable.once('test', function () {
				callCount1++;
			});
			observable.once('test', function () {
				callCount2++;
			});
			observable.notify({ eventName: 'test', object: observable });
			expect(callCount1).toBe(1);
			expect(callCount2).toBe(1);
			observable.notify({ eventName: 'test', object: observable });
			expect(callCount1).toBe(1);
			expect(callCount2).toBe(1);
		});
	});

	describe('notify', () => {
		it('calls listeners in registration order with the event data', () => {
			const observable = new Observable();
			const calls: string[] = [];
			observable.on('test', (data) => calls.push('first:' + data.eventName));
			observable.on('test', (data) => calls.push('second:' + data.eventName));
			observable.notify({ eventName: 'test', object: observable });
			expect(calls).toEqual(['first:test', 'second:test']);
		});

		it('binds thisArg as the callback context', () => {
			const observable = new Observable();
			const ctx = { name: 'ctx' };
			let receivedThis: any;
			let receivedData: any;
			observable.on(
				'test',
				function (this: any, data) {
					receivedThis = this;
					receivedData = data;
				},
				ctx,
			);
			observable.notify({ eventName: 'test', object: observable });
			expect(receivedThis).toBe(ctx);
			expect(receivedData.eventName).toBe('test');
			expect(receivedData.object).toBe(observable);
		});

		it('allows a listener to remove itself during dispatch without affecting other listeners', () => {
			const observable = new Observable();
			const calls: string[] = [];
			const first = () => {
				calls.push('first');
				observable.off('test', first);
			};
			const second = () => calls.push('second');
			observable.on('test', first);
			observable.on('test', second);
			observable.notify({ eventName: 'test', object: observable });
			observable.notify({ eventName: 'test', object: observable });
			expect(calls).toEqual(['first', 'second', 'second']);
		});
	});

	describe('hasListeners', () => {
		it('reflects listener registration and removal', () => {
			const observable = new Observable();
			expect(observable.hasListeners('test')).toBe(false);
			const handler = () => {
				// no-op
			};
			observable.on('test', handler);
			expect(observable.hasListeners('test')).toBe(true);
			observable.off('test', handler);
			expect(observable.hasListeners('test')).toBe(false);
		});
	});

	describe('static (global) event handlers', () => {
		afterEach(() => {
			Observable.removeEventListener('globalTest');
		});

		it('notifies global handlers registered on Observable for any instance', () => {
			const calls: string[] = [];
			Observable.addEventListener('globalTest', () => calls.push('global'));

			const observable = new Observable();
			observable.on('globalTest', () => calls.push('instance'));
			observable.notify({ eventName: 'globalTest', object: observable });

			expect(calls).toEqual(['instance', 'global']);
		});

		it('notifies eventNameFirst global handlers before instance listeners', () => {
			const calls: string[] = [];
			Observable.addEventListener('globalTestFirst', () => calls.push('globalFirst'));

			const observable = new Observable();
			observable.on('globalTest', () => calls.push('instance'));
			observable.notify({ eventName: 'globalTest', object: observable });

			Observable.removeEventListener('globalTestFirst');

			expect(calls).toEqual(['globalFirst', 'instance']);
		});

		it('stops notifying after global handler removal', () => {
			let callCount = 0;
			const handler = () => callCount++;
			Observable.addEventListener('globalTest', handler);

			const observable = new Observable();
			observable.notify({ eventName: 'globalTest', object: observable });
			expect(callCount).toBe(1);

			Observable.removeEventListener('globalTest', handler);
			observable.notify({ eventName: 'globalTest', object: observable });
			expect(callCount).toBe(1);
		});
	});
});
