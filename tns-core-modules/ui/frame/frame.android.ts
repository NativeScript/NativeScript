// Definitions.
import {
    AndroidFrame as AndroidFrameDefinition, BackstackEntry,
    NavigationTransition, AndroidFragmentCallbacks, AndroidActivityCallbacks
} from ".";
import { Page } from "../page";

// Types.
import * as application from "../../application";
import {
    FrameBase, stack, goBack, View, Observable,
    traceEnabled, traceWrite, traceCategories, traceError
} from "./frame-common";

import {
    _setAndroidFragmentTransitions, _onFragmentCreateAnimator, _getAnimatedEntries,
    _updateTransitions, _reverseTransitions, _clearEntry, _clearFragment, AnimationType
} from "./fragment.transitions";

import { profile } from "../../profiling";

// TODO: Remove this and get it from global to decouple builder for angular
import { createViewFromEntry } from "../builder";

export * from "./frame-common";

interface AnimatorState {
    enterAnimator: any;
    exitAnimator: any;
    popEnterAnimator: any;
    popExitAnimator: any;
    transitionName: string;
}

const INTENT_EXTRA = "com.tns.activity";
const ROOT_VIEW_ID_EXTRA = "com.tns.activity.rootViewId";
const FRAMEID = "_frameId";
const CALLBACKS = "_callbacks";

const ownerSymbol = Symbol("_owner");
const activityRootViewsMap = new Map<number, WeakRef<View>>();

let navDepth = -1;
let fragmentId = -1;
export let moduleLoaded: boolean;

