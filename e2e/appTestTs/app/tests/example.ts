import { Builder, Label, Frame } from "@nativescript/core/ui";

import { navigateToModule, asdf, render } from "@nativescript/core/testing/ui-helper";
import { assert } from "@nativescript/core/testing/tk-unit";

const snippet = `
<StackLayout id="stack">
	<Label id="label" text="Label"></Label>
</StackLayout>`

describe("---> describe", function () {
	// it("---> snippet", function (done) {
	// 	const rootView = Builder.parse(snippet);
	// 	const label = <Label>rootView.getViewById("label");

	// 	const actualText = label.text;
	// 	const expectedText = "Label";

	// 	assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
	// 	done();
	// });

	// it("---> page", function () {
	// 	const rootView = Builder.load("test-page");
	// 	const label = <Label>rootView.getViewById("label");

	// 	const actualText = label.text;
	// 	const expectedText = "Test Page Stack Label";

	// 	assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
	// });

	it("---> navigate to module", () => {
		const page = navigateToModule("test-module");
		const label = page.getViewById("label");
		const actualText = label.text;
		const expectedText = "42 taps left";
		assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
	});
});
