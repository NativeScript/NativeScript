// Definitions.
import {
    AndroidFrame as AndroidFrameDefinition, BackstackEntry, NavigationEntry,
    NavigationTransition, AndroidFragmentCallbacks, AndroidActivityCallbacks
} from ".";
import { Page } from "../page";

// Types.
import * as application from "../../application";
import {
    FrameBase, NavigationContext, stack, goBack, View, Observable, topmost,
    traceEnabled, traceWrite, traceCategories
} from "./frame-common";

import {
    _setAndroidFragmentTransitions, _onFragmentCreateAnimator, _getAnimatedEntries,
    _updateTransitions, _reverseTransitions, _clearEntry, _clearFragment, AnimationType
} from "./fragment.transitions";

import { profile } from "../../profiling";

// TODO: Remove this and get it from global to decouple builder for angular
import { createViewFromEntry } from "../builder";

export * from "./frame-common";

const INTENT_EXTRA = "com.tns.activity";
const FRAMEID = "_frameId";
const CALLBACKS = "_callbacks";

const ownerSymbol = Symbol("_owner");

let navDepth = -1;
let fragmentId = -1;
export let moduleLoaded: boolean;

if (global && global.__inspector) {
    const devtools = require("tns-core-modules/debugger/devtools-elements");
    devtools.attachDOMInspectorEventCallbacks(global.__inspector);
    devtools.attachDOMInspectorCommandCallbacks(global.__inspector);
}

export let attachStateChangeListener: android.view.View.OnAttachStateChangeListener;

function getAttachListener(): android.view.View.OnAttachStateChangeListener {
    if (!attachStateChangeListener) {
        @Interfaces([android.view.View.OnAttachStateChangeListener])
        class AttachListener extends java.lang.Object implements android.view.View.OnAttachStateChangeListener {
            constructor() {
                super();
                return global.__native(this);
            }

            onViewAttachedToWindow(view: android.view.View): void {
                const owner: View = view[ownerSymbol];
                if (owner) {
                    owner._onAttachedToWindow();
                }
            }

            onViewDetachedFromWindow(view: android.view.View): void {
                const owner: View = view[ownerSymbol];
                if (owner) {
                    owner._onDetachedFromWindow();
                }
            }
        }

        attachStateChangeListener = new AttachListener();
    }

    return attachStateChangeListener;
}

export function reloadPage(): void {
    const app = application.android;
    const rootView: View = (<any>app).rootView;
    if (!rootView || !rootView._onLivesync()) {
        // Delete previously cached root view in order to recreate it.
        resetActivityContent(application.android.foregroundActivity);
    }
}

// attach on global, so it can be overwritten in NativeScript Angular
(<any>global).__onLiveSyncCore = reloadPage;

export class Frame extends FrameBase {
    private _android: AndroidFrame;
    private _delayedNavigationEntry: BackstackEntry;
    private _containerViewId: number = -1;
    private _tearDownPending = false;
    private _attachedToWindow = false;
    public _isBack: boolean = true;

    constructor() {
        super();
        this._android = new AndroidFrame(this);
    }

    public static get defaultAnimatedNavigation(): boolean {
        return FrameBase.defaultAnimatedNavigation;
    }
    public static set defaultAnimatedNavigation(value: boolean) {
        FrameBase.defaultAnimatedNavigation = value;
    }

    public static get defaultTransition(): NavigationTransition {
        return FrameBase.defaultTransition;
    }
    public static set defaultTransition(value: NavigationTransition) {
        FrameBase.defaultTransition = value;
    }

    get containerViewId(): number {
        return this._containerViewId;
    }

    get android(): AndroidFrame {
        return this._android;
    }

    _onAttachedToWindow(): void {
        super._onAttachedToWindow();
        this._attachedToWindow = true;
        this._processNextNavigationEntry();
    }

    _onDetachedFromWindow(): void {
        super._onDetachedFromWindow();
        this._attachedToWindow = false;
    }

