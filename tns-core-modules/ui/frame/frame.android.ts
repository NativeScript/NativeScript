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

function onFragmentShown(fragment: FragmentClass) {
    if (trace.enabled) {
        trace.write(`SHOWN ${fragment}`, trace.categories.NativeLifecycle);
    }
    if (fragment.clearHistory) {
        // This is the fragment which was at the bottom of the stack (fragment0) when we cleared history and called
        // manager.popBackStack(firstEntryName, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        if (trace.enabled) {
            trace.write(`${fragment} has been shown, but it is being cleared from history. Returning.`, trace.categories.NativeLifecycle);
        }
        return null;
    }

    // TODO: consider putting entry and page in queue so we can safely extract them here. Pass the index of current navigation and extract it from here.
    // After extracting navigation info - remove this index from navigation stack.
    var frame = fragment.frame;
    var entry: definition.BackstackEntry = fragment.entry;
    var page: pages.Page = entry.resolvedPage;

    let currentNavigationContext;
    let navigationQueue = (<any>frame)._navigationQueue;
    for (let i = 0; i < navigationQueue.length; i++) {
        if (navigationQueue[i].entry === entry) {
            currentNavigationContext = navigationQueue[i];
            break;
        }
    }

    var isBack = currentNavigationContext ? currentNavigationContext.isBackNavigation : false;

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

