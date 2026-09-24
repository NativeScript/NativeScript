import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { padsSafeAreaEdge, safeAreaEdgesPaddedByShorthand, splitBoxShorthand } from './safe-area-padding';
import { StyleScope, applyInlineStyle } from './style-scope';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';
import { SafeArea } from '../../safe-area';
import { SafeAreaEdgeAll, SafeAreaEdgeBottom, SafeAreaEdgeNone, SafeAreaEdgeTop } from '../core/view/safe-area-edges';

function styled(css: string): { root: any; view: any } {
	const scope = new StyleScope();
	scope.css = css;

	const root = new StackLayout();
	root._styleScope = scope;
	root.className = 'host';

	const view = new Label();
	root.addChild(view);
	view._styleScope = scope;

	return { root, view };
}

function load(...views: any[]) {
	for (const view of views) {
		view._cssState.onLoaded();
	}
}

const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve));

describe('padsSafeAreaEdge', () => {
	it('recognizes the edge variable in any form', () => {
		expect(padsSafeAreaEdge(SafeAreaEdgeBottom, 'env(safe-area-inset-bottom)')).toBe(true);
		expect(padsSafeAreaEdge(SafeAreaEdgeBottom, 'calc(12dip + env(ns-safe-area-inset-bottom))')).toBe(true);
		expect(padsSafeAreaEdge(SafeAreaEdgeBottom, 'env(safe-area-max-inset-bottom, 0)')).toBe(true);
	});

	it('ignores another edge, another variable and plain lengths', () => {
		expect(padsSafeAreaEdge(SafeAreaEdgeTop, 'env(safe-area-inset-bottom)')).toBe(false);
		expect(padsSafeAreaEdge(SafeAreaEdgeBottom, 'env(brand-gutter)')).toBe(false);
		expect(padsSafeAreaEdge(SafeAreaEdgeBottom, '12dip')).toBe(false);
		expect(padsSafeAreaEdge(SafeAreaEdgeBottom, 12)).toBe(false);
	});
});

describe('splitBoxShorthand', () => {
	it('expands 1 to 4 values in padding order', () => {
		expect(splitBoxShorthand('1')).toEqual(['1', '1', '1', '1']);
		expect(splitBoxShorthand('1 2')).toEqual(['1', '2', '1', '2']);
		expect(splitBoxShorthand('1 2 3')).toEqual(['1', '2', '3', '2']);
		expect(splitBoxShorthand('1 2 3 4')).toEqual(['1', '2', '3', '4']);
	});

	it('keeps a function with spaces as one value', () => {
		expect(splitBoxShorthand('calc(1dip + 2dip) 4')).toEqual(['calc(1dip + 2dip)', '4', 'calc(1dip + 2dip)', '4']);
	});

	it('rejects any other count', () => {
		expect(splitBoxShorthand('')).toBeNull();
		expect(splitBoxShorthand('1 2 3 4 5')).toBeNull();
	});
});

describe('safeAreaEdgesPaddedByShorthand', () => {
	it('takes every edge for safe-area-padding', () => {
		expect(safeAreaEdgesPaddedByShorthand('safe-area-padding', '0')).toBe(SafeAreaEdgeAll);
	});

	it('takes the edges a padding value names', () => {
		expect(safeAreaEdgesPaddedByShorthand('padding', 'env(safe-area-inset-top) 16 env(safe-area-inset-bottom) 16')).toBe(SafeAreaEdgeTop | SafeAreaEdgeBottom);
		expect(safeAreaEdgesPaddedByShorthand('padding', '16')).toBe(SafeAreaEdgeNone);
		expect(safeAreaEdgesPaddedByShorthand('margin', 'env(safe-area-inset-top)')).toBe(SafeAreaEdgeNone);
	});
});

