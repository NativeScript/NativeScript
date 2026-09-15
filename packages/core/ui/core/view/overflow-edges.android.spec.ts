import { describe, it, expect } from 'vitest';

import { OverflowEdgeAllButTop, OverflowEdgeBottom, OverflowEdgeBottomDontConsume, OverflowEdgeCutout, OverflowEdgeDontApply, OverflowEdgeIgnore, OverflowEdgeLeft, OverflowEdgeNone, OverflowEdgeRight, OverflowEdgeTop, parseEdges } from './overflow-edges.android';

describe('parseEdges', () => {
	it('maps a single edge to its flag', () => {
		expect(parseEdges('top')).toBe(OverflowEdgeTop);
		expect(parseEdges('bottom')).toBe(OverflowEdgeBottom);
		expect(parseEdges('left')).toBe(OverflowEdgeLeft);
		expect(parseEdges('right')).toBe(OverflowEdgeRight);
		expect(parseEdges('all-but-top')).toBe(OverflowEdgeAllButTop);
	});

	it('ORs stacked edges together', () => {
		expect(parseEdges('top,bottom')).toBe(OverflowEdgeTop | OverflowEdgeBottom);
		expect(parseEdges('left,right,bottom-dont-consume')).toBe(OverflowEdgeLeft | OverflowEdgeRight | OverflowEdgeBottomDontConsume);
	});

	it('tolerates whitespace around each entry', () => {
		expect(parseEdges(' top , bottom ')).toBe(OverflowEdgeTop | OverflowEdgeBottom);
	});

	it('treats dont-apply and ignore as sentinels rather than flags', () => {
		// OR-ing either into a bitmask would corrupt both, so the first one wins outright.
		expect(parseEdges('dont-apply')).toBe(OverflowEdgeDontApply);
		expect(parseEdges('dont-apply,bottom')).toBe(OverflowEdgeDontApply);
		expect(parseEdges('ignore')).toBe(OverflowEdgeIgnore);
		expect(parseEdges('ignore,bottom')).toBe(OverflowEdgeIgnore);
		expect(parseEdges('bottom,ignore')).toBe(OverflowEdgeIgnore);
	});

	it('returns none for a value that resolves to none, not null', () => {
		// null means "leave the view alone"; a real none has to be applied so the view
		// gives back any edges it was handling before.
		expect(parseEdges('none')).toBe(OverflowEdgeNone);
		expect(parseEdges('none,none')).toBe(OverflowEdgeNone);
	});

	it('returns null when nothing in the value is recognized', () => {
		expect(parseEdges('')).toBeNull();
		expect(parseEdges('nope')).toBeNull();
		expect(parseEdges('nope,alsonope')).toBeNull();
	});

	it('ignores unknown entries mixed in with known ones', () => {
		expect(parseEdges('nope,top')).toBe(OverflowEdgeTop);
	});

	it('carries cutout alongside any edge', () => {
		// cutout is a modifier, not an edge: it selects the inset source and leaves the
		// edge bits to say which sides get padded.
		expect(parseEdges('cutout')).toBe(OverflowEdgeCutout);
		expect(parseEdges('none,cutout')).toBe(OverflowEdgeCutout);
		expect(parseEdges('top,cutout')).toBe(OverflowEdgeTop | OverflowEdgeCutout);
		expect(parseEdges('cutout,top,bottom')).toBe(OverflowEdgeCutout | OverflowEdgeTop | OverflowEdgeBottom);
	});

	it('drops cutout next to a sentinel, which distributes nothing of its own', () => {
		expect(parseEdges('dont-apply,cutout')).toBe(OverflowEdgeDontApply);
		expect(parseEdges('cutout,dont-apply')).toBe(OverflowEdgeDontApply);
		expect(parseEdges('ignore,cutout')).toBe(OverflowEdgeIgnore);
	});
});
