// Definitions.
import {
    AndroidFrame as AndroidFrameDefinition, BackstackEntry,
    NavigationTransition, AndroidFragmentCallbacks, AndroidActivityCallbacks
} from ".";
import { Page } from "../page";

// Types.
import { FrameBase, application, NavigationContext, stack, goBack, View, Observable, traceEnabled, traceWrite, traceCategories } from "./frame-common";
import { DIALOG_FRAGMENT_TAG } from "../page/constants";
import * as transitionModule from "../transition";

import { profile } from "../../profiling";

export * from "./frame-common";

const HIDDEN = "_hidden";
const INTENT_EXTRA = "com.tns.activity";
const FRAMEID = "_frameId";
const CALLBACKS = "_callbacks";
let navDepth = -1;
let fragmentId = -1;
let activityInitialized = false;

function onFragmentShown(fragment: android.app.Fragment) {
    if (traceEnabled()) {
        traceWrite(`SHOWN ${fragment}`, traceCategories.NativeLifecycle);
    }

    let callbacks: FragmentCallbacksImplementation = fragment[CALLBACKS];
    if (callbacks.clearHistory) {
        // This is the fragment which was at the bottom of the stack (fragment0) when we cleared history and called
        // manager.popBackStack(firstEntryName, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        if (traceEnabled()) {
            traceWrite(`${fragment} has been shown, but it is being cleared from history. Returning.`, traceCategories.NativeLifecycle);
        }
        return null;
    }

    // TODO: consider putting entry and page in queue so we can safely extract them here. Pass the index of current navigation and extract it from here.
    // After extracting navigation info - remove this index from navigation stack.
    let frame = callbacks.frame;
    let entry = callbacks.entry;
    let page = entry.resolvedPage;
    page._fragmentTag = entry.fragmentTag;

    let currentNavigationContext;
    let navigationQueue = (<any>frame)._navigationQueue;
    for (let i = 0; i < navigationQueue.length; i++) {
        if (navigationQueue[i].entry === entry) {
            currentNavigationContext = navigationQueue[i];
            break;
        }
    }

    // onFragmentShown is called before NativeActivity.start where we call frame.onLoaded
    // We need to call frame.onLoaded() here so that the call to frame._addView(page) will emit the page.loaded event
    // before the page.navigatedTo event making the two platforms identical.
    if (!frame.isLoaded) {
        frame._currentEntry = entry;
        frame.onLoaded();
    }

    const isBack = currentNavigationContext ? currentNavigationContext.isBackNavigation : false;
    if (!isBack) {
        frame._addView(page);
    } else if (!page.isLoaded) {
        // Pages in backstack are unloaded so raise loaded here.
        page.onLoaded();
    }

    // Handle page transitions.
    transitionModule._onFragmentShown(fragment, isBack);
}

function onFragmentHidden(fragment: android.app.Fragment, destroyed: boolean) {
    if (traceEnabled()) {
        traceWrite(`HIDDEN ${fragment}; destroyed: ${destroyed}`, traceCategories.NativeLifecycle);
    }
    let callbacks: FragmentCallbacksImplementation = fragment[CALLBACKS];
    let isBack = callbacks.entry.isBack;
    callbacks.entry.isBack = undefined;
    callbacks.entry.resolvedPage._fragmentTag = undefined;

    // Handle page transitions.
    transitionModule._onFragmentHidden(fragment, isBack, destroyed);
}

export class Frame extends FrameBase {
    private _android: AndroidFrame;
    private _delayedNavigationEntry: BackstackEntry;
    private _containerViewId: number = -1;
    // private _listener: android.view.View.OnAttachStateChangeListener;

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

    private completeTransitioneNeeded: number = 0;

    public _processNavigationQueue(page: Page) {
        this.completeTransitioneNeeded--;
        if (this.completeTransitioneNeeded === 0) {
            super._processNavigationQueue(this.currentPage);
        }
    }

