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
	});
});