    protected _processNextNavigationEntry(): void {
        // In case activity was destroyed because of back button pressed (e.g. app exit)
        // and application is restored from recent apps, current fragment isn't recreated.
        // In this case call _navigateCore in order to recreate the current fragment.
        // Don't call navigate because it will fire navigation events. 
        // As JS instances are alive it is already done for the current page.
        if (!this.isLoaded || !this._attachedToWindow) {
            return;
        }

        const animatedEntries = _getAnimatedEntries(this._android.frameId);
        if (animatedEntries) {
            // // recreate UI on the animated fragments because we have new context.
            // // We need to recreate the UI because it Frame will do it only for currentPage.
            // // Once currentPage is changed due to transition end we will have no UI on the
            // // new Page.
            // animatedEntries.forEach(entry =>  {
            //     const page = entry.resolvedPage;
            //     if (page._context !== this._context) {
            //         page._tearDownUI(true);
            //         page._setupUI(this._context);
            //     }
            // });

            // Wait until animations are completed.
            if (animatedEntries.size > 0) {
                return;
            }
        }

        const manager = this._getFragmentManager();
        const entry = this._currentEntry;
        if (entry && manager && !manager.findFragmentByTag(entry.fragmentTag)) {
            // Simulate first navigation (e.g. no animations or transitions)
            this._currentEntry = null;
            // NavigateCore will eventually call _processNextNavigationEntry again.
            this._navigateCore(entry);
            this._currentEntry = entry;
        } else {
            super._processNextNavigationEntry();
        }
    }

    private createFragment(backstackEntry: BackstackEntry, fragmentTag: string): android.app.Fragment {
        ensureFragmentClass();
        const newFragment = new fragmentClass();
        const args = new android.os.Bundle();
        args.putInt(FRAMEID, this._android.frameId);
        newFragment.setArguments(args);
        setFragmentCallbacks(newFragment);

        const callbacks = newFragment[CALLBACKS];
        callbacks.frame = this;
        callbacks.entry = backstackEntry;

        // backstackEntry
        backstackEntry.fragment = newFragment;
        backstackEntry.fragmentTag = fragmentTag;
        backstackEntry.navDepth = navDepth;

        return newFragment;
    }

    public setCurrent(entry: BackstackEntry, isBack: boolean): void {
        const current = this._currentEntry;
        const currentEntryChanged = current !== entry;
        if (currentEntryChanged) {
            this._updateBackstack(entry, isBack);
        }

        if (currentEntryChanged) {
            // If activity was destroyed we need to destroy fragment and UI
            // of current and new entries.
            if (this._tearDownPending) {
                this._tearDownPending = false;
                if (!entry.recreated) {
                    clearEntry(entry);
                }

                if (current && !current.recreated) {
                    clearEntry(current);
                }

                // If we have context activity was recreated. Create new fragment
                // and UI for the new current page.
                const context = this._context;
                if (context && !entry.recreated) {
                    entry.fragment = this.createFragment(entry, entry.fragmentTag);
                    entry.resolvedPage._setupUI(context);
                }

                entry.recreated = false;
                current.recreated = false;
            }

            super.setCurrent(entry, isBack);

            // If we had real navigation process queue.
            this._processNavigationQueue(entry.resolvedPage);
        } else {
            // Otherwise currentPage was recreated so this wasn't real navigation.
            // Continue with next item in the queue.
            this._processNextNavigationEntry();
        }
    }

    public _onBackPressed(): boolean {
        if (this.canGoBack()) {
            this.goBack();
            return true;
        } else if (!this.navigationQueueIsEmpty()) {
            const manager = this._getFragmentManager();
            if (manager) {
                manager.executePendingTransactions();
                return true;
            }
        }

        return false;
    }

