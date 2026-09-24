import { SafeAreaCommon } from './safe-area-common';
import { getWindow } from '../utils/native-helper';
import { layout } from '../utils/layout-helper';
import { Trace } from '../trace';
import type { SafeAreaInsets } from './safe-area-interfaces';

export * from './safe-area-interfaces';
export { SafeAreaCommon, ZERO_INSETS } from './safe-area-common';

function toDip(value: number): number {
	return layout.round(layout.toDeviceIndependentPixels(value));
}

class AndroidSafeArea extends SafeAreaCommon {
	private subscribedDecorView: WeakRef<android.view.View>;

	protected override read(): SafeAreaInsets | null {
		const decorView = getWindow<android.view.Window>()?.getDecorView();
		if (!decorView) {
			return null;
		}

		// A recreated activity takes the listener with it.
		if (this.subscribedDecorView?.get() !== decorView) {
			this.subscribeTo(decorView);
		}

		const windowInsets = androidx.core.view.ViewCompat.getRootWindowInsets(decorView);
		if (!windowInsets) {
			return null;
		}

		const Type = androidx.core.view.WindowInsetsCompat.Type;
		const insets = windowInsets.getInsets(Type.systemBars() | Type.displayCutout());

		return { top: toDip(insets.top), right: toDip(insets.right), bottom: toDip(insets.bottom), left: toDip(insets.left) };
	}

	protected override subscribe(): boolean {
		const decorView = getWindow<android.view.Window>()?.getDecorView();
		if (!decorView) {
			return false;
		}

		this.subscribeTo(decorView);

		return true;
	}

	private subscribeTo(decorView: android.view.View): void {
		const compat = androidx.core.view.ViewCompat;
		const owner = this;

		compat.setOnApplyWindowInsetsListener(
			decorView,
			new androidx.core.view.OnApplyWindowInsetsListener({
				onApplyWindowInsets(view, insets) {
					try {
						owner.refresh();
					} catch (e) {
						Trace.write(`Failed to refresh safe area insets. ${e}`, Trace.categories.Layout, Trace.messageType.error);
					}

					// Restores what the decor view does without a listener installed.
					return compat.onApplyWindowInsets(view, insets);
				},
			}),
		);

		this.subscribedDecorView = new WeakRef(decorView);
	}
}

export const SafeArea = new AndroidSafeArea();
