import { Trace, Page } from '@nativescript/core';

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
	setTimeout(async () => {
		try {
			const tests = await import('./test-runner');
			tests.runAll('');
		} catch (e) {
			console.error('[automated] failed to load test-runner', e);
		}
	}, 10);
}

export function onNavigatedTo(args) {
	console.log('onNavigatedTo');
	args.object.off(Page.loadedEvent, onNavigatedTo);
	if (executeTests) {
		executeTests = false;
		runTests();
	}
}
