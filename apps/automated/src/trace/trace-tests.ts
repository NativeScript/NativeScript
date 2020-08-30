// >> trace-require
import { Trace } from '@nativescript/core';
// << trace-require

export var test_DummyTestForSnippetOnly0 = function () {
	// >> trace-all-categories
	Trace.setCategories(Trace.categories.All);
	Trace.enable();
	// << trace-all-categories
};

export var test_DummyTestForSnippetOnly1 = function () {
	// >> trace-specific-categories
	Trace.setCategories(Trace.categories.All.split(',').concat(Trace.categories.Binding, Trace.categories.Debug, Trace.categories.Layout, Trace.categories.NativeLifecycle, Trace.categories.Navigation, Trace.categories.Style, Trace.categories.ViewHierarchy, Trace.categories.VisualTreeEvents).join(','));
	Trace.enable();
	// << trace-specific-categories
};

export var test_DummyTestForSnippetOnly2 = function () {
	// >> trace-message
	Trace.setCategories(Trace.categories.Debug);
	Trace.enable();
	if (Trace.isEnabled()) {
		Trace.write('My Debug Message', Trace.categories.Debug);
	}
	// << trace-message
};
