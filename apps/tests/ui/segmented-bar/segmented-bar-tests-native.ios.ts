import segmentedBarModule = require("ui/segmented-bar");

export function getNativeItemsCount(bar: segmentedBarModule.SegmentedBar): number {
    return (<UISegmentedControl>bar.ios).numberOfSegments;
}

export function checkNativeItemsTextColor(bar: segmentedBarModule.SegmentedBar): boolean {
    var isValid = true;

    var attrs = (<UISegmentedControl>bar.ios).titleTextAttributesForState(UIControlState.UIControlStateNormal);
    isValid = bar.color && attrs && attrs.valueForKey(NSForegroundColorAttributeName) === bar.color.ios;

    return isValid;
}