import { LayoutBaseCommon } from './layout-base-common';
import { View } from '../core/view';

describe('LayoutBaseCommon sibling CSS invalidation', () => {
	function createLayout(scopeFlags: { hasAdjacentCombinatorSelectors: boolean; hasSiblingCombinatorSelectors: boolean } | null) {
		const layout = new LayoutBaseCommon();
		layout._styleScope = scopeFlags as any;

		const a = new LayoutBaseCommon();
		const b = new LayoutBaseCommon();
		layout.addChild(a as unknown as View);
		layout.addChild(b as unknown as View);

		const spyA = vi.spyOn(a, '_onCssStateChange');
		const spyB = vi.spyOn(b, '_onCssStateChange');

		return { layout, a, b, spyA, spyB };
	}

	const adjacentOnly = { hasAdjacentCombinatorSelectors: true, hasSiblingCombinatorSelectors: false };
	const generalSibling = { hasAdjacentCombinatorSelectors: false, hasSiblingCombinatorSelectors: true };
	const noCombinators = { hasAdjacentCombinatorSelectors: false, hasSiblingCombinatorSelectors: false };

	it('insert at 0 with adjacent selectors invalidates only the shifted view', () => {
		const { layout, spyA, spyB } = createLayout(adjacentOnly);

		layout.insertChild(new LayoutBaseCommon() as unknown as View, 0);

		expect(spyA).toHaveBeenCalledTimes(1);
		expect(spyB).not.toHaveBeenCalled();
	});

	it('insert in the middle with adjacent selectors invalidates only the next view', () => {
		const { layout, spyA, spyB } = createLayout(adjacentOnly);

		layout.insertChild(new LayoutBaseCommon() as unknown as View, 1);

		expect(spyA).not.toHaveBeenCalled();
		expect(spyB).toHaveBeenCalledTimes(1);
	});

	it('remove at 0 with adjacent selectors invalidates only the view taking its place', () => {
		const { layout, a, spyB } = createLayout(adjacentOnly);

		layout.removeChild(a as unknown as View);

		expect(spyB).toHaveBeenCalledTimes(1);
	});

	it('insert at 0 with general sibling selectors invalidates all following views', () => {
		const { layout, spyA, spyB } = createLayout(generalSibling);

		layout.insertChild(new LayoutBaseCommon() as unknown as View, 0);

		expect(spyA).toHaveBeenCalledTimes(1);
		expect(spyB).toHaveBeenCalledTimes(1);
	});

	it('remove at 0 with general sibling selectors invalidates all following views', () => {
		const { layout, a, spyB } = createLayout(generalSibling);

		layout.removeChild(a as unknown as View);

		expect(spyB).toHaveBeenCalledTimes(1);
	});

	it('fresh child is matched once through scope inheritance, not twice', () => {
		const { layout } = createLayout(adjacentOnly);
		const c = new LayoutBaseCommon();
		const spyC = vi.spyOn(c, '_onCssStateChange');

		layout.insertChild(c as unknown as View, 0);

		expect(spyC).toHaveBeenCalledTimes(1);
	});

	it('re-inserting a child that kept its scope invalidates the child itself', () => {
		const { layout, a, spyA, spyB } = createLayout(adjacentOnly);

		layout.removeChild(a as unknown as View);
		spyA.mockClear();
		spyB.mockClear();

		layout.insertChild(a as unknown as View, 1);

		expect(spyA).toHaveBeenCalledTimes(1);
		expect(spyB).not.toHaveBeenCalled();
	});

	it('append does not invalidate existing children', () => {
		const { layout, spyA, spyB } = createLayout(generalSibling);

		layout.addChild(new LayoutBaseCommon() as unknown as View);

		expect(spyA).not.toHaveBeenCalled();
		expect(spyB).not.toHaveBeenCalled();
	});

	it('stylesheet without sibling combinators does no invalidation work', () => {
		const { layout, spyA, spyB } = createLayout(noCombinators);

		layout.insertChild(new LayoutBaseCommon() as unknown as View, 0);
		layout.removeChild(layout.getChildAt(0));

		expect(spyA).not.toHaveBeenCalled();
		expect(spyB).not.toHaveBeenCalled();
	});

	it('missing style scope does not throw', () => {
		const { layout, spyA } = createLayout(null);

		expect(() => layout.insertChild(new LayoutBaseCommon() as unknown as View, 0)).not.toThrow();
		expect(spyA).not.toHaveBeenCalled();
	});
});
