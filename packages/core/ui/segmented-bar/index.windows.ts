export * from './segmented-bar-common';

import { SegmentedBarBase, SegmentedBarItemBase } from './segmented-bar-common';

export class SegmentedBarItem extends SegmentedBarItemBase {
	// Minimal implementation for Windows: update is a no-op for now.
	public _update(): void {
		// Windows-specific native mapping for SegmentedBarItem titles
		// is not fully implemented yet. Avoid throwing when XML builder
		// sets the `title` property by providing a safe no-op here.
	}
}

export class SegmentedBar extends SegmentedBarBase {
	nativeViewProtected: any;
	private _isPivotAvailable: boolean = true;

	public createNativeView() {
		try {
			const pivot = new Windows.UI.Xaml.Controls.Pivot();
			this._isPivotAvailable = true;
			this.nativeViewProtected = pivot;
			return pivot;
		} catch (e) {
			// Pivot not available on some Windows hosts; fallback to a simple Grid
			try {
				const grid = new Windows.UI.Xaml.Controls.Grid();
				this._isPivotAvailable = false;
				this.nativeViewProtected = grid;
				return grid;
			} catch (_e) {
				// Last resort: return null and avoid throwing during view creation
				this._isPivotAvailable = false;
				this.nativeViewProtected = null;
				return null;
			}
		}
	}
}
