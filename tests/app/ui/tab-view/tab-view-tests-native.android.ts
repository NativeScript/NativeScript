import * as tabViewModule from "ui/tab-view";

export function getNativeTabCount(tabView: tabViewModule.TabView): number {
    var pagerAdapter: android.support.v4.view.PagerAdapter = (<any>tabView)._pagerAdapter;
    return pagerAdapter.getCount();
}

export function selectNativeTab(tabView: tabViewModule.TabView, index: number): void {
    var viewPager: android.support.v4.view.ViewPager = (<any>tabView)._viewPager;
    return viewPager.setCurrentItem(index);
}

export function getNativeSelectedIndex(tabView: tabViewModule.TabView): number {
    var viewPager: android.support.v4.view.ViewPager = (<any>tabView)._viewPager;
    return viewPager.getCurrentItem();
}