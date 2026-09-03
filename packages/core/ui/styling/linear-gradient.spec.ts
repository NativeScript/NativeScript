import { resolveGradientStopOffsets } from './linear-gradient';

function stops(...offsets: (number | undefined)[]) {
	return offsets.map((value) => (value === undefined ? { color: null } : { color: null, offset: { unit: '%' as const, value } }));
}

describe('resolveGradientStopOffsets', () => {
	it('fills a missing final stop with 1', () => {
		expect(resolveGradientStopOffsets(stops(0.68, undefined))).toEqual([0.68, 1]);
	});

	it('spreads unpositioned stops evenly', () => {
		expect(resolveGradientStopOffsets(stops(undefined, undefined, undefined))).toEqual([0, 0.5, 1]);
		const [a, b, c] = resolveGradientStopOffsets(stops(0.3, undefined, 0.6));
		expect([a, c]).toEqual([0.3, 0.6]);
		expect(b).toBeCloseTo(0.45, 10);
	});

	it('spreads a run between its positioned neighbours', () => {
		const [a, b, c, d, e] = resolveGradientStopOffsets(stops(undefined, 0.2, undefined, undefined, 1));
		expect([a, b, e]).toEqual([0, 0.2, 1]);
		expect(c).toBeCloseTo(0.4667, 3);
		expect(d).toBeCloseTo(0.7333, 3);
	});

	it('raises a position that goes backwards', () => {
		expect(resolveGradientStopOffsets(stops(0.5, 0.2))).toEqual([0.5, 0.5]);
	});

	it('keeps fully positioned stops as written', () => {
		expect(resolveGradientStopOffsets(stops(0, 0.52, 0.84, 1))).toEqual([0, 0.52, 0.84, 1]);
	});

	it('handles no stops', () => {
		expect(resolveGradientStopOffsets([])).toEqual([]);
	});
});
