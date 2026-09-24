import { SafeAreaCommon } from './safe-area-common';
import { getWindow } from '../utils/native-helper';
import type { SafeAreaInsets } from './safe-area-interfaces';

export * from './safe-area-interfaces';
export { SafeAreaCommon, ZERO_INSETS } from './safe-area-common';

class IOSSafeArea extends SafeAreaCommon {
	protected override read(): SafeAreaInsets | null {
		const insets = getWindow<UIWindow>()?.safeAreaInsets;
		if (!insets) {
			return null;
		}

		return { top: insets.top, right: insets.right, bottom: insets.bottom, left: insets.left };
	}

	// UIKit has no notification for this; the Page controller calls refresh instead.
	protected override subscribe(): boolean {
		return !!getWindow<UIWindow>();
	}
}

export const SafeArea = new IOSSafeArea();