    @profile
    public _navigateCore(newEntry: BackstackEntry) {
        super._navigateCore(newEntry);
        this._isBack = false;

        // set frameId here so that we could use it in fragment.transitions
        newEntry.frameId = this._android.frameId;

        const activity = this._android.activity;
        if (!activity) {
            // Activity not associated. In this case we have two execution paths:
            // 1. This is the main frame for the application
            // 2. This is an inner frame which requires a new Activity
            const currentActivity = this._android.currentActivity;
            if (currentActivity) {
                startActivity(currentActivity, this._android.frameId);
            }

            this._delayedNavigationEntry = newEntry;
            return;
        }

        const manager: android.app.FragmentManager = this._getFragmentManager();
        const clearHistory = newEntry.entry.clearHistory;
        const currentEntry = this._currentEntry;

        // New Fragment
        if (clearHistory) {
            navDepth = -1;
        }

        navDepth++;
        fragmentId++;
        const newFragmentTag = `fragment${fragmentId}[${navDepth}]`;
        const newFragment = this.createFragment(newEntry, newFragmentTag);
        const transaction = manager.beginTransaction();
        const animated = this._getIsAnimatedNavigation(newEntry.entry);
        // NOTE: Don't use transition for the initial nagivation (same as on iOS)
        // On API 21+ transition won't be triggered unless there was at least one
        // layout pass so we will wait forever for transitionCompleted handler...
        // https://github.com/NativeScript/NativeScript/issues/4895
        const navigationTransition = this._currentEntry ? this._getNavigationTransition(newEntry.entry) : null;

        _setAndroidFragmentTransitions(animated, navigationTransition, currentEntry, newEntry, transaction, manager, this._android.frameId);
        // if (clearHistory) {
        //     deleteEntries(this.backStack);
        // }

        if (currentEntry && animated && !navigationTransition) {
            transaction.setTransition(android.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN);
        }

        transaction.replace(this.containerViewId, newFragment, newFragmentTag);
        transaction.commit();
    }

    public _goBackCore(backstackEntry: BackstackEntry) {
        this._isBack = true;
        super._goBackCore(backstackEntry);
        navDepth = backstackEntry.navDepth;

        const manager: android.app.FragmentManager = this._getFragmentManager();
        const transaction = manager.beginTransaction();

        if (!backstackEntry.fragment) {
            // Happens on newer API levels. On older all fragments
            // are recreated once activity is created.
            // This entry fragment was destroyed by app suspend.
            // We need to recreate its animations and then reverse it.
            backstackEntry.fragment = this.createFragment(backstackEntry, backstackEntry.fragmentTag);
            _updateTransitions(backstackEntry);
        }

        const transitionReversed = _reverseTransitions(backstackEntry, this._currentEntry);
        if (!transitionReversed) {
            // If transition were not reversed then use animations.
            transaction.setCustomAnimations(AnimationType.popEnterFakeResourceId, AnimationType.popExitFakeResourceId, AnimationType.enterFakeResourceId, AnimationType.exitFakeResourceId);
        }

        transaction.replace(this.containerViewId, backstackEntry.fragment, backstackEntry.fragmentTag);
        transaction.commit();
    }

    public _removeEntry(removed: BackstackEntry): void {
        super._removeEntry(removed);

        if (removed.fragment) {
            _clearEntry(removed);
        }

        removed.fragment = null;
        removed.viewSavedState = null;
    }

    public createNativeView() {
        return new org.nativescript.widgets.ContentLayout(this._context);
    }

    public initNativeView(): void {
        super.initNativeView();
        const listener = getAttachListener();
        this.nativeViewProtected.addOnAttachStateChangeListener(listener);
        this.nativeViewProtected[ownerSymbol] = this;
        this._android.rootViewGroup = this.nativeViewProtected;
        if (this._containerViewId < 0) {
            this._containerViewId = android.view.View.generateViewId();
        }
        this._android.rootViewGroup.setId(this._containerViewId);
    }

    public disposeNativeView() {
        const listener = getAttachListener();
        this.nativeViewProtected.removeOnAttachStateChangeListener(listener);
        this.nativeViewProtected[ownerSymbol] = null;
        this._tearDownPending = !!this._executingEntry;
        const current = this._currentEntry;

        this.backStack.forEach(entry => {
            // Don't destroy current and executing entries or UI will look blank.
            // We will do it in setCurrent.
            if (entry !== this._executingEntry) {
                clearEntry(entry);
            }
        });

        if (current && !this._executingEntry) {
            clearEntry(current);
        }

        this._android.rootViewGroup = null;
        super.disposeNativeView();
    }

    public _popFromFrameStack() {
        if (!this._isInFrameStack) {
            return;
        }

        super._popFromFrameStack();
        if (this._android.hasOwnActivity) {
            this._android.activity.finish();
        }
    }

    public _getNavBarVisible(page: Page): boolean {
        if (page.actionBarHidden !== undefined) {
            return !page.actionBarHidden;
        }

        if (this._android && this._android.showActionBar !== undefined) {
            return this._android.showActionBar;
        }

        return true;
    }

