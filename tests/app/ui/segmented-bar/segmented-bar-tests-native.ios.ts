import * as segmentedBarModule from "ui/segmented-bar";

export function getNativeItemsCount(bar: segmentedBarModule.SegmentedBar): number {
    return (<UISegmentedControl>bar.ios).numberOfSegments;
}

export function checkNativeItemsTextColor(bar: segmentedBarModule.SegmentedBar): boolean {
    var isValid = true;

    var attrs = (<UISegmentedControl>bar.ios).titleTextAttributesForState(UIControlState.Normal);
    isValid = bar.color && attrs && attrs.valueForKey(NSForegroundColorAttributeName) === bar.color.ios;

    return isValid;
}

export function setNativeSelectedIndex(bar: segmentedBarModule.SegmentedBar, index: number): void {
    bar.ios.selectedSegmentIndex = index;
    (<UISegmentedControl>bar.ios).sendActionsForControlEvents(UIControlEvents.ValueChanged);
}