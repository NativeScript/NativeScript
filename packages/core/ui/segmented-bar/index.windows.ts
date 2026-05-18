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
	nativeViewProtected: Windows.UI.Xaml.Controls.Pivot;

	public createNativeView() {
		const pivot = new Windows.UI.Xaml.Controls.Pivot();
		return pivot;
	}
}
