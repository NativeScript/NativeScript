// import { renderFixture } from "@nativescript/core/testing";
// import { assert } from "chai";
// import { Page } from "@nativescript/core/ui/page/page";
// import { ListView } from "@nativescript/core/ui/list-view/list-view";
// import { waitUntilLayoutReady } from "../home/home-page";
// import { waitUntilReady } from "../home/tk-unit";

// // const snippet = `
// // <StackLayout id="stack">
// // 	<Label id="label" text="Label"></Label>
// // </StackLayout>`

// describe("---> describe", function () {
//     // 	// it("---> snippet", function () {
//     // 	// 	const rootView = renderFixture(false, snippet);
//     // 	// 	const label = <Label>rootView.getViewById("label");

//     // 	// 	const actualText = label.text;
//     // 	// 	const expectedText = "Labe";

//     // 	// 	assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
//     // 	// });

//     // 	// it("---> page", function () {
//     // 	// 	const rootView = renderFixture(true, "test-page");
//     // 	// 	const label = <Label>rootView.getViewById("label");

//     // 	// 	const actualText = label.text;
//     // 	// 	const expectedText = "Test Page";

//     // 	// 	assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
//     // 	// });

//     it("---> navigate to module", async () => {
//         // const page = <Page>renderFixture(true, "home/home-page");
//         // listView.on(ListView.itemLoadingEvent, function (args) {
//         //     console.log("aaa");
//         //     counter++;
//         //     console.log("bbb");
//         //     console.log(counter);
//         //     console.log(listView.items.length);
//         //     if (counter === listView.items.length) {
//         //         console.log("sdf");
//         //         // waitUntilLayoutReady(listView.items[0]);
//         //         // waitUntilReady(() => );
//         //         console.log("yey");
//         //         done();
//         //     }
//         // });
//         // console.log("--->", listView);
//         // const listView = <ListView>page.getViewById("list-view");
//         // waitUntilReady(() => listView.isLayoutValid);
//         // waitUntilReady(() => page.isLayoutValid);

//         // const p = new Promise(function (resolve, reject) {

//         // });

//         async function asdf() {
//             // `delay` returns a promise
//             return new Promise(function (resolve, reject) {
//                 // Only `delay` is able to resolve or reject the promise
//                 // setTimeout(function () {
//                 //     resolve(42); // After 3 seconds, resolve the promise with value 42
//                 console.log("---> pro");
//                 const page = <Page>renderFixture(true, "home/home-page");
//                 const listView = <ListView>page.getViewById("list-view");
//                 waitUntilReady(() => listView.isLayoutValid);
//                 console.log("---> middle");
//                 waitUntilReady(() => page.isLayoutValid);
//                 console.log("---> end");
//                 resolve(page);
//                 // }, 0);
//             });
//         }

//         function good(page) {
//             console.log("---> page", page);
//             // cb();
//             // done();
//         }

//         function bad(e) {
//             console.error(e);
//             // cb();done
//             // done();

//         }

//         const awef = await asdf();
//         good(awef);
//             // .then(
//             //     good,
//             //     bad
//             // // ).then(
//             // //     done()
//             // );
//         // done();

//         // console.log("--->", listView.items.length);
//         // const items = listView.items;
//         // console.log("--->", items.size);

//         // const actualText = label.text;
//         // const size = label.size;
//         // const height = label.height;
//         // const width = label.width;
//         // const position = label.position;
//         // const style = label.style.backgroundColor;
//         // const color = label.style.color;

//         // const nativeView = label.nativeView;
//         // const x = label.nativeView.originX;

//         // const asdf = label.getLocationInWindow();

//         // const expectedText = "42 taps";
//         // // assert(actualText === expectedText, `Actual: ${actualText}, Expected: ${expectedText}`);
//         // console.log("---> sssize", size);
//         // console.log("---> height", height);
//         // console.log("---> width", width);
//         // console.log("---> position", position);
//         // console.log("---> style", style);
//         // console.log("---> color", color);
//         // console.log("---> nativeView", nativeView);
//         // console.log("---> x", x);
//         // console.log("---> asdf", asdf);
//     });

//     // 	// it("this is a test", () => {
//     // 	// 	// .when()
//     // 	// 	// .waitUntilReady()
//     // 	// 	// .waitUntilLayoutIsValid()
//     // 	// 	setup("test-module").then(fixture => {
//     // 	// 		const rootView = fixture.root;
//     // 	// 		const label = rootView.getViewById("label");
//     // 	// 		const labelText = label.text;
//     // 	// 		const labelHeight = label.labelHeight;
//     // 	// 		// label size
//     // 	// 		// label position
//     // 	// 		// label.style. ...
//     // 	// 		// label.nativeView
//     // 	// 		// label vizualise

//     // 	// 		// assert

//     // 	// 		// list view async loading
//     // 	// 		// list view async loading

//     // 	// 		// tab view
//     // 	// 		// tab view
//     // 	// 	});
//     // 	// });

// });

