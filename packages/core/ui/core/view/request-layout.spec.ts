import { StackLayout } from '../../layouts/stack-layout';

describe('iOS requestLayout', () => {
	async function tree() {
		const parent = new StackLayout();
		const child = new StackLayout();
		parent.addChild(child);
		// addChild requests layout; start each test on a fresh turn.
		await Promise.resolve();
		const parentRequest = vi.spyOn(parent, 'requestLayout');
		return { parent, child, parentRequest };
	}

	it('climbs once per turn while the view is still flagged', async () => {
		const { child, parentRequest } = await tree();

		child.requestLayout();
		child.requestLayout();
		child.requestLayout();

		expect(parentRequest).toHaveBeenCalledTimes(1);
	});

	it('climbs again in the next turn', async () => {
		const { child, parentRequest } = await tree();

		child.requestLayout();
		await Promise.resolve();
		child.requestLayout();

		expect(parentRequest).toHaveBeenCalledTimes(2);
	});

	it('climbs again after a layout pass clears the flag', async () => {
		const { child, parentRequest } = await tree();

		child.requestLayout();
		child.layout(0, 0, 100, 100);
		expect(child.isLayoutRequested).toBe(false);
		child.requestLayout();

		expect(parentRequest).toHaveBeenCalledTimes(2);
	});

	it('climbs again when a same-turn layout pass cleared an ancestor but skipped the view', async () => {
		const { parent, child } = await tree();

		child.visibility = 'collapse';
		child.requestLayout();
		parent.measure(0, 0);
		parent.layout(0, 0, 100, 100);
		expect(parent.isLayoutRequested).toBe(false);
		expect(child.isLayoutRequested).toBe(true);

		child.visibility = 'visible';
		child.requestLayout();

		expect(parent.isLayoutRequested).toBe(true);
	});
});