    public _saveFragmentsState(): void {
        // We save only fragments in backstack.
        // Current fragment is saved by FragmentManager.
        this.backStack.forEach((entry) => {
            const view: android.view.View = entry.resolvedPage.nativeViewProtected;
            if (!entry.viewSavedState && view) {
                const viewState = new android.util.SparseArray<android.os.Parcelable>();
                view.saveHierarchyState(viewState);
                entry.viewSavedState = viewState;
            }
        });
    }
}

function clearEntry(entry: BackstackEntry): void {
    if (entry.fragment) {
        _clearFragment(entry);
    }

    entry.recreated = false;
    entry.fragment = null;
    const page = entry.resolvedPage;
    if (page._context) {
        entry.resolvedPage._tearDownUI(true);
    }
}

let framesCounter = 0;
let framesCache = new Array<WeakRef<AndroidFrame>>();

class AndroidFrame extends Observable implements AndroidFrameDefinition {
    public rootViewGroup: android.view.ViewGroup;
    public hasOwnActivity = false;
    public frameId;

    private _showActionBar = true;
    private _owner: Frame;
    public cachePagesOnNavigate: boolean = true;

    constructor(owner: Frame) {
        super();
        this._owner = owner;
        this.frameId = framesCounter++;
        framesCache.push(new WeakRef(this));
    }

    public get showActionBar(): boolean {
        return this._showActionBar;
    }

    public set showActionBar(value: boolean) {
        if (this._showActionBar !== value) {
            this._showActionBar = value;
            if (this.owner.currentPage) {
                this.owner.currentPage.actionBar.update();
            }
        }
    }

    public get activity(): android.app.Activity {
        let activity: android.app.Activity = this.owner._context;
        if (activity) {
            return activity;
        }

        // traverse the parent chain for an ancestor Frame
        let currView = this._owner.parent;
        while (currView) {
            if (currView instanceof Frame) {
                return (<Frame>currView).android.activity;
            }

            currView = currView.parent;
        }

        return undefined;
    }

    public get actionBar(): android.app.ActionBar {
        let activity = this.currentActivity;
        if (!activity) {
            return undefined;
        }

        let bar = activity.getActionBar();
        if (!bar) {
            return undefined;
        }

        return bar;
    }

    public get currentActivity(): android.app.Activity {
        let activity = this.activity;
        if (activity) {
            return activity;
        }

        let frames = stack();
        for (let length = frames.length, i = length - 1; i >= 0; i--) {
            activity = frames[i].android.activity;
            if (activity) {
                return activity;
            }
        }

        return undefined;
    }

    public get owner(): Frame {
        return this._owner;
    }

    public canGoBack() {
        if (!this.activity) {
            return false;
        }

        // can go back only if it is not the main one.
        return this.activity.getIntent().getAction() !== android.content.Intent.ACTION_MAIN;
    }

    public fragmentForPage(entry: BackstackEntry): any {
        const tag = entry && entry.fragmentTag;
        if (tag) {
            return this.owner._getFragmentManager().findFragmentByTag(tag);
        }

        return undefined;
    }
}

function findPageForFragment(fragment: android.app.Fragment, frame: Frame) {
    const fragmentTag = fragment.getTag();
    if (traceEnabled()) {
        traceWrite(`Finding page for ${fragmentTag}.`, traceCategories.NativeLifecycle);
    }

    let entry: BackstackEntry;
    const current = frame._currentEntry;
    const navigating = frame._executingEntry;
    if (current && current.fragmentTag === fragmentTag) {
        entry = current;
    } else if (navigating && navigating.fragmentTag === fragmentTag) {
        entry = navigating;
    }

    let page: Page;
    if (entry) {
        entry.recreated = true;
        page = entry.resolvedPage;
    }

    if (page) {
        const callbacks: FragmentCallbacksImplementation = fragment[CALLBACKS];
        callbacks.frame = frame;
        callbacks.entry = entry;
        entry.fragment = fragment;
        _updateTransitions(entry);
    } else {
        throw new Error(`Could not find a page for ${fragmentTag}.`);
    }
}

function startActivity(activity: android.app.Activity, frameId: number) {
    // TODO: Implicitly, we will open the same activity type as the current one
    const intent = new android.content.Intent(activity, activity.getClass());
    intent.setAction(android.content.Intent.ACTION_DEFAULT);
    intent.putExtra(INTENT_EXTRA, frameId);

    // TODO: Put the navigation context (if any) in the intent
    activity.startActivity(intent);
}

