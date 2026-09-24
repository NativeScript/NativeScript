import { SafeArea } from '../../../safe-area';
import type { SafeAreaInsets } from '../../../safe-area';
import { registerCssEnvironmentVariable } from '../../styling/css-env';
import { layout } from '../../../utils/layout-helper';
import { parseSafeAreaEdges, SafeAreaEdgeAll, SafeAreaEdgeAuto, SafeAreaEdgeBottom, SafeAreaEdgeLeft, SafeAreaEdgeRight, SafeAreaEdgeTop } from './safe-area-edges';

interface SafeAreaNode {
	overflowSafeArea?: string;
	_safeAreaPaddedEdges?: number;
	parent?: SafeAreaNode;
	_getPlatformSafeAreaInsets?: () => { top: number; right: number; bottom: number; left: number };
	_supportsPerViewSafeArea?: boolean;
}

/**
 * The edges still unconsumed at this view: an ancestor that does not overflow an edge
 * is insetting itself there, and one that pads an edge from the safe area has taken
 * it, so its subtree must not inset it again.
 */
export function remainingSafeAreaEdges(view: SafeAreaNode): number {
	let mask = SafeAreaEdgeAll;

	for (let node = view?.parent; node && mask; node = node.parent) {
		const edges = parseSafeAreaEdges(node.overflowSafeArea);
		if (edges !== SafeAreaEdgeAuto) {
			mask &= edges;
		}

		const padded = node._safeAreaPaddedEdges;
		if (padded) {
			mask &= ~padded;
		}
	}

	return mask;
}

/**
 * The window insets minus whatever an ancestor already took, in dip.
 *
 * With consumption tracking on, a platform that reduces the insets down the hierarchy
 * itself - UIKit does - is the more accurate source, because it also sees the layouts
 * that inset without declaring it.
 */
export function remainingSafeAreaInsets(view: SafeAreaNode): SafeAreaInsets {
	const insets = SafeArea.insets;
	const mask = remainingSafeAreaEdges(view);
	const declared = {
		top: mask & SafeAreaEdgeTop ? insets.top : 0,
		right: mask & SafeAreaEdgeRight ? insets.right : 0,
		bottom: mask & SafeAreaEdgeBottom ? insets.bottom : 0,
		left: mask & SafeAreaEdgeLeft ? insets.left : 0,
	};

	if (!SafeArea.trackConsumption) {
		return declared;
	}

	// All zero is a meaningful answer where the platform propagates - it means an
	// ancestor already took everything - so capability cannot be sniffed from the value.
	if (!view?._supportsPerViewSafeArea) {
		return declared;
	}

	const platform = view._getPlatformSafeAreaInsets?.();
	if (!platform) {
		return declared;
	}

	const toDip = (value: number) => Math.round(layout.toDeviceIndependentPixels(value));

	return {
		top: Math.min(declared.top, toDip(platform.top)),
		right: Math.min(declared.right, toDip(platform.right)),
		bottom: Math.min(declared.bottom, toDip(platform.bottom)),
		left: Math.min(declared.left, toDip(platform.left)),
	};
}

const EDGES = ['top', 'right', 'bottom', 'left'] as const;

// A NativeScript extension: the spec's safe-area-inset-* stay window scoped, and these
// report what is left where they are used, which is what nested pages need.
for (const edge of EDGES) {
	registerCssEnvironmentVariable(`ns-safe-area-inset-${edge}`, 0, (_indices, view) => `${remainingSafeAreaInsets(view as SafeAreaNode)[edge]}dip`);
}
