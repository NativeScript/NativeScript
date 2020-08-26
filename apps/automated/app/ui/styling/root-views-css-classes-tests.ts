import * as helper from '../../ui-helper';
import * as TKUnit from '../../tk-unit';

import { Application, isAndroid, isIOS, Device, Button, Page, ShownModallyData, ShowModalOptions, View, Utils, Enums } from '@nativescript/core';
import { _rootModalViews } from '@nativescript/core/ui/core/view/view-common';

const CLASS_NAME = 'class-name';
const ROOT_CSS_CLASS = 'ns-root';
const MODAL_CSS_CLASS = 'ns-modal';
const ANDROID_PLATFORM_CSS_CLASS = 'ns-android';
const IOS_PLATFORM_CSS_CLASS = 'ns-ios';
const PHONE_DEVICE_TYPE_CSS_CLASS = 'ns-phone';
const TABLET_DEVICE_TYPE_CSS_CLASS = 'ns-tablet';
const PORTRAIT_ORIENTATION_CSS_CLASS = 'ns-portrait';
const LANDSCAPE_ORIENTATION_CSS_CLASS = 'ns-landscape';
const UNKNOWN_ORIENTATION_CSS_CLASS = 'ns-unknown';
const DARK_SYSTEM_APPEARANCE_CSS_CLASS = 'ns-dark';
const LIGHT_SYSTEM_APPEARANCE_CSS_CLASS = 'ns-light';

function _test_root_css_class(view: View, isModal: boolean, shouldSetClassName: boolean) {
	if (shouldSetClassName) {
		view.className = CLASS_NAME;
	}

	const cssClass = isModal ? MODAL_CSS_CLASS : ROOT_CSS_CLASS;
	const viewCssClasses = view.cssClasses;
	TKUnit.assertTrue(viewCssClasses.has(cssClass), `${cssClass} CSS class is missing`);

	if (shouldSetClassName) {
		TKUnit.assertTrue(viewCssClasses.has(CLASS_NAME), `${CLASS_NAME} CSS class is missing`);
	}
}

function _test_platform_css_class(rootView: View, shouldSetClassName: boolean) {
	if (shouldSetClassName) {
		rootView.className = CLASS_NAME;
	}

	const cssClasses = rootView.cssClasses;
	if (isAndroid) {
		TKUnit.assertTrue(cssClasses.has(ANDROID_PLATFORM_CSS_CLASS), `${ANDROID_PLATFORM_CSS_CLASS} CSS class is missing`);
		TKUnit.assertFalse(cssClasses.has(IOS_PLATFORM_CSS_CLASS), `${IOS_PLATFORM_CSS_CLASS} CSS class is present`);
	} else {
		TKUnit.assertTrue(cssClasses.has(IOS_PLATFORM_CSS_CLASS), `${IOS_PLATFORM_CSS_CLASS} CSS class is missing`);
		TKUnit.assertFalse(cssClasses.has(ANDROID_PLATFORM_CSS_CLASS), `${ANDROID_PLATFORM_CSS_CLASS} CSS class is present`);
	}

	if (shouldSetClassName) {
		TKUnit.assertTrue(cssClasses.has(CLASS_NAME), `${CLASS_NAME} CSS class is missing`);
	}
}

function _test_device_type_css_class(rootView: View, shouldSetClassName: boolean) {
	if (shouldSetClassName) {
		rootView.className = CLASS_NAME;
	}

	const cssClasses = rootView.cssClasses;
	const deviceType = Device.deviceType;
	if (deviceType === Enums.DeviceType.Phone) {
		TKUnit.assertTrue(cssClasses.has(PHONE_DEVICE_TYPE_CSS_CLASS), `${PHONE_DEVICE_TYPE_CSS_CLASS} CSS class is missing`);
		TKUnit.assertFalse(cssClasses.has(TABLET_DEVICE_TYPE_CSS_CLASS), `${TABLET_DEVICE_TYPE_CSS_CLASS} CSS class is present`);
	} else {
		TKUnit.assertTrue(cssClasses.has(TABLET_DEVICE_TYPE_CSS_CLASS), `${TABLET_DEVICE_TYPE_CSS_CLASS} CSS class is missing`);
		TKUnit.assertFalse(cssClasses.has(PHONE_DEVICE_TYPE_CSS_CLASS), `${PHONE_DEVICE_TYPE_CSS_CLASS} CSS class is present`);
	}

	if (shouldSetClassName) {
		TKUnit.assertTrue(cssClasses.has(CLASS_NAME), `${CLASS_NAME} CSS class is missing`);
	}
}

