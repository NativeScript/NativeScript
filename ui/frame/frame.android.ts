import definition = require("ui/frame");
import frameCommon = require("./frame-common");
import pages = require("ui/page");
import {View} from "ui/core/view";
import {Observable} from "data/observable";
import trace = require("trace");
import application = require("application");
import * as types from "utils/types";
import * as utils from "utils/utils";
import transitionModule = require("ui/transition");

global.moduleMerge(frameCommon, exports);

var TAG = "_fragmentTag";
var OWNER = "_owner";
var HIDDEN = "_hidden";
var INTENT_EXTRA = "com.tns.activity";
var ROOT_VIEW = "_rootView";
var BACKSTACK_TAG = "_backstackTag";
var IS_BACK = "_isBack";
var NAV_DEPTH = "_navDepth";
var CLEARING_HISTORY = "_clearingHistory";
var FRAMEID = "_frameId";

var navDepth = -1;

var activityInitialized = false;

var animationFixed;
function ensureAnimationFixed() {
    if (!animationFixed) {
        animationFixed = android.os.Build.VERSION.SDK_INT >= 19 // android.os.Build.VERSION.KITKAT but we don't have definition for it
            ? 1 : -1;
    }
}

var FragmentClass;
function ensureFragmentClass() {
    if (FragmentClass) {
        return;
    }

    FragmentClass = (<any>android.app.Fragment).extend({

        onCreate: function (savedInstanceState: android.os.Bundle) {
            trace.write(`${this.getTag()}.onCreate(${savedInstanceState})`, trace.categories.NativeLifecycle);
            this.super.onCreate(savedInstanceState);
            this.super.setHasOptionsMenu(true);

            // There is no entry set to the fragment, so this must be destroyed fragment that was recreated by Android.
            // We should find its corresponding page in our backstack and set it manually.
            if (!(<any>this).entry) {
                let frameId = (<android.app.Fragment>this).getArguments().getInt(FRAMEID);
                let frame = getFrameById(frameId);
                if (frame) {
                    this.frame = frame;
                }
                else {
                    throw new Error(`Cannot find Frame for ${this}`);
                }

                findPageForFragment(this, this.frame);
            }
        },

        onCreateView: function (inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle): android.view.View {
            trace.write(`${this.getTag()}.onCreateView(inflater, container, ${savedInstanceState})`, trace.categories.NativeLifecycle);
            var entry = this.entry;
            var page = entry.resolvedPage;
            if (savedInstanceState && savedInstanceState.getBoolean(HIDDEN, false)) {
                this.super.getFragmentManager().beginTransaction().hide(this).commit();
                page._onAttached(this.getActivity());
            }
            else {
                onFragmentShown(this);
            }

            return page._nativeView;
        },

        onHiddenChanged: function (hidden: boolean) {
            trace.write(`${this.getTag()}.onHiddenChanged(${hidden})`, trace.categories.NativeLifecycle);
            this.super.onHiddenChanged(hidden);
            if (hidden) {
                onFragmentHidden(this);
            }
            else {
                onFragmentShown(this);
            }
        },

        onSaveInstanceState: function (outState: android.os.Bundle) {
            trace.write(`${this.getTag()}.onSaveInstanceState(${outState})`, trace.categories.NativeLifecycle);
            this.super.onSaveInstanceState(outState);
            if (this.isHidden()) {
                outState.putBoolean(HIDDEN, true);
            }
        },

        onDestroyView: function () {
            trace.write(`${this.getTag()}.onDestroyView()`, trace.categories.NativeLifecycle);
            this.super.onDestroyView();
            onFragmentHidden(this);

            // When Fragment is destroyed we detach page even if cachePagesOnNavigate is true.
            let entry: definition.BackstackEntry = this.entry;
            let page = entry.resolvedPage;
            if (page._context) {
                page._onDetached(true);
            }
        },

        onDestroy: function () {
            trace.write(`${this.getTag()}.onDestroy()`, trace.categories.NativeLifecycle);
            this.super.onDestroy();
            utils.GC();
        },

        onCreateAnimator: function (transit: number, enter: boolean, nextAnim: number): android.animation.Animator {
            var animator = transitionModule._onFragmentCreateAnimator(this, nextAnim);

            if (!animator) {
                animator = this.super.onCreateAnimator(transit, enter, nextAnim);
            }

            trace.write(`${this.getTag()}.onCreateAnimator(${transit}, ${enter}, ${nextAnim}): ${animator}`, trace.categories.NativeLifecycle);
            return animator;
        }
    });
}

