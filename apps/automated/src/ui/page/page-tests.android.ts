import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { addLabelToPage } from './page-tests-common';
import { Page } from '@nativescript/core/ui/page';
import { Label } from '@nativescript/core/ui/label';
import { Frame } from '@nativescript/core/ui/frame';

export * from './page-tests-common';

export function test_NavigateToNewPage_WithAndroidCache() {
	// Clear history if any.
	helper.navigate(() => {
		const launchPage = new Page();
		launchPage.id = 'launchPage_test_NavigateToNewPage_WithAndroidCache';

		return launchPage;
	});

	TKUnit.assertEqual(Frame.topmost().backStack.length, 0, 'The backstack should be empty before this test can be run.');

	let testPage: Page;
	let label: Label;

	const pageFactory = function (): Page {
		testPage = new Page();
		testPage.id = 'testPage_test_NavigateToNewPage_WithAndroidCache';
		label = new Label();
		label.text = 'The quick brown fox jumps over the lazy dog.';
		testPage.content = label;

		return testPage;
	};

	const currentPage = Frame.topmost().currentPage;
	helper.navigateWithHistory(pageFactory);
	TKUnit.assertNotNull(currentPage.nativeView);
	helper.goBack();

	TKUnit.assertNull(testPage.parent, 'Page.parent should become undefined after navigating back');
	TKUnit.assertFalse(testPage.isLoaded, 'Page.isLoaded should become false after navigating back');
	TKUnit.assertNull(testPage.frame, 'Page.frame should become undefined after navigating back');
	TKUnit.assertFalse(testPage._isAddedToNativeVisualTree, 'Page._isAddedToNativeVisualTree should become false after navigating back');

	TKUnit.assertNull(label._context, 'InnerControl._context should not be set after navigate back.');
	TKUnit.assertNull(label.android, 'InnerControl.android should not be set after navigate back.');
	TKUnit.assertNull(label.nativeViewProtected, 'InnerControl.nativeView hould not be set after navigate back.');
	TKUnit.assertFalse(label.isLoaded, 'InnerControl.isLoaded should become false after navigating back');
	TKUnit.assertFalse(label._isAddedToNativeVisualTree, 'InnerControl._isAddedToNativeVisualTree should not be true after navigating back');
}

export function test_NavigateToNewPage_InnerControl() {
	let testPage: Page;
	const pageFactory = function () {
		testPage = new Page();
		testPage.id = 'testPage_test_NavigateToNewPage_InnerControl';
		addLabelToPage(testPage);

		return testPage;
	};

	helper.navigateWithHistory(pageFactory);
	helper.goBack();

	const label = <Label>testPage.content;
	TKUnit.assertNull(label._context, 'InnerControl._context should be undefined after navigate back.');
	TKUnit.assertNull(label.android, 'InnerControl.android should be undefined after navigate back.');
	TKUnit.assertNull(label.nativeViewProtected, 'InnerControl.nativeView should be undefined after navigate back.');
	TKUnit.assertFalse(label.isLoaded, 'InnerControl.isLoaded should become false after navigating back');
	TKUnit.assertFalse(label._isAddedToNativeVisualTree, 'InnerControl._isAddedToNativeVisualTree should become false after navigating back');
}

export function test_SetPageCaching_ToTheSameValue_AfterNavigated_DoesNotThrow() {
	const pageFactory = function () {
		const testPage = new Page();
		testPage.id = 'testPage_test_SetPageCaching_ToTheSameValue_AfterNavigated_DoesNotThrow';

		return testPage;
	};

	helper.navigate(pageFactory);
}

export function test_Resolve_Fragment_ForPage() {
	let testPage: Page;
	const pageFactory = () => {
		testPage = new Page();

		return testPage;
	};

	const frame = Frame.topmost();
	frame.navigate(pageFactory);
	TKUnit.waitUntilReady(() => frame.navigationQueueIsEmpty());

	const fragment = frame.android.fragmentForPage(frame._currentEntry);
	TKUnit.assertNotNull(fragment, 'Failed to resolve native fragment for page');
}