function _test_orientation_css_class(rootView: View, shouldSetClassName: boolean) {
	if (shouldSetClassName) {
		rootView.className = CLASS_NAME;
	}

	const cssClasses = rootView.cssClasses;
	let appOrientation;
	if (isAndroid) {
		appOrientation = Application.android.orientation;
	} else {
		appOrientation = Application.ios.orientation;
	}
	if (appOrientation === 'portrait') {
		TKUnit.assertTrue(cssClasses.has(PORTRAIT_ORIENTATION_CSS_CLASS), `${PORTRAIT_ORIENTATION_CSS_CLASS} CSS class is missing`);
		TKUnit.assertFalse(cssClasses.has(LANDSCAPE_ORIENTATION_CSS_CLASS), `${LANDSCAPE_ORIENTATION_CSS_CLASS} CSS class is present`);
		TKUnit.assertFalse(cssClasses.has(UNKNOWN_ORIENTATION_CSS_CLASS), `${UNKNOWN_ORIENTATION_CSS_CLASS} CSS class is present`);
	} else if (appOrientation === 'landscape') {
		TKUnit.assertTrue(cssClasses.has(LANDSCAPE_ORIENTATION_CSS_CLASS), `${LANDSCAPE_ORIENTATION_CSS_CLASS} CSS class is missing`);
		TKUnit.assertFalse(cssClasses.has(PORTRAIT_ORIENTATION_CSS_CLASS), `${PORTRAIT_ORIENTATION_CSS_CLASS} CSS class is present`);
		TKUnit.assertFalse(cssClasses.has(UNKNOWN_ORIENTATION_CSS_CLASS), `${UNKNOWN_ORIENTATION_CSS_CLASS} CSS class is present`);
	} else if (appOrientation === 'landscape') {
		TKUnit.assertTrue(cssClasses.has(UNKNOWN_ORIENTATION_CSS_CLASS), `${UNKNOWN_ORIENTATION_CSS_CLASS} CSS class is missing`);
		TKUnit.assertFalse(cssClasses.has(LANDSCAPE_ORIENTATION_CSS_CLASS), `${LANDSCAPE_ORIENTATION_CSS_CLASS} CSS class is present`);
		TKUnit.assertFalse(cssClasses.has(PORTRAIT_ORIENTATION_CSS_CLASS), `${PORTRAIT_ORIENTATION_CSS_CLASS} CSS class is present`);
	}

	if (shouldSetClassName) {
		TKUnit.assertTrue(cssClasses.has(CLASS_NAME), `${CLASS_NAME} CSS class is missing`);
	}
}

function _test_system_appearance_css_class(rootView: View, shouldSetClassName: boolean) {
	if (shouldSetClassName) {
		rootView.className = CLASS_NAME;
	}

	const cssClasses = rootView.cssClasses;
	let systemAppearance;
	if (isAndroid) {
		systemAppearance = Application.android.systemAppearance;
	} else {
		systemAppearance = Application.ios.systemAppearance;
	}
	if (isIOS && Utils.ios.MajorVersion <= 12) {
		TKUnit.assertFalse(cssClasses.has(DARK_SYSTEM_APPEARANCE_CSS_CLASS), `${DARK_SYSTEM_APPEARANCE_CSS_CLASS} CSS class is present`);
		TKUnit.assertFalse(cssClasses.has(LIGHT_SYSTEM_APPEARANCE_CSS_CLASS), `${LIGHT_SYSTEM_APPEARANCE_CSS_CLASS} CSS class is present`);
	} else if (systemAppearance === 'dark') {
		TKUnit.assertTrue(cssClasses.has(DARK_SYSTEM_APPEARANCE_CSS_CLASS), `${DARK_SYSTEM_APPEARANCE_CSS_CLASS} CSS class is missing`);
		TKUnit.assertFalse(cssClasses.has(LIGHT_SYSTEM_APPEARANCE_CSS_CLASS), `${LIGHT_SYSTEM_APPEARANCE_CSS_CLASS} CSS class is present`);
	} else if (systemAppearance === 'light') {
		TKUnit.assertTrue(cssClasses.has(LIGHT_SYSTEM_APPEARANCE_CSS_CLASS), `${LIGHT_SYSTEM_APPEARANCE_CSS_CLASS} CSS class is missing`);
		TKUnit.assertFalse(cssClasses.has(DARK_SYSTEM_APPEARANCE_CSS_CLASS), `${DARK_SYSTEM_APPEARANCE_CSS_CLASS} CSS class is present`);
	}

	if (shouldSetClassName) {
		TKUnit.assertTrue(cssClasses.has(CLASS_NAME), `${CLASS_NAME} CSS class is missing`);
	}
}

