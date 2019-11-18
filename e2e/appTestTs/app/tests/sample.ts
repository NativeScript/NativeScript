// import { Builder, Label, Frame } from "@nativescript/core/ui";

// import { navigateToModule, asdf, render } from "@nativescript/core/testing/ui-helper";
// import { assert } from "@nativescript/core/testing/tk-unit";

// // function assert(test: any, message?: string) {
// // 	if (!test) {
// // 		throw new Error(message);
// // 	}
// // }

// const snippet = `
// <StackLayout id="stack">
// 	<Label id="label" text="Label"></Label>
// </StackLayout>`

// // describe("---> describe", function () {
// // it("---> snippet", function (done) {
// // 	const rootView = Builder.parse(snippet);
// // 	const label = <Label>rootView.getViewById("label");


// // 	const actualText = label.text;
// // 	const expectedText = "Label";

// // 	assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
// // 	done();
// // });

// // it("---> page", function () {
// // 	const rootView = Builder.load("test-page");
// // 	const label = <Label>rootView.getViewById("label");

// // 	const actualText = label.text;
// // 	const expectedText = "Test Page Stack Label";

// // 	assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
// // });

// // it("---> module", function (done) {
// // 	// render done
// // 	asdf("test-module").then((fixture) => {
// // 		const label = fixture.getViewById("label");
// // 		const actualText = label.text;
// // 		const expectedText = "42 taps ";
// // 		assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
// // 		done();
// // 	});//.finally(done);
// // });

// // 	it('resolves', (done) => {
// // 		const resolvingPromise = new Promise((resolve) => {
// // 			resolve('promiseresolved');
// // 		});
// // 		resolvingPromise.then((result) => {
// // 			expect(result).to.equal('promise resolved');
// // 		}).finally(done);
// // 	});
// // });

// const resolvingPromise = new Promise((resolve) =>
// 	resolve('promise resolved')
// );

// const rejectingPromise = new Promise((resolve, reject) =>
// 	reject(new Error('promise rejected'))
// );


// describe('async await', () => {

// 	// Output:
// 	it('asdf ', () => {
// 		// const result = await asdf("test-module");
// 		const page = navigateToModule("test-module");
// 		const label = page.getViewById("label");
// 		const actualText = label.text;
// 		const expectedText = "42 taps left";
// 		assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
// 		// expect(result).to.equal('promise resolved');
// 	});

// 	// Output: ✓ assertion success
// 	it('assertion success', async () => {
// 		const result = await resolvingPromise;
// 		expect(result).to.equal('promise resolved');
// 	});

// 	// // Output: AssertionError: expected 'promise resolved' to equal 'i fail'
// 	// it('failing assertion', async () => {
// 	// 	const result = await resolvingPromise;
// 	// 	expect(result).to.equal('i fail');
// 	// });

// 	// // Output: Error: promise rejected
// 	// it('promise rejects', async () => {
// 	// 	const result = await rejectingPromise;
// 	// 	expect(result).to.equal('promise resolved');
// 	// });

// });
