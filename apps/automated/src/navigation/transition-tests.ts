import * as helper from '../ui-helper';
import * as TKUnit from '../tk-unit';
import { Color, Device, CoreTypes, Trace, SharedTransition, NavigationEntry, NavigationTransition, Page, platformNames, GridLayout, Frame, Utils } from '@nativescript/core';
import { CustomTransition, CustomSharedElementPageTransition } from './custom-transition';

function _testTransition(navigationTransition: NavigationTransition) {
	const testId = `Transition[${JSON.stringify(navigationTransition)}]`;
	if (Trace.isEnabled()) {
		Trace.write(`Testing ${testId}`, Trace.categories.Test);
	}
	const navigationEntry: NavigationEntry = {
		create: function (): Page {
			const page = new Page();
			page.id = testId;
			page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));

			return page;
		},
		animated: true,
		transition: navigationTransition,
	};

	helper.navigateWithEntry(navigationEntry);
}

export function test_Transitions() {
	helper.navigate(() => {
		const page = new Page();
		page.id = 'TransitionsTestPage_MAIN';
		page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));

		return page;
	});

	let transitions;
	if (__APPLE__) {
		transitions = ['curl'];
	} else {
		const _sdkVersion = parseInt(Device.sdkVersion);
		transitions = _sdkVersion >= 21 ? ['explode'] : [];
	}

	transitions = transitions.concat(['fade', 'slide']);

	// Custom transition
	_testTransition({ instance: new CustomTransition(), duration: 10 });

	// Built-in transitions
	transitions.forEach((name) => {
		_testTransition({ name, duration: 20, curve: CoreTypes.AnimationCurve.easeIn });
	});

	// helper.navigateWithEntry({ create: mainPageFactory, clearHistory: true, animated: false });
}

function collectJsAndJavaGarbage() {
	for (let i = 0; i < 3; i++) {
		Utils.GC();
		java.lang.System.gc();
		java.lang.System.runFinalization();
		TKUnit.wait(0.05);
	}
}

export function test_Transitions_SurviveGarbageCollectionBeforeGoingBack() {
	if (!__ANDROID__) {
		return;
	}

	helper.navigate(() => {
		const page = new Page();
		page.id = 'TransitionsGcTestPage_MAIN';

		return page;
	});

	helper.navigateWithEntry({
		create: () => {
			const page = new Page();
			page.id = 'TransitionsGcTestPage_SECOND';

			return page;
		},
		animated: true,
		transition: { name: 'slide', duration: 20 },
	});

	// The back navigation reuses the transitions the forward one created.
	collectJsAndJavaGarbage();
	helper.goBack();

	TKUnit.assertEqual(Frame.topmost().currentPage.id, 'TransitionsGcTestPage_MAIN', 'goBack should land on the first page');
}

export function test_SharedElementTransitions(done) {
	const mainPage = helper.navigate(() => {
		const page = new Page();
		page.id = 'SharedelementTransitionsTestPage_MAIN';
		page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
		const grid = new GridLayout();

		const sharedElement = new GridLayout();
		sharedElement.width = { unit: 'dip', value: 200 };
		sharedElement.height = { unit: 'dip', value: 200 };
		sharedElement.marginTop = 20;
		sharedElement.borderRadius = 20;
		sharedElement.verticalAlignment = 'top';
		sharedElement.iosOverflowSafeArea = false;
		sharedElement.backgroundColor = new Color('yellow');
		sharedElement.sharedTransitionTag = 'testing';
		grid.addChild(sharedElement);

		page.content = grid;
		return page;
	});

	const navigationTransition = SharedTransition.custom(new CustomSharedElementPageTransition());

	const testId = `SharedElementTransition[${JSON.stringify(navigationTransition)}]`;
	if (Trace.isEnabled()) {
		Trace.write(`Testing ${testId}`, Trace.categories.Test);
	}
	const navigationEntry: NavigationEntry = {
		create(): Page {
			const page = new Page();
			page.id = testId;
			page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
			const grid = new GridLayout();

			const sharedElement = new GridLayout();
			sharedElement.width = { unit: 'dip', value: 60 };
			sharedElement.height = { unit: 'dip', value: 60 };
			sharedElement.marginTop = 20;
			sharedElement.borderRadius = 30;
			sharedElement.verticalAlignment = 'top';
			sharedElement.iosOverflowSafeArea = false;
			sharedElement.backgroundColor = new Color('purple');
			sharedElement.sharedTransitionTag = 'testing';
			grid.addChild(sharedElement);

			page.content = grid;

			page.once('navigatedTo', () => {
				done();
			});

			return page;
		},
		animated: true,
		transition: navigationTransition,
	};

	mainPage.frame.navigate(navigationEntry);
}
