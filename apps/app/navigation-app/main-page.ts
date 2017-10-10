import { EventData } from 'tns-core-modules/data/observable';
import { Page, NavigatedData } from 'tns-core-modules/ui/page';
import { topmost, NavigationEntry } from 'tns-core-modules/ui/frame';

export function nav() {
    const e: NavigationEntry = {
        moduleName: "navigation-app/main-page"
    }
    topmost().navigate(e)
}
export function navClearTrans() {
    console.log("transition and clear")

    const e: NavigationEntry = {
        transition: {
            name: "slideLeft",
            curve: "linear"
        },
        clearHistory: true,
        moduleName: "navigation-app/main-page"
    }
    topmost().navigate(e)
}


export function navWithTransition() {
    const e: NavigationEntry = {
        transition: {
            name: "slideLeft",
            curve: "linear"
        },
        moduleName: "navigation-app/main-page"
    }
    topmost().navigate(e)
}

export function navWithClear() {
    const e: NavigationEntry = {
        clearHistory: true,
        moduleName: "navigation-app/main-page"
    }
    topmost().navigate(e)
}

let i = 0;
const colors = ["lightgreen", "lightblue", "lightcoral"]

export function navigatedFrom(args: NavigatedData) {
    console.log(`navigatedFrom ${args.object.toString()}  isBack: ${args.isBackNavigation}`)
}

export function navigatedTo(args: NavigatedData) {
    console.log(`navigatedTo ${args.object.toString()}  isBack: ${args.isBackNavigation}`)
}

export function navigatingTo(args: NavigatedData) {
    (<any>args.object).page.backgroundColor = colors[(i++) % 3];
    console.log(`navigatingTo ${args.object.toString()}  isBack: ${args.isBackNavigation}`)
}

export function navigatingFrom(args: NavigatedData) {
    console.log(`navigatingFrom ${args.object.toString()}  isBack: ${args.isBackNavigation}`)
}