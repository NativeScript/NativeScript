import { parseCSSShadow } from './css-shadow';
import { zeroLength } from './style-properties';

describe('css-shadow', () => {
	it('empty', () => {
		const shadow = parseCSSShadow('');
		expect(shadow.inset).toBe(false);
		expect(shadow.offsetX).toBe(zeroLength);
		expect(shadow.offsetY).toBe(zeroLength);
		expect(shadow.blurRadius).toBe(zeroLength);
		expect(shadow.spreadRadius).toBe(zeroLength);
		expect(shadow.color).toBe('black');
	});

	// 			it("1px 1px 2px black", () => {
	// 				const shadow = parseCSSShadow("1px 1px 2px black")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(1)
	// 				expect(shadow.offsetY).toBe(1)
	// 				expect(shadow.blurRadius).toBe(2)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('black')
	// 			});

	// 			it("#fc0 1px 0 10px", () => {
	// 				const shadow = parseCSSShadow("#fc0 1px 0 10px")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(1)
	// 				expect(shadow.offsetY).toBe(zeroLength)
	// 				expect(shadow.blurRadius).toBe(10)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('#fc0')
	// 			});

	// 			it("5px 5px #558abb", () => {
	// 				const shadow = parseCSSShadow("5px 5px #558abb")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(5)
	// 				expect(shadow.offsetY).toBe(5)
	// 				expect(shadow.blurRadius).toBe(zeroLength)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('#558abb')
	// 			});

	// 			it("white 2px 5px", () => {
	// 				const shadow = parseCSSShadow("white 2px 5px")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(2)
	// 				expect(shadow.offsetY).toBe(5)
	// 				expect(shadow.blurRadius).toBe(zeroLength)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('white')
	// 			});

	// 			it("5px 10px", () => {
	// 				const shadow = parseCSSShadow("5px 10px")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(5)
	// 				expect(shadow.offsetY).toBe(10)
	// 				expect(shadow.blurRadius).toBe(zeroLength)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('black')
	// 			});

	// // box
	// 			it("60px -16px teal", () => {
	// 				const shadow = parseCSSShadow("60px -16px teal")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(60)
	// 				expect(shadow.offsetY).toBe(-16)
	// 				expect(shadow.blurRadius).toBe(zeroLength)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('teal')
	// 			});

	// 			it("10px 5px 5px black", () => {
	// 				const shadow = parseCSSShadow("10px 5px 5px black")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(10)
	// 				expect(shadow.offsetY).toBe(5)
	// 				expect(shadow.blurRadius).toBe(zeroLength)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('black')
	// 			});

	// 			it("2px 2px 2px 1px rgba(0, 0, 0, 0.2)", () => {
	// 				const shadow = parseCSSShadow("2px 2px 2px 1px rgba(0, 0, 0, 0.2)")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(2)
	// 				expect(shadow.offsetY).toBe(2)
	// 				expect(shadow.blurRadius).toBe(2)
	// 				expect(shadow.spreadRadius).toBe(1)
	// 				expect(shadow.color).toBe('rgba(0, 0, 0, 0.2)')
	// 			});

	// 			it("inset 5em 1em gold", () => {
	// 				const shadow = parseCSSShadow("inset 5em 1em gold")
	// 				expect(shadow.inset).toBe(true)
	// 				expect(shadow.offsetX).toBe(5)
	// 				expect(shadow.offsetY).toBe(1)
	// 				expect(shadow.blurRadius).toBe(zeroLength)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('gold')
	// 			});

	// 			it("5 10", () => {
	// 				const shadow = parseCSSShadow("5 10")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(5)
	// 				expect(shadow.offsetY).toBe(10)
	// 				expect(shadow.blurRadius).toBe(zeroLength)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('black')
	// 			});

	// 			it("2 2 2 #333", () => {
	// 				const shadow = parseCSSShadow("2 2 2 #333")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(2)
	// 				expect(shadow.offsetY).toBe(2)
	// 				expect(shadow.blurRadius).toBe(2)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('#333')
	// 			});

	// 			it("-1 -1 1 #333", () => {
	// 				const shadow = parseCSSShadow("-1 -1 1 #333")
	// 				expect(shadow.inset).toBe(false)
	// 				expect(shadow.offsetX).toBe(-1)
	// 				expect(shadow.offsetY).toBe(-1)
	// 				expect(shadow.blurRadius).toBe(1)
	// 				expect(shadow.spreadRadius).toBe(zeroLength)
	// 				expect(shadow.color).toBe('#333')
	// 			});
});
