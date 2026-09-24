import { splitOnTopLevelSpacesAndCommas } from './css-utils';
import { SafeAreaEdgeAll, SafeAreaEdgeBottom, SafeAreaEdgeLeft, SafeAreaEdgeNone, SafeAreaEdgeRight, SafeAreaEdgeTop } from '../core/view/safe-area-edges';

type Edge = 'top' | 'right' | 'bottom' | 'left';

const EDGES: readonly (readonly [Edge, number])[] = [
	['top', SafeAreaEdgeTop],
	['right', SafeAreaEdgeRight],
	['bottom', SafeAreaEdgeBottom],
	['left', SafeAreaEdgeLeft],
];

const PADDING_LONGHANDS: Record<string, number> = {
	'padding-top': SafeAreaEdgeTop,
	paddingTop: SafeAreaEdgeTop,
	'padding-right': SafeAreaEdgeRight,
	paddingRight: SafeAreaEdgeRight,
	'padding-bottom': SafeAreaEdgeBottom,
	paddingBottom: SafeAreaEdgeBottom,
	'padding-left': SafeAreaEdgeLeft,
	paddingLeft: SafeAreaEdgeLeft,
};

export const PADDING_CSS_LONGHANDS: readonly (readonly [string, number])[] = [
	['padding-top', SafeAreaEdgeTop],
	['padding-right', SafeAreaEdgeRight],
	['padding-bottom', SafeAreaEdgeBottom],
	['padding-left', SafeAreaEdgeLeft],
];

// Only the variable for the same edge counts: padding-top: env(safe-area-inset-bottom)
// is a length like any other.
const EDGE_ENV_RE: Record<number, RegExp> = {
	[SafeAreaEdgeTop]: /env\(\s*(?:ns-)?safe-area-(?:max-)?inset-top\b/,
	[SafeAreaEdgeRight]: /env\(\s*(?:ns-)?safe-area-(?:max-)?inset-right\b/,
	[SafeAreaEdgeBottom]: /env\(\s*(?:ns-)?safe-area-(?:max-)?inset-bottom\b/,
	[SafeAreaEdgeLeft]: /env\(\s*(?:ns-)?safe-area-(?:max-)?inset-left\b/,
};

export const SAFE_AREA_PADDING_SHORTHAND = 'safe-area-padding';

/**
 * The edge a padding longhand sets, by js or css name, or undefined for any other property.
 */
export function paddingLonghandEdge(propertyName: string): number | undefined {
	return PADDING_LONGHANDS[propertyName];
}

/**
 * Whether a padding value for the given edge pads it from the safe area.
 */
export function padsSafeAreaEdge(edge: number, value: unknown): boolean {
	return typeof value === 'string' && value.includes('env(') && EDGE_ENV_RE[edge].test(value);
}

/**
 * Splits a 1 to 4 value box shorthand into its top, right, bottom and left values, or
 * returns null for any other count.
 */
export function splitBoxShorthand(value: string): [string, string, string, string] | null {
	const parts = splitOnTopLevelSpacesAndCommas(value.trim());
	switch (parts.length) {
		case 1:
			return [parts[0], parts[0], parts[0], parts[0]];
		case 2:
			return [parts[0], parts[1], parts[0], parts[1]];
		case 3:
			return [parts[0], parts[1], parts[2], parts[1]];
		case 4:
			return [parts[0], parts[1], parts[2], parts[3]];
		default:
			return null;
	}
}

/**
 * The edges a shorthand declaration pads from the safe area. `safe-area-padding` pads
 * every edge; `padding` pads each edge whose value names that edge's inset.
 */
export function safeAreaEdgesPaddedByShorthand(shorthand: string, value: unknown): number {
	if (shorthand === SAFE_AREA_PADDING_SHORTHAND || shorthand === 'safeAreaPadding') {
		return SafeAreaEdgeAll;
	}

	if (shorthand !== 'padding' || typeof value !== 'string' || !value.includes('env(')) {
		return SafeAreaEdgeNone;
	}

	const values = splitBoxShorthand(value);
	if (!values) {
		return SafeAreaEdgeNone;
	}

	let mask = SafeAreaEdgeNone;
	for (let i = 0; i < 4; i++) {
		const edge = EDGES[i][1];
		if (padsSafeAreaEdge(edge, values[i])) {
			mask |= edge;
		}
	}

	return mask;
}

/**
 * The value `safe-area-padding` gives one edge: the declared length plus whatever safe
 * area inset is still left at the view.
 */
export function safeAreaPaddingValue(edge: Edge, length: string): string {
	const env = `env(ns-safe-area-inset-${edge})`;

	return length === '0' || length === '0dip' || length === '0px' ? env : `calc(${length} + ${env})`;
}
