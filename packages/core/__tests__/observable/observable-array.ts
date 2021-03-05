import { ObservableArray } from '@nativescript/core/data/observable-array';
import { assert } from 'chai';

describe('observable-array', () => {
	describe('splice', () => {
		it('removes an item', () => {
			const _array = new ObservableArray();

			_array.push(1);
			_array.push(2);

			_array.splice(0, 1);

			assert.equal(2, _array.getItem(0));
		});

		it('replaces an item', () => {
			const _array = new ObservableArray();

			_array.push(1);
			_array.push(2);

			_array.splice(0, 1, 3);

			assert.equal(3, _array.getItem(0));
		});

		it('empties on start zero and no delete count', () => {
			const _array = new ObservableArray();

			_array.push(1);

			_array.splice(0);
			assert.equal(0, _array.length);
		});

		it('empties on length set to zero', () => {
			const _array = new ObservableArray();

			_array.push(1);
			_array.push(2);

			_array.length = 0;
			assert.equal(0, _array.length);
		});
	});
});
