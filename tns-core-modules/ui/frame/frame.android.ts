import definition = require("ui/frame");
import frameCommon = require("./frame-common");
import pages = require("ui/page");
import transitionModule = require("ui/transition");
import trace = require("trace");
import {View} from "ui/core/view";
import {Observable} from "data/observable";
import * as application from "application";
import * as types from "utils/types";

global.moduleMerge(frameCommon, exports);

let HIDDEN = "_hidden";
let INTENT_EXTRA = "com.tns.activity";
let FRAMEID = "_frameId";
let navDepth = -1;
let fragmentId = -1;
let activityInitialized = false;
const CALLBACKS = "_callbacks";

function onFragmentShown(fragment: android.app.Fragment) {
    if (trace.enabled) {
        trace.write(`SHOWN ${fragment}`, trace.categories.NativeLifecycle);
    }

    let callbacks: FragmentCallbacksImplementation = fragment[CALLBACKS];
    if (callbacks.clearHistory) {
        // This is the fragment which was at the bottom of the stack (fragment0) when we cleared history and called
        // manager.popBackStack(firstEntryName, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        if (trace.enabled) {
            trace.write(`${fragment} has been shown, but it is being cleared from history. Returning.`, trace.categories.NativeLifecycle);
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

    const isBack = currentNavigationContext ? currentNavigationContext.isBackNavigation : false;

    frame._addView(page);

    // onFragmentShown is called before NativeActivity.start where we call frame.onLoaded
    // We need to call frame.onLoaded() here so that the call to frame._addView(page) will emit the page.loaded event
    // before the page.navigatedTo event making the two platforms identical.
    if (!frame.isLoaded) {
        frame._currentEntry = entry;
        frame.onLoaded();
    }

    // Handle page transitions.
    transitionModule._onFragmentShown(fragment, isBack);
}

function onFragmentHidden(fragment: android.app.Fragment, destroyed: boolean) {
    if (trace.enabled) {
        trace.write(`HIDDEN ${fragment}; destroyed: ${destroyed}`, trace.categories.NativeLifecycle);
    }
    let callbacks: FragmentCallbacksImplementation = fragment[CALLBACKS];
    let isBack = callbacks.entry.isBack;
    callbacks.entry.isBack = undefined;
    callbacks.entry.resolvedPage._fragmentTag = undefined;

    // Handle page transitions.
    transitionModule._onFragmentHidden(fragment, isBack, destroyed);
}

export class Frame extends frameCommon.Frame {
    private _android: AndroidFrame;
    private _delayedNavigationEntry: definition.BackstackEntry;
    private _containerViewId: number = -1;
    private _listener: android.view.View.OnAttachStateChangeListener;
    constructor() {
        super();
        this._android = new AndroidFrame(this);
        this._listener = new android.view.View.OnAttachStateChangeListener({
            onViewAttachedToWindow: this.onNativeViewAttachedToWindow.bind(this),
            onViewDetachedFromWindow: this.onNativeViewDetachedToWindow.bind(this)
        });
    }

    public static get defaultAnimatedNavigation(): boolean {
        return frameCommon.Frame.defaultAnimatedNavigation;
    }
    public static set defaultAnimatedNavigation(value: boolean) {
        frameCommon.Frame.defaultAnimatedNavigation = value;
    }

    public static get defaultTransition(): definition.NavigationTransition {
        return frameCommon.Frame.defaultTransition;
    }
    public static set defaultTransition(value: definition.NavigationTransition) {
        frameCommon.Frame.defaultTransition = value;
    }

    get containerViewId(): number {
        return this._containerViewId;
    }

    get android(): AndroidFrame {
        return this._android;
    }

    get _nativeView(): any {
        return this._android.rootViewGroup;
    }

    public _navigateCore(backstackEntry: definition.BackstackEntry) {
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
        if (trace.enabled) {
            trace.write(`BEGIN TRANSACTION ${fragmentTransaction}`, trace.categories.Navigation);
        }

        // Transitions
        let animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        let navigationTransition = this._getNavigationTransition(backstackEntry.entry);
        if (currentFragment) {
            // There might be transitions left over from previous forward navigations from the current page.
            transitionModule._clearForwardTransitions(currentFragment);

            if (animated && navigationTransition) {
                transitionModule._setAndroidFragmentTransitions(navigationTransition, currentFragment, newFragment, fragmentTransaction);
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
            if (trace.enabled) {
                trace.write(`POP BACK STACK ${firstEntryName}`, trace.categories.Navigation);
            }
            manager.popBackStackImmediate(firstEntryName, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }

        // Hide/remove current fragment if it exists and was not popped
        if (currentFragment && !emptyNativeBackStack) {
            if (this.android.cachePagesOnNavigate && !clearHistory) {
                if (trace.enabled) {
                    trace.write(`\tHIDE ${currentFragment}`, trace.categories.Navigation);
                }
                fragmentTransaction.hide(currentFragment);
            }
            else {
                if (trace.enabled) {
                    trace.write(`\tREMOVE ${currentFragment}`, trace.categories.Navigation);
                }
                fragmentTransaction.remove(currentFragment);
            }
        }

        // Add newFragment
        if (trace.enabled) {
            trace.write(`\tADD ${newFragmentTag}<${callbacks.entry.resolvedPage}>`, trace.categories.Navigation);
        }
        fragmentTransaction.add(this.containerViewId, newFragment, newFragmentTag);

        // addToBackStack
        if (this.backStack.length > 0 && currentFragment && !clearHistory) {
            // We add each entry in the backstack to avoid the "Stack corrupted" mismatch
            if (trace.enabled) {
                trace.write(`\tADD TO BACK STACK ${currentFragment}`, trace.categories.Navigation);
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
            if (trace.enabled) {
                trace.write(`\tSET TRANSITION ${trans === 0 ? "NONE" : "OPEN"}`, trace.categories.Navigation);
            }
            fragmentTransaction.setTransition(trans);
        }

        fragmentTransaction.commit();
        if (trace.enabled) {
            trace.write(`END TRANSACTION ${fragmentTransaction}`, trace.categories.Navigation);
        }
    }

    private static _clearHistory(fragment: android.app.Fragment) {
        if (trace.enabled) {
            trace.write(`CLEAR HISTORY FOR ${fragment}`, trace.categories.Navigation);
        }
        let callbacks: FragmentCallbacksImplementation = fragment[CALLBACKS];
        callbacks.clearHistory = true; // This is hacky
        transitionModule._clearBackwardTransitions(fragment);
        transitionModule._clearForwardTransitions(fragment);
        transitionModule._removePageNativeViewFromAndroidParent(callbacks.entry.resolvedPage);
    }

    public _goBackCore(backstackEntry: definition.BackstackEntry) {
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

    public _createUI() {
        let root = new org.nativescript.widgets.ContentLayout(this._context);
        if (this._containerViewId < 0) {
            this._containerViewId = com.tns.View.generateViewId();
        }

        this._android.rootViewGroup = root;
        this._android.rootViewGroup.setId(this._containerViewId);
        this._android.rootViewGroup.addOnAttachStateChangeListener(this._listener);
    }

    private onNativeViewAttachedToWindow(view: android.view.View): void {
        if (this._delayedNavigationEntry) {
            this._navigateCore(this._delayedNavigationEntry);
            this._delayedNavigationEntry = undefined;
        }
    }

    private onNativeViewDetachedToWindow(view: android.view.View): void {
        // unused for the moment.
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

    public _clearAndroidReference() {
        this._android.rootViewGroup.removeOnAttachStateChangeListener(this._listener);
        // we should keep the reference to underlying native object, since frame can contain many pages.
        this._android.rootViewGroup = null;
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

    public _getNavBarVisible(page: pages.Page): boolean {
        if (types.isDefined(page.actionBarHidden)) {
            return !page.actionBarHidden;
        }

        if (this._android && types.isDefined(this._android.showActionBar)) {
            return this._android.showActionBar;
        }

        return true;
    }

    protected _processNavigationContext(navigationContext: frameCommon.NavigationContext) {
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
                        if (trace.enabled) {
                            trace.write(`Frame _processNavigationContext: Drop For Activity GC-ed`, trace.categories.Navigation);
                        }
                        unsubscribe();
                        return;
                    }
                    if (isCurrent) {
                        if (trace.enabled) {
                            trace.write(`Frame _processNavigationContext: Activity.Resumed, Continue`, trace.categories.Navigation);
                        }
                        super._processNavigationContext(navigationContext);
                        unsubscribe();
                    }
                };
                let unsubscribe = () => {
                    if (trace.enabled) {
                        trace.write(`Frame _processNavigationContext: Unsubscribe from Activity.Resumed`, trace.categories.Navigation);
                    }
                    application.android.off(application.AndroidApplication.activityResumedEvent, resume);
                    application.android.off(application.AndroidApplication.activityStoppedEvent, unsubscribe);
                    application.android.off(application.AndroidApplication.activityDestroyedEvent, unsubscribe);
                };

                if (trace.enabled) {
                    trace.write(`Frame._processNavigationContext: Subscribe for Activity.Resumed`, trace.categories.Navigation);
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

class AndroidFrame extends Observable implements definition.AndroidFrame {
    public rootViewGroup: android.view.ViewGroup;
    public hasOwnActivity = false;
    public frameId;

    private _showActionBar = true;
    private _owner: Frame;
    private _cachePagesOnNavigate: boolean;

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

        let stack = frameCommon.stack(),
            length = stack.length,
            i = length - 1,
            frame: definition.Frame;

        for (i; i >= 0; i--) {
            frame = stack[i];
            activity = frame.android.activity;
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

    public fragmentForPage(page: pages.Page): any {
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
    let page: pages.Page;
    let entry: definition.BackstackEntry;

    if (trace.enabled) {
        trace.write(`Finding page for ${fragmentTag}.`, trace.categories.NativeLifecycle);
    }

    if (fragmentTag === (<any>pages).DIALOG_FRAGMENT_TAG) {
        if (trace.enabled) {
            trace.write(`No need to find page for dialog fragment.`, trace.categories.NativeLifecycle);
        }
        return;
    }

    if (frame._currentEntry && frame._currentEntry.fragmentTag === fragmentTag) {
        page = frame.currentPage;
        entry = frame._currentEntry;
        if (trace.enabled) {
            trace.write(`Current page matches fragment ${fragmentTag}.`, trace.categories.NativeLifecycle);
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
            if (trace.enabled) {
                trace.write(`Found ${page} for ${fragmentTag}`, trace.categories.NativeLifecycle);
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

class FragmentCallbacksImplementation implements definition.AndroidFragmentCallbacks {
    public frame: Frame;
    public entry: definition.BackstackEntry;
    public clearHistory: boolean;

    public onHiddenChanged(fragment: android.app.Fragment, hidden: boolean, superFunc: Function): void {
        if (trace.enabled) {
            trace.write(`${fragment}.onHiddenChanged(${hidden})`, trace.categories.NativeLifecycle);
        }
        superFunc.call(fragment, hidden);
        if (hidden) {
            onFragmentHidden(fragment, false);
        }
        else {
            onFragmentShown(fragment);
        }
    }

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

        if (trace.enabled) {
            trace.write(`${fragment}.onCreateAnimator(${transit}, ${enter ? "enter" : "exit"}, ${nextAnimString}): ${animator}`, trace.categories.NativeLifecycle);
        }
        return animator;
    }

    public onCreate(fragment: android.app.Fragment, savedInstanceState: android.os.Bundle, superFunc: Function): void {
        if (trace.enabled) {
            trace.write(`${fragment}.onCreate(${savedInstanceState})`, trace.categories.NativeLifecycle);
        }

        superFunc.call(fragment, savedInstanceState);

        // There is no entry set to the fragment, so this must be destroyed fragment that was recreated by Android.
        // We should find its corresponding page in our backstack and set it manually.
        if (!this.entry) {
            let frameId = fragment.getArguments().getInt(FRAMEID);
            let frame = getFrameById(frameId);
            if (frame) {
                this.frame = frame;
            }
            else {
                throw new Error(`Cannot find Frame for ${fragment}`);
            }

            findPageForFragment(fragment, this.frame);
        }
    }

    public onCreateView(fragment: android.app.Fragment, inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle, superFunc: Function): android.view.View {
        if (trace.enabled) {
            trace.write(`${fragment}.onCreateView(inflater, container, ${savedInstanceState})`, trace.categories.NativeLifecycle);
        }
        const entry = this.entry;
        const page = entry.resolvedPage;
        if (savedInstanceState && savedInstanceState.getBoolean(HIDDEN, false)) {
            fragment.getFragmentManager().beginTransaction().hide(fragment).commit();
            page._onAttached(fragment.getActivity());
        }
        else {
            onFragmentShown(fragment);
        }

        return page._nativeView;
    }

    public onSaveInstanceState(fragment: android.app.Fragment, outState: android.os.Bundle, superFunc: Function): void {
        if (trace.enabled) {
            trace.write(`${fragment}.onSaveInstanceState(${outState})`, trace.categories.NativeLifecycle);
        }
        superFunc.call(fragment, outState);
        if (fragment.isHidden()) {
            outState.putBoolean(HIDDEN, true);
        }
    }

    public onDestroyView(fragment: android.app.Fragment, superFunc: Function): void {
        if (trace.enabled) {
            trace.write(`${fragment}.onDestroyView()`, trace.categories.NativeLifecycle);
        }
        superFunc.call(fragment);
        // Detaching the page has been move in onFragmentHidden due to transitions.
        onFragmentHidden(fragment, true);
    }

    public onDestroy(fragment: android.app.Fragment, superFunc: Function): void {
        if (trace.enabled) {
            trace.write(`${fragment}.onDestroy()`, trace.categories.NativeLifecycle);
        }
        superFunc.call(fragment);
    }

    public toStringOverride(fragment: android.app.Fragment, superFunc: Function): string {
        return `${fragment.getTag()}<${this.entry ? this.entry.resolvedPage : ""}>`;
    }
}

class ActivityCallbacksImplementation implements definition.AndroidActivityCallbacks {
    private _rootView: View;

    public onCreate(activity: android.app.Activity, savedInstanceState: android.os.Bundle, superFunc: Function): void {
        if (trace.enabled) {
            trace.write(`Activity.onCreate(${savedInstanceState})`, trace.categories.NativeLifecycle);
        }

        let app = application.android;
        let intent = activity.getIntent();
        if (application.onLaunch) {
            application.onLaunch(intent);
        }

        let launchArgs: application.LaunchEventData = { eventName: application.launchEvent, object: app, android: intent };
        application.notify(launchArgs);

        let frameId = -1;
        let rootView = launchArgs.root;
        let extras = intent.getExtras();

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
            navParam = application.mainEntry;
            if (!navParam) {
                navParam = application.mainModule;
            }

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
        rootView._onAttached(activity);
        activity.setContentView(rootView._nativeView, new org.nativescript.widgets.CommonLayoutParams());
        // frameId is negative w
        if (frame) {
            frame.navigate(navParam);
        }

        activityInitialized = true;
    }

    public onSaveInstanceState(activity: android.app.Activity, outState: android.os.Bundle, superFunc: Function): void {
        superFunc.call(activity, outState);
        let view = this._rootView;
        if (view instanceof Frame) {
            outState.putInt(INTENT_EXTRA, view.android.frameId);
        }
    }

    public onStart(activity: any, superFunc: Function): void {
        superFunc.call(activity);

        if (trace.enabled) {
            trace.write("NativeScriptActivity.onStart();", trace.categories.NativeLifecycle);
        }
        let rootView = this._rootView;
        if (rootView && !rootView.isLoaded) {
            rootView.onLoaded();
        }
    }

    public onStop(activity: any, superFunc: Function): void {
        superFunc.call(activity);

        if (trace.enabled) {
            trace.write("NativeScriptActivity.onStop();", trace.categories.NativeLifecycle);
        }
        let rootView = this._rootView;
        if (rootView && rootView.isLoaded) {
            rootView.onUnloaded();
        }
    }

    public onDestroy(activity: any, superFunc: Function): void {
        let rootView = this._rootView;
        if (rootView && rootView._context) {
            rootView._onDetached(true);
        }

        superFunc.call(activity);

        if (trace.enabled) {
            trace.write("NativeScriptActivity.onDestroy();", trace.categories.NativeLifecycle);
        }

        const exitArgs = { eventName: application.exitEvent, object: application.android, android: activity };
        application.notify(exitArgs);
        if (application.onExit) {
            application.onExit();
        }
    }

    public onBackPressed(activity: any, superFunc: Function): void {
        if (trace.enabled) {
            trace.write("NativeScriptActivity.onBackPressed;", trace.categories.NativeLifecycle);
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

        if (!frameCommon.goBack()) {
            superFunc.call(activity);
        }
    }

    public onRequestPermissionsResult(activity: any, requestCode: number, permissions: Array<String>, grantResults: Array<number>, superFunc: Function): void {
        if (trace.enabled) {
            trace.write("NativeScriptActivity.onRequestPermissionsResult;", trace.categories.NativeLifecycle);
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

    public onActivityResult(activity: any, requestCode: number, resultCode: number, data: android.content.Intent, superFunc: Function): void {
        superFunc.call(activity, requestCode, resultCode, data);
        if (trace.enabled) {
            trace.write(`NativeScriptActivity.onActivityResult(${requestCode}, ${resultCode}, ${data})`, trace.categories.NativeLifecycle);
        }

        const result = application.android.onActivityResult;
        if (result) {
            result(requestCode, resultCode, data);
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