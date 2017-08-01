import * as segmentedBarModule from "tns-core-modules/ui/segmented-bar";

export function getNativeItemsCount(bar: segmentedBarModule.SegmentedBar): number {
    return (<UISegmentedControl>bar.nativeViewProtected).numberOfSegments;
}

export function checkNativeItemsTextColor(bar: segmentedBarModule.SegmentedBar): boolean {
    var isValid = true;

    var attrs = (<UISegmentedControl>bar.nativeViewProtected).titleTextAttributesForState(UIControlState.Normal);
    isValid = bar.color && attrs && attrs.valueForKey(NSForegroundColorAttributeName) === bar.color.ios;

    return isValid;
}

export function setNativeSelectedIndex(bar: segmentedBarModule.SegmentedBar, index: number): void {
    (<UISegmentedControl>bar.nativeViewProtected).selectedSegmentIndex = index;
    (<UISegmentedControl>bar.nativeViewProtected).sendActionsForControlEvents(UIControlEvents.ValueChanged);
}