// Application root view
export function test_root_view_root_css_class() {
	const rootView = Application.getRootView();
	_test_root_css_class(rootView, false, false);
}

export function test_root_view_class_name_preserve_root_css_class() {
	const rootView = Application.getRootView();
	_test_root_css_class(rootView, false, true);
}

export function test_root_view_platform_css_class() {
	const rootView = Application.getRootView();
	_test_platform_css_class(rootView, false);
}

export function test_root_view_class_name_preserve_platform_css_class() {
	const rootView = Application.getRootView();
	_test_platform_css_class(rootView, true);
}

export function test_root_view_device_type_css_class() {
	const rootView = Application.getRootView();
	_test_device_type_css_class(rootView, false);
}

export function test_root_view_class_name_preserve_device_type_css_class() {
	const rootView = Application.getRootView();
	_test_device_type_css_class(rootView, true);
}

export function test_root_view_orientation_css_class() {
	const rootView = Application.getRootView();
	_test_orientation_css_class(rootView, false);
}

export function test_root_view_class_name_preserve_orientation_css_class() {
	const rootView = Application.getRootView();
	_test_orientation_css_class(rootView, true);
}

export function test_root_view_system_appearance_css_class() {
	const rootView = Application.getRootView();
	_test_system_appearance_css_class(rootView, false);
}

export function test_root_view_class_name_preserve_system_appearance_css_class() {
	const rootView = Application.getRootView();
	_test_system_appearance_css_class(rootView, true);
}

