import { Button } from "tns-core-modules/ui/button";
import { Page } from "tns-core-modules/ui/page";
// import { createViewFromEntry } from "tns-core-modules/ui/builder/builder";
// import { AnimationType, _setAndroidFragmentTransitions, setupExitAndPopEnterAnimation, NoTransition, setupAllAnimation }
//  from "tns-core-modules/ui/frame/fragment.transitions";
// import { setupDefaultAnimations } from "tns-core-modules/ui/frame/fragment.transitions";

export function onLoaded() {
    console.log("---> second loaded");
}

export function onTap(args) {
    console.log("---> second onTap");

    const button: Button = args.object;
    // button.text="awef";
    const page: Page = button.page;
    const frame = page.frame;
    const frameEntry = frame.currentEntry;
    // // const secondPage = loadPage("/data/data/org.nativescript.appTs/files/app/second-page", "/data/data/org.nativescript.appTs/files/app/second-page.xml");

    // const secondPage = createViewFromEntry({ moduleName: "./second-page" });

    // // frame.navigate("second-page");

    // const backstackEntry = { // BackstackEntry
    //     entry: frameEntry, // NavigationEntry
    //     resolvedPage: <Page>secondPage, // Page
    //     navDepth: undefined,
    //     fragmentTag: undefined,
    //     frameId: undefined,
    //     recreated: true
    // }

    // // // TODO: what does this id do?
    // // const frameId = frame.android.frameId;
    // // frame._isBack = false;
    // // backstackEntry.frameId = frameId;

    // // const manager = frame._getFragmentManager()
    // // const currentEntry = frame._currentEntry

    // // const newFragmentTag = `fragment${frameId}[-1]`
    // // const newFragment = frame.createFragment(backstackEntry, newFragmentTag)

    // // const transaction = manager.beginTransaction()
    // // // _setAndroidFragmentTransitions(
    // // //     false,
    // // //     null,
    // // //     this._currentEntry,
    // // //     backstackEntry,
    // // //     transaction,
    // // //     frameId
    // // // )
    // // setupDefaultAnimations(newEntry, new FadeTransition(150, null));
    // // transaction.replace(frame.containerViewId, newFragment, newFragmentTag);
    // // transaction.commitAllowingStateLoss();

    // // transaction.setCustomAnimations(AnimationType.enterFakeResourceId, AnimationType.exitFakeResourceId);

    // // const transition = new NoTransition(0, null);
    // // setupAllAnimation(backstackEntry, transition);
    // // setupExitAndPopEnterAnimation(backstackEntry, transition);

    // console.log("---> backStack", frame.backStack);
}
