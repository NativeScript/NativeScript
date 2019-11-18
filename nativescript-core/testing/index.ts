// TODO: Remove this and get it from global to decouple builder for angular
import { Builder } from "../ui/builder/builder";
import { unsetValue, View } from "../ui/core/view/view";
import { Frame, NavigationEntry } from "../ui/frame/frame";
import { Page } from "../ui/page/page";

import * as TKUnit from "./tk-unit";

export let ASYNC = 0.2;
export let MEMORY_ASYNC = 2;

function navigate(pageFactory: () => Page, navigationContext?: any): Page {
    let entry: NavigationEntry = { create: pageFactory, animated: false, context: navigationContext, clearHistory: true };

    return navigateWithEntry(entry);
}

function navigateWithHistory(pageFactory: () => Page, navigationContext?: any): Page {
    let entry: NavigationEntry = { create: pageFactory, animated: false, context: navigationContext, clearHistory: false };

    return navigateWithEntry(entry);
}

export function asdf(moduleName: string, context?: any): Page {
    let entry: NavigationEntry = { moduleName: moduleName, context: context, animated: false, clearHistory: true };

    return navigateWithEntry(entry);
}

function navigateToModule(moduleName: string, context?: any): Page {
    let entry: NavigationEntry = { moduleName: moduleName, context: context, animated: false, clearHistory: true };

    return navigateWithEntry(entry);
}

function getCurrentPage(): Page {
    return Frame.topmost().currentPage;
}

function getClearCurrentPage(): Page {
    let page = Frame.topmost().currentPage;
    page.style.backgroundColor = unsetValue;
    page.style.color = unsetValue;
    page.bindingContext = unsetValue;
    page.className = unsetValue;
    page.id = unsetValue;
    page.css = "";

    return page;
}

function waitUntilNavigatedTo(page: Page, action: Function) {
    let completed = false;
    function navigatedTo(args) {
        args.object.page.off("navigatedTo", navigatedTo);
        completed = true;
    }

    page.on("navigatedTo", navigatedTo);
    action();
    TKUnit.waitUntilReady(() => completed, 5);
}

function waitUntilNavigatedFrom(action: Function, topFrame?: Frame) {
    const currentPage = topFrame ? topFrame.currentPage : Frame.topmost().currentPage;
    let completed = false;
    function navigatedFrom(args) {
        args.object.page.off("navigatedFrom", navigatedFrom);
        completed = true;
    }

    currentPage.on("navigatedFrom", navigatedFrom);
    action();
    TKUnit.waitUntilReady(() => completed);
}

function waitUntilLayoutReady(view: View): void {
    TKUnit.waitUntilReady(() => view.isLayoutValid);
}

function navigateWithEntry(entry: NavigationEntry, topFrame?: Frame): Page {
    const page = Builder.createViewFromEntry(entry) as Page;
    entry.moduleName = null;
    entry.create = function () {
        return page;
    };

    waitUntilNavigatedFrom(() => topFrame ? topFrame.navigate(entry) : Frame.topmost().navigate(entry));
    // navigatedTo;
    // waitUntilNavigatedTo(() => topFrame ? topFrame.navigate(entry) : Frame.topmost().navigate(entry));


    return page;
}
