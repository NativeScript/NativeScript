import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { View } from '@nativescript/core/ui/core/view';
import { Button } from '@nativescript/core/ui/button';
import { Page } from '@nativescript/core/ui/page';
import { ScrollView } from '@nativescript/core/ui/scroll-view';
import { LayoutBase } from '@nativescript/core/ui/layouts/layout-base';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout';
import { ProxyViewContainer } from '@nativescript/core/ui/proxy-view-container';
import { ListView } from '@nativescript/core/ui/list-view';

export function test_add_children_to_attached_proxy() {
	const outer = new StackLayout();
	const proxy = new ProxyViewContainer();

	function testAction(views: Array<View>) {
		outer.addChild(createBtn('1'));
		outer.addChild(proxy);
		proxy.addChild(createBtn('2'));
		proxy.addChild(createBtn('3'));
		proxy.addChild(createBtn('4'));

		outer.addChild(createBtn('5'));

		assertNativeChildren(outer, ['1', '2', '3', '4', '5']);
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_children_immediately_registered_in_parent_grid_layout() {
	const outer = new GridLayout();
	const proxy = new ProxyViewContainer();

	function testAction(views: Array<View>) {
		outer.addChild(proxy);
		proxy.addChild(createBtn('1'));

		assertNativeChildren(outer, ['1']);
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_proxy_layout_properties() {
	const outer = new GridLayout();
	const proxy = new ProxyViewContainer();

	function testAction(views: Array<View>) {
		outer.addChild(proxy);

		const btn = createBtn('1');
		proxy.addChild(btn);

		proxy.row = 1;
		TKUnit.assertEqual(proxy.row, btn.row, 'Proxy row value to existing child');

		const btn2 = createBtn('2');
		proxy.addChild(btn2);
		TKUnit.assertEqual(proxy.row, btn2.row, 'Proxy row value to new child');

		proxy.removeChild(btn2);

		btn.row = 0;
		TKUnit.assertNotEqual(proxy.row, btn.row, 'Child value changed');

		proxy.row = 1;
		TKUnit.assertNotEqual(proxy.row, btn.row, 'Changed child value not overridden');
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_children_registered_in_parent_grid_layout_on_attach() {
	const outer = new GridLayout();
	const proxy = new ProxyViewContainer();

	function testAction(views: Array<View>) {
		proxy.addChild(createBtn('1'));
		outer.addChild(proxy);

		assertNativeChildren(outer, ['1']);
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_add_children_to_detached_proxy() {
	const outer = new StackLayout();
	const proxy = new ProxyViewContainer();

	function testAction(views: Array<View>) {
		outer.addChild(createBtn('1'));

		proxy.addChild(createBtn('2'));
		proxy.addChild(createBtn('3'));
		proxy.addChild(createBtn('4'));
		outer.addChild(proxy);

		outer.addChild(createBtn('5'));

		assertNativeChildren(outer, ['1', '2', '3', '4', '5']);
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_remove_proxy() {
	const outer = new StackLayout();
	const proxy = new ProxyViewContainer();

	outer.addChild(createBtn('1'));

	outer.addChild(proxy);
	proxy.addChild(createBtn('2'));
	proxy.addChild(createBtn('3'));
	proxy.addChild(createBtn('4'));

	outer.addChild(createBtn('5'));

	function testAction(views: Array<View>) {
		assertNativeChildren(outer, ['1', '2', '3', '4', '5']);
		outer.removeChild(proxy);
		assertNativeChildren(outer, ['1', '5']);
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_remove_child_of_attached_proxy() {
	const outer = new StackLayout();
	const proxy = new ProxyViewContainer();

	outer.addChild(createBtn('1'));

	outer.addChild(proxy);
	proxy.addChild(createBtn('2'));
	const testBtn = createBtn('3');
	proxy.addChild(testBtn);
	proxy.addChild(createBtn('4'));

	outer.addChild(createBtn('5'));

	function testAction(views: Array<View>) {
		assertNativeChildren(outer, ['1', '2', '3', '4', '5']);
		proxy.removeChild(testBtn);
		assertNativeChildren(outer, ['1', '2', '4', '5']);
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_insert_inside_proxy() {
	const outer = new StackLayout();
	const proxy = new ProxyViewContainer();

	outer.addChild(createBtn('1'));

	outer.addChild(proxy);
	proxy.addChild(createBtn('2'));
	proxy.addChild(createBtn('4'));

	outer.addChild(createBtn('5'));

	function testAction(views: Array<View>) {
		assertNativeChildren(outer, ['1', '2', '4', '5']);
		proxy.insertChild(createBtn('3'), 1);
		assertNativeChildren(outer, ['1', '2', '3', '4', '5']);
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_insert_after_proxy() {
	const outer = new StackLayout();
	const proxy = new ProxyViewContainer();

	outer.addChild(createBtn('1'));

	outer.addChild(proxy);
	proxy.addChild(createBtn('2'));
	proxy.addChild(createBtn('3'));
	proxy.addChild(createBtn('4'));

	function testAction(views: Array<View>) {
		assertNativeChildren(outer, ['1', '2', '3', '4']);
		outer.insertChild(createBtn('5'), 2);
		assertNativeChildren(outer, ['1', '2', '3', '4', '5']);
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_proxy_does_not_stop_request_layout_bubble() {
	const outer = new StackLayout();
	const proxy = new ProxyViewContainer();

	outer.addChild(createBtn('1'));
	outer.addChild(proxy);
	const btn = createBtn('2');
	proxy.addChild(btn);

	function testAction(views: Array<View>) {
		assertNativeChildren(outer, ['1', '2']);
		waitUntilElementLayoutIsValid(outer);
		TKUnit.assert(outer.isLayoutValid, 'outer container isLayoutValid should be true');
		btn.requestLayout();
		TKUnit.assertFalse(outer.isLayoutValid, 'outer container isLayoutValid should be invalidated here');
	}

	helper.buildUIAndRunTest(outer, testAction);
}

export function test_proxy_iniside_page() {
	const proxy = new ProxyViewContainer();
	proxy.addChild(createBtn('1'));

	function testAction(views: Array<View>) {
		const page = <Page>views[1];
		waitUntilElementLayoutIsValid(page);
	}

	helper.buildUIAndRunTest(proxy, testAction);
}

export function test_proxy_inside_scroll_view() {
	const scroll = new ScrollView();
	const proxy = new ProxyViewContainer();
	scroll.content = proxy;

	proxy.addChild(createBtn('1'));

	function testAction(views: Array<View>) {
		const page = <Page>views[1];
		waitUntilElementLayoutIsValid(page);
	}

	helper.buildUIAndRunTest(scroll, testAction);
}

export function test_proxy_inside_border() {
	const scroll = new ScrollView();
	const proxy = new ProxyViewContainer();
	scroll.content = proxy;

	proxy.addChild(createBtn('1'));

	function testAction(views: Array<View>) {
		const page = <Page>views[1];
		waitUntilElementLayoutIsValid(page);
	}

	helper.buildUIAndRunTest(scroll, testAction);
}

export function test_proxy_inside_listview_itemTemplate_crash() {
	// Usually reproducible with an Angular component in the template
	// We use a simple declaration here to simulate it.
	const list = new ListView();
	list.items = ['item 1'];
	list.itemTemplate = `
    <ProxyViewContainer>
        <Label text="{{$value}}"></Label>
    </ProxyViewContainer>
    `;

	function testAction(views: Array<View>) {
		const page = <Page>views[1];
		waitUntilElementLayoutIsValid(page);
	}

	helper.buildUIAndRunTest(list, testAction);
}

// TODO: Proxy as a direct child to of TabItem is not supported. Not sure if we want to support it.
//export function test_proxy_inside_tab() {
//    const proxy = new ProxyViewContainer();
//    proxy.addChild(createBtn("1"));

//    const tab = new TabView();
//    const items = new Array<TabViewItem>();
//    items.push(new TabViewItem({ title: "tab with proxy", view: proxy }));
//    tab.items = items;

//    function testAction(views: Array<View>) {
//        const page = <Page>views[1];
//        waitUntilElementLayoutIsValid(page);
//    };

//    helper.buildUIAndRunTest(tab, tab);
//}

// TODO: Proxy as a direct child to of ActionBar is not supported. Not sure if we want to support it.
//export function test_proxy_inside_actionBar() {
//    function testAction(views: Array<View>) {
//        const page = <Page>views[1];
//        const proxy = new ProxyViewContainer();
//        proxy.addChild(createBtn("1"));
//        page.actionBar.titleView = proxy;
//        waitUntilElementLayoutIsValid(page);
//    };

//    helper.buildUIAndRunTest(createBtn("hi"), testAction);
//}

function waitUntilElementLayoutIsValid(view: View, timeoutSec?: number): void {
	TKUnit.waitUntilReady(() => {
		return view.isLayoutValid;
	}, timeoutSec || 1);
}

function createBtn(text: string): Button {
	const b = new Button();
	b.text = text;

	return b;
}

function assertNativeChildren(layout: LayoutBase, arr: Array<string>) {
	if (layout.android) {
		let android: org.nativescript.widgets.LayoutBase = layout.android;
		TKUnit.assertEqual(android.getChildCount(), arr.length, 'Native children');
		for (let i = 0; i < arr.length; i++) {
			let nativeBtn = <android.widget.Button>android.getChildAt(i);
			TKUnit.assertEqual(nativeBtn.getText(), arr[i]);
		}
	} else if (layout.ios) {
		let ios: UIView = layout.ios;
		TKUnit.assertEqual(ios.subviews.count, arr.length, 'Native children');
		for (let i = 0; i < arr.length; i++) {
			let nativeBtn = <UIButton>ios.subviews[i];
			TKUnit.assertEqual(nativeBtn.titleLabel.text, arr[i]);
		}
	} else {
		TKUnit.assert(false, 'No native view to assert');
	}
}
