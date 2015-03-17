import segmentedBarModule = require("ui/segmented-bar");

export function getNativeItemsCount(bar: segmentedBarModule.SegmentedBar): number {
    return (<android.widget.TabHost>bar.android).getTabWidget().getTabCount();
}