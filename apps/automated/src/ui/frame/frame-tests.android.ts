import { Frame, GridLayout, Label, Page, Trace, View } from '@nativescript/core';
import * as TKUnit from '../../tk-unit';
import { unsetValue } from '@nativescript/core/ui/core/view';
import { PercentLength } from '@nativescript/core/ui/styling/style-properties';
import { buildUIAndRunTest } from '../../ui-helper';
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

export function test_nested_frames() {
	let topFrame = Frame.topmost();
	let currentPage = topFrame.currentPage;
	console.log(Frame.topmost(), currentPage);
	class PageAbstraction {
		page: Page;
		root: GridLayout;
		setContent(content: View) {
			this.root.insertChild(content, 0);
			content.marginTop = 30;
		}
	}

	const pageFactory = (color: string) => {
		const page = new Page();
		page.backgroundColor = color;
		const gl = new GridLayout();
		const label = new Label();
		page.on('navigatedTo', () => {
			let depth = 0;
			let parent = label.parent;
			let parentFrame: Frame = null;
			while (parent) {
				if (parent instanceof Frame) {
					parentFrame = parentFrame || parent;
					depth++;
				}
				parent = parent.parent;
			}
			label.text = `Depth: ${depth} - Page: ${parentFrame?.backStack.length}`;
		});
		label.style.zIndex = 999;
		gl.insertChild(label, 0);
		page.content = gl;
		const abs = new PageAbstraction();
		abs.root = gl;
		abs.page = page;

		return abs;
	};

	const page1 = pageFactory('red');
	const page2 = pageFactory('blue');
	const page3 = pageFactory('green');
	const parentPage2 = pageFactory('yellow');

	const frameFactory = () => {
		const frame = new Frame();
		frame._popFromFrameStack();
		frame.navigate = function (...args) {
			// console.log('navigateTo', args, args[0].create().backgroundColor);
			Frame.prototype.navigate.call(frame, ...args);
			this._popFromFrameStack();
		};
		frame.goBack = function (...args) {
			// console.log('goBack', args);
			Frame.prototype.goBack.call(frame, ...args);
			this._popFromFrameStack();
		};
		frame.on('navigatingTo', () => ((frame as any).__midNav = true));
		frame.on('navigatedTo', () => ((frame as any).__midNav = false));
		return frame;
	};

	const innerFrame = frameFactory();
	const innerFrame2 = frameFactory();
	page1.setContent(innerFrame2);

	innerFrame.navigate({
		create: () => {
			return page1.page;
		},
	});

	innerFrame2.navigate({
		create: () => {
			return page2.page;
		},
	});
	function validateState(frame: Frame) {
		TKUnit.waitUntilReady(() => (frame as any).__midNav === false, 1);
		TKUnit.assertTrue(frame._executingContext == null);
		TKUnit.assertTrue(frame._currentEntry != null);
		if (frame.isLoaded) {
			TKUnit.assertTrue(frame._currentEntry.fragment != null);
		}
	}
	// TKUnit.wait(1);
	buildUIAndRunTest(innerFrame, ([parentFrame, parentPage]) => {
		Trace.enable();
		Trace.setCategories(Trace.categories.concat(Trace.categories.NativeLifecycle, Trace.categories.Transition));
		validateState(innerFrame);
		validateState(innerFrame2);
		innerFrame2.navigate({
			create: () => {
				return page3.page;
			},
		});
		validateState(innerFrame);
		validateState(innerFrame2);
		innerFrame.navigate({
			create: () => parentPage2.page,
		});
		validateState(innerFrame);
		validateState(innerFrame2);
		innerFrame.goBack();
		validateState(innerFrame);
		validateState(innerFrame2);
		innerFrame2.goBack();
		validateState(innerFrame);
		validateState(innerFrame2);
		innerFrame.navigate({
			create: () => parentPage2.page,
		});
		validateState(innerFrame);
		validateState(innerFrame2);
		innerFrame.goBack();
		validateState(innerFrame);
		validateState(innerFrame2);

		// innerFrame.navigate({
		// 	create: () => parentPage2.page,
		// });
		// TKUnit.wait(1);
		// innerFrame.goBack();
		// TKUnit.wait(1);
		// TKUnit.assertTrue(innerFrame2._currentEntry.fragment != null);
		// TKUnit.wait(5);
	});

	// TKUnit.waitUntilReady(() => {
	// 	return innerFrame.isLayoutValid;
	// }, 1);

	TKUnit.wait(10);
}