if (global && global.__inspector) {
    const devtools = require("tns-core-modules/debugger/devtools-elements.js");
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

export function reloadPage(context?: ModuleContext): void {
    const activity = application.android.foregroundActivity;
    const callbacks: AndroidActivityCallbacks = activity[CALLBACKS];
    if (callbacks) {
        const rootView: View = callbacks.getRootView();

        if (!rootView || !rootView._onLivesync(context)) {
            callbacks.resetActivityContent(activity);
        }
    } else {
        traceError(`${activity}[CALLBACKS] is null or undefined`);
    }
}

// attach on global, so it can be overwritten in NativeScript Angular
(<any>global).__onLiveSyncCore = reloadPage;

export class Frame extends FrameBase {
    private _android: AndroidFrame;
    private _containerViewId: number = -1;
    private _tearDownPending = false;
    private _attachedToWindow = false;
    public _isBack: boolean = true;
    private _cachedAnimatorState: AnimatorState;

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

    get _hasFragments(): boolean {
        return true;
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
        if (!this.isLoaded || this._executingEntry || !this._attachedToWindow) {
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
            // we need to cache the original animation settings so we can restore them later; otherwise as the
            // simulated first navigation is not animated (it is actually a zero duration animator) the "popExit" animation
            // is broken when transaction.setCustomAnimations(...) is used in a scenario with:
            // 1) forward navigation
            // 2) suspend / resume app
            // 3) back navigation -- the exiting fragment is erroneously animated with the exit animator from the
            // simulated navigation (NoTransition, zero duration animator) and thus the fragment immediately disappears;
            // the user only sees the animation of the entering fragment as per its specific enter animation settings.
            // NOTE: we are restoring the animation settings in Frame.setCurrent(...) as navigation completes asynchronously
            this._cachedAnimatorState = getAnimatorState(this._currentEntry);

            this._currentEntry = null;
            // NavigateCore will eventually call _processNextNavigationEntry again.
            this._navigateCore(entry);
            this._currentEntry = entry;
        } else {
            super._processNextNavigationEntry();
        }
    }

    public _getChildFragmentManager() {
        const backstackEntry = this._executingEntry || this._currentEntry;
        if (backstackEntry && backstackEntry.fragment && backstackEntry.fragment.isAdded()) {
            return backstackEntry.fragment.getChildFragmentManager();
        }

        return null;
    }

    public _onRootViewReset(): void {
        super._onRootViewReset();

        // call this AFTER the super call to ensure descendants apply their rootview-reset logic first
        // i.e. in a scenario with nested frames / frame with tabview let the descendandt cleanup the inner
        // fragments first, and then cleanup the parent fragments
        this.disposeCurrentFragment();
    }

    onUnloaded() {
        super.onUnloaded();

        // calling dispose fragment after super.onUnloaded() means we are not relying on the built-in Android logic
        // to automatically remove child fragments when parent fragment is removed;
        // this fixes issue with missing nested fragment on app suspend / resume;
        this.disposeCurrentFragment();
    }

    private disposeCurrentFragment(): void {
        if (!this._currentEntry ||
            !this._currentEntry.fragment ||
            !this._currentEntry.fragment.isAdded()) {
            return;
        }

        const manager: android.support.v4.app.FragmentManager = this._getFragmentManager();
        const transaction = manager.beginTransaction();
        transaction.remove(this._currentEntry.fragment);
        transaction.commitNowAllowingStateLoss();
    }

    private createFragment(backstackEntry: BackstackEntry, fragmentTag: string): android.support.v4.app.Fragment {
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

                if (current) {
                    current.recreated = false;
                }
            }

            super.setCurrent(entry, isBack);

            // If we had real navigation process queue.
            this._processNavigationQueue(entry.resolvedPage);
        } else {
            // Otherwise currentPage was recreated so this wasn't real navigation.
            // Continue with next item in the queue.
            this._processNextNavigationEntry();
        }

        // restore cached animation settings if we just completed simulated first navigation (no animation)
        if (this._cachedAnimatorState) {
            restoreAnimatorState(this._currentEntry, this._cachedAnimatorState);
            this._cachedAnimatorState = null;
        }
    }

    public onBackPressed(): boolean {
        if (this.canGoBack()) {
            this.goBack();
            return true;
        }

        if (!this.navigationQueueIsEmpty()) {
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

            return;
        }

        const manager: android.support.v4.app.FragmentManager = this._getFragmentManager();
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
        const animated = currentEntry ? this._getIsAnimatedNavigation(newEntry.entry) : false;
        // NOTE: Don't use transition for the initial navigation (same as on iOS)
        // On API 21+ transition won't be triggered unless there was at least one
        // layout pass so we will wait forever for transitionCompleted handler...
        // https://github.com/NativeScript/NativeScript/issues/4895
        const navigationTransition = this._currentEntry ? this._getNavigationTransition(newEntry.entry) : null;

        _setAndroidFragmentTransitions(animated, navigationTransition, currentEntry, newEntry, transaction, this._android.frameId);

        if (currentEntry && animated && !navigationTransition) {
            transaction.setTransition(android.support.v4.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN);
        }

        transaction.replace(this.containerViewId, newFragment, newFragmentTag);
        transaction.commitAllowingStateLoss();
    }

    public _goBackCore(backstackEntry: BackstackEntry) {
        this._isBack = true;
        super._goBackCore(backstackEntry);
        navDepth = backstackEntry.navDepth;

        const manager: android.support.v4.app.FragmentManager = this._getFragmentManager();
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
            // we do not use Android backstack so setting popEnter / popExit is meaningless (3rd and 4th optional args)
            transaction.setCustomAnimations(AnimationType.popEnterFakeResourceId, AnimationType.popExitFakeResourceId);
        }

        transaction.replace(this.containerViewId, backstackEntry.fragment, backstackEntry.fragmentTag);
        transaction.commitAllowingStateLoss();
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
        this._removeFromFrameStack();
        super.disposeNativeView();
    }

    public _popFromFrameStack() {
        if (!this._isInFrameStack) {
            return;
        }

        super._popFromFrameStack();
    }

    public _getNavBarVisible(page: Page): boolean {
        switch (this.actionBarVisibility) {
            case "never":
                return false;

            case "always":
                return true;

            default:
                if (page.actionBarHidden !== undefined) {
                    return !page.actionBarHidden;
                }

                if (this._android && this._android.showActionBar !== undefined) {
                    return this._android.showActionBar;
                }

                return true;
        }
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

function cloneExpandedAnimator(expandedAnimator: any) {
    if (!expandedAnimator) {
        return null;
    }

    const clone = expandedAnimator.clone();
    clone.entry = expandedAnimator.entry;
    clone.transitionType = expandedAnimator.transitionType;

    return clone;
}

function getAnimatorState(entry: BackstackEntry): AnimatorState {
    const expandedEntry = <any>entry;
    const animatorState = <AnimatorState>{};

    animatorState.enterAnimator = cloneExpandedAnimator(expandedEntry.enterAnimator);
    animatorState.exitAnimator = cloneExpandedAnimator(expandedEntry.exitAnimator);
    animatorState.popEnterAnimator = cloneExpandedAnimator(expandedEntry.popEnterAnimator);
    animatorState.popExitAnimator = cloneExpandedAnimator(expandedEntry.popExitAnimator);
    animatorState.transitionName = expandedEntry.transitionName;

    return animatorState;
}

function restoreAnimatorState(entry: BackstackEntry, snapshot: AnimatorState): void {
    const expandedEntry = <any>entry;
    if (snapshot.enterAnimator) {
        expandedEntry.enterAnimator = snapshot.enterAnimator;
    }

    if (snapshot.exitAnimator) {
        expandedEntry.exitAnimator = snapshot.exitAnimator;
    }

    if (snapshot.popEnterAnimator) {
        expandedEntry.popEnterAnimator = snapshot.popEnterAnimator;
    }

    if (snapshot.popExitAnimator) {
        expandedEntry.popExitAnimator = snapshot.popExitAnimator;
    }

    expandedEntry.transitionName = snapshot.transitionName;
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

    public get activity(): android.support.v7.app.AppCompatActivity {
        let activity: android.support.v7.app.AppCompatActivity = this.owner._context;
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

    public get currentActivity(): android.support.v7.app.AppCompatActivity {
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

function findPageForFragment(fragment: android.support.v4.app.Fragment, frame: Frame) {
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
    }
    else {
        throw new Error(`Could not find a page for ${fragmentTag}.`);
    }
}

function startActivity(activity: android.support.v7.app.AppCompatActivity, frameId: number) {
    // TODO: Implicitly, we will open the same activity type as the current one
    const intent = new android.content.Intent(activity, activity.getClass());
    intent.setAction(android.content.Intent.ACTION_DEFAULT);
    intent.putExtra(INTENT_EXTRA, frameId);

    // TODO: Put the navigation context (if any) in the intent
    activity.startActivity(intent);
}

function getFrameByNumberId(frameId: number): Frame {
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
        throw new Error("Failed to initialize the extended android.support.v4.app.Fragment class");
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
    public onHiddenChanged(fragment: android.support.v4.app.Fragment, hidden: boolean, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onHiddenChanged(${hidden})`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment, hidden);
    }

    @profile
    public onCreateAnimator(fragment: org.nativescript.widgets.FragmentBase, transit: number, enter: boolean, nextAnim: number, superFunc: Function): android.animation.Animator {
        // HACK: FragmentBase class MUST handle removing nested fragment scenario to workaround
        // https://code.google.com/p/android/issues/detail?id=55228
        if (!enter && fragment.getRemovingParentFragment()) {
            return superFunc.call(fragment, transit, enter, nextAnim);
        }

        let nextAnimString: string;
        switch (nextAnim) {
            case AnimationType.enterFakeResourceId: nextAnimString = "enter"; break;
            case AnimationType.exitFakeResourceId: nextAnimString = "exit"; break;
            case AnimationType.popEnterFakeResourceId: nextAnimString = "popEnter"; break;
            case AnimationType.popExitFakeResourceId: nextAnimString = "popExit"; break;
        }

        let animator = _onFragmentCreateAnimator(this.entry, fragment, nextAnim, enter);
        if (!animator) {
            animator = superFunc.call(fragment, transit, enter, nextAnim);
        }

        if (traceEnabled()) {
            traceWrite(`${fragment}.onCreateAnimator(${transit}, ${enter ? "enter" : "exit"}, ${nextAnimString}): ${animator ? "animator" : "no animator"}`, traceCategories.NativeLifecycle);
        }

        return animator;
    }

    @profile
    public onCreate(fragment: android.support.v4.app.Fragment, savedInstanceState: android.os.Bundle, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onCreate(${savedInstanceState})`, traceCategories.NativeLifecycle);
        }

        superFunc.call(fragment, savedInstanceState);
        // There is no entry set to the fragment, so this must be destroyed fragment that was recreated by Android.
        // We should find its corresponding page in our backstack and set it manually.
        if (!this.entry) {
            const args = fragment.getArguments();
            const frameId = args.getInt(FRAMEID);
            const frame = getFrameByNumberId(frameId);
            if (!frame) {
                throw new Error(`Cannot find Frame for ${fragment}`);
            }

            findPageForFragment(fragment, frame);
        }
    }

    @profile
    public onCreateView(fragment: android.support.v4.app.Fragment, inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle, superFunc: Function): android.view.View {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onCreateView(inflater, container, ${savedInstanceState})`, traceCategories.NativeLifecycle);
        }

        const entry = this.entry;
        if (!entry) {
            traceError(`${fragment}.onCreateView: entry is null or undefined`);
            return null;
        }

        const page = entry.resolvedPage;
        if (!page) {
            traceError(`${fragment}.onCreateView: entry has no resolvedPage`);
            return null;
        }

        const frame = this.frame;
        if (!frame) {
            traceError(`${fragment}.onCreateView: this.frame is null or undefined`);
            return null;
        }

        if (page.parent === frame) {
            // If we are navigating to a page that was destroyed
            // reinitialize its UI.
            if (!page._context) {
                const context = container && container.getContext() || inflater && inflater.getContext();
                page._setupUI(context);
            }
        } else {
            if (!frame._styleScope) {
                // Make sure page will have styleScope even if parents don't.
                page._updateStyleScope();
            }

            frame._addView(page);
        }

        if (frame.isLoaded && !page.isLoaded) {
            page.callLoaded();
        }

        const savedState = entry.viewSavedState;
        if (savedState) {
            (<android.view.View>page.nativeViewProtected).restoreHierarchyState(savedState);
            entry.viewSavedState = null;
        }

        // fixes 'java.lang.IllegalStateException: The specified child already has a parent. You must call removeView() on the child's parent first'.
        // on app resume in nested frame scenarios with support library version greater than 26.0.0
        // HACK: this whole code block shouldn't be necessary as the native view is supposedly removed from its parent
        // right after onDestroyView(...) is called but for some reason the fragment view (page) still thinks it has a
        // parent while its supposed parent believes it properly removed its children; in order to "force" the child to
        // lose its parent we temporarily add it to the parent, and then remove it (addViewInLayout doesn't trigger layout pass)
        const nativeView = page.nativeViewProtected;
        if (nativeView != null) {
            const parentView = nativeView.getParent();
            if (parentView instanceof android.view.ViewGroup) {
                if (parentView.getChildCount() === 0) {
                    parentView.addViewInLayout(nativeView, -1, new org.nativescript.widgets.CommonLayoutParams());
                }

                parentView.removeView(nativeView);
            }
        }

        return page.nativeViewProtected;
    }

    @profile
    public onSaveInstanceState(fragment: android.support.v4.app.Fragment, outState: android.os.Bundle, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onSaveInstanceState(${outState})`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment, outState);
    }

    @profile
    public onDestroyView(fragment: android.support.v4.app.Fragment, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onDestroyView()`, traceCategories.NativeLifecycle);
        }

        superFunc.call(fragment);
    }

    @profile
    public onDestroy(fragment: android.support.v4.app.Fragment, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onDestroy()`, traceCategories.NativeLifecycle);
        }

        superFunc.call(fragment);

        const entry = this.entry;
        if (!entry) {
            traceError(`${fragment}.onDestroy: entry is null or undefined`);
            return null;
        }

        // [nested frames / fragments] see https://github.com/NativeScript/NativeScript/issues/6629
        // retaining reference to a destroyed fragment here somehow causes a cryptic
        // "IllegalStateException: Failure saving state: active fragment has cleared index: -1"
        // in a specific mixed parent / nested frame navigation scenario
        entry.fragment = null;

        const page = entry.resolvedPage;
        if (!page) {
            traceError(`${fragment}.onDestroy: entry has no resolvedPage`);
            return null;
        }
    }

    @profile
    public onStop(fragment: android.support.v4.app.Fragment, superFunc: Function): void {
        superFunc.call(fragment);
    }

    @profile
    public toStringOverride(fragment: android.support.v4.app.Fragment, superFunc: Function): string {
        const entry = this.entry;
        if (entry) {
            return `${entry.fragmentTag}<${entry.resolvedPage}>`;
        } else {
            return "NO ENTRY, " + superFunc.call(fragment);
        }
    }
}

