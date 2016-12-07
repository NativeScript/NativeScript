//@private
import tabViewModule = require("ui/tab-view");

export declare function getNativeTabCount(tabView: tabViewModule.TabView): number;
export declare function selectNativeTab(tabView: tabViewModule.TabView, index: number): void;
export declare function getNativeSelectedIndex(tabView: tabViewModule.TabView): number;
export declare function getNativeFont(tabView: tabViewModule.TabView): any;