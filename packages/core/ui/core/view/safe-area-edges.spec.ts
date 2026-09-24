import { describe, it, expect } from 'vitest';

import { parseSafeAreaEdges, overflowsSafeAreaEdge, SafeAreaEdgeAll, SafeAreaEdgeAuto, SafeAreaEdgeBottom, SafeAreaEdgeLeft, SafeAreaEdgeNone, SafeAreaEdgeRight, SafeAreaEdgeTop } from './safe-area-edges';

describe('parseSafeAreaEdges', () => {
	it('parses each single edge', () => {
		expect(parseSafeAreaEdges('top')).toBe(SafeAreaEdgeTop);
		expect(parseSafeAreaEdges('right')).toBe(SafeAreaEdgeRight);
		expect(parseSafeAreaEdges('bottom')).toBe(SafeAreaEdgeBottom);
		expect(parseSafeAreaEdges('left')).toBe(SafeAreaEdgeLeft);
	});

	it('parses the keywords', () => {
		expect(parseSafeAreaEdges('auto')).toBe(SafeAreaEdgeAuto);
		expect(parseSafeAreaEdges('none')).toBe(SafeAreaEdgeNone);
		expect(parseSafeAreaEdges('all')).toBe(SafeAreaEdgeAll);
	});

	it('combines edges separated by spaces or commas', () => {
		expect(parseSafeAreaEdges('top bottom')).toBe(SafeAreaEdgeTop | SafeAreaEdgeBottom);
		expect(parseSafeAreaEdges('top,bottom')).toBe(SafeAreaEdgeTop | SafeAreaEdgeBottom);
		expect(parseSafeAreaEdges('  top ,  bottom ')).toBe(SafeAreaEdgeTop | SafeAreaEdgeBottom);
	});

	it('is case-insensitive, unlike the env() variable names', () => {
		expect(parseSafeAreaEdges('Bottom')).toBe(SafeAreaEdgeBottom);
	});

	it('ignores a repeated edge', () => {
		expect(parseSafeAreaEdges('bottom bottom')).toBe(SafeAreaEdgeBottom);
	});

	it('ignores tokens it does not recognize', () => {
		expect(parseSafeAreaEdges('bottom sideways')).toBe(SafeAreaEdgeBottom);
	});

	it('keeps none distinct from auto', () => {
		expect(parseSafeAreaEdges('none')).toBe(SafeAreaEdgeNone);
		expect(parseSafeAreaEdges('none,none')).toBe(SafeAreaEdgeNone);
		expect(parseSafeAreaEdges('none sideways')).toBe(SafeAreaEdgeNone);
	});

	it('falls back to auto when nothing was recognized', () => {
		expect(parseSafeAreaEdges('')).toBe(SafeAreaEdgeAuto);
		expect(parseSafeAreaEdges('sideways')).toBe(SafeAreaEdgeAuto);
		expect(parseSafeAreaEdges(undefined as never)).toBe(SafeAreaEdgeAuto);
	});

	it('lets auto win over any edge beside it', () => {
		expect(parseSafeAreaEdges('auto bottom')).toBe(SafeAreaEdgeAuto);
		expect(parseSafeAreaEdges('bottom auto')).toBe(SafeAreaEdgeAuto);
	});
});

describe('overflowsSafeAreaEdge', () => {
	it('reports the edges in the mask', () => {
		const edges = parseSafeAreaEdges('top bottom');

		expect(overflowsSafeAreaEdge(edges, SafeAreaEdgeTop)).toBe(true);
		expect(overflowsSafeAreaEdge(edges, SafeAreaEdgeBottom)).toBe(true);
		expect(overflowsSafeAreaEdge(edges, SafeAreaEdgeLeft)).toBe(false);
	});

	it('overflows nothing under auto', () => {
		expect(overflowsSafeAreaEdge(SafeAreaEdgeAuto, SafeAreaEdgeTop)).toBe(false);
	});

	it('overflows nothing under none', () => {
		expect(overflowsSafeAreaEdge(SafeAreaEdgeNone, SafeAreaEdgeTop)).toBe(false);
	});
});