function onFragmentShown(fragment) {
    trace.write(`SHOWN ${fragment.getTag()}`, trace.categories.NativeLifecycle);
    if (fragment[CLEARING_HISTORY]) {
        trace.write(`${fragment.getTag()} has been shown, but we are currently clearing history. Returning.`, trace.categories.NativeLifecycle);
        return null;
    }

    // TODO: consider putting entry and page in queue so we can safely extract them here. Pass the index of current navigation and extract it from here.
    // After extracting navigation info - remove this index from navigation stack.
    var frame = fragment.frame;
    var entry: definition.BackstackEntry = fragment.entry;
    var page: pages.Page = entry.resolvedPage;

    let currentNavigationContext;
    let navigationQueue = frame._navigationQueue;
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

function onFragmentHidden(fragment) {
    trace.write(`HIDDEN ${fragment.getTag()}`, trace.categories.NativeLifecycle);

    if (fragment[CLEARING_HISTORY]) {
        trace.write(`${fragment.getTag()} has been hidden, but we are currently clearing history. Returning.`, trace.categories.NativeLifecycle);
        return null;
    }

    var isBack = fragment.entry[IS_BACK];
    fragment.entry[IS_BACK] = undefined;
    
    // Handle page transitions.
    transitionModule._onFragmentHidden(fragment, isBack);
}

export class Frame extends frameCommon.Frame {
    private _android: AndroidFrame;
    private _delayedNavigationEntry: definition.BackstackEntry;
    private _containerViewId: number;
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
        trace.write(`${this}._navigateCore(page: ${backstackEntry.resolvedPage}, backstackVisible: ${this._isEntryBackstackVisible(backstackEntry)}, clearHistory: ${backstackEntry.entry.clearHistory}), navDepth: ${navDepth}`, trace.categories.Navigation);

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

        // Clear history
        if (backstackEntry.entry.clearHistory) {
            let backStackEntryCount = manager.getBackStackEntryCount();
            let i = backStackEntryCount - 1;
            let fragment: android.app.Fragment;
            while (i >= 0) {
                fragment = manager.findFragmentByTag(manager.getBackStackEntryAt(i--).getName());
                trace.write(`${fragment.getTag()}[CLEARING_HISTORY] = true;`, trace.categories.NativeLifecycle);
                fragment[CLEARING_HISTORY] = true;
            }

            // Remember that the current fragment has never been added to the backStack, so mark it as well.
            if (this.currentPage) {
                fragment = manager.findFragmentByTag(this.currentPage[TAG]);
                if (fragment) {
                    fragment[CLEARING_HISTORY] = true;
                    trace.write(`${fragment.getTag()}[CLEARING_HISTORY] = true;`, trace.categories.NativeLifecycle);
                }
            }

            if (backStackEntryCount) {
                let firstEntryName = manager.getBackStackEntryAt(0).getName();
                trace.write(`manager.popBackStack(${firstEntryName}, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);`, trace.categories.NativeLifecycle);
                manager.popBackStack(firstEntryName, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
            }
            this._currentEntry = null;
            navDepth = -1;
        }

        navDepth++;

        let fragmentTransaction = manager.beginTransaction();

        var currentFragmentTag: string;
        var currentFragment: android.app.Fragment;
        if (this.currentPage) {
            currentFragmentTag = this.currentPage[TAG];
            currentFragment = manager.findFragmentByTag(currentFragmentTag);
        }

        var newFragmentTag = "fragment" + navDepth;
        ensureFragmentClass();
        let newFragment = new FragmentClass();

        let args = new android.os.Bundle();
        args.putInt(FRAMEID, this._android.frameId);
        newFragment.setArguments(args);

        var animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        var navigationTransition = this._getNavigationTransition(backstackEntry.entry);
        if (currentFragment) {
            // There might be transitions left over from previous forward navigations from the current page.
            transitionModule._clearForwardTransitions(currentFragment);
        }

        if (animated && navigationTransition) {
            transitionModule._setAndroidFragmentTransitions(navigationTransition, currentFragment, newFragment, fragmentTransaction);
        }

        newFragment.frame = this;
        newFragment.entry = backstackEntry;

        backstackEntry[BACKSTACK_TAG] = newFragmentTag;
        backstackEntry[NAV_DEPTH] = navDepth;

        // remember the fragment tag at page level so that we can retrieve the fragment associated with a Page instance
        backstackEntry.resolvedPage[TAG] = newFragmentTag;

        let isFirstNavigation = types.isNullOrUndefined(this._currentEntry);
        if (isFirstNavigation) {
            fragmentTransaction.add(this.containerViewId, newFragment, newFragmentTag);
            trace.write(`fragmentTransaction.add(${newFragmentTag});`, trace.categories.NativeLifecycle);
        }
        else {
            if (this.android.cachePagesOnNavigate && !backstackEntry.entry.clearHistory) {
                if (currentFragment) {
                    fragmentTransaction.hide(currentFragment);
                    trace.write(`fragmentTransaction.hide(${currentFragmentTag});`, trace.categories.NativeLifecycle);
                }
                else {
                    trace.write(`Could not find ${currentFragmentTag} to hide.`, trace.categories.NativeLifecycle);
                }

                fragmentTransaction.add(this.containerViewId, newFragment, newFragmentTag);
                trace.write(`fragmentTransaction.add(${newFragmentTag});`, trace.categories.NativeLifecycle);
            }
            else {
                fragmentTransaction.replace(this.containerViewId, newFragment, newFragmentTag);
                trace.write(`fragmentTransaction.replace(${newFragmentTag});`, trace.categories.NativeLifecycle);
            }

            // Add to backStack if needed.
            if (this.backStack.length > 0 && this._currentEntry) {
                // We add each entry in the backstack to avoid the "Stack corrupted" mismatch
                let backstackTag = this._currentEntry[BACKSTACK_TAG];
                fragmentTransaction.addToBackStack(backstackTag);
                trace.write(`fragmentTransaction.addToBackStack(${backstackTag});`, trace.categories.NativeLifecycle);
            }
        }

        if (!isFirstNavigation) {
            // This bug is fixed on API19+
            ensureAnimationFixed();
            if (this.android.cachePagesOnNavigate && animationFixed < 0) {
                // Apparently, there is an Android bug with when hiding fragments with animation.
                // https://code.google.com/p/android/issues/detail?id=32405
                // When bug is fixed use animated variable.
                fragmentTransaction.setTransition(android.app.FragmentTransaction.TRANSIT_NONE);
            }
            else {
                var transit = animated ? android.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN : android.app.FragmentTransaction.TRANSIT_NONE;
                fragmentTransaction.setTransition(transit);
            }
        }

        fragmentTransaction.commit();
        trace.write(`fragmentTransaction.commit();`, trace.categories.NativeLifecycle);
    }

    public _goBackCore(backstackEntry: definition.BackstackEntry) {
        navDepth = backstackEntry[NAV_DEPTH];

        if (this._currentEntry) {
            // We need this information inside onFragmentHidden
            this._currentEntry[IS_BACK] = true;
        }

        trace.write(`${this}._goBackCore(pageId: ${backstackEntry.resolvedPage.id}, backstackVisible: ${this._isEntryBackstackVisible(backstackEntry)}, clearHistory: ${backstackEntry.entry.clearHistory}), navDepth: ${navDepth}`, trace.categories.Navigation);

        var manager = this._android.activity.getFragmentManager();
        if (manager.getBackStackEntryCount() > 0) {
            // pop all other fragments up until the named one
            // this handles cases where user may navigate to an inner page without adding it on the backstack
            manager.popBackStack(backstackEntry[BACKSTACK_TAG], android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }
    }

    public _createUI() {
        let root = new org.nativescript.widgets.ContentLayout(this._context);
        this._containerViewId = android.view.View.generateViewId();
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
        console.log("---------------------------");
        console.log("Fragment Manager Back Stack (" + length + ")");
        while (i >= 0) {
            var fragment = <any>manager.findFragmentByTag(manager.getBackStackEntryAt(i--).getName());
            console.log("[ " + fragment.getTag() + " ]");
        }
    }

    public _printFrameBackStack() {
        var length = this.backStack.length;
        var i = length - 1;
        console.log("---------------------------");
        console.log("Frame Back Stack (" + length + ")");
        while (i >= 0) {
            var backstackEntry = <definition.BackstackEntry>this.backStack[i--];
            console.log("[ " + backstackEntry.resolvedPage.id + " ]");
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
}

var NativeActivity = {

    get rootView(): View {
        return this[ROOT_VIEW];
    },

    onCreate: function (savedInstanceState: android.os.Bundle) {
        trace.write(`NativeScriptActivity.onCreate(${savedInstanceState})`, trace.categories.NativeLifecycle);

        let app = application.android;
        let activity: android.app.Activity = this;
        let intent = activity.getIntent();
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
        else if (!rootView) {
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
        this.super.onCreate(isRestart ? savedInstanceState : null);

        this[ROOT_VIEW] = rootView;

        // Initialize native visual tree;
        rootView._onAttached(this);
        this.setContentView(rootView._nativeView, new org.nativescript.widgets.CommonLayoutParams());
        // frameId is negative w
        if (frame) {
            frame.navigate(navParam);
        }

        activityInitialized = true;
        // TODO: If the above fails because we call fragmentManager.beginTransition().commit() before
        // we are added as content to activity - add if (rootview instanceof Frame) -> call navigate
        //this.frame._onActivityCreated(isRestart);
    },

    onSaveInstanceState(outState: android.os.Bundle): void {
        this.super.onSaveInstanceState(outState);
        let view = this.rootView;
        if (view instanceof Frame) {
            outState.putInt(INTENT_EXTRA, (<Frame>view).android.frameId);
        }
    },

    onActivityResult: function (requestCode: number, resultCode: number, data: android.content.Intent) {
        this.super.onActivityResult(requestCode, resultCode, data);
        trace.write(`NativeScriptActivity.onActivityResult(${requestCode}, ${resultCode}, ${data})`, trace.categories.NativeLifecycle);

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
    },

    onStart: function () {
        this.super.onStart();
        trace.write("NativeScriptActivity.onStart();", trace.categories.NativeLifecycle);
        let rootView: View = this.rootView
        if (rootView && !rootView.isLoaded) {
            rootView.onLoaded();
        }
    },

    onStop: function () {
        this.super.onStop();
        trace.write("NativeScriptActivity.onStop();", trace.categories.NativeLifecycle);
        let rootView: View = this.rootView
        if (rootView && rootView.isLoaded) {
            rootView.onUnloaded();
        }
    },

    onDestroy: function () {
        let rootView: View = this.rootView
        if (rootView && rootView._context) {
            rootView._onDetached(true);
        }

        this.super.onDestroy();
        trace.write("NativeScriptActivity.onDestroy();", trace.categories.NativeLifecycle);
    },

    onBackPressed: function () {
        trace.write("NativeScriptActivity.onBackPressed;", trace.categories.NativeLifecycle);

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
            this.super.onBackPressed();
        }
    },

    onLowMemory: function () {
        trace.write("NativeScriptActivity.onLowMemory()", trace.categories.NativeLifecycle);
        gc();
        java.lang.System.gc();
        this.super.onLowMemory();

        application.notify(<application.ApplicationEventData>{ eventName: application.lowMemoryEvent, object: this, android: this });
    },

    onTrimMemory: function (level: number) {
        trace.write(`NativeScriptActivity.onTrimMemory(${level})`, trace.categories.NativeLifecycle);
        gc();
        java.lang.System.gc();
        this.super.onTrimMemory(level);
    }
};

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

    trace.write(`Finding page for ${fragmentTag}.`, trace.categories.NativeLifecycle);
    if (fragmentTag === (<any>pages).DIALOG_FRAGMENT_TAG) {
        trace.write(`No need to find page for dialog fragment.`, trace.categories.NativeLifecycle);
        return;
    }

    if (frame.currentPage && frame.currentPage[TAG] === fragmentTag) {
        page = frame.currentPage;
        entry = frame._currentEntry;
        trace.write(`Current page matches fragment ${fragmentTag}.`, trace.categories.NativeLifecycle);
    }
    else {
        var backStack = frame.backStack;
        for (var i = 0; i < backStack.length; i++) {
            if (backStack[i].resolvedPage[TAG] === fragmentTag) {
                entry = backStack[i];
                break;
            }
        }
        if (entry) {
            page = entry.resolvedPage;
            trace.write(`Found ${page} for ${fragmentTag}`, trace.categories.NativeLifecycle);
        }
    }

    if (page) {
        (<any>fragment).frame = frame;
        (<any>fragment).entry = entry;

        page[TAG] = fragmentTag;
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

export function getActivity(): Object {
    return NativeActivity;
}