class ActivityCallbacksImplementation implements AndroidActivityCallbacks {
    private _rootView: View;

    public getRootView(): View {
        return this._rootView;
    }

    @profile
    public onCreate(activity: android.support.v7.app.AppCompatActivity, savedInstanceState: android.os.Bundle, intentOrSuperFunc: android.content.Intent | Function, superFunc?: Function): void {
        if (traceEnabled()) {
            traceWrite(`Activity.onCreate(${savedInstanceState})`, traceCategories.NativeLifecycle);
        }

        const intent: android.content.Intent = superFunc ? <android.content.Intent>intentOrSuperFunc : undefined;

        if (!superFunc) {
            console.log("AndroidActivityCallbacks.onCreate(activity: any, savedInstanceState: any, superFunc: Function) " +
                "is deprecated. Use AndroidActivityCallbacks.onCreate(activity: any, savedInstanceState: any, intent: any, superFunc: Function) instead.");
            superFunc = <Function>intentOrSuperFunc;
        }

        // If there is savedInstanceState this call will recreate all fragments that were previously in the navigation.
        // We take care of associating them with a Page from our backstack in the onAttachFragment callback.
        // If there is savedInstanceState and moduleLoaded is false we are restarted but process was killed.
        // For now we treat it like first run (e.g. we are not passing savedInstanceState so no fragments are being restored).
        // When we add support for application save/load state - revise this logic.
        let isRestart = !!savedInstanceState && moduleLoaded;
        superFunc.call(activity, isRestart ? savedInstanceState : null);

        // Try to get the rootViewId form the saved state in case the activity
        // was destroyed and we are now recreating it.
        if (savedInstanceState) {
            const rootViewId = savedInstanceState.getInt(ROOT_VIEW_ID_EXTRA, -1);
            if (rootViewId !== -1 && activityRootViewsMap.has(rootViewId)) {
                this._rootView = activityRootViewsMap.get(rootViewId).get();
            }
        }

        if (intent && intent.getAction()) {
            application.android.notify(<application.AndroidActivityNewIntentEventData>{
                eventName: application.AndroidApplication.activityNewIntentEvent,
                object: application.android,
                activity,
                intent
            });
        }

        this.setActivityContent(activity, savedInstanceState, true);
        moduleLoaded = true;
    }

