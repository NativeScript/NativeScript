import { Frame, GridLayout, Label, Page, TabView, View } from '@nativescript/core';
import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';

export * from './frame-tests-common';

function assertHostedBelowHeader(hosted: View) {
	const header = new Label();
	header.text = 'Header';
	const grid = new GridLayout();
	grid.rows = '50, *';
	GridLayout.setRow(hosted, 1);
	grid.addChild(header);
	grid.addChild(hosted);

	helper.buildUIAndRunTest(grid, () => {
		helper.waitUntilLayoutReady(hosted);

		const headerFrame = (header.nativeViewProtected as UIView).frame;
		const hostedFrame = (hosted.nativeViewProtected as UIView).frame;
		const container = (grid.nativeViewProtected as UIView).bounds;

		TKUnit.assertAreClose(hostedFrame.origin.y, headerFrame.origin.y + headerFrame.size.height, 0.5, 'top');
		TKUnit.assertAreClose(hostedFrame.origin.y + hostedFrame.size.height, container.size.height, 0.5, 'bottom');
		TKUnit.assertAreClose(hostedFrame.origin.x, 0, 0.5, 'left');
		TKUnit.assertAreClose(hostedFrame.size.width, container.size.width, 0.5, 'width');
	});
}

export function test_frame_hosted_in_layout_fills_its_cell() {
	assertHostedBelowHeader(new Frame());
}

export function test_tab_view_hosted_in_layout_fills_its_cell() {
	assertHostedBelowHeader(new TabView());
}

export function test_default_navigation_delegate_does_not_advertise_custom_animation(done: (error?: Error) => void) {
	const frame = Frame.topmost();
	const original = frame.currentPage;
	const selector = 'navigationController:animationControllerForOperation:fromViewController:toViewController:';
	function assertDelegate(page: Page, custom: boolean) {
		TKUnit.assertEqual(frame.currentPage, page, 'current page');
		TKUnit.assertTrue(frame.navigationQueueIsEmpty(), 'navigation settled');
		const delegate = frame.ios.controller.delegate as NSObject;
		TKUnit.assertEqual(delegate.respondsToSelector(selector), custom, 'custom animation selector');
		TKUnit.assertTrue(delegate.respondsToSelector('navigationController:didShowViewController:animated:'), 'didShow selector');
	}
	function whenNavigated(page: Page, action: () => void): Promise<void> {
		return new Promise((resolve) => {
			// Page restores its delegate after dispatching navigatedTo.
			page.once(Page.navigatedToEvent, () => setTimeout(resolve, 0));
			action();
		});
	}
	(async () => {
		const standard = new Page();
		await whenNavigated(standard, () => frame.navigate({ create: () => standard, transition: null, animated: true }));
		assertDelegate(standard, false);
		const custom = new Page();
		await whenNavigated(custom, () => frame.navigate({ create: () => custom, transition: { name: 'fade', duration: 20 }, animated: true }));
		assertDelegate(custom, true);
		const next = new Page();
		await whenNavigated(next, () => frame.navigate({ create: () => next, transition: null, animated: true }));
		assertDelegate(next, false);
		await whenNavigated(custom, () => frame.goBack());
		assertDelegate(custom, true);
		await whenNavigated(standard, () => frame.goBack());
		assertDelegate(standard, false);
		await whenNavigated(original, () => frame.goBack());
	})().then(() => done(), done);
}
