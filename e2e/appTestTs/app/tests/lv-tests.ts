// // import { RadListView, ListViewEventData, ListViewLinearLayout, ListViewScrollDirection } from "nativescript-ui-listview";
// import { topmost } from "tns-core-modules/ui/frame";
// import { Page } from "tns-core-modules/ui/page";
// import { Label } from "tns-core-modules/ui/label";
// import { isAndroid, isIOS } from "tns-core-modules/platform";
// import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
// import * as TKUnit from "../home/tk-unit";
// import { ListView } from "tns-core-modules/ui/list-view/list-view";

// interface Item {
//     text: string;
//     age: number;
//     loadedCount: number;
//     unloadedCount: number;
//     onViewLoaded: (args) => void;
//     onViewUnloaded: (args) => void;
// }

// function generateCollection(count: number): ObservableArray<string> {
//     let obsArray = new ObservableArray<any>();
//     for (let i = 0; i < count; i++) {
//         obsArray.push(" Item " + i);
//     }
//     return obsArray;
// }

// function generateItemsForMultipleTemplatesTests(count: number): ObservableArray<Item> {
//     let items = new ObservableArray<Item>();
//     for (let i = 0; i < count; i++) {
//         items.push({
//             text: "Item " + i,
//             age: i,
//             loadedCount: 0,
//             unloadedCount: 0,
//             onViewLoaded: function onViewLoaded(args) {
//                 this.loadedCount++;
//             },
//             onViewUnloaded: function onViewUnloaded(args) {
//                 this.unloadedCount++;
//             }
//         });
//     }
//     return items;
// }

// function navigate(listView) {
//     topmost().navigate({
//         create: () => {
//             const page = new Page();
//             page.content = listView;
//             return page;
//         },
//         clearHistory: true
//     });
// }

// describe("example tests", () => {
//     let listView = null;

//     beforeEach(() => {
//         listView = new ListView();
//     });

//     afterEach(() => {
//         // if (listView) {
//         //     listView.removeAllListeners();
//         // }
//     });

//     it("test_default_TNS_values", () => {
//         assert.isUndefined(listView.items);
//     });

//     it("test_set_items_to_array_loads_all_items", (done) => {
//         const colors = ["red", "green", "blue"];
//         const indexes = {};
//         let counter = 0;
//         listView.items = colors;
//         listView.on(ListView.itemLoadingEvent, function (args) {
//             console.log("aaa");
//             counter++;
//             console.log("bbb");
//             console.log(counter);
//             console.log(listView.items.length);
//             if (counter === listView.items.length) {
//                 console.log("sdf");

//             }
//         });

//         console.log("---> counter", counter);
//         console.log("---");
//         navigate(listView);
//         console.log("+++");
//         console.log("---> counter", listView.items.length);
//         done();
//     });

//     // it("test_set_items_to_obs_array_loads_items_horizontally", (done) => {
//     //     const linearLayout = new ListViewLinearLayout();
//     //     linearLayout.scrollDirection = ListViewScrollDirection.Vertical;
//     //     listView.listViewLayout = linearLayout;

//     //     // let isScrolled = false;
//     //     const loadedIndexes = [];
//     //     const items = generateCollection(50);
//     //     listView.items = items;

//     //     listView.on(ListView.itemLoadingEvent, function (args: ListViewEventData) {
//     //         loadedIndexes[args.index] = true;

//     //         if (args.index === 48) {
//     //             done();
//     //         }
//     //     });

//     //     navigate(listView);

//     //     TKUnit.waitUntilReady(() => loadedIndexes[5] === true);
//     //     listView.scrollToIndex(49);
//     //     TKUnit.waitUntilReady(() => loadedIndexes[48] === true);
//     // });

//     // it("test_set_items_to_obs_array_scroll_horizontally", () => {
//     //     const linearLayout = new ListViewLinearLayout();
//     //     listView.listViewLayout = linearLayout;
//     //     linearLayout.scrollDirection = ListViewScrollDirection.Vertical;

//     //     const loadedIndexes = [];
//     //     listView.on(RadListView.itemLoadingEvent, function (args: ListViewEventData) {
//     //         loadedIndexes[args.index] = true;
//     //     });

//     //     const items = generateCollection(50);
//     //     listView.items = items;

//     //     navigate(listView);

//     //     TKUnit.waitUntilReady(() => loadedIndexes[5] === true);
//     //     listView.scrollToIndex(35);
//     //     TKUnit.waitUntilReady(() => loadedIndexes[35] === true);

//     //     // assert the next item is not loaded
//     //     assert.isFalse(!!loadedIndexes[36]);
//     // });

//     // it("test_getScrollOffset_respects_safe_areas", () => {
//     //     const loadedIndexes = [];
//     //     listView.on(RadListView.itemLoadingEvent, function (args: ListViewEventData) {
//     //         loadedIndexes[args.index] = true;
//     //     });

//     //     const items = generateCollection(10);
//     //     listView.items = items;

//     //     navigate(listView);

//     //     TKUnit.waitUntilReady(() => loadedIndexes[5] === true);
//     //     assert.isTrue(listView.getScrollOffset() === 0);
//     // });

//     // it("test_set_items_to_huge_obs_array", () => {
//     //     listView.itemTemplate = `
//     //         <StackLayout>
//     //         <Label text='{{ text }}' />
//     //         <Label text='{{ age }}' />
//     //         </StackLayout>
//     //     `;

//     //     const start = TKUnit.time();

//     //     const items = generateItemsForMultipleTemplatesTests(10000);
//     //     listView.items = items;

//     //     const loadedIndexes = [];
//     //     listView.on(RadListView.itemLoadingEvent, function (args: ListViewEventData) {
//     //         loadedIndexes[args.index] = true;
//     //     });

//     //     TKUnit.waitUntilReady(() => loadedIndexes[10] === true);
//     //     assert.isTrue(loadedIndexes[10]);

//     //     const end = TKUnit.time() - start;
//     //     console.log("================= END ============= ", end);
//     // });
// });