describe('smart padding', () => {
	beforeEach(() => {
		SafeArea._setInsets(24, 0, 48, 0);
		SafeArea._resetMaxInsets();
	});

	afterEach(() => {
		SafeArea._setInsets(0, 0, 0, 0);
		SafeArea._resetMaxInsets();
	});

	it('marks an edge padded from the safe area in css', () => {
		const { view } = styled('label { padding-bottom: calc(12dip + env(safe-area-inset-bottom)); padding-top: 8; }');
		load(view);

		expect(view.style.paddingBottom).toBe(60);
		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeBottom);
	});

	it('marks the edges a padding shorthand pads', () => {
		const { view } = styled('label { padding: env(safe-area-inset-top) 16 env(safe-area-inset-bottom) 16; }');
		load(view);

		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeTop | SafeAreaEdgeBottom);
	});

	it('does not mark padding that only reads another edge', () => {
		const { view } = styled('label { padding-top: env(safe-area-inset-bottom); }');
		load(view);

		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeNone);
	});

	it('marks a local write, and clears it on a plain one', () => {
		const { view } = styled('');

		view.style.paddingBottom = 'env(safe-area-inset-bottom)';
		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeBottom);

		view.style.paddingBottom = 10;
		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeNone);
	});

	// The longhands see resolved lengths; recording them would flip the mask on every
	// re-evaluation and never settle.
	it('settles after a padding shorthand holding env()', async () => {
		const { view } = styled('');

		view.style.padding = 'env(safe-area-inset-top) 16 env(safe-area-inset-bottom) 16';
		await flush();
		await flush();

		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeTop | SafeAreaEdgeBottom);
		expect(view.style.paddingBottom).toBe(48);
	});

	it('lets a local write override the cascade per edge', () => {
		const { view } = styled('label { padding-bottom: env(safe-area-inset-bottom); padding-top: env(safe-area-inset-top); }');
		load(view);

		view.style.paddingBottom = 4;

		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeTop);
	});

	it('marks an inline style and keeps it live', () => {
		const { view } = styled('');

		applyInlineStyle(view, 'padding-bottom: calc(4dip + env(safe-area-inset-bottom))');
		expect(view.style.paddingBottom).toBe(52);
		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeBottom);

		SafeArea._setInsets(24, 0, 20, 0);
		expect(view.style.paddingBottom).toBe(24);
	});

	it('consumes the edge for descendants but not for the view itself', () => {
		const { root, view } = styled('');

		root.style.paddingBottom = 'env(ns-safe-area-inset-bottom)';

		expect(root.style.paddingBottom).toBe(48);
		expect(root.getRemainingSafeAreaInsets().bottom).toBe(48);
		expect(view.getRemainingSafeAreaInsets()).toEqual({ top: 24, right: 0, bottom: 0, left: 0 });
	});

	it('re-resolves a descendant once an ancestor starts padding', async () => {
		const { root, view } = styled('label { padding-bottom: env(ns-safe-area-inset-bottom); }');
		load(root, view);
		expect(view.style.paddingBottom).toBe(48);

		root.style.paddingBottom = 'env(safe-area-inset-bottom)';
		await flush();
		expect(view.style.paddingBottom).toBe(0);

		root.style.paddingBottom = 0;
		await flush();
		expect(view.style.paddingBottom).toBe(48);
	});
});

describe('safe-area-padding shorthand', () => {
	beforeEach(() => {
		SafeArea._setInsets(24, 0, 48, 0);
		SafeArea._resetMaxInsets();
	});

	afterEach(() => {
		SafeArea._setInsets(0, 0, 0, 0);
		SafeArea._resetMaxInsets();
	});

	it('adds the remaining inset to each padding value in css', () => {
		const { view } = styled('label { safe-area-padding: 0 16dip 12dip; }');
		load(view);

		expect(view.style.paddingTop).toBe(24);
		expect(view.style.paddingRight).toBe(16);
		expect(view.style.paddingBottom).toBe(60);
		expect(view.style.paddingLeft).toBe(16);
		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeAll);
	});

	it('works from js through the view alias', () => {
		const { view } = styled('');

		view.safeAreaPadding = '8';

		expect(view.style.paddingTop).toBe(32);
		expect(view.style.paddingBottom).toBe(56);
		expect(view.style.paddingLeft).toBe(8);
		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeAll);
	});

	it('accepts a number', () => {
		const { view } = styled('');

		view.style.safeAreaPadding = 4;

		expect(view.style.paddingBottom).toBe(52);
	});

	it('resolves a var() value', () => {
		const { view } = styled('label { --gutter: 10; safe-area-padding: var(--gutter); }');
		load(view);

		expect(view.style.paddingTop).toBe(34);
		expect(view.style.paddingRight).toBe(10);
		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeAll);
	});

	it('re-evaluates when the insets change', () => {
		const { view } = styled('');
		view.style.safeAreaPadding = '0 0 12dip';

		SafeArea._setInsets(24, 0, 96, 0);

		expect(view.style.paddingBottom).toBe(108);
	});

	it('takes only what an ancestor left', () => {
		const { root, view } = styled('');
		root.style.paddingBottom = 'env(safe-area-inset-bottom)';

		view.style.safeAreaPadding = '0 0 12dip';

		expect(view.style.paddingTop).toBe(24);
		expect(view.style.paddingBottom).toBe(12);
	});

	it('unsets every edge for an invalid value', () => {
		const { view } = styled('label { safe-area-padding: 1 2 3 4 5; }');
		load(view);

		expect(view.style.paddingBottom).toBe(styled('').view.style.paddingBottom);
		expect(view._safeAreaPaddedEdges).toBe(SafeAreaEdgeNone);
	});
});
