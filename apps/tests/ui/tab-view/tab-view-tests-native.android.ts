import tabViewModule = require("ui/tab-view");

export function getNativeTabCount(tabView: tabViewModule.TabView): number {
    var actionBar = _getActionBar(tabView);
    if (actionBar) {
        return actionBar.getTabCount();
    }

    return tabView.android.getAdapter().getCount();
}

export function selectNativeTab(tabView: tabViewModule.TabView, index: number): void {
    var actionBar = _getActionBar(tabView);
    if (actionBar) {
        actionBar.setSelectedNavigationItem(index);
    }
    else {
        tabView.android.setCurrentItem(index);
    }
}

function _getActionBar(tabView: tabViewModule.TabView) {
    if (!tabView.android) {
        return undefined;
    }

    var activity = <android.app.Activity>tabView.android.getContext();
    return activity.getActionBar();
}
