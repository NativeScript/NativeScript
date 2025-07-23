import { Trace, Page } from '@nativescript/core';

import * as tests from './test-runner';

let executeTests = true;

Trace.enable();
Trace.addCategories(Trace.categories.Test + ',' + Trace.categories.Error);

// When debugging
// Trace.setCategories(Trace.categories.concat(
//    Trace.categories.Test,
//    Trace.categories.Navigation,
//    Trace.categories.Transition,
//    Trace.categories.NativeLifecycle,
//    Trace.categories.ViewHierarchy,
//    Trace.categories.VisualTreeEvents
// ));

function runTests() {
	setTimeout(() => tests.runAll(''), 10);
}

export function onNavigatedTo(args) {
	args.object.off(Page.loadedEvent, onNavigatedTo);
	if (executeTests) {
		executeTests = false;
		runTests();
	}
}