function getFrameById(frameId: number): Frame {
    // Find the frame for this activity.
    for (let i = 0; i < framesCache.length; i++) {
        let aliveFrame = framesCache[i].get();
        if (aliveFrame && aliveFrame.frameId === frameId) {
            return aliveFrame.owner;
        }
    }

    return null;
}

function ensureFragmentClass() {
    if (fragmentClass) {
        return;
    }

    // this require will apply the FragmentClass implementation 
    require("ui/frame/fragment");

    if (!fragmentClass) {
        throw new Error("Failed to initialize the extended android.app.Fragment class");
    }
}

let fragmentClass: any;
export function setFragmentClass(clazz: any) {
    if (fragmentClass) {
        throw new Error("Fragment class already initialized");
    }

    fragmentClass = clazz;
}

class FragmentCallbacksImplementation implements AndroidFragmentCallbacks {
    public frame: Frame;
    public entry: BackstackEntry;

    @profile
    public onHiddenChanged(fragment: android.app.Fragment, hidden: boolean, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onHiddenChanged(${hidden})`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment, hidden);
    }

    @profile
    public onCreateAnimator(fragment: android.app.Fragment, transit: number, enter: boolean, nextAnim: number, superFunc: Function): android.animation.Animator {
        let nextAnimString: string;
        switch (nextAnim) {
            case -10: nextAnimString = "enter"; break;
            case -20: nextAnimString = "exit"; break;
            case -30: nextAnimString = "popEnter"; break;
            case -40: nextAnimString = "popExit"; break;
        }

        let animator = _onFragmentCreateAnimator(this.entry, fragment, nextAnim, enter);
        if (!animator) {
            animator = superFunc.call(fragment, transit, enter, nextAnim);
        }

        if (traceEnabled()) {
            traceWrite(`${fragment}.onCreateAnimator(${transit}, ${enter ? "enter" : "exit"}, ${nextAnimString}): ${animator ? 'animator' : 'no animator'}`, traceCategories.NativeLifecycle);
        }
        return animator;
    }

    @profile
    public onCreate(fragment: android.app.Fragment, savedInstanceState: android.os.Bundle, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onCreate(${savedInstanceState})`, traceCategories.NativeLifecycle);
        }

        superFunc.call(fragment, savedInstanceState);
        // There is no entry set to the fragment, so this must be destroyed fragment that was recreated by Android.
        // We should find its corresponding page in our backstack and set it manually.
        if (!this.entry) {
            const args = fragment.getArguments();
            const frameId = args.getInt(FRAMEID);
            const frame = getFrameById(frameId);
            if (!frame) {
                throw new Error(`Cannot find Frame for ${fragment}`);
            }

            findPageForFragment(fragment, frame);
        }
    }

    @profile
    public onCreateView(fragment: android.app.Fragment, inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle, superFunc: Function): android.view.View {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onCreateView(inflater, container, ${savedInstanceState})`, traceCategories.NativeLifecycle);
        }

        const entry = this.entry;
        const page = entry.resolvedPage;
        const frame = this.frame;
        if (page.parent === frame) {
            // If we are navigating to a page that was destroyed
            // reinitialize its UI.
            if (!page._context) {
                const context = container && container.getContext() || inflater && inflater.getContext();
                page._setupUI(context);
            }
        } else {
            if (!this.frame._styleScope) {
                // Make sure page will have styleScope even if parents don't.
                page._updateStyleScope();
            }

            this.frame._addView(page);
        }

        // Load page here even if root view is not loaded yet.
        // Otherwise it will show as blank,
        // The case is Tab->Frame->Page activity recreated, fragments are 
        // created before Tab loads its items.
        // TODO: addCheck if the fragment is visible so we don't load pages
        // that are not in the selectedIndex of the Tab!!!!!!
        if (!page.isLoaded) {
            page.callLoaded();
        }

        const savedState = entry.viewSavedState;
        if (savedState) {
            (<android.view.View>page.nativeViewProtected).restoreHierarchyState(savedState);
            entry.viewSavedState = null;
        }

        return page.nativeViewProtected;
    }

    @profile
    public onSaveInstanceState(fragment: android.app.Fragment, outState: android.os.Bundle, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onSaveInstanceState(${outState})`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment, outState);
    }

    @profile
    public onDestroyView(fragment: android.app.Fragment, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onDestroyView()`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment);
    }

    @profile
    public onDestroy(fragment: android.app.Fragment, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onDestroy()`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment);
    }

    @profile
    public onStop(fragment: android.app.Fragment, superFunc: Function): void {
        superFunc.call(fragment);
    }

    @profile
    public toStringOverride(fragment: android.app.Fragment, superFunc: Function): string {
        const entry = this.entry;
        if (entry) {
            return `${entry.fragmentTag}<${entry.resolvedPage}>`;
        } else {
            return "NO ENTRY, " + superFunc.call(fragment);
        }
    }
}

