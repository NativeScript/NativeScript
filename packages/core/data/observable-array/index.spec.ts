import { ObservableArray } from '.';

describe('ObservableArray', () => {
	describe('splice', () => {
		it('removes an item', () => {
			const _array = new ObservableArray();

			_array.push(1);
			_array.push(2);

			_array.splice(0, 1);

			expect(_array.getItem(0)).toBe(2);
		});

		it('replaces an item', () => {
			const _array = new ObservableArray();

			_array.push(1);
			_array.push(2);

			_array.splice(0, 1, 3);

			expect(_array.getItem(0)).toBe(3);
		});

		it('empties on start zero and no delete count', () => {
			const _array = new ObservableArray();

			_array.push(1);

			_array.splice(0);
			expect(_array.length).toBe(0);
		});

		it('empties on length set to zero', () => {
			const _array = new ObservableArray();

			_array.push(1);
			_array.push(2);

			_array.length = 0;
			expect(_array.length).toBe(0);
		});
	});

	describe('findIndex', () => {
		it('finds an item', () => {
			const _array = new ObservableArray();

			_array.push(1);
			_array.push(2);

			const index = _array.findIndex((i) => i === 2);

			expect(index).toBe(1);
		});

		it('does not find item', () => {
			const _array = new ObservableArray();

			_array.push(1);
			_array.push(2);

			const index = _array.findIndex((i) => i === 3);

			expect(index).toBe(-1);
		});
	});
});
