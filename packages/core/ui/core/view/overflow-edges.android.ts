/**
 * Internal helper for the `androidOverflowEdge` property. Kept out of index.android.ts
 * so the parsing can be unit tested without pulling the whole view stack in.
 *
 * The values mirror org.nativescript.widgets.LayoutBase.
 */

export const OverflowEdgeIgnore = -1;
export const OverflowEdgeNone = 0;
export const OverflowEdgeLeft = 1 << 1;
export const OverflowEdgeTop = 1 << 2;
export const OverflowEdgeRight = 1 << 3;
export const OverflowEdgeBottom = 1 << 4;
export const OverflowEdgeDontApply = 1 << 5;
export const OverflowEdgeLeftDontConsume = 1 << 6;
export const OverflowEdgeTopDontConsume = 1 << 7;
export const OverflowEdgeRightDontConsume = 1 << 8;
export const OverflowEdgeBottomDontConsume = 1 << 9;
export const OverflowEdgeAllButLeft = 1 << 10;
export const OverflowEdgeAllButTop = 1 << 11;
export const OverflowEdgeAllButRight = 1 << 12;
export const OverflowEdgeAllButBottom = 1 << 13;
/**
 * Not an edge: a modifier that folds the display cutout into the insets being
 * distributed. Type.systemBars() leaves the cutout out, which only shows up once the
 * device is rotated and the camera moves to an edge that has no bar.
 */
export const OverflowEdgeCutout = 1 << 14;

const edgeMap: Record<string, number> = {
	none: OverflowEdgeNone,
	ignore: OverflowEdgeIgnore,
	left: OverflowEdgeLeft,
	top: OverflowEdgeTop,
	right: OverflowEdgeRight,
	bottom: OverflowEdgeBottom,
	'dont-apply': OverflowEdgeDontApply,
	'left-dont-consume': OverflowEdgeLeftDontConsume,
	'top-dont-consume': OverflowEdgeTopDontConsume,
	'right-dont-consume': OverflowEdgeRightDontConsume,
	'bottom-dont-consume': OverflowEdgeBottomDontConsume,
	'all-but-left': OverflowEdgeAllButLeft,
	'all-but-top': OverflowEdgeAllButTop,
	'all-but-right': OverflowEdgeAllButRight,
	'all-but-bottom': OverflowEdgeAllButBottom,
	cutout: OverflowEdgeCutout,
};

/**
 * Turns a comma separated `androidOverflowEdge` value into the flags LayoutBase expects.
 * Returns null when nothing in the value was recognized, which means "leave the view alone".
 */
export function parseEdges(edges: string): number | null {
	let result = 0;
	let matched = false;

	for (const raw of edges.split(',')) {
		const value = edgeMap[raw.trim()];
		if (value === undefined) {
			continue;
		}

		matched = true;
		// `dont-apply` and `ignore` are sentinels rather than bit flags, so OR-ing them
		// with an edge would corrupt both. The first one wins outright - which also means
		// `cutout` alongside either of them is dropped. `dont-apply` hands the raw cutout
		// values to JS regardless, and `ignore` distributes nothing at all.
		if (value === OverflowEdgeDontApply || value === OverflowEdgeIgnore) {
			return value;
		}

		result |= value;
	}

	// A value that legitimately resolves to none (0) still has to be applied, otherwise
	// setting the property to e.g. 'none,none' would be a silent no-op that strands the
	// view on the edges it had before.
	return matched ? result : null;
}
