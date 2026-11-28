import { setToggleApplicationEventListenersCallback, toggleApplicationEventListeners } from './helpers-common';

describe('toggleApplicationEventListeners', () => {
	it('replays listeners requested before the platform handler is installed', () => {
		const handled: Array<[boolean, (args: any) => void]> = [];
		const early = () => {};
		const withdrawn = () => {};

		toggleApplicationEventListeners(true, early);
		toggleApplicationEventListeners(true, withdrawn);
		toggleApplicationEventListeners(false, withdrawn);

		setToggleApplicationEventListenersCallback((toAdd, callback) => handled.push([toAdd, callback]));

		expect(handled).toEqual([[true, early]]);

		const late = () => {};
		toggleApplicationEventListeners(true, late);

		expect(handled).toEqual([
			[true, early],
			[true, late],
		]);
	});
});
