import * as TKUnit from '../../tk-unit';
import { PercentLength, unsetValue, Frame, Page, StackLayout, GridLayout, View } from '@nativescript/core';
export * from './frame-tests-common';

export function test_percent_width_and_height_set_to_page_support() {
	let topFrame = Frame.topmost();
	let currentPage = topFrame.currentPage;

	(<any>currentPage).width = '50%';
	(<any>currentPage).height = '50%';

	TKUnit.waitUntilReady(() => {
		return currentPage.isLayoutValid;
	}, 1);

	let topFrameWidth = topFrame.getMeasuredWidth();
	let topFrameHeight = topFrame.getMeasuredHeight();

	let currentPageWidth = currentPage.getMeasuredWidth();
	let currentPageHeight = currentPage.getMeasuredHeight();

	TKUnit.assertEqual(currentPageWidth, Math.floor(topFrameWidth / 2), 'Current page measuredWidth incorrect');
	TKUnit.assertEqual(currentPageHeight, Math.floor(topFrameHeight / 2), 'Current page measuredHeight incorrect');

	//reset values.
	currentPage.height = unsetValue;
	currentPage.width = unsetValue;

	TKUnit.assertTrue(PercentLength.equals(currentPage.width, 'auto'));
	TKUnit.assertTrue(PercentLength.equals(currentPage.height, 'auto'));
}

export function test_percent_margin_set_to_page_support() {
	let topFrame = Frame.topmost();
	let currentPage = topFrame.currentPage;
	currentPage.margin = '10%';

	TKUnit.waitUntilReady(() => {
		return currentPage.isLayoutValid;
	}, 1);

	let topFrameWidth = topFrame.getMeasuredWidth();
	let topFrameHeight = topFrame.getMeasuredHeight();

	let currentPageWidth = currentPage.getMeasuredWidth();
	let currentPageHeight = currentPage.getMeasuredHeight();

	let marginLeft = topFrameWidth * 0.1;
	let marginTop = topFrameHeight * 0.1;

	let bounds = currentPage._getCurrentLayoutBounds();
	TKUnit.assertEqual(bounds.left, Math.floor(marginLeft), 'Current page LEFT position incorrect');
	TKUnit.assertEqual(bounds.top, Math.floor(marginTop), 'Current page  TOP position incorrect');
	TKUnit.assertEqual(bounds.right, Math.floor(marginLeft + currentPageWidth), 'Current page  RIGHT position incorrect');
	TKUnit.assertEqual(bounds.bottom, Math.floor(marginTop + currentPageHeight), 'Current page  BOTTOM position incorrect');

	//reset values.
	currentPage.margin = '0';

	TKUnit.assertTrue(PercentLength.equals(currentPage.marginLeft, 0));
	TKUnit.assertTrue(PercentLength.equals(currentPage.marginTop, 0));
	TKUnit.assertTrue(PercentLength.equals(currentPage.marginRight, 0));
	TKUnit.assertTrue(PercentLength.equals(currentPage.marginBottom, 0));
}

export function test_back_after_activity_recreation(done: (error?: Error) => void) {
	const frame = Frame.topmost();
	frame.navigate({ create: () => new Page(), clearHistory: true, animated: false });
	TKUnit.waitUntilReady(() => frame.navigationQueueIsEmpty(), 15);
	const previous = frame.currentPage;
	frame.navigate({ create: () => new Page(), animated: false });
	TKUnit.waitUntilReady(() => frame.navigationQueueIsEmpty(), 15);
	const activity = frame.android.activity;
	activity.recreate();

	const deadline = Date.now() + 10000;
	let wentBack = false;
	const poll = () => {
		try {
			if (!wentBack && frame.android.activity !== activity && frame.isLoaded && frame.currentPage.isLoaded) {
				wentBack = true;
				frame.goBack();
			} else if (wentBack && frame.navigationQueueIsEmpty()) {
				TKUnit.assertEqual(frame.currentPage, previous, 'Back resumes after early native attachment');
				done();
				return;
			}
			TKUnit.assertTrue(Date.now() < deadline, wentBack ? 'Back navigation stalled after Activity recreation' : 'Activity recreated and Frame loaded');
			setTimeout(poll, 50);
		} catch (e) {
			done(e);
		}
	};
	setTimeout(poll, 50);
}

function showHostLayout(): StackLayout {
	const topFrame = Frame.topmost();
	const layout = new StackLayout();
	const hostPage = new Page();
	hostPage.content = layout;
	topFrame.navigate({ create: () => hostPage, clearHistory: true, animated: false });
	TKUnit.waitUntilReady(() => topFrame.navigationQueueIsEmpty() && hostPage.isLoaded, 15);

	return layout;
}

function countNavigatedTo(frame: Frame): { count: number } {
	const counter = { count: 0 };
	frame.on(Frame.navigatedToEvent, () => counter.count++);

	return counter;
}

function assertNavigationIsPending(frame: Frame) {
	const fragment = frame._executingContext?.entry?.fragment;
	TKUnit.assertNotNull(fragment, 'Nested frame started navigating');
	TKUnit.assertFalse(fragment.isAdded(), 'Nested frame fragment transaction is still pending');
}

function waitFor(done: (error?: Error) => void, condition: () => boolean, then: () => void, message: string) {
	const deadline = Date.now() + 10000;
	const poll = () => {
		try {
			if (condition()) {
				then();

				return;
			}
			TKUnit.assertTrue(Date.now() < deadline, message);
			setTimeout(poll, 50);
		} catch (e) {
			done(e);
		}
	};
	setTimeout(poll, 50);
}

function afterFragmentManagerPass(done: (error?: Error) => void, then: () => void) {
	setTimeout(() => {
		try {
			then();
		} catch (e) {
			done(e);
		}
	}, 500);
}

export function test_nested_frame_removed_before_its_first_page_is_shown(done: (error?: Error) => void) {
	const topFrame = Frame.topmost();
	const layout = showHostLayout();

	const nestedFrame = new Frame();
	const navigatedTo = countNavigatedTo(nestedFrame);
	let nestedPage: Page;
	layout.addChild(nestedFrame);
	nestedFrame.navigate({ create: () => (nestedPage = new Page()), animated: false });
	assertNavigationIsPending(nestedFrame);
	layout.removeChild(nestedFrame);

	topFrame.navigate({ create: () => new Page(), animated: false });
	waitFor(
		done,
		() => topFrame.navigationQueueIsEmpty(),
		() => {
			TKUnit.assertNull(nestedPage.nativeViewProtected, 'Nested page native view was never created');
			TKUnit.assertFalse(!!nestedPage.isLoaded, 'Nested page was never loaded');
			TKUnit.assertEqual(navigatedTo.count, 0, 'Nested frame navigatedTo count');
			TKUnit.assertFalse(nestedFrame.navigationQueueIsEmpty(), 'Nested frame keeps the navigation queued');
			done();
		},
		'Navigation settled after removing the nested frame',
	);
}

export function test_nested_frame_removed_before_its_first_page_is_shown_navigates_when_added_again(done: (error?: Error) => void) {
	const layout = showHostLayout();

	const nestedFrame = new Frame();
	const navigatedTo = countNavigatedTo(nestedFrame);
	let nestedPage: Page;
	layout.addChild(nestedFrame);
	nestedFrame.navigate({ create: () => (nestedPage = new Page()), animated: false });
	assertNavigationIsPending(nestedFrame);
	layout.removeChild(nestedFrame);

	afterFragmentManagerPass(done, () => {
		TKUnit.assertEqual(navigatedTo.count, 0, 'Nested frame navigatedTo count while removed');
		layout.addChild(nestedFrame);
		waitFor(
			done,
			() => nestedFrame.navigationQueueIsEmpty() && nestedFrame.currentPage === nestedPage && nestedPage.isLoaded,
			() => {
				TKUnit.assertEqual(navigatedTo.count, 1, 'Nested frame navigatedTo count');
				TKUnit.assertNull(nestedFrame._executingContext, 'Nested frame has no executing navigation');
				TKUnit.assertEqual(Frame.topmost(), nestedFrame, 'Nested frame is the topmost frame');
				layout.removeChild(nestedFrame);
				done();
			},
			'Nested frame navigated to the queued page after being added again',
		);
	});
}

export function test_nested_frame_removed_while_going_back_goes_back_when_added_again(done: (error?: Error) => void) {
	const layout = showHostLayout();

	const nestedFrame = new Frame();
	const firstPage = new Page();
	const secondPage = new Page();
	layout.addChild(nestedFrame);
	nestedFrame.navigate({ create: () => firstPage, animated: false });
	TKUnit.waitUntilReady(() => nestedFrame.navigationQueueIsEmpty(), 15);
	nestedFrame.navigate({ create: () => secondPage, animated: false });
	TKUnit.waitUntilReady(() => nestedFrame.navigationQueueIsEmpty(), 15);

	const navigatedTo = countNavigatedTo(nestedFrame);
	nestedFrame.goBack();
	assertNavigationIsPending(nestedFrame);
	layout.removeChild(nestedFrame);

	afterFragmentManagerPass(done, () => {
		TKUnit.assertEqual(navigatedTo.count, 0, 'Nested frame navigatedTo count while removed');
		TKUnit.assertFalse(!!firstPage.isLoaded, 'First page was not shown while removed');
		layout.addChild(nestedFrame);
		waitFor(
			done,
			() => nestedFrame.navigationQueueIsEmpty() && nestedFrame.currentPage === firstPage && firstPage.isLoaded,
			() => {
				TKUnit.assertEqual(navigatedTo.count, 1, 'Nested frame navigatedTo count');
				TKUnit.assertEqual(nestedFrame.backStack.length, 0, 'Nested frame back stack length');
				TKUnit.assertNull(nestedFrame._executingContext, 'Nested frame has no executing navigation');
				layout.removeChild(nestedFrame);
				done();
			},
			'Nested frame went back after being added again',
		);
	});
}

export function test_frame_in_modal_removed_before_its_first_page_is_shown(done: (error?: Error) => void) {
	const topFrame = Frame.topmost();
	topFrame.navigate({ create: () => new Page(), clearHistory: true, animated: false });
	TKUnit.waitUntilReady(() => topFrame.navigationQueueIsEmpty(), 15);

	const modalRoot = new GridLayout();
	const modalFrame = new Frame();
	const navigatedTo = countNavigatedTo(modalFrame);
	let modalPage: Page;
	modalRoot.addChild(modalFrame);
	modalFrame.navigate({ create: () => (modalPage = new Page()), animated: false });

	let closed = false;
	modalRoot.on(View.shownModallyEvent, () => {
		try {
			assertNavigationIsPending(modalFrame);
			modalRoot.closeModal();
			modalRoot.removeChild(modalFrame);
		} catch (e) {
			done(e);
		}
	});
	topFrame.currentPage.showModal(modalRoot, { context: null, closeCallback: () => (closed = true), animated: false });

	waitFor(
		done,
		() => closed && !modalRoot.isLoaded,
		() =>
			afterFragmentManagerPass(done, () => {
				TKUnit.assertFalse(!!modalPage.isLoaded, 'Modal frame page was never loaded');
				TKUnit.assertEqual(navigatedTo.count, 0, 'Modal frame navigatedTo count');
				done();
			}),
		'Modal closed',
	);
}