function onFragmentHidden(fragment: FragmentClass, destroyed: boolean) {
    if (trace.enabled) {
        trace.write(`HIDDEN ${fragment}; destroyed: ${destroyed}`, trace.categories.NativeLifecycle);
    }

    var isBack = fragment.entry.isBack;
    fragment.entry.isBack = undefined;

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
        var currentFragment: FragmentClass;
        if (this._currentEntry) {
            this._currentEntry.isNavigation = true;
            currentFragment = <FragmentClass>manager.findFragmentByTag(this._currentEntry.fragmentTag);
        }

        let clearHistory = backstackEntry.entry.clearHistory;
        
        // New Fragment
        if (clearHistory) {
            navDepth = -1;
        }
        navDepth++;
        fragmentId++;
        var newFragmentTag = `fragment${fragmentId}[${navDepth}]`;
        let newFragment = new FragmentClass();
        let args = new android.os.Bundle();
        args.putInt(FRAMEID, this._android.frameId);
        newFragment.setArguments(args);
        newFragment.frame = this;
        newFragment.entry = backstackEntry;

        // backstackEntry
        backstackEntry.isNavigation = true;
        backstackEntry.fragmentTag = newFragmentTag;
        backstackEntry.navDepth = navDepth;

        // Clear History
        let length = manager.getBackStackEntryCount();
        let emptyNativeBackStack = clearHistory && length > 0; 
        if (emptyNativeBackStack) {
            for (let i = 0; i < length; i++) {
                let fragmentToRemove = <FragmentClass>manager.findFragmentByTag(manager.getBackStackEntryAt(i).getName());
                Frame._clearHistory(fragmentToRemove);
            }
            if (currentFragment) {
                Frame._clearHistory(currentFragment);
            }
            let firstEntryName = manager.getBackStackEntryAt(0).getName();
            if (trace.enabled) {
                trace.write(`POP BACK STACK ${firstEntryName}`, trace.categories.Navigation);
            }
            manager.popBackStackImmediate(firstEntryName, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }

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
            trace.write(`\tADD ${newFragmentTag}<${newFragment.entry.resolvedPage}>`, trace.categories.Navigation);
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
            if (this.android.cachePagesOnNavigate && animationFixed < 0) {
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

    private static _clearHistory(fragment: FragmentClass) {
        if (trace.enabled) {
            trace.write(`CLEAR HISTORY FOR ${fragment}`, trace.categories.Navigation);
        }
        fragment.clearHistory = true;
        transitionModule._clearBackwardTransitions(fragment);
        transitionModule._clearForwardTransitions(fragment);
        transitionModule._removePageNativeViewFromAndroidParent(fragment.entry.resolvedPage);
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

        var manager = this._android.activity.getFragmentManager();
        if (manager.getBackStackEntryCount() > 0) {
            // pop all other fragments up until the named one
            // this handles cases where user may navigate to an inner page without adding it on the backstack
            manager.popBackStack(backstackEntry.fragmentTag, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }
    }

    public _createUI() {
        let root = new org.nativescript.widgets.ContentLayout(this._context);
        if (this._containerViewId < 0) {
            this._containerViewId = android.view.View.generateViewId();
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
        var manager = this._android.activity.getFragmentManager();
        var length = manager.getBackStackEntryCount();
        var i = length - 1;
        console.log(`Fragment Manager Back Stack: `);
        while (i >= 0) {
            var fragment = manager.findFragmentByTag(manager.getBackStackEntryAt(i--).getName());
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
                        return
                    }
                    if (isCurrent) {
                        if (trace.enabled) {
                            trace.write(`Frame _processNavigationContext: Activity.Resumed, Continue`, trace.categories.Navigation);
                        }
                        super._processNavigationContext(navigationContext);
                        unsubscribe();
                    }
                }
                let unsubscribe = () => {
                    if (trace.enabled) {
                        trace.write(`Frame _processNavigationContext: Unsubscribe from Activity.Resumed`, trace.categories.Navigation);
                    }
                    application.android.off(application.AndroidApplication.activityResumedEvent, resume);
                    application.android.off(application.AndroidApplication.activityStoppedEvent, unsubscribe);
                    application.android.off(application.AndroidApplication.activityDestroyedEvent, unsubscribe);
                }

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

var framesCounter = 0;
var framesCache: Array<WeakRef<AndroidFrame>> = new Array<WeakRef<AndroidFrame>>();

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
}

function findPageForFragment(fragment: android.app.Fragment, frame: Frame) {
    var fragmentTag = fragment.getTag();
    var page: pages.Page;
    var entry: definition.BackstackEntry;

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
        var backStack = frame.backStack;
        for (var i = 0; i < backStack.length; i++) {
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
        (<any>fragment).frame = frame;
        (<any>fragment).entry = entry;
    }
    else {
        //throw new Error(`Could not find a page for ${fragmentTag}.`);
    }
}

function startActivity(activity: android.app.Activity, frameId: number) {
    var intent = new android.content.Intent(activity, (<any>com).tns.NativeScriptActivity.class);
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

var animationFixed;
function ensureAnimationFixed() {
    if (!animationFixed) {
        // android.os.Build.VERSION.KITKAT but we don't have definition for it
        animationFixed = android.os.Build.VERSION.SDK_INT >= 19 ? 1 : -1;
    }
}

@JavaProxy("com.tns.FragmentClass")
class FragmentClass extends android.app.Fragment {
    public frame: Frame;
    public entry: definition.BackstackEntry;
    public clearHistory: boolean;

    constructor() {
        super();
        return global.__native(this);
    }

    public onHiddenChanged(hidden: boolean): void {
        if (trace.enabled) {
            trace.write(`${this}.onHiddenChanged(${hidden})`, trace.categories.NativeLifecycle);
        }
        super.onHiddenChanged(hidden);
        if (hidden) {
            onFragmentHidden(this, false);
        }
        else {
            onFragmentShown(this);
        }
    }

    public onCreateAnimator(transit: number, enter: boolean, nextAnim: number): android.animation.Animator {
        var nextAnimString: string;
        switch (nextAnim) {
            case -10: nextAnimString = "enter"; break;
            case -20: nextAnimString = "exit"; break;
            case -30: nextAnimString = "popEnter"; break;
            case -40: nextAnimString = "popExit"; break;
        }

        var animator = transitionModule._onFragmentCreateAnimator(this, nextAnim);

        if (!animator) {
            animator = super.onCreateAnimator(transit, enter, nextAnim);
        }

        if (trace.enabled) {
            trace.write(`${this}.onCreateAnimator(${transit}, ${enter ? "enter" : "exit"}, ${nextAnimString}): ${animator}`, trace.categories.NativeLifecycle);
        }
        return animator;
    }

    public onCreate(savedInstanceState: android.os.Bundle): void {
        if (trace.enabled) {
            trace.write(`${this}.onCreate(${savedInstanceState})`, trace.categories.NativeLifecycle);
        }
        super.onCreate(savedInstanceState);
        super.setHasOptionsMenu(true);

        // There is no entry set to the fragment, so this must be destroyed fragment that was recreated by Android.
        // We should find its corresponding page in our backstack and set it manually.
        if (!this.entry) {
            let frameId = this.getArguments().getInt(FRAMEID);
            let frame = getFrameById(frameId);
            if (frame) {
                this.frame = frame;
            }
            else {
                throw new Error(`Cannot find Frame for ${this}`);
            }

            findPageForFragment(this, this.frame);
        }
    }

    public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle): android.view.View {
        if (trace.enabled) {
            trace.write(`${this}.onCreateView(inflater, container, ${savedInstanceState})`, trace.categories.NativeLifecycle);
        }
        var entry = this.entry;
        var page = entry.resolvedPage;
        if (savedInstanceState && savedInstanceState.getBoolean(HIDDEN, false)) {
            this.getFragmentManager().beginTransaction().hide(this).commit();
            page._onAttached(this.getActivity());
        }
        else {
            onFragmentShown(this);
        }

        return page._nativeView;
    }

    public onSaveInstanceState(outState: android.os.Bundle): void {
        if (trace.enabled) {
            trace.write(`${this}.onSaveInstanceState(${outState})`, trace.categories.NativeLifecycle);
        }
        super.onSaveInstanceState(outState);
        if (this.isHidden()) {
            outState.putBoolean(HIDDEN, true);
        }
    }

    public onDestroyView(): void {
        if (trace.enabled) {
            trace.write(`${this}.onDestroyView()`, trace.categories.NativeLifecycle);
        }
        super.onDestroyView();
        // Detaching the page has been move in onFragmentHidden due to transitions.
        onFragmentHidden(this, true);
    }

    public onDestroy(): void {
        if (trace.enabled) {
            trace.write(`${this}.onDestroy()`, trace.categories.NativeLifecycle);
        }
        super.onDestroy();

        this.entry.fragmentTag = undefined;
    }

    public toString(): string {
        return `${this.getTag()}<${this.entry ? this.entry.resolvedPage : ""}>`;
    }
}

@JavaProxy("com.tns.NativeScriptActivity")
class NativeScriptActivity extends android.app.Activity {
    private rootView: View;

    constructor() {
        super();
        return global.__native(this);
    }

    protected onCreate(savedInstanceState: android.os.Bundle): void {
        if (trace.enabled) {
            trace.write(`NativeScriptActivity.onCreate(${savedInstanceState})`, trace.categories.NativeLifecycle);
        }

        let app = application.android;
        let intent = this.getIntent();
        if (application.onLaunch) {
            application.onLaunch(intent);
        }

        let args: application.LaunchEventData = { eventName: application.launchEvent, object: app, android: intent };
        application.notify(args);

        let frameId = -1;
        let rootView = args.root;
        let extras = intent.getExtras();

        // We have extras when we call - new Frame().navigate();
        // savedInstanceState is used when activity is recreated.
        if (extras) {
            frameId = extras.getInt(INTENT_EXTRA, -1);
        }
        else if (savedInstanceState) {
            frameId = savedInstanceState.getInt(INTENT_EXTRA, -1)
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
        var isRestart = !!savedInstanceState && activityInitialized;
        super.onCreate(isRestart ? savedInstanceState : null);

        this.rootView = rootView;

        // Initialize native visual tree;
        rootView._onAttached(this);
        this.setContentView(rootView._nativeView, new org.nativescript.widgets.CommonLayoutParams());
        // frameId is negative w
        if (frame) {
            frame.navigate(navParam);
        }

        activityInitialized = true;
    }

    protected onSaveInstanceState(outState: android.os.Bundle): void {
        super.onSaveInstanceState(outState);
        let view = this.rootView;
        if (view instanceof Frame) {
            outState.putInt(INTENT_EXTRA, view.android.frameId);
        }
    }

    protected onStart(): void {
        super.onStart();
        if (trace.enabled) {
            trace.write("NativeScriptActivity.onStart();", trace.categories.NativeLifecycle);
        }
        let rootView = this.rootView
        if (rootView && !rootView.isLoaded) {
            rootView.onLoaded();
        }
    }

    protected onStop(): void {
        super.onStop();
        if (trace.enabled) {
            trace.write("NativeScriptActivity.onStop();", trace.categories.NativeLifecycle);
        }
        let rootView = this.rootView
        if (rootView && rootView.isLoaded) {
            rootView.onUnloaded();
        }
    }

    protected onDestroy(): void {
        let rootView = this.rootView
        if (rootView && rootView._context) {
            rootView._onDetached(true);
        }

        super.onDestroy();
        if (trace.enabled) {
            trace.write("NativeScriptActivity.onDestroy();", trace.categories.NativeLifecycle);
        }
    }

    public onBackPressed(): void {
        if (trace.enabled) {
            trace.write("NativeScriptActivity.onBackPressed;", trace.categories.NativeLifecycle);
        }

        var args = <application.AndroidActivityBackPressedEventData>{
            eventName: "activityBackPressed",
            object: application.android,
            activity: this,
            cancel: false,
        };
        application.android.notify(args);

        if (args.cancel) {
            return;
        }

        if (!frameCommon.goBack()) {
            super.onBackPressed();
        }
    }

    public onRequestPermissionsResult (requestCode: number, permissions: Array<String>, grantResults: Array<number>): void {
        if (trace.enabled) {
            trace.write("NativeScriptActivity.onRequestPermissionsResult;", trace.categories.NativeLifecycle);
        }

        application.android.notify(<application.AndroidActivityRequestPermissionsEventData>{
            eventName: "activityRequestPermissions",
            object: application.android,
            activity: this,
            requestCode: requestCode,
            permissions: permissions,
            grantResults: grantResults
        });
    }

    protected onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
        super.onActivityResult(requestCode, resultCode, data);
        if (trace.enabled) {
            trace.write(`NativeScriptActivity.onActivityResult(${requestCode}, ${resultCode}, ${data})`, trace.categories.NativeLifecycle);
        }

        var result = application.android.onActivityResult;
        if (result) {
            result(requestCode, resultCode, data);
        }

        application.android.notify(<application.AndroidActivityResultEventData>{
            eventName: "activityResult",
            object: application.android,
            activity: this,
            requestCode: requestCode,
            resultCode: resultCode,
            intent: data
        });
    }
}