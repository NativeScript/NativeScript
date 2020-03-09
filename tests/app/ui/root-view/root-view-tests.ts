import * as TKUnit from "../../tk-unit";
import { Page, View } from "tns-core-modules/ui/page";
import { Frame, NavigationEntry, _stack } from "tns-core-modules/ui/frame";
import { _resetRootView, getRootView } from "tns-core-modules/application";
import { TabView } from "tns-core-modules/ui/tab-view";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";
import * as helper from "../../ui-helper";

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

    TKUnit.assertNotNull(rootView);
    TKUnit.assertEqual(rootView.className, "MyStackLayoutRoot", "Expected result custom control is created");
    helper.assertViewBackgroundColor(rootView, "#0000FF");
}

export function test_custom_component_rootview_layout_updates() {
    layout_invalidate_test("./ui/root-view/root-modules/custom-component-root");
}

export function test_tabview_rootview_css_applied() {
    var entry = {
        moduleName: "ui/root-view/root-modules/tabview-root"
    };

    _resetRootView(entry);

    var rootView = getRootView();
    TKUnit.waitUntilReady(() => rootView.isLoaded);

    TKUnit.assert(rootView instanceof TabView);
    helper.assertTabSelectedTabTextColor(rootView, "#0000FF");
}

export function test_gridlayout_rootview_css_applied() {
    var entry = {
        moduleName: "ui/root-view/root-modules/gridlayout-root"
    };

    _resetRootView(entry);

    var rootView = getRootView();
    TKUnit.waitUntilReady(() => rootView.isLoaded);

    TKUnit.assert(rootView instanceof GridLayout);
    helper.assertViewBackgroundColor(rootView, "#0000FF");
}

export function test_gridlayout_rootview_layout_updates() {
    layout_invalidate_test("ui/root-view/root-modules/gridlayout-root");
}

export function test_tabview_rootview_layout_updates() {
    layout_invalidate_test("ui/root-view/root-modules/gridlayout-root");
}

function layout_invalidate_test(moduleName: string) {
    var entry = { moduleName };

    _resetRootView(entry);

    var rootView = getRootView();
    TKUnit.waitUntilReady(() => rootView.isLayoutValid);

    const lbl = <View>rootView.getViewById("my-test-label");

    lbl.visibility = "collapse";
    TKUnit.assertFalse(rootView.isLayoutValid);
    TKUnit.waitUntilReady(() => rootView.isLayoutValid);

    lbl.visibility = "visible";
    TKUnit.assertFalse(rootView.isLayoutValid);
    TKUnit.waitUntilReady(() => rootView.isLayoutValid);
    TKUnit.waitUntilReady(() => lbl.isLayoutValid);
}

export function tearDownModule() {
    // reset the root to frame for other tests
    const resetFrameRoot = createTestFrameRootEntry();

    _resetRootView(resetFrameRoot.entry);
    TKUnit.waitUntilReady(() => resetFrameRoot.page.isLoaded);
}
