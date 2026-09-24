export const SafeAreaEdgeNone = 0;
export const SafeAreaEdgeTop = 1 << 0;
export const SafeAreaEdgeRight = 1 << 1;
export const SafeAreaEdgeBottom = 1 << 2;
export const SafeAreaEdgeLeft = 1 << 3;
export const SafeAreaEdgeAll = SafeAreaEdgeTop | SafeAreaEdgeRight | SafeAreaEdgeBottom | SafeAreaEdgeLeft;

// Leaving the platform's handling alone is not the same as overflowing no edges.
export const SafeAreaEdgeAuto = -1;

const edgeMap: Record<string, number> = {
	auto: SafeAreaEdgeAuto,
	none: SafeAreaEdgeNone,
	all: SafeAreaEdgeAll,
	top: SafeAreaEdgeTop,
	right: SafeAreaEdgeRight,
	bottom: SafeAreaEdgeBottom,
	left: SafeAreaEdgeLeft,
};

const SEPARATOR_RE = /[\s,]+/;

/**
 * Turns an `overflowSafeArea` value into the mask of edges the view overflows into,
 * or `SafeAreaEdgeAuto` when nothing in it was recognized.
 */
export function parseSafeAreaEdges(edges: string): number {
	if (typeof edges !== 'string') {
		return SafeAreaEdgeAuto;
	}

	let result = SafeAreaEdgeNone;
	let matched = false;

	for (const raw of edges.trim().split(SEPARATOR_RE)) {
		const value = edgeMap[raw.toLowerCase()];
		if (value === undefined) {
			continue;
		}

		// A sentinel rather than a bit flag, so or-ing it would corrupt both.
		if (value === SafeAreaEdgeAuto) {
			return SafeAreaEdgeAuto;
		}

		matched = true;
		result |= value;
	}

	// A value that resolves to none still has to be applied.
	return matched ? result : SafeAreaEdgeAuto;
}

export function overflowsSafeAreaEdge(edges: number, edge: number): boolean {
	return edges !== SafeAreaEdgeAuto && (edges & edge) !== 0;
}