    @profile
    public onSaveInstanceState(activity: android.support.v7.app.AppCompatActivity, outState: android.os.Bundle, superFunc: Function): void {
        superFunc.call(activity, outState);
        const rootView = this._rootView;
        if (rootView instanceof Frame) {
            outState.putInt(INTENT_EXTRA, rootView.android.frameId);
            rootView._saveFragmentsState();
        }

        outState.putInt(ROOT_VIEW_ID_EXTRA, rootView._domId);
    }

    @profile
    public onNewIntent(activity: android.support.v7.app.AppCompatActivity, intent: android.content.Intent, superSetIntentFunc: Function, superFunc: Function): void {
        superFunc.call(activity, intent);
        superSetIntentFunc.call(activity, intent);

        application.android.notify(<application.AndroidActivityNewIntentEventData>{
            eventName: application.AndroidApplication.activityNewIntentEvent,
            object: application.android,
            activity,
            intent
        });
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
    public onPostResume(activity: any, superFunc: Function): void {
        superFunc.call(activity);

        if (traceEnabled()) {
            traceWrite("NativeScriptActivity.onPostResume();", traceCategories.NativeLifecycle);
        }

        // NOTE: activity.onPostResume() is called when activity resume is complete and we can
        // safely raise the application resume event;
        // onActivityResumed(...) lifecycle callback registered in application is called too early
        // and raising the application resume event there causes issues like
        // https://github.com/NativeScript/NativeScript/issues/6708
        if ((<any>activity).isNativeScriptActivity) {
            const args = <application.ApplicationEventData>{
                eventName: application.resumeEvent,
                object: application.android,
                android: activity
            };
            application.notify(args);
            application.android.paused = false;
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

            if (!viewArgs.cancel && !view.onBackPressed()) {
                callSuper = true;
            }
        }

        if (callSuper) {
            superFunc.call(activity);
        }
    }

    @profile
    public onRequestPermissionsResult(
        activity: any,
        requestCode: number,
        permissions: Array<String>,
        grantResults: Array<number>,
        superFunc: Function
    ): void {
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
    public onActivityResult(
        activity: any,
        requestCode: number,
        resultCode: number,
        data: android.content.Intent,
        superFunc: Function
    ): void {
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

    public resetActivityContent(activity: android.support.v7.app.AppCompatActivity): void {
        if (this._rootView) {
            const manager = this._rootView._getFragmentManager();
            manager.executePendingTransactions();

            this._rootView._onRootViewReset();
        }
        // Delete previously cached root view in order to recreate it.
        this._rootView = null;
        this.setActivityContent(activity, null, false);
        this._rootView.callLoaded();
    }

    // Paths that go trough this method:
    // 1. Application initial start - there is no rootView in callbacks.
    // 2. Application revived after Activity is destroyed. this._rootView should have been restored by id in onCreate.
    // 3. Livesync if rootView has no custom _onLivesync. this._rootView should have been cleared upfront. Launch event should not fired
    // 4. _resetRootView method. this._rootView should have been cleared upfront. Launch event should not fired
    private setActivityContent(
        activity: android.support.v7.app.AppCompatActivity,
        savedInstanceState: android.os.Bundle,
        fireLaunchEvent: boolean
    ): void {
        const shouldCreateRootFrame = application.shouldCreateRootFrame();
        let rootView = this._rootView;

        if (traceEnabled()) {
            traceWrite(
                `Frame.setActivityContent rootView: ${rootView} shouldCreateRootFrame: ${shouldCreateRootFrame} fireLaunchEvent: ${fireLaunchEvent}`,
                traceCategories.NativeLifecycle
            );
        }

        if (!rootView) {
            const mainEntry = application.getMainEntry();
            const intent = activity.getIntent();

            if (fireLaunchEvent) {
                // entry point for Angular and Vue frameworks
                rootView = notifyLaunch(intent, savedInstanceState);
            }

            if (!rootView) {
                // entry point for NS Core
                if (!mainEntry) {
                    // Also handles scenarios with Angular and Vue where the notifyLaunch didn't return a root view.
                    throw new Error("Main entry is missing. App cannot be started. Verify app bootstrap.");
                }

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
                        rootView = getFrameByNumberId(frameId) || new Frame();
                    }

                    if (rootView instanceof Frame) {
                        rootView.navigate(mainEntry);
                    } else {
                        throw new Error("A Frame must be used to navigate to a Page.");
                    }
                } else {
                    rootView = createViewFromEntry(mainEntry);
                }
            }

            this._rootView = rootView;
            activityRootViewsMap.set(rootView._domId, new WeakRef(rootView));
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
}

const notifyLaunch = profile("notifyLaunch", function notifyLaunch(intent: android.content.Intent, savedInstanceState: android.os.Bundle): View {
    const launchArgs: application.LaunchEventData = {
        eventName: application.launchEvent,
        object: application.android,
        android: intent, savedInstanceState
    };

    application.notify(launchArgs);
    application.notify(<application.LoadAppCSSEventData>{ eventName: "loadAppCss", object: <any>this, cssFile: application.getCssFileName() });
    return launchArgs.root;
});

export function setActivityCallbacks(activity: android.support.v7.app.AppCompatActivity): void {
    activity[CALLBACKS] = new ActivityCallbacksImplementation();
}

export function setFragmentCallbacks(fragment: android.support.v4.app.Fragment): void {
    fragment[CALLBACKS] = new FragmentCallbacksImplementation();
}