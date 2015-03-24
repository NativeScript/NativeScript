/**
 * Contains the TabView class, which represents a standard content component with tabs.
 */
declare module "ui/tab-view" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Represents a tab view entry.
     */
    interface TabViewItem {
        /**
         * Gets or sets the title of the TabViewItem.
         */
        title: string;

        /**
         * Gets or sets the view of the TabViewItem.
         */
        view: view.View;
        
        /**
         * Gets or sets the icon source of the TabViewItem. This could either be a a file name or resource id.
         */
        iconSource?: string;
    }

    /**
     * Represents a tab view.
     */
    class TabView extends view.View {
        public static itemsProperty: dependencyObservable.Property;
        public static selectedIndexProperty: dependencyObservable.Property;

        /**
         * Gets or sets the items of the TabView.
         */
        items: Array<TabViewItem>;

        /**
         * Gets or sets the selectedIndex of the TabView.
         */
        selectedIndex: number;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/support/v4/view/ViewPager.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: android.support.v4.view.ViewPager;

        /**
         * Gets the native iOS [UITabBarController](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITabBarController_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: UITabBarController;
    }
} 