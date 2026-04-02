import { parseFilter, FilterFunction } from './filter-parser';
import { Color } from '../../color';

describe('parseFilter', () => {
    it('should return empty array for none', () => {
        expect(parseFilter('none')).toEqual([]);
        expect(parseFilter('')).toEqual([]);
    });

    it('should parse blur', () => {
        const result = parseFilter('blur(5px)');
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('blur');
        expect(result[0].value).toBe(5);
    });

    it('should parse brightness', () => {
        const result = parseFilter('brightness(150%)');
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('brightness');
        expect(result[0].value).toBe(1.5);
    });

    it('should parse contrast', () => {
        const result = parseFilter('contrast(200%)');
        expect(result[0].type).toBe('contrast');
        expect(result[0].value).toBe(2);
    });

    it('should parse grayscale', () => {
        const result = parseFilter('grayscale(100%)');
        expect(result[0].type).toBe('grayscale');
        expect(result[0].value).toBe(1);
    });

    it('should parse saturate', () => {
        const result = parseFilter('saturate(50%)');
        expect(result[0].type).toBe('saturate');
        expect(result[0].value).toBe(0.5);
    });

    it('should parse invert', () => {
        const result = parseFilter('invert(100%)');
        expect(result[0].type).toBe('invert');
        expect(result[0].value).toBe(1);
    });

    it('should parse sepia', () => {
        const result = parseFilter('sepia(100%)');
        expect(result[0].type).toBe('sepia');
        expect(result[0].value).toBe(1);
    });

    it('should parse hue-rotate', () => {
        const result = parseFilter('hue-rotate(90deg)');
        expect(result[0].type).toBe('hue-rotate');
        expect(result[0].value).toBe(90);
    });

    it('should parse hue-rotate in radians', () => {
        const result = parseFilter('hue-rotate(0.5rad)');
        expect(result[0].type).toBe('hue-rotate');
        // 0.5 rad ≈ 28.65 deg
        expect(result[0].value).toBeCloseTo(28.64788975654116, 5);
    });

    it('should parse drop-shadow with lengths and optional color', () => {
        const result = parseFilter('drop-shadow(10px 20px 5px black)');
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('drop-shadow');
        const ds = result[0].value as any;
        expect(ds.h).toBe(10);
        expect(ds.v).toBe(20);
        expect(ds.blur).toBe(5);
        expect(ds.color).toBe('black');
    });

    it('should parse drop-shadow without blur', () => {
        const result = parseFilter('drop-shadow(2px 4px red)');
        const ds = result[0].value as any;
        expect(ds.h).toBe(2);
        expect(ds.v).toBe(4);
        expect(ds.blur).toBe(0);
        expect(ds.color).toBe('red');
    });

    it('should parse multiple filters', () => {
        const result = parseFilter('blur(5px) brightness(150%) contrast(200%)');
        expect(result.length).toBe(3);
        expect(result[0].type).toBe('blur');
        expect(result[1].type).toBe('brightness');
        expect(result[2].type).toBe('contrast');
    });

    it('should ignore unknown filter functions', () => {
        const result = parseFilter('unknown(5px) blur(3px)');
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('blur');
    });
});