// Modal root view
function _test_modal_root_view_modal_css_class(shouldSetClassName: boolean) {
	let modalClosed = false;

	const modalCloseCallback = function () {
		modalClosed = true;
	};

	const modalPageShownModallyEventHandler = function (args: ShownModallyData) {
		const page = <Page>args.object;
		page.off(View.shownModallyEvent, modalPageShownModallyEventHandler);

		const rootModalView = <View>_rootModalViews[0];
		_test_root_css_class(rootModalView, true, shouldSetClassName);
		args.closeCallback();
	};

	const hostNavigatedToEventHandler = function (args) {
		const page = <Page>args.object;
		page.off(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const modalPage = new Page();
		modalPage.on(View.shownModallyEvent, modalPageShownModallyEventHandler);
		const button = <Button>page.content;
		const options: ShowModalOptions = {
			context: {},
			closeCallback: modalCloseCallback,
			fullscreen: false,
			animated: false,
		};
		button.showModal(modalPage, options);
	};

	const hostPageFactory = function (): Page {
		const hostPage = new Page();
		hostPage.on(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const button = new Button();
		hostPage.content = button;

		return hostPage;
	};

	helper.navigate(hostPageFactory);
	TKUnit.waitUntilReady(() => modalClosed);
}

export function test_modal_root_view_modal_css_class() {
	_test_modal_root_view_modal_css_class(false);
}

export function test_modal_root_view_class_name_preserve_modal_css_class() {
	_test_modal_root_view_modal_css_class(true);
}

function _test_root_modal_view_platform_css_class(shouldSetClassName: boolean) {
	let modalClosed = false;

	const modalCloseCallback = function () {
		modalClosed = true;
	};

	const modalPageShownModallyEventHandler = function (args: ShownModallyData) {
		const page = <Page>args.object;
		page.off(View.shownModallyEvent, modalPageShownModallyEventHandler);

		const rootModalView = <View>_rootModalViews[0];
		_test_platform_css_class(rootModalView, shouldSetClassName);
		args.closeCallback();
	};

	const hostNavigatedToEventHandler = function (args) {
		const page = <Page>args.object;
		page.off(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const modalPage = new Page();
		modalPage.on(View.shownModallyEvent, modalPageShownModallyEventHandler);
		const button = <Button>page.content;
		const options: ShowModalOptions = {
			context: {},
			closeCallback: modalCloseCallback,
			fullscreen: false,
			animated: false,
		};
		button.showModal(modalPage, options);
	};

	const hostPageFactory = function (): Page {
		const hostPage = new Page();
		hostPage.on(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const button = new Button();
		hostPage.content = button;

		return hostPage;
	};

	helper.navigate(hostPageFactory);
	TKUnit.waitUntilReady(() => modalClosed);
}

export function test_modal_root_view_platform_css_class() {
	_test_root_modal_view_platform_css_class(false);
}

export function test_modal_root_view_class_name_preserve_platform_css_class() {
	_test_root_modal_view_platform_css_class(true);
}

function _test_root_modal_view_device_type_css_class(shouldSetClassName: boolean) {
	let modalClosed = false;

	const modalCloseCallback = function () {
		modalClosed = true;
	};

	const modalPageShownModallyEventHandler = function (args: ShownModallyData) {
		const page = <Page>args.object;
		page.off(View.shownModallyEvent, modalPageShownModallyEventHandler);

		const rootModalView = <View>_rootModalViews[0];
		_test_device_type_css_class(rootModalView, shouldSetClassName);
		args.closeCallback();
	};

	const hostNavigatedToEventHandler = function (args) {
		const page = <Page>args.object;
		page.off(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const modalPage = new Page();
		modalPage.on(View.shownModallyEvent, modalPageShownModallyEventHandler);
		const button = <Button>page.content;
		const options: ShowModalOptions = {
			context: {},
			closeCallback: modalCloseCallback,
			fullscreen: false,
			animated: false,
		};
		button.showModal(modalPage, options);
	};

	const hostPageFactory = function (): Page {
		const hostPage = new Page();
		hostPage.on(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const button = new Button();
		hostPage.content = button;

		return hostPage;
	};

	helper.navigate(hostPageFactory);
	TKUnit.waitUntilReady(() => modalClosed);
}

export function test_modal_root_view_device_type_css_class() {
	_test_root_modal_view_device_type_css_class(false);
}

export function test_modal_root_view_class_name_preserve_device_type_css_class() {
	_test_root_modal_view_device_type_css_class(true);
}

function _test_root_modal_view_orientation_css_class(shouldSetClassName: boolean) {
	let modalClosed = false;

	const modalCloseCallback = function () {
		modalClosed = true;
	};

	const modalPageShownModallyEventHandler = function (args: ShownModallyData) {
		const page = <Page>args.object;
		page.off(View.shownModallyEvent, modalPageShownModallyEventHandler);

		const rootModalView = <View>_rootModalViews[0];
		_test_orientation_css_class(rootModalView, shouldSetClassName);
		args.closeCallback();
	};

	const hostNavigatedToEventHandler = function (args) {
		const page = <Page>args.object;
		page.off(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const modalPage = new Page();
		modalPage.on(View.shownModallyEvent, modalPageShownModallyEventHandler);
		const button = <Button>page.content;
		const options: ShowModalOptions = {
			context: {},
			closeCallback: modalCloseCallback,
			fullscreen: false,
			animated: false,
		};
		button.showModal(modalPage, options);
	};

	const hostPageFactory = function (): Page {
		const hostPage = new Page();
		hostPage.on(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const button = new Button();
		hostPage.content = button;

		return hostPage;
	};

	helper.navigate(hostPageFactory);
	TKUnit.waitUntilReady(() => modalClosed);
}

export function test_modal_root_view_orientation_css_class() {
	_test_root_modal_view_orientation_css_class(false);
}

export function test_modal_root_view_class_name_preserve_orientation_css_class() {
	_test_root_modal_view_orientation_css_class(true);
}

function _test_root_modal_view_system_appearance_css_class(shouldSetClassName: boolean) {
	let modalClosed = false;

	const modalCloseCallback = function () {
		modalClosed = true;
	};

	const modalPageShownModallyEventHandler = function (args: ShownModallyData) {
		const page = <Page>args.object;
		page.off(View.shownModallyEvent, modalPageShownModallyEventHandler);

		const rootModalView = <View>_rootModalViews[0];
		_test_system_appearance_css_class(rootModalView, shouldSetClassName);
		args.closeCallback();
	};

	const hostNavigatedToEventHandler = function (args) {
		const page = <Page>args.object;
		page.off(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const modalPage = new Page();
		modalPage.on(View.shownModallyEvent, modalPageShownModallyEventHandler);
		const button = <Button>page.content;
		const options: ShowModalOptions = {
			context: {},
			closeCallback: modalCloseCallback,
			fullscreen: false,
			animated: false,
		};
		button.showModal(modalPage, options);
	};

	const hostPageFactory = function (): Page {
		const hostPage = new Page();
		hostPage.on(Page.navigatedToEvent, hostNavigatedToEventHandler);

		const button = new Button();
		hostPage.content = button;

		return hostPage;
	};

	helper.navigate(hostPageFactory);
	TKUnit.waitUntilReady(() => modalClosed);
}

export function test_modal_root_view_system_appearance_css_class() {
	_test_root_modal_view_system_appearance_css_class(false);
}

export function test_modal_root_view_class_name_preserve_system_appearance_css_class() {
	_test_root_modal_view_system_appearance_css_class(true);
}
