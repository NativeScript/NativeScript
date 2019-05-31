import { TabView } from "tns-core-modules/ui/tab-view";

export function getNativeTabCount(tabView: TabView): number {
    const pagerAdapter: android.support.v4.view.PagerAdapter = (<any>tabView)._pagerAdapter;
    return pagerAdapter ? pagerAdapter.getCount() : 0;
}

export function selectNativeTab(tabView: TabView, index: number): void {
    const viewPager: android.support.v4.view.ViewPager = (<any>tabView)._viewPager;
    if (viewPager) {
        viewPager.setCurrentItem(index);
    }
}

export function getNativeSelectedIndex(tabView: TabView): number {
    const viewPager: android.support.v4.view.ViewPager = (<any>tabView)._viewPager;
    return viewPager ? viewPager.getCurrentItem() : -1;
}

export function getNativeFont(tabView: TabView): any {
    const tv: android.widget.TextView = (<org.nativescript.widgets.TabLayout>(<any>tabView)._tabLayout).getTextViewForItemAt(0);
    if (tv) {
        return {
            typeface: tv.getTypeface(),
            size: tv.getTextSize()
        }
    }

    return null;
}

export function getOriginalFont(tabView: TabView): any {
    const tv: android.widget.TextView = (<org.nativescript.widgets.TabLayout>(<any>tabView)._tabLayout).getTextViewForItemAt(0);
    return {
        typeface: tv.getTypeface(),
        size: tv.getTextSize()
    }
}