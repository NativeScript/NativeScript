import * as TKUnit from '../../tk-unit';
import { PercentLength, unsetValue, Frame, Page } from '@nativescript/core';
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
