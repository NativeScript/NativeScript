import { parseCSSShadow } from './css-shadow';
import { CoreTypes } from '../../core-types';
import { Length } from './style-properties';
import { Color } from '../../color';

describe('css-shadow', () => {
	it('empty', () => {
		const shadow = parseCSSShadow('');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toBeUndefined();
		expect(shadow.offsetY).toBeUndefined();
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toBeUndefined();
	});

	it('1px 1px 2px black', () => {
		const shadow = parseCSSShadow('1px 1px 2px black');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toEqual(Length.parse('1px'));
		expect(shadow.offsetY).toEqual(Length.parse('1px'));
		expect(shadow.blurRadius).toEqual(Length.parse('2px'));
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('black'));
	});

	it('#fc0 1px 0 10px', () => {
		const shadow = parseCSSShadow('#fc0 1px 0 10px');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toEqual(Length.parse('1px'));
		expect(shadow.offsetY).toEqual(0);
		expect(shadow.blurRadius).toEqual(Length.parse('10px'));
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('#fc0'));
	});

	it('5px 5px #558abb', () => {
		const shadow = parseCSSShadow('5px 5px #558abb');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toEqual(Length.parse('5px'));
		expect(shadow.offsetY).toEqual(Length.parse('5px'));
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('#558abb'));
	});

	it('white 2px 5px', () => {
		const shadow = parseCSSShadow('white 2px 5px');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toEqual(Length.parse('2px'));
		expect(shadow.offsetY).toEqual(Length.parse('5px'));
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('white'));
	});

	it('5px 10px', () => {
		const shadow = parseCSSShadow('5px 10px');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toEqual(Length.parse('5px'));
		expect(shadow.offsetY).toEqual(Length.parse('10px'));
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('black'));
	});

	// box
	it('60px -16px teal', () => {
		const shadow = parseCSSShadow('60px -16px teal');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toEqual(Length.parse('60px'));
		expect(shadow.offsetY).toEqual(Length.parse('-16px'));
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('teal'));
	});

	it('10px 5px 5px black', () => {
		const shadow = parseCSSShadow('10px 5px 5px black');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toEqual(Length.parse('10px'));
		expect(shadow.offsetY).toEqual(Length.parse('5px'));
		expect(shadow.blurRadius).toEqual(Length.parse('5px'));
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('black'));
	});

	it('2px 2px 2px 1px rgba(0, 0, 0, 0.2)', () => {
		const shadow = parseCSSShadow('2px 2px 2px 1px rgba(0, 0, 0, 0.2)');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toEqual(Length.parse('2px'));
		expect(shadow.offsetY).toEqual(Length.parse('2px'));
		expect(shadow.blurRadius).toEqual(Length.parse('2px'));
		expect(shadow.spreadRadius).toEqual(Length.parse('1px'));
		expect(shadow.color).toEqual(new Color('rgba(0, 0, 0, 0.2)'));
	});

	it('inset 5em 1em gold', () => {
		const shadow = parseCSSShadow('inset 5em 1em gold');
		expect(shadow.inset).toBe(true);
		expect(shadow.offsetX).toBe(5);
		expect(shadow.offsetY).toBe(1);
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('gold'));
	});

	it('5 10', () => {
		const shadow = parseCSSShadow('5 10');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toBe(5);
		expect(shadow.offsetY).toBe(10);
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('black'));
	});

	it('2 2 2 #333', () => {
		const shadow = parseCSSShadow('2 2 2 #333');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toBe(2);
		expect(shadow.offsetY).toBe(2);
		expect(shadow.blurRadius).toBe(2);
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('#333'));
	});

	it('-1 -1 1 #333', () => {
		const shadow = parseCSSShadow('-1 -1 1 #333');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toBe(-1);
		expect(shadow.offsetY).toBe(-1);
		expect(shadow.blurRadius).toBe(1);
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('#333'));
	});

	it('none', () => {
		const shadow = parseCSSShadow('none');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toBeUndefined();
		expect(shadow.offsetY).toBeUndefined();
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toBeUndefined();
	});

	it('unset', () => {
		const shadow = parseCSSShadow('unset');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toBeUndefined();
		expect(shadow.offsetY).toBeUndefined();
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toBeUndefined();
	});

	it('unset 5em 1em gold', () => {
		// invalid shorthand should result in nothing being applied
		const shadow = parseCSSShadow('unset 5em 1em gold');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toBeUndefined();
		expect(shadow.offsetY).toBeUndefined();
		expect(shadow.blurRadius).toBeUndefined();
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toBeUndefined();
	});

	it('5em 1em gold unset', () => {
		// partially invalid shorthand should result in standard default fallback
		const shadow = parseCSSShadow('5em 1em gold unset');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toBe(5);
		expect(shadow.offsetY).toBe(1);
		expect(shadow.blurRadius).toEqual(CoreTypes.zeroLength);
		expect(shadow.spreadRadius).toBeUndefined();
		expect(shadow.color).toEqual(new Color('black'));
	});
});
