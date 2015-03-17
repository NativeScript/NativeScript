import segmentedBarModule = require("ui/segmented-bar");

export function getNativeItemsCount(bar: segmentedBarModule.SegmentedBar): number {
    return (<UISegmentedControl>bar.ios).numberOfSegments;
}