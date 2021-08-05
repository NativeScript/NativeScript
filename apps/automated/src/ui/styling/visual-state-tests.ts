import * as TKUnit from '../../tk-unit';
import * as view from '@nativescript/core/ui/core/view';
import * as page from '@nativescript/core/ui/page';
import * as types from '@nativescript/core/utils/types';
import * as helper from '../../ui-helper';

function assertInState(view: view.View, state: string, knownStates: string[]): void {
	let pseudo = view.cssPseudoClasses;
	if (state) {
		TKUnit.assert(pseudo.has(state), 'Expected view ' + view + ' to have pseudo class ' + state);
	}
	knownStates
		.filter((s) => s !== state)
		.forEach((s) => {
			TKUnit.assert(!pseudo.has(s), 'Expected view ' + view + ' not to have pseudo class ' + s + (state ? ' expected just ' + state + '.' : ''));
		});
}

export var test_goToVisualState = function () {
	var test = function (views: Array<view.View>) {
		(<page.Page>views[0]).css = 'button:hovered { color: red; background-color: orange } button:pressed { color: white; background-color: black }';

		var btn = views[1];

		assertInState(btn, null, ['hovered', 'pressed']);

		btn._goToVisualState('hovered');

		assertInState(btn, 'hovered', ['hovered', 'pressed']);

		TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === 'red');
		TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === 'orange');

		btn._goToVisualState('pressed');

		assertInState(btn, 'pressed', ['hovered', 'pressed']);

		TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === 'white');
		TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === 'black');
	};

	helper.do_PageTest_WithButton(test);
};

export var test_goToVisualState_NoState_ShouldResetStyledProperties = function () {
	var test = function (views: Array<view.View>) {
		(<page.Page>views[0]).css = 'button:hovered { color: red; background-color: orange }';

		var btn = views[1];
		assertInState(btn, null, ['hovered', 'pressed']);

		btn._goToVisualState('hovered');

		assertInState(btn, 'hovered', ['hovered', 'pressed']);
		TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === 'red');
		TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === 'orange');

		btn._goToVisualState('pressed');

		// since there are no modifiers for the "Pressed" state, the "Normal" state is returned.
		assertInState(btn, 'pressed', ['hovered', 'pressed']);

		// properties are reset (set to undefined)
		TKUnit.assert(types.isUndefined(btn.style.color));
		TKUnit.assert(types.isUndefined(btn.style.backgroundColor));
	};

	helper.do_PageTest_WithButton(test);
};

export var test_goToVisualState_NoState_ShouldGoToNormal = function () {
	var test = function (views: Array<view.View>) {
		(<page.Page>views[0]).css = 'button { color: orange; background-color: black } button:hovered { color: red; background-color: orange }';

		var btn = views[1];

		assertInState(btn, null, ['hovered', 'pressed']);

		btn._goToVisualState('hovered');

		assertInState(btn, 'hovered', ['hovered', 'pressed']);
		TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === 'red');
		TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === 'orange');

		btn._goToVisualState('pressed');

		// since there are no modifiers for the "Pressed" state, the "Normal" state is returned.
		assertInState(btn, 'pressed', ['hovered', 'pressed']);

		// the actual state is "normal" and properties are reverted to these settings (if any)
		TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === 'orange');
		TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === 'black');
	};

	helper.do_PageTest_WithButton(test);
};