class ActivityCallbacksImplementation implements AndroidActivityCallbacks {
    public _rootView: View;

    @profile
    public onCreate(activity: android.app.Activity, savedInstanceState: android.os.Bundle, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`Activity.onCreate(${savedInstanceState})`, traceCategories.NativeLifecycle);
        }

        // If there is savedInstanceState this call will recreate all fragments that were previously in the navigation.
        // We take care of associating them with a Page from our backstack in the onAttachFragment callback.
        // If there is savedInstanceState and moduleLoaded is false we are restarted but process was killed.
        // For now we treat it like first run (e.g. we are not passing savedInstanceState so no fragments are being restored).
        // When we add support for application save/load state - revise this logic.
        let isRestart = !!savedInstanceState && moduleLoaded;
        superFunc.call(activity, isRestart ? savedInstanceState : null);

        setActivityContent(activity, savedInstanceState);
        moduleLoaded = true;
    }

    @profile
    public onSaveInstanceState(activity: android.app.Activity, outState: android.os.Bundle, superFunc: Function): void {
        superFunc.call(activity, outState);
        const frame = this._rootView;
        if (frame instanceof Frame) {
            outState.putInt(INTENT_EXTRA, frame.android.frameId);
            frame._saveFragmentsState();
        }
    }

    @profile
    public onStart(activity: any, superFunc: Function): void {
        superFunc.call(activity);

        if (traceEnabled()) {
            traceWrite("NativeScriptActivity.onStart();", traceCategories.NativeLifecycle);
        }

        const rootView = this._rootView;
        if (rootView && !rootView.isLoaded) {
            rootView.callLoaded();
        }
    }

    @profile
    public onStop(activity: any, superFunc: Function): void {
        superFunc.call(activity);

        if (traceEnabled()) {
            traceWrite("NativeScriptActivity.onStop();", traceCategories.NativeLifecycle);
        }

        const rootView = this._rootView;
        if (rootView && rootView.isLoaded) {
            rootView.callUnloaded();
        }
    }

    @profile
    public onDestroy(activity: any, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite("NativeScriptActivity.onDestroy();", traceCategories.NativeLifecycle);
        }

        const rootView = this._rootView;
        if (rootView) {
            rootView._tearDownUI(true);
        }

        const exitArgs = { eventName: application.exitEvent, object: application.android, android: activity };
        application.notify(exitArgs);

        superFunc.call(activity);
    }

    @profile
    public onBackPressed(activity: any, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite("NativeScriptActivity.onBackPressed;", traceCategories.NativeLifecycle);
        }

        const args = <application.AndroidActivityBackPressedEventData>{
            eventName: "activityBackPressed",
            object: application.android,
            activity: activity,
            cancel: false,
        };
        application.android.notify(args);
        if (args.cancel) {
            return;
        }

        const view = this._rootView;
        let callSuper = false;
        if (view instanceof Frame) {
            callSuper = !goBack();
        } else {
            const viewArgs = <application.AndroidActivityBackPressedEventData>{
                eventName: "activityBackPressed",
                object: view,
                activity: activity,
                cancel: false,
            };
            view.notify(viewArgs);

            if (!viewArgs.cancel && !view._onBackPressed()) {
                callSuper = true;
            }
        }

        if (callSuper) {
            superFunc.call(activity);
        }
    }

    @profile
    public onRequestPermissionsResult(activity: any, requestCode: number, permissions: Array<String>, grantResults: Array<number>, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite("NativeScriptActivity.onRequestPermissionsResult;", traceCategories.NativeLifecycle);
        }

        application.android.notify(<application.AndroidActivityRequestPermissionsEventData>{
            eventName: "activityRequestPermissions",
            object: application.android,
            activity: activity,
            requestCode: requestCode,
            permissions: permissions,
            grantResults: grantResults
        });
    }

    @profile
    public onActivityResult(activity: any, requestCode: number, resultCode: number, data: android.content.Intent, superFunc: Function): void {
        superFunc.call(activity, requestCode, resultCode, data);
        if (traceEnabled()) {
            traceWrite(`NativeScriptActivity.onActivityResult(${requestCode}, ${resultCode}, ${data})`, traceCategories.NativeLifecycle);
        }

        application.android.notify(<application.AndroidActivityResultEventData>{
            eventName: "activityResult",
            object: application.android,
            activity: activity,
            requestCode: requestCode,
            resultCode: resultCode,
            intent: data
        });
    }
}

