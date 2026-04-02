import { Color } from '../../color';

export interface FilterFunction {
    type: 'blur' | 'brightness' | 'contrast' | 'drop-shadow' | 'grayscale' | 'hue-rotate' | 'invert' | 'opacity' | 'saturate' | 'sepia';
    value: number | DropShadowValue;
}

export interface DropShadowValue {
    h: number;
    v: number;
    blur?: number;
    color?: string; // CSS color string
}

/**
 * Parses a CSS filter value into an array of FilterFunction.
 * Supports: blur, brightness, contrast, drop-shadow, grayscale, hue-rotate, invert, opacity, saturate, sepia.
 * @param value The CSS filter string, e.g. "blur(5px) brightness(150%)"
 * @returns Array of FilterFunction, or empty array if 'none' or empty.
 */
export function parseFilter(value: string): FilterFunction[] {
    if (!value || value.trim() === 'none') {
        return [];
    }

    const functions: FilterFunction[] = [];
    // Regex to match function calls: name(arguments)
    // This regex matches: word characters, hyphen, then parentheses with anything inside (non-greedy)
    const regex = /([a-zA-Z-]+)\s*\(([^)]+)\)/g;
    let match;

    while ((match = regex.exec(value)) !== null) {
        const name = match[1].toLowerCase();
        const args = match[2].trim();

        try {
            const filter = parseFilterFunction(name, args);
            if (filter) {
                functions.push(filter);
            }
        } catch (err) {
            // Skip invalid filter functions but continue parsing others
            console.warn(`Invalid filter function: ${name}(${args}) - ${err.message}`);
        }
    }

    return functions;
}

function parseFilterFunction(type: string, args: string): FilterFunction | null {
    switch (type) {
        case 'blur':
            return { type: 'blur', value: parseLength(args) };
        case 'brightness':
        case 'contrast':
        case 'grayscale':
        case 'invert':
        case 'opacity':
        case 'saturate':
        case 'sepia':
            // These take a percentage or number. For brightness, 100% = 1, >100% brighter.
            // We'll store as a number where 1 = 100% (or 1 for blur? Actually blur uses length).
            const percent = parsePercentage(args);
            return { type: type as any, value: percent };
        case 'hue-rotate':
            // Angle in deg, rad, etc. We'll store in degrees for simplicity.
            const angle = parseAngle(args);
            return { type: 'hue-rotate', value: angle };
        case 'drop-shadow':
            // Syntax: offset-x offset-y blur-radius? color?
            // The color is optional and usually last if present.
            // We need to split args while keeping color together if it contains spaces (like "rgb(0,0,0)").
            // Simple approach: try to parse from left: first two are lengths (required), third optional length, rest is color.
            const parts = splitDropShadowArgs(args);
            if (parts.length < 2) {
                throw new Error('drop-shadow requires at least offset-x and offset-y');
            }
            const h = parseLength(parts[0]);
            const v = parseLength(parts[1]);
            const blur = parts.length >= 3 ? parseLength(parts[2]) : 0;
            const color = parts.length > 3 ? parts.slice(3).join(' ') : undefined;
            return {
                type: 'drop-shadow',
                value: { h, v, blur, color: color } // color may be undefined
            };
        default:
            // Unknown filter type, ignore
            return null;
    }
}

function parseLength(str: string): number {
    // Remove unit and parse number. For blur, unit is typically px. We'll return value in pixels.
    // If no unit, assume pixels? CSS filter blur radius is in px.
    const num = parseFloat(str);
    if (isNaN(num)) {
        throw new Error(`Invalid length: ${str}`);
    }
    return num;
}

function parsePercentage(str: string): number {
    // Remove % sign if present and return fraction (e.g., 150% => 1.5)
    let s = str.trim();
    if (s.endsWith('%')) {
        s = s.slice(0, -1);
    }
    const num = parseFloat(s) / 100;
    if (isNaN(num)) {
        throw new Error(`Invalid percentage: ${str}`);
    }
    return num;
}

function parseAngle(str: string): number {
    // Convert angle to degrees. Supported units: deg, rad, grad, turn.
    const s = str.trim();
    if (s.endsWith('deg')) {
        return parseFloat(s.slice(0, -3));
    } else if (s.endsWith('rad')) {
        const rad = parseFloat(s.slice(0, -3));
        return rad * (180 / Math.PI);
    } else if (s.endsWith('grad')) {
        const grad = parseFloat(s.slice(0, -4));
        return grad * 0.9; // 100 grad = 90 deg
    } else if (s.endsWith('turn')) {
        const turns = parseFloat(s.slice(0, -4));
        return turns * 360;
    } else {
        // Assume degrees if no unit? CSS requires unit for angle. But we'll default to deg.
        return parseFloat(s);
    }
}

function splitDropShadowArgs(args: string): string[] {
    // We need to split by spaces but not inside parentheses or functions like rgb().
    // Simple approach: split by whitespace, then try to recombine color if it contains spaces.
    // We'll split on whitespace that is not inside parentheses.
    const parts: string[] = [];
    let current = '';
    let parenDepth = 0;

    for (let i = 0; i < args.length; i++) {
        const char = args[i];
        if (char === '(') {
            parenDepth++;
            current += char;
        } else if (char === ')') {
            parenDepth--;
            current += char;
        } else if (char === ' ' && parenDepth === 0) {
            if (current) {
                parts.push(current);
                current = '';
            }
        } else {
            current += char;
        }
    }
    if (current) {
        parts.push(current);
    }

    // If we have more than 3 parts, the rest should be considered color (which may have spaces)
    // But if the color is something like "rgb(0, 0, 0)" it's already one part because we didn't split inside parentheses.
    // So if we have exactly 4 parts, that's fine. If we have >4, combine everything after index 2 into color.
    if (parts.length > 3) {
        const combinedColor = parts.slice(2).join(' ');
        return [parts[0], parts[1], combinedColor];
    }
    return parts;
}
