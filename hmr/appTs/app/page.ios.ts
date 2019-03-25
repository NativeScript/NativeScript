// import { Button } from "tns-core-modules/ui/button";
// import { loadPage } from "tns-core-modules/ui/builder/builder";
// import { Page } from "tns-core-modules/ui/page";

// export function onTap(args) {
//     console.log("---> first");

//     const button: Button = args.object;
//     const page: Page = button.page;
//     const frame = page.frame;
//     const frameEntry = frame.currentEntry;
//     const secondPage = loadPage("./second-page", "./second-page");

//     const backstackEntry = { // BackstackEntry
//         entry: frameEntry, // NavigationEntry
//         resolvedPage: secondPage, // Page
//         navDepth: undefined,
//         fragmentTag: undefined
//     }

//     // console.log("---> backstackEntry", backstackEntry);

//     // UIViewController
//     let viewController = backstackEntry.resolvedPage.ios;
//     viewController["_entry"] = backstackEntry;
//     viewController["_delegate"] = null;
//     viewController["_transition"] = { name: "non-animated" };

//     const oldControllers = frame.ios.controller.viewControllers;
//     let newViewControllers = NSMutableArray.alloc().initWithArray(oldControllers);

//     const skippedNavController = newViewControllers.lastObject;
//     (<any>skippedNavController).isBackstackSkipped = true;
//     newViewControllers.removeLastObject();
//     newViewControllers.addObject(viewController);

//     frame.ios.controller.setViewControllersAnimated(newViewControllers, false);
// }

// export function onLoaded() {
//     console.log("---> first loaded");
// }