function resetActivityContent(activity: android.app.Activity): void {
    const callbacks: ActivityCallbacksImplementation = activity[CALLBACKS];
    const app = application.android;

    // Delete previously cached root view in order to recreate it.
    callbacks._rootView = (<any>app).rootView = null;
    setActivityContent(activity, null);
    callbacks._rootView.callLoaded();
}

function setActivityContent(activity: android.app.Activity, savedInstanceState: android.os.Bundle): void {
    const callbacks: ActivityCallbacksImplementation = activity[CALLBACKS];

    const shouldCreateRootFrame = application.shouldCreateRootFrame();
    const app = application.android;

    // TODO: this won't work if we open more than one activity!!!
    let rootView = callbacks._rootView = (<any>app).rootView;
    if (!rootView) {
        const mainEntry = application.getMainEntry();
        const intent = activity.getIntent();
        rootView = notifyLaunch(intent, savedInstanceState);
        if (shouldCreateRootFrame) {
            const extras = intent.getExtras();
            let frameId = -1;

            // We have extras when we call - new Frame().navigate();
            // savedInstanceState is used when activity is recreated.
            // NOTE: On API 23+ we get extras on first run.
            // Check changed - first try to get frameId from Extras if not from saveInstanceState.
            if (extras) {
                frameId = extras.getInt(INTENT_EXTRA, -1);
            }

            if (savedInstanceState && frameId < 0) {
                frameId = savedInstanceState.getInt(INTENT_EXTRA, -1);
            }

            if (!rootView) {
                // If we have frameId from extras - we are starting a new activity from navigation (e.g. new Frame().navigate()))
                // Then we check if we have frameId from savedInstanceState - this happens when Activity is destroyed but app was not (e.g. suspend)
                rootView = getFrameById(frameId) || new Frame();
            }

            if (rootView instanceof Frame) {
                rootView.navigate(mainEntry);
            } else {
                throw new Error("A Frame must be used to navigate to a Page.");
            }
        } else {
            rootView = createViewFromEntry(mainEntry);
        }

        callbacks._rootView = (<any>app).rootView = rootView;
    }

    // Initialize native visual tree;
    if (shouldCreateRootFrame) {
        // Don't setup as styleScopeHost
        rootView._setupUI(activity);
    } else {
        // setup view as styleScopeHost
        rootView._setupAsRootView(activity);
    }

    activity.setContentView(rootView.nativeViewProtected, new org.nativescript.widgets.CommonLayoutParams());
}

const notifyLaunch = profile("notifyLaunch", function notifyLaunch(intent: android.content.Intent, savedInstanceState: android.os.Bundle): View {
    const launchArgs: application.LaunchEventData = { eventName: application.launchEvent, object: application.android, android: intent, savedInstanceState };
    application.notify(launchArgs);
    application.notify(<application.LoadAppCSSEventData>{ eventName: "loadAppCss", object: <any>this, cssFile: application.getCssFileName() });
    return launchArgs.root;
});

export function setActivityCallbacks(activity: android.app.Activity): void {
    activity[CALLBACKS] = new ActivityCallbacksImplementation();
}

export function setFragmentCallbacks(fragment: android.app.Fragment): void {
    fragment[CALLBACKS] = new FragmentCallbacksImplementation();
}
