import * as TKUnit from "../../TKUnit";
import { Page } from "tns-core-modules/ui/page";
import { Frame, NavigationEntry, stack } from "tns-core-modules/ui/frame";
import { _resetRootView, getRootView } from "tns-core-modules/application";
import { TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";
import * as myCustomControlWithoutXml from "./mymodule/MyControl";
import * as helper from "../helper";

function createTestFrameRootEntry() {
    const page = new Page();
    const frameRoot = new Frame();
    frameRoot.navigate(() => page);

    const entry: NavigationEntry = {
        create: () => frameRoot
    };

    return {
        entry: entry,
        root: frameRoot,
        page: page
    };
}

export function test_custom_component_rootview_css_applied() {
    var entry = {
        moduleName: "ui/root-view/root-modules/custom-component-root"
    };

    _resetRootView(entry);

    var rootView = getRootView();
    TKUnit.waitUntilReady(() => rootView.isLoaded);

    TKUnit.assert(rootView instanceof myCustomControlWithoutXml.MyControl);
    helper.assertViewBackgroundColor(rootView, "#0000FF");
};

export function test_tabview_rootview_css_applied() {
    var entry = {
        moduleName: "ui/root-view/root-modules/tabview-root"
    };

    _resetRootView(entry);

    var rootView = getRootView();
    TKUnit.waitUntilReady(() => rootView.isLoaded);

    TKUnit.assert(rootView instanceof TabView);
    helper.assertTabSelectedTabTextColor(rootView, "#0000FF");
};

export function test_gridlayout_rootview_css_applied() {
    var entry = {
        moduleName: "ui/root-view/root-modules/gridlayout-root"
    };

    _resetRootView(entry);

    var rootView = getRootView();
    TKUnit.waitUntilReady(() => rootView.isLoaded);

    TKUnit.assert(rootView instanceof GridLayout);
    helper.assertViewBackgroundColor(rootView, "#0000FF");
};

export function tearDownModule() {
    // reset the root to frame for other tests
    const resetFrameRoot = createTestFrameRootEntry();

    _resetRootView(resetFrameRoot.entry);
    TKUnit.waitUntilReady(() => resetFrameRoot.page.isLoaded);
}