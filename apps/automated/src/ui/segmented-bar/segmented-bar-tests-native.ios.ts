import * as segmentedBarModule from '@nativescript/core/ui/segmented-bar';

export function getNativeItemsCount(bar: segmentedBarModule.SegmentedBar): number {
	return (<UISegmentedControl>bar.nativeViewProtected).numberOfSegments;
}

export function checkNativeItemsTextColor(bar: segmentedBarModule.SegmentedBar): boolean {
	const attrs = (<UISegmentedControl>bar.nativeViewProtected).titleTextAttributesForState(UIControlState.Normal);
	const nativeViewColor = bar.color && attrs && attrs.valueForKey(NSForegroundColorAttributeName);
	const barColor = bar.color.ios;

	return barColor.isEqual(nativeViewColor);
}

export function setNativeSelectedIndex(bar: segmentedBarModule.SegmentedBar, index: number): void {
	(<UISegmentedControl>bar.nativeViewProtected).selectedSegmentIndex = index;
	(<UISegmentedControl>bar.nativeViewProtected).sendActionsForControlEvents(UIControlEvents.ValueChanged);
}