    @profile
    public _navigateCore(backstackEntry: BackstackEntry) {
        super._navigateCore(backstackEntry);

        let activity = this._android.activity;
        if (!activity) {
            // We do not have an Activity yet associated. In this case we have two execution paths:
            // 1. This is the main frame for the application
            // 2. This is an inner frame which requires a new Activity
            let currentActivity = this._android.currentActivity;
            if (currentActivity) {
                startActivity(currentActivity, this._android.frameId);
            }

            this._delayedNavigationEntry = backstackEntry;
            return;
        }

        let manager = activity.getFragmentManager();

        // Current Fragment
        let currentFragment: android.app.Fragment;
        if (this._currentEntry) {
            this._currentEntry.isNavigation = true;
            currentFragment = manager.findFragmentByTag(this._currentEntry.fragmentTag);
        }

        let clearHistory = backstackEntry.entry.clearHistory;

        // New Fragment
        if (clearHistory) {
            navDepth = -1;
        }

        navDepth++;
        fragmentId++;
        let newFragmentTag = `fragment${fragmentId}[${navDepth}]`;
        ensureFragmentClass();
        let newFragment: android.app.Fragment = new fragmentClass();
        let args = new android.os.Bundle();
        args.putInt(FRAMEID, this._android.frameId);
        newFragment.setArguments(args);
        setFragmentCallbacks(newFragment);

        let callbacks = newFragment[CALLBACKS];
        callbacks.frame = this;
        callbacks.entry = backstackEntry;

        // backstackEntry
        backstackEntry.isNavigation = true;
        backstackEntry.fragmentTag = newFragmentTag;
        backstackEntry.navDepth = navDepth;

        let fragmentTransaction = manager.beginTransaction();
        if (traceEnabled()) {
            traceWrite(`BEGIN TRANSACTION ${fragmentTransaction}`, traceCategories.Navigation);
        }

        // Transitions
        let animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        let navigationTransition = this._getNavigationTransition(backstackEntry.entry);
        if (currentFragment) {
            // There might be transitions left over from previous forward navigations from the current page.
            transitionModule._clearForwardTransitions(currentFragment);

            if (animated && navigationTransition) {
                const transitionCreated = transitionModule._setAndroidFragmentTransitions(this.android.cachePagesOnNavigate, navigationTransition, currentFragment, newFragment, fragmentTransaction);
                this.completeTransitioneNeeded = transitionCreated ? 2 : 1;
            }
        }

        // Clear History
        let length = manager.getBackStackEntryCount();
        let emptyNativeBackStack = clearHistory && length > 0;
        if (emptyNativeBackStack) {
            for (let i = 0; i < length; i++) {
                let fragmentToRemove = manager.findFragmentByTag(manager.getBackStackEntryAt(i).getName());
                Frame._clearHistory(fragmentToRemove);
            }

            if (currentFragment) {
                // We need to reverse the transitions because Android will ask the current fragment
                // to create its POP EXIT animator due to popping the back stack, but in reality
                // we need to create the EXIT animator because we are actually going forward and not back.
                transitionModule._prepareCurrentFragmentForClearHistory(currentFragment);
            }

            let firstEntryName = manager.getBackStackEntryAt(0).getName();
            if (traceEnabled()) {
                traceWrite(`POP BACK STACK ${firstEntryName}`, traceCategories.Navigation);
            }

            manager.popBackStackImmediate(firstEntryName, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }

        // remove current fragment if it exists and was not popped
        // We can afford to remove it because we keep the nativeView so
        // when added back we don't create new nativeView but use the existing.
        // This give us faster back navigation.
        if (currentFragment && !emptyNativeBackStack) {
            // if (this.android.cachePagesOnNavigate && !clearHistory) {
            //     if (traceEnabled()) {
            //         traceWrite(`\tHIDE ${currentFragment}`, traceCategories.Navigation);
            //     }
            //     fragmentTransaction.hide(currentFragment);
            // }
            // else {
            //     if (traceEnabled()) {
            //         traceWrite(`\tREMOVE ${currentFragment}`, traceCategories.Navigation);
            //     }
            fragmentTransaction.remove(currentFragment);
            // }
        }

        // Add newFragment
        if (traceEnabled()) {
            traceWrite(`\tADD ${newFragmentTag}<${callbacks.entry.resolvedPage}>`, traceCategories.Navigation);
        }
        fragmentTransaction.add(this.containerViewId, newFragment, newFragmentTag);

        // addToBackStack
        if (this.backStack.length > 0 && currentFragment && !clearHistory) {
            // We add each entry in the backstack to avoid the "Stack corrupted" mismatch
            if (traceEnabled()) {
                traceWrite(`\tADD TO BACK STACK ${currentFragment}`, traceCategories.Navigation);
            }
            fragmentTransaction.addToBackStack(this._currentEntry.fragmentTag);
        }

        if (currentFragment) {
            // This bug is fixed on API19+
            ensureAnimationFixed();
            let trans: number;
            if (this.android.cachePagesOnNavigate && animationFixed < 0 && !navigationTransition) {
                // Apparently, there is an Android bug with when hiding fragments with animation.
                // https://code.google.com/p/android/issues/detail?id=32405
                // When bug is fixed use animated variable.
                trans = android.app.FragmentTransaction.TRANSIT_NONE;
            }
            else {
                trans = animated ? android.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN : android.app.FragmentTransaction.TRANSIT_NONE;
            }
            if (traceEnabled()) {
                traceWrite(`\tSET TRANSITION ${trans === 0 ? "NONE" : "OPEN"}`, traceCategories.Navigation);
            }
            fragmentTransaction.setTransition(trans);
        }

        fragmentTransaction.commit();
        if (traceEnabled()) {
            traceWrite(`END TRANSACTION ${fragmentTransaction}`, traceCategories.Navigation);
        }
    }

    private static _clearHistory(fragment: android.app.Fragment) {
        if (traceEnabled()) {
            traceWrite(`CLEAR HISTORY FOR ${fragment}`, traceCategories.Navigation);
        }
        let callbacks: FragmentCallbacksImplementation = fragment[CALLBACKS];
        callbacks.clearHistory = true; // This is hacky
        transitionModule._clearBackwardTransitions(fragment);
        transitionModule._clearForwardTransitions(fragment);
        const page = callbacks.entry.resolvedPage;
        // transitionModule._removePageNativeViewFromAndroidParent(page);
        if (page.frame) {
            page.frame._removeView(page);
        }
    }

    public _goBackCore(backstackEntry: BackstackEntry) {
        super._goBackCore(backstackEntry);

        navDepth = backstackEntry.navDepth;

        backstackEntry.isNavigation = true;
        if (this._currentEntry) {
            // We need this information inside onFragmentHidden
            this._currentEntry.isBack = true;
            this._currentEntry.isNavigation = true;
        }

        const manager = this._android.activity.getFragmentManager();
        
        if (manager.getBackStackEntryCount() > 0) {
            // pop all other fragments up until the named one
            // this handles cases where user may navigate to an inner page without adding it on the backstack
            manager.popBackStack(backstackEntry.fragmentTag, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }
    }

    public createNativeView() {
        const root = new org.nativescript.widgets.ContentLayout(this._context);
        if (this._containerViewId < 0) {
            this._containerViewId = android.view.View.generateViewId();
        }
        return root;
    }

    public initNativeView(): void {
        super.initNativeView();
        this._android.rootViewGroup = this.nativeViewProtected;
        this._android.rootViewGroup.setId(this._containerViewId);
    }

    public disposeNativeView() {
        // we should keep the reference to underlying native object, since frame can contain many pages.
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

    public _printNativeBackStack() {
        if (!this._android.activity) {
            return;
        }
        const manager = this._android.activity.getFragmentManager();
        const length = manager.getBackStackEntryCount();
        let i = length - 1;
        console.log(`Fragment Manager Back Stack: `);
        while (i >= 0) {
            const fragment = manager.findFragmentByTag(manager.getBackStackEntryAt(i--).getName());
            console.log(`\t${fragment}`);
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

    protected _processNavigationContext(navigationContext: NavigationContext) {
        let activity = this._android.activity;
        if (activity) {
            let isForegroundActivity = activity === application.android.foregroundActivity;
            let isPaused = application.android.paused;

            if (activity && !isForegroundActivity || (isForegroundActivity && isPaused)) {
                let weakActivity = new WeakRef(activity);
                let resume = (args: application.AndroidActivityEventData) => {
                    let weakActivityInstance = weakActivity.get();
                    let isCurrent = args.activity === weakActivityInstance;
                    if (!weakActivityInstance) {
                        if (traceEnabled()) {
                            traceWrite(`Frame _processNavigationContext: Drop For Activity GC-ed`, traceCategories.Navigation);
                        }
                        unsubscribe();
                        return;
                    }
                    if (isCurrent) {
                        if (traceEnabled()) {
                            traceWrite(`Frame _processNavigationContext: Activity.Resumed, Continue`, traceCategories.Navigation);
                        }
                        super._processNavigationContext(navigationContext);
                        unsubscribe();
                    }
                };
                let unsubscribe = () => {
                    if (traceEnabled()) {
                        traceWrite(`Frame _processNavigationContext: Unsubscribe from Activity.Resumed`, traceCategories.Navigation);
                    }
                    application.android.off(application.AndroidApplication.activityResumedEvent, resume);
                    application.android.off(application.AndroidApplication.activityStoppedEvent, unsubscribe);
                    application.android.off(application.AndroidApplication.activityDestroyedEvent, unsubscribe);
                };

                if (traceEnabled()) {
                    traceWrite(`Frame._processNavigationContext: Subscribe for Activity.Resumed`, traceCategories.Navigation);
                }
                application.android.on(application.AndroidApplication.activityResumedEvent, resume);
                application.android.on(application.AndroidApplication.activityStoppedEvent, unsubscribe);
                application.android.on(application.AndroidApplication.activityDestroyedEvent, unsubscribe);
                return;
            }
        }
        super._processNavigationContext(navigationContext);
    }
}

let framesCounter = 0;
let framesCache: Array<WeakRef<AndroidFrame>> = new Array<WeakRef<AndroidFrame>>();

class AndroidFrame extends Observable implements AndroidFrameDefinition {
    public rootViewGroup: android.view.ViewGroup;
    public hasOwnActivity = false;
    public frameId;

    private _showActionBar = true;
    private _owner: Frame;
    private _cachePagesOnNavigate: boolean = true;

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

    public get cachePagesOnNavigate(): boolean {
        return this._cachePagesOnNavigate;
    }

    public set cachePagesOnNavigate(value: boolean) {
        if (this._cachePagesOnNavigate !== value) {
            if (this._owner.backStack.length > 0) {
                this._owner._printFrameBackStack();
                this._owner._printNativeBackStack();
                console.log(`currentPage: ${this._owner.currentPage}`);
                throw new Error("Cannot set cachePagesOnNavigate if there are items in the back stack.");
            }

            this._cachePagesOnNavigate = value;
        }
    }

    public canGoBack() {
        if (!this.activity) {
            return false;
        }

        // can go back only if it is not the main one.
        return this.activity.getIntent().getAction() !== android.content.Intent.ACTION_MAIN;
    }

    public fragmentForPage(page: Page): any {
        if (!page) {
            return undefined;
        }

        let tag = page._fragmentTag;
        if (tag) {
            let manager = this.activity.getFragmentManager();
            return manager.findFragmentByTag(tag);
        }

        return undefined;
    }
}

function findPageForFragment(fragment: android.app.Fragment, frame: Frame) {
    let fragmentTag = fragment.getTag();
    let page: Page;
    let entry: BackstackEntry;

    if (traceEnabled()) {
        traceWrite(`Finding page for ${fragmentTag}.`, traceCategories.NativeLifecycle);
    }

    if (fragmentTag === DIALOG_FRAGMENT_TAG) {
        if (traceEnabled()) {
            traceWrite(`No need to find page for dialog fragment.`, traceCategories.NativeLifecycle);
        }
        return;
    }

    if (frame._currentEntry && frame._currentEntry.fragmentTag === fragmentTag) {
        page = frame.currentPage;
        entry = frame._currentEntry;
        if (traceEnabled()) {
            traceWrite(`Current page matches fragment ${fragmentTag}.`, traceCategories.NativeLifecycle);
        }
    }
    else {
        const backStack = frame.backStack;
        for (let i = 0; i < backStack.length; i++) {
            if (backStack[i].fragmentTag === fragmentTag) {
                entry = backStack[i];
                break;
            }
        }
        if (entry) {
            page = entry.resolvedPage;
            if (traceEnabled()) {
                traceWrite(`Found ${page} for ${fragmentTag}`, traceCategories.NativeLifecycle);
            }
        }
    }

    if (page) {
        let callbacks: FragmentCallbacksImplementation = fragment[CALLBACKS];
        callbacks.frame = frame;
        callbacks.entry = entry;
    }
    else {
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

let animationFixed;
function ensureAnimationFixed() {
    if (!animationFixed) {
        // android.os.Build.VERSION.KITKAT but we don't have definition for it
        animationFixed = android.os.Build.VERSION.SDK_INT >= 19 ? 1 : -1;
    }
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
    public clearHistory: boolean;

    @profile
    public onHiddenChanged(fragment: android.app.Fragment, hidden: boolean, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onHiddenChanged(${hidden})`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment, hidden);
        if (hidden) {
            onFragmentHidden(fragment, false);
        }
        else {
            onFragmentShown(fragment);
        }
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

        let animator = transitionModule._onFragmentCreateAnimator(fragment, nextAnim);

        if (!animator) {
            animator = superFunc.call(fragment, transit, enter, nextAnim);
        }

        if (traceEnabled()) {
            traceWrite(`${fragment}.onCreateAnimator(${transit}, ${enter ? "enter" : "exit"}, ${nextAnimString}): ${animator}`, traceCategories.NativeLifecycle);
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
            let frameId = fragment.getArguments().getInt(FRAMEID);
            let frame = getFrameById(frameId);
            if (frame) {
                this.frame = frame;
            } else {
                throw new Error(`Cannot find Frame for ${fragment}`);
            }

            findPageForFragment(fragment, this.frame);
        }
    }

    @profile
    public onCreateView(fragment: android.app.Fragment, inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle, superFunc: Function): android.view.View {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onCreateView(inflater, container, ${savedInstanceState})`, traceCategories.NativeLifecycle);
        }

        const entry = this.entry;
        const page = entry.resolvedPage;
        try {
            if (savedInstanceState && savedInstanceState.getBoolean(HIDDEN, false)) {
                fragment.getFragmentManager().beginTransaction().hide(fragment).commit();
                this.frame._addView(page);
            } else {
                onFragmentShown(fragment);
            }
        } catch (ex) {
            const label = new android.widget.TextView(container.getContext());
            label.setText(ex.message + ", " + ex.stackTrace);
            return label;
        }

        return page.nativeViewProtected;
    }

    @profile
    public onSaveInstanceState(fragment: android.app.Fragment, outState: android.os.Bundle, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`${fragment}.onSaveInstanceState(${outState})`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment, outState);
        if (fragment.isHidden()) {
            outState.putBoolean(HIDDEN, true);
        }
    }

    @profile
    public onDestroyView(fragment: android.app.Fragment, superFunc: Function): void {
        const entry = this.entry;
        const page = entry.resolvedPage;
        console.log(`------------- ${page}.onDestroyView`);
        if (traceEnabled()) {
            traceWrite(`${fragment}.onDestroyView()`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment);

        // Detaching the page has been move in onFragmentHidden due to transitions.
        onFragmentHidden(fragment, false);
    }

    @profile
    public onDestroy(fragment: android.app.Fragment, superFunc: Function): void {
        const entry = this.entry;
        const page = entry.resolvedPage;
        console.log(`------------- ${page}.onDestroy`);

        if (traceEnabled()) {
            traceWrite(`${fragment}.onDestroy()`, traceCategories.NativeLifecycle);
        }
        superFunc.call(fragment);

        // Detaching the page has been move in onFragmentHidden due to transitions.
        onFragmentHidden(fragment, true);
    }

    @profile
    public toStringOverride(fragment: android.app.Fragment, superFunc: Function): string {
        return `${fragment.getTag()}<${this.entry ? this.entry.resolvedPage : ""}>`;
    }
}

class ActivityCallbacksImplementation implements AndroidActivityCallbacks {
    private _rootView: View;

    @profile
    public onCreate(activity: android.app.Activity, savedInstanceState: android.os.Bundle, superFunc: Function): void {
        if (traceEnabled()) {
            traceWrite(`Activity.onCreate(${savedInstanceState})`, traceCategories.NativeLifecycle);
        }

        const app = application.android;
        const intent = activity.getIntent();
        const launchArgs: application.LaunchEventData = { eventName: application.launchEvent, object: app, android: intent };
        application.notify(launchArgs);

        let frameId = -1;
        let rootView = launchArgs.root;
        const extras = intent.getExtras();

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

        // If we have frameId from extras - we are starting a new activity from navigation (e.g. new Frame().navigate()))
        // Then we check if we have frameId from savedInstanceState - this happens when Activity is destroyed but app was not (e.g. suspend)
        // Only then we fallback to the view returned from the event. This is done in order to have backwards compatibility (remove it for 2.0.0).
        let frame: Frame;
        let navParam;
        if (frameId >= 0) {
            rootView = getFrameById(frameId);
        }

        if (!rootView) {
            navParam = application.getMainEntry();

            if (navParam) {
                frame = new Frame();
            } else {
                // TODO: Throw an exception?
                throw new Error("A Frame must be used to navigate to a Page.");
            }

            rootView = frame;
        }

        // If there is savedInstanceState this call will recreate all fragments that were previously in the navigation.
        // We take care of associating them with a Page from our backstack in the onAttachFragment callback.
        // If there is savedInstanceState and activityInitialized is false we are restarted but process was killed.
        // For now we treat it like first run (e.g. we are not passing savedInstanceState so no fragments are being restored).
        // When we add support for application save/load state - revise this logic.
        let isRestart = !!savedInstanceState && activityInitialized;
        superFunc.call(activity, isRestart ? savedInstanceState : null);

        this._rootView = rootView;

        // Initialize native visual tree;
        rootView._setupUI(activity);
        activity.setContentView(rootView.nativeViewProtected, new org.nativescript.widgets.CommonLayoutParams());
        // frameId is negative w
        if (frame) {
            frame.navigate(navParam);
        }

        activityInitialized = true;
    }

    @profile
    public onSaveInstanceState(activity: android.app.Activity, outState: android.os.Bundle, superFunc: Function): void {
        superFunc.call(activity, outState);
        let view = this._rootView;
        if (view instanceof Frame) {
            outState.putInt(INTENT_EXTRA, view.android.frameId);
        }
    }

    @profile
    public onStart(activity: any, superFunc: Function): void {
        superFunc.call(activity);

        if (traceEnabled()) {
            traceWrite("NativeScriptActivity.onStart();", traceCategories.NativeLifecycle);
        }
        let rootView = this._rootView;
        if (rootView && !rootView.isLoaded) {
            rootView.onLoaded();
        }
    }

    @profile
    public onStop(activity: any, superFunc: Function): void {
        superFunc.call(activity);

        if (traceEnabled()) {
            traceWrite("NativeScriptActivity.onStop();", traceCategories.NativeLifecycle);
        }
        let rootView = this._rootView;
        if (rootView && rootView.isLoaded) {
            rootView.onUnloaded();
        }
    }

    @profile
    public onDestroy(activity: any, superFunc: Function): void {
        let rootView = this._rootView;
        if (rootView && rootView._context) {
            rootView._tearDownUI(true);
        }

        superFunc.call(activity);

        if (traceEnabled()) {
            traceWrite("NativeScriptActivity.onDestroy();", traceCategories.NativeLifecycle);
        }

        const exitArgs = { eventName: application.exitEvent, object: application.android, android: activity };
        application.notify(exitArgs);
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

        if (!goBack()) {
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

export function setActivityCallbacks(activity: android.app.Activity): void {
    activity[CALLBACKS] = new ActivityCallbacksImplementation();
}

export function setFragmentCallbacks(fragment: android.app.Fragment): void {
    fragment[CALLBACKS] = new FragmentCallbacksImplementation();
}
