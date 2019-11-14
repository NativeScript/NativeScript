import { Builder, Label, Frame } from "@nativescript/core/ui";

import { navigateToModule } from "@nativescript/core/testing/ui-helper";
import { assert } from "@nativescript/core/testing/tk-unit";

// function assert(test: any, message?: string) {
// 	if (!test) {
// 		throw new Error(message);
// 	}
// }

const snippet = `
<StackLayout id="stack">
	<Label id="label" text="Label"></Label>
</StackLayout>`

describe("---> describe", function () {
	it("---> snippet", function () {
		const rootView = Builder.parse(snippet);
		const label = <Label>rootView.getViewById("label");

		const actualText = label.text;
		const expectedText = "Labe";

		assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
	});

	it("---> page", function () {
		const rootView = Builder.load("test-page");
		const label = <Label>rootView.getViewById("label");

		const actualText = label.text;
		const expectedText = "Test Page Stack Labe";

		assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
	});

	it("---> module", function () {
		navigateToModule("test-module");
		const label = <Label>Frame.topmost().getViewById("label");

		const actualText = label.text;
		const expectedText = "42 taps lef";

		assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
	});
});
