import * as helper from '../ui-helper';
import { Color, Device, CoreTypes, Trace, SharedTransition, NavigationEntry, NavigationTransition, Page, platformNames, GridLayout } from '@nativescript/core';
import { CustomTransition, CustomSharedElementPageTransition } from './custom-transition';

function _testTransition(navigationTransition: NavigationTransition) {
	var testId = `Transition[${JSON.stringify(navigationTransition)}]`;
	if (Trace.isEnabled()) {
		Trace.write(`Testing ${testId}`, Trace.categories.Test);
	}
	var navigationEntry: NavigationEntry = {
		create: function (): Page {
			let page = new Page();
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

	var transitions;
	if (Device.os === platformNames.ios) {
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

export function test_SharedElementTransitions() {
	helper.navigate(() => {
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

	var testId = `SharedElementTransition[${JSON.stringify(navigationTransition)}]`;
	// if (Trace.isEnabled()) {
	// Trace.write(`Testing ${testId}`, Trace.categories.Test);
	console.log(`Testing ${testId}`);
	// }
	var navigationEntry: NavigationEntry = {
		create: function (): Page {
			let page = new Page();
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
			return page;
		},
		animated: true,
		transition: navigationTransition,
	};

	helper.navigateWithEntry(navigationEntry);
}
