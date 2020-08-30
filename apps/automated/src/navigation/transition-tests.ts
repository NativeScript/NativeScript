import * as helper from '../ui-helper';
import * as platform from '@nativescript/core/platform';
import { Trace } from '@nativescript/core';
import { Color } from '@nativescript/core/color';
import { NavigationEntry, NavigationTransition } from '@nativescript/core/ui/frame';
import { Page } from '@nativescript/core/ui/page';
import { AnimationCurve } from '@nativescript/core/ui/enums';
import { CustomTransition } from './custom-transition';

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
	if (platform.Device.os === platform.platformNames.ios) {
		transitions = ['curl'];
	} else {
		const _sdkVersion = parseInt(platform.Device.sdkVersion);
		transitions = _sdkVersion >= 21 ? ['explode'] : [];
	}

	transitions = transitions.concat(['fade', 'slide']);

	// Custom transition
	_testTransition({ instance: new CustomTransition(), duration: 10 });

	// Built-in transitions
	transitions.forEach((name) => {
		_testTransition({ name, duration: 20, curve: AnimationCurve.easeIn });
	});

	// helper.navigateWithEntry({ create: mainPageFactory, clearHistory: true, animated: false });
}
