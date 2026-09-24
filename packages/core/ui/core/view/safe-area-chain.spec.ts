import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { remainingSafeAreaEdges, remainingSafeAreaInsets } from './safe-area-chain';
import { SafeAreaEdgeAll, SafeAreaEdgeBottom, SafeAreaEdgeTop } from './safe-area-edges';
import { SafeArea } from '../../../safe-area';
import { _evaluateCssEnvExpression } from '../../styling/css-env';

function chain(...overflow: (string | undefined)[]) {
	// Innermost first; index 0 is the view asking.
	let node: any = null;
	for (let i = overflow.length - 1; i >= 0; i--) {
		node = { overflowSafeArea: overflow[i], parent: node };
	}

	let head = node;
	const nodes: any[] = [];
	while (head) {
		nodes.push(head);
		head = head.parent;
	}

	return nodes[0];
}

describe('safe area consumption chain', () => {
	beforeEach(() => {
		SafeArea._setInsets(24, 0, 48, 0);
		SafeArea._resetMaxInsets();
	});
	afterEach(() => {
		SafeArea._setInsets(0, 0, 0, 0);
		SafeArea._resetMaxInsets();
	});

	it('leaves every edge available with no ancestors', () => {
		expect(remainingSafeAreaEdges({})).toBe(SafeAreaEdgeAll);
	});

	it('ignores ancestors that did not declare', () => {
		expect(remainingSafeAreaEdges(chain(undefined, undefined))).toBe(SafeAreaEdgeAll);
	});

	it('takes the edges an ancestor insets', () => {
		// The parent overflows only the bottom, so it insets the other three.
		expect(remainingSafeAreaEdges(chain(undefined, 'bottom'))).toBe(SafeAreaEdgeBottom);
	});

	it('leaves nothing when an ancestor insets every edge', () => {
		expect(remainingSafeAreaEdges(chain(undefined, 'none'))).toBe(0);
	});

	it('leaves everything when an ancestor overflows every edge', () => {
		expect(remainingSafeAreaEdges(chain(undefined, 'all'))).toBe(SafeAreaEdgeAll);
	});

	it('intersects across several ancestors', () => {
		expect(remainingSafeAreaEdges(chain(undefined, 'top bottom', 'bottom'))).toBe(SafeAreaEdgeBottom);
	});

	it('reports the remaining insets in dip', () => {
		expect(remainingSafeAreaInsets(chain(undefined, 'bottom'))).toEqual({ top: 0, right: 0, bottom: 48, left: 0 });
		expect(remainingSafeAreaInsets(chain(undefined, 'none'))).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
		expect(remainingSafeAreaInsets(chain(undefined, 'all'))).toEqual({ top: 24, right: 0, bottom: 48, left: 0 });
	});
});

describe('env(ns-safe-area-inset-*)', () => {
	beforeEach(() => {
		SafeArea._setInsets(24, 0, 48, 0);
		SafeArea._resetMaxInsets();
	});
	afterEach(() => {
		SafeArea._setInsets(0, 0, 0, 0);
		SafeArea._resetMaxInsets();
	});

	it('reports the full inset when nothing consumed it', () => {
		expect(_evaluateCssEnvExpression('env(ns-safe-area-inset-bottom)', chain(undefined, 'all'))).toBe('48dip');
	});

	it('reports zero once an ancestor consumed the edge', () => {
		expect(_evaluateCssEnvExpression('env(ns-safe-area-inset-bottom)', chain(undefined, 'none'))).toBe('0dip');
	});

	it('leaves the spec variable window scoped', () => {
		expect(_evaluateCssEnvExpression('env(safe-area-inset-bottom)', chain(undefined, 'none'))).toBe('48dip');
	});
});

describe('consumption tracking opt-in', () => {
	beforeEach(() => {
		SafeArea._setInsets(24, 0, 48, 0);
		SafeArea._resetMaxInsets();
	});
	afterEach(() => {
		SafeArea.trackConsumption = false;
		SafeArea._setInsets(0, 0, 0, 0);
		SafeArea._resetMaxInsets();
	});

	// scale is 1 under test, so device pixels and dip line up.
	function withPlatformInsets(bottomPx: number) {
		const node: any = chain(undefined, 'all');
		node._supportsPerViewSafeArea = true;
		node._getPlatformSafeAreaInsets = () => ({ left: 0, top: 0, right: 0, bottom: bottomPx });

		return node;
	}

	it('ignores the platform value while off', () => {
		const node = withPlatformInsets(0);

		expect(SafeArea.trackConsumption).toBe(false);
		expect(remainingSafeAreaInsets(node).bottom).toBe(48);
	});

	it('uses the platform value once on', () => {
		SafeArea.trackConsumption = true;

		// UIKit reports zero for a view an ancestor already inset - that is the answer,
		// not a missing capability.
		expect(remainingSafeAreaInsets(withPlatformInsets(0)).bottom).toBe(0);
		expect(remainingSafeAreaInsets(withPlatformInsets(12)).bottom).toBe(12);
	});

	it('keeps the declared chain where the platform has no per view value', () => {
		SafeArea.trackConsumption = true;

		const node: any = chain(undefined, 'all');
		node._getPlatformSafeAreaInsets = () => ({ left: 0, top: 0, right: 0, bottom: 0 });

		expect(remainingSafeAreaInsets(node).bottom).toBe(48);
	});

	it('never reports more than the declared chain allows', () => {
		SafeArea.trackConsumption = true;

		const node: any = chain(undefined, 'none');
		node._supportsPerViewSafeArea = true;
		node._getPlatformSafeAreaInsets = () => ({ left: 0, top: 0, right: 0, bottom: 48 });

		// The ancestor declared it consumes the bottom, so the declaration still wins.
		expect(remainingSafeAreaInsets(node).bottom).toBe(0);
	});
});
