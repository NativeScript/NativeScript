import frameCommon = require("./frame-common");
import definition = require("ui/frame");
import trace = require("trace");
import pages = require("ui/page");
import enums = require("ui/enums");
import utils = require("utils/utils");
import view = require("ui/core/view");
import uiUtils = require("ui/utils");
import * as types from "utils/types";
import * as animationModule from "ui/animation";
import * as transitionModule from "ui/transition";
import application = require("application");

global.moduleMerge(frameCommon, exports);

var ENTRY = "_entry";
var NAV_DEPTH = "_navDepth";
var TRANSITION = "_transition";
var navDepth = -1;

export class Frame extends frameCommon.Frame {
    private _ios: iOSFrame;
    private _paramToNavigate: any;

    public _shouldSkipNativePop: boolean = false;
    public _navigateToEntry: definition.BackstackEntry;
    public _widthMeasureSpec: number;
    public _heightMeasureSpec: number;
    public _right: number;
    public _bottom: number;

    constructor() {
        super();
        this._ios = new iOSFrame(this);
        
        // When there is a 40px high "in-call" status bar, nobody moves the navigationBar top from 20 to 40 and it remains underneath the status bar.
        var that = this;
        application.ios.addNotificationObserver(UIApplicationDidChangeStatusBarFrameNotification, (notification: NSNotification) => {
            that._handleHigherInCallStatusBarIfNeeded();
            if (this._ios.controller.owner.currentPage) {
                this._ios.controller.owner.currentPage.requestLayout();
            }
        });
    }

    public onLoaded() {
        super.onLoaded();

        if (this._paramToNavigate) {
            this.navigate(this._paramToNavigate);
            this._paramToNavigate = undefined;
        }
    }

    public navigate(param: any) {
        if (this.isLoaded) {
            super.navigate(param);
        }
        else {
            this._paramToNavigate = param;
        }
    }

    public _navigateCore(backstackEntry: definition.BackstackEntry) {
        trace.write(`${this}._navigateCore(pageId: ${backstackEntry.resolvedPage.id}, backstackVisible: ${this._isEntryBackstackVisible(backstackEntry) }, clearHistory: ${backstackEntry.entry.clearHistory}), navDepth: ${navDepth}`, trace.categories.Navigation);
        var viewController: UIViewController = backstackEntry.resolvedPage.ios;
        if (!viewController) {
            throw new Error("Required page does not have a viewController created.");
        }

        navDepth++;

        var animated = this.currentPage ? this._getIsAnimatedNavigation(backstackEntry.entry) : false;
        var navigationTransition = this._getNavigationTransition(backstackEntry.entry);
        if (animated && navigationTransition) {
            viewController[TRANSITION] = navigationTransition;
        }

        backstackEntry[NAV_DEPTH] = navDepth;
        viewController[ENTRY] = backstackEntry;

        this._updateActionBar(backstackEntry.resolvedPage);

        // First navigation.
        if (!this._currentEntry) {
            this._ios.controller.pushViewControllerAnimated(viewController, animated);
            trace.write(`${this}.pushViewControllerAnimated(${viewController}, ${animated}); depth = ${navDepth}`, trace.categories.Navigation);
            return;
        }

        // We should clear the entire history.
        if (backstackEntry.entry.clearHistory) {
            viewController.navigationItem.hidesBackButton = true;
            var newControllers = NSMutableArray.alloc().initWithCapacity(1);
            newControllers.addObject(viewController);
            this._ios.controller.setViewControllersAnimated(newControllers, animated);
            trace.write(`${this}.setViewControllersAnimated([${viewController}], ${animated}); depth = ${navDepth}`, trace.categories.Navigation);
            return;

        }

        // We should hide the current entry from the back stack.
        if (!this._isEntryBackstackVisible(this._currentEntry)) {
            var newControllers = NSMutableArray.alloc().initWithArray(this._ios.controller.viewControllers);
            if (newControllers.count === 0) {
                throw new Error("Wrong controllers count.");
            }

            // the code below fixes a phantom animation that appears on the Back button in this case
            // TODO: investigate why the animation happens at first place before working around it
            viewController.navigationItem.hidesBackButton = this.backStack.length === 0;

            // swap the top entry with the new one
            newControllers.removeLastObject();
            newControllers.addObject(viewController);

            // replace the controllers instead of pushing directly
            this._ios.controller.setViewControllersAnimated(newControllers, animated);
            trace.write(`${this}.setViewControllersAnimated([originalControllers - lastController + ${viewController}], ${animated}); depth = ${navDepth}`, trace.categories.Navigation);
            return;
        }

        // General case.
        this._ios.controller.pushViewControllerAnimated(viewController, animated);
        trace.write(`${this}.pushViewControllerAnimated(${viewController}, ${animated}); depth = ${navDepth}`, trace.categories.Navigation);
    }

    public _goBackCore(backstackEntry: definition.BackstackEntry) {
        navDepth = backstackEntry[NAV_DEPTH];
        trace.write(`${this}._goBackCore(pageId: ${backstackEntry.resolvedPage.id}, backstackVisible: ${this._isEntryBackstackVisible(backstackEntry) }, clearHistory: ${backstackEntry.entry.clearHistory}), navDepth: ${navDepth}`, trace.categories.Navigation);

        if (!this._shouldSkipNativePop) {
            var controller = backstackEntry.resolvedPage.ios;
            var animated = this._currentEntry ? this._getIsAnimatedNavigation(this._currentEntry.entry) : false;

            this._updateActionBar(backstackEntry.resolvedPage);
            trace.write(`${this}.popToViewControllerAnimated(${controller}, ${animated}); depth = ${navDepth}`, trace.categories.Navigation);
            this._ios.controller.popToViewControllerAnimated(controller, animated);
        }
    }

    public _updateActionBar(page?: pages.Page): void {
        super._updateActionBar(page);

        var page = page || this.currentPage;
        var newValue = this._getNavBarVisible(page);

        this._ios.showNavigationBar = newValue;
        if (this._ios.controller.navigationBar) {
            this._ios.controller.navigationBar.userInteractionEnabled = this.navigationQueueIsEmpty();
        }
    }

    public _getNavBarVisible(page: pages.Page): boolean {
        switch (this._ios.navBarVisibility) {
            case enums.NavigationBarVisibility.always:
                return true;

            case enums.NavigationBarVisibility.never:
                return false;

            case enums.NavigationBarVisibility.auto:
                let newValue: boolean;

                if (page && types.isDefined(page.actionBarHidden)) {
                    newValue = !page.actionBarHidden;
                }
                else {
                    newValue = this.backStack.length > 0 || (page && page.actionBar && !page.actionBar._isEmpty());
                }

                newValue = !!newValue; // Make sure it is boolean
                return newValue;
        }
    }

    public get ios(): definition.iOSFrame {
        return this._ios;
    }

    get _nativeView(): any {
        return this._ios.controller.view;
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

    public requestLayout(): void {
        super.requestLayout();
        // Invalidate our Window so that layout is triggered again.
        var window = this._nativeView.window;
        if (window) {
            window.setNeedsLayout();
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {

        let width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        let height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        this._widthMeasureSpec = widthMeasureSpec;
        this._heightMeasureSpec = heightMeasureSpec;

        let result = this.measurePage(this.currentPage);
        if (this._navigateToEntry && this.currentPage) {
            let newPageSize = this.measurePage(this._navigateToEntry.resolvedPage);
            result.measuredWidth = Math.max(result.measuredWidth, newPageSize.measuredWidth);
            result.measuredHeight = Math.max(result.measuredHeight, newPageSize.measuredHeight);
        }
        let widthAndState = view.View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        let heightAndState = view.View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public measurePage(page: pages.Page): { measuredWidth: number; measuredHeight: number } {
        // If background does not span under statusbar - reduce available height.
        let heightSpec: number = this._heightMeasureSpec;
        if (page && !page.backgroundSpanUnderStatusBar && !this.parent) {
            let height = utils.layout.getMeasureSpecSize(this._heightMeasureSpec);
            let heightMode = utils.layout.getMeasureSpecMode(this._heightMeasureSpec);
            let statusBarHeight = uiUtils.ios.getStatusBarHeight();
            heightSpec = utils.layout.makeMeasureSpec(height - statusBarHeight, heightMode);
        }

        return view.View.measureChild(this, page, this._widthMeasureSpec, heightSpec);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        this._right = right;
        this._bottom = bottom;
        this._handleHigherInCallStatusBarIfNeeded();
        this.layoutPage(this.currentPage);
        if (this._navigateToEntry && this.currentPage) {
            this.layoutPage(this._navigateToEntry.resolvedPage);
        }
    }

    public layoutPage(page: pages.Page): void {
        if (page && (<any>page)._viewWillDisappear) {
            //https://github.com/NativeScript/NativeScript/issues/1201
            return;
        }

        // If background does not span under statusbar - reduce available height and adjust top offset.
        let statusBarHeight = (page && !page.backgroundSpanUnderStatusBar && !this.parent) ? uiUtils.ios.getStatusBarHeight() : 0;

        view.View.layoutChild(this, page, 0, statusBarHeight, this._right, this._bottom);
    }

    public get navigationBarHeight(): number {
        var navigationBar = this._ios.controller.navigationBar;
        return (navigationBar && !this._ios.controller.navigationBarHidden) ? navigationBar.frame.size.height : 0;
    }

    public _setNativeViewFrame(nativeView: any, frame: any) {
        // HACK: The plugin https://github.com/hackiftekhar/IQKeyboardManager offsets our Frame's 'nativeView.frame.origin.y'
        // to a negative value so the currently focused TextField/TextView is always on the screen while the soft keyboard is showing.
        // Our Frame always wants to have an origin of {0, 0}, so if someone else has been playing with origin.x or origin.y do not bring it back to {0, 0}.
        if (nativeView.frame.size.width === frame.size.width && nativeView.frame.size.height === frame.size.height) {
            return;
        }

        super._setNativeViewFrame(nativeView, frame);
    }

    public remeasureFrame(): void {
        this.requestLayout();
        let window: UIWindow = this._nativeView.window;
        if (window) {
            window.layoutIfNeeded();
        }
    }

    _handleHigherInCallStatusBarIfNeeded() {
        let statusBarHeight = uiUtils.ios.getStatusBarHeight();
        if (!this._ios ||
            !this._ios.controller ||
            !this._ios.controller.navigationBar ||
            this._ios.controller.navigationBar.hidden ||
            this._ios.controller.navigationBar.frame.origin.y === statusBarHeight) {
            return;
        }

        trace.write(`Forcing navigationBar.frame.origin.y to ${statusBarHeight} due to a higher in-call status-bar`, trace.categories.Layout);
        this._ios.controller.navigationBar.autoresizingMask = UIViewAutoresizing.UIViewAutoresizingNone;
        this._ios.controller.navigationBar.removeConstraints((<any>this)._ios.controller.navigationBar.constraints);
        this._ios.controller.navigationBar.frame = CGRectMake(
            this._ios.controller.navigationBar.frame.origin.x,
            statusBarHeight,
            this._ios.controller.navigationBar.frame.size.width,
            this._ios.controller.navigationBar.frame.size.height);
    }
}

class TransitionDelegate extends NSObject {
    static new(): TransitionDelegate {
        return <TransitionDelegate>super.new();
    }

    private _owner: UINavigationControllerImpl;
    private _id: string;

    public initWithOwnerId(owner: UINavigationControllerImpl, id: string): TransitionDelegate {
        this._owner = owner;
        this._owner.transitionDelegates.push(this);
        this._id = id;
        return this;
    }

    public animationWillStart(animationID: string, context: any): void {
        trace.write(`START ${this._id}`, trace.categories.Transition);
    }

    public animationDidStop(animationID: string, finished: boolean, context: any): void {
        if (finished) {
            trace.write(`END ${this._id}`, trace.categories.Transition);
        }
        else {
            trace.write(`CANCEL ${this._id}`, trace.categories.Transition);
        }

        if (this._owner) {
            var index = this._owner.transitionDelegates.indexOf(this);
            if (index > -1) {
                this._owner.transitionDelegates.splice(index, 1);
            }
        }
    }

    public static ObjCExposedMethods = {
        "animationWillStart": { returns: interop.types.void, params: [NSString, NSObject] },
        "animationDidStop": { returns: interop.types.void, params: [NSString, NSNumber, NSObject] }
    };
}

var _defaultTransitionDuration = 0.35;
class UINavigationControllerImpl extends UINavigationController implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    private _owner: WeakRef<Frame>;
    private _transitionDelegates: Array<TransitionDelegate>;

    public static initWithOwner(owner: WeakRef<Frame>): UINavigationControllerImpl {
        var controller = <UINavigationControllerImpl>UINavigationControllerImpl.new();
        controller._owner = owner;
        controller._transitionDelegates = new Array<TransitionDelegate>();
        return controller;
    }

    get owner(): Frame {
        return this._owner.get();
    }

    get transitionDelegates(): Array<TransitionDelegate> {
        return this._transitionDelegates;
    }

    public viewDidLoad(): void {
        let owner = this._owner.get();
        if (owner) {
            owner.onLoaded();
        }
    }

    public viewDidLayoutSubviews(): void {
        let owner = this._owner.get();
        if (owner) {
            trace.write(this._owner + " viewDidLayoutSubviews, isLoaded = " + owner.isLoaded, trace.categories.ViewHierarchy);
            owner._updateLayout();
        }
    }

    public navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        trace.write(`UINavigationControllerImpl.navigationControllerWillShowViewControllerAnimated(${navigationController}, ${viewController}, ${animated})`, trace.categories.NativeLifecycle);
        // In this method we need to layout the new page otherwise page will be shown empty and update after that which is bad UX.
        let frame = this._owner.get();
        if (!frame) {
            return;
        }

        let newEntry: definition.BackstackEntry = viewController[ENTRY];
        let newPage = newEntry.resolvedPage;
        if (!newPage.parent) {
            if (!frame._currentEntry) {
                // First navigation
                frame._currentEntry = newEntry;
            }
            else {
                frame._navigateToEntry = newEntry;
            }

            frame._addView(newPage);
            frame.remeasureFrame();
        }
        else if (newPage.parent !== frame) {
            throw new Error("Page is already shown on another frame.");
        }

        newPage.actionBar.update();
        
        //HACK: https://github.com/NativeScript/NativeScript/issues/1021
        viewController["willShowCalled"] = true;
    }

    public navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        trace.write(`UINavigationControllerImpl.navigationControllerDidShowViewControllerAnimated(${navigationController}, ${viewController}, ${animated})`, trace.categories.NativeLifecycle);

        //HACK: https://github.com/NativeScript/NativeScript/issues/1021
        if (viewController["willShowCalled"] === undefined) {
            return;
        }
        else {
            viewController["willShowCalled"] = undefined;
        }

        let frame = this._owner.get();
        if (!frame) {
            return;
        }

        let newEntry: definition.BackstackEntry = viewController[ENTRY];
        let newPage = newEntry.resolvedPage;

        let backStack = frame.backStack;
        let currentEntry = backStack.length > 0 ? backStack[backStack.length - 1] : null;

        // This code check if navigation happened through UI (e.g. back button or swipe gesture).
        // When calling goBack on frame isBack will be false.
        let isBack: boolean = currentEntry && newEntry === currentEntry;

        let currentNavigationContext;
        let navigationQueue = (<any>frame)._navigationQueue;
        for (let i = 0; i < navigationQueue.length; i++) {
            if (navigationQueue[i].entry === newEntry) {
                currentNavigationContext = navigationQueue[i];
                break;
            }
        }

        let isBackNavigation = currentNavigationContext ? currentNavigationContext.isBackNavigation : false;

        if (isBack) {
            try {
                frame._shouldSkipNativePop = true;
                frame.goBack();
            }
            finally {
                frame._shouldSkipNativePop = false;
            }
        }

        let page = frame.currentPage;
        if (page && !navigationController.viewControllers.containsObject(page.ios)) {
            frame._removeView(page);
        }

        frame._navigateToEntry = null;
        frame._currentEntry = newEntry;
        frame.remeasureFrame();
        frame._updateActionBar(newPage);

        // notify the page
        newPage.onNavigatedTo(isBack || isBackNavigation);
        frame._processNavigationQueue(newPage);
    }

    public supportedInterfaceOrientation(): number {
        return UIInterfaceOrientationMask.UIInterfaceOrientationMaskAll;
    }

    public pushViewControllerAnimated(viewController: UIViewController, animated: boolean): void {
        var navigationTransition = <definition.NavigationTransition>viewController[TRANSITION];
        trace.write(`UINavigationControllerImpl.pushViewControllerAnimated(${viewController}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);

        if (!animated || !navigationTransition) {
            super.pushViewControllerAnimated(viewController, animated);
            return;
        }

        var nativeTransition = _getNativeTransition(navigationTransition, true);
        if (!nativeTransition) {
            super.pushViewControllerAnimated(viewController, animated);
            return;
        }

        var duration = navigationTransition.duration ? navigationTransition.duration / 1000 : _defaultTransitionDuration;
        var curve = _getNativeCurve(navigationTransition);
        var id = _getTransitionId(nativeTransition, "push");
        var transitionDelegate = TransitionDelegate.new().initWithOwnerId(this, id);
        UIView.animateWithDurationAnimations(duration, () => {
            UIView.setAnimationDelegate(transitionDelegate);
            UIView.setAnimationWillStartSelector("animationWillStart");
            UIView.setAnimationDidStopSelector("animationDidStop");
            UIView.setAnimationCurve(curve);
            super.pushViewControllerAnimated(viewController, false);
            UIView.setAnimationTransitionForViewCache(nativeTransition, this.view, true);
        });
    }

    public setViewControllersAnimated(viewControllers: NSArray, animated: boolean): void {
        var viewController = viewControllers.lastObject;
        var navigationTransition = <definition.NavigationTransition>viewController[TRANSITION];
        trace.write(`UINavigationControllerImpl.setViewControllersAnimated(${viewControllers}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);

        if (!animated || !navigationTransition) {
            super.setViewControllersAnimated(viewControllers, animated);
            return;
        }

        var nativeTransition = _getNativeTransition(navigationTransition, true);
        if (!nativeTransition) {
            super.setViewControllersAnimated(viewControllers, animated);
            return;
        }

        var duration = navigationTransition.duration ? navigationTransition.duration / 1000 : _defaultTransitionDuration;
        var curve = _getNativeCurve(navigationTransition);
        var id = _getTransitionId(nativeTransition, "set");
        var transitionDelegate = TransitionDelegate.new().initWithOwnerId(this, id);
        UIView.animateWithDurationAnimations(duration, () => {
            UIView.setAnimationDelegate(transitionDelegate);
            UIView.setAnimationWillStartSelector("animationWillStart");
            UIView.setAnimationDidStopSelector("animationDidStop");
            UIView.setAnimationCurve(curve);
            super.setViewControllersAnimated(viewControllers, false);
            UIView.setAnimationTransitionForViewCache(nativeTransition, this.view, true);
        });
    }

    public popViewControllerAnimated(animated: boolean): UIViewController {
        var lastViewController = this.viewControllers.lastObject;
        var navigationTransition = <definition.NavigationTransition>lastViewController[TRANSITION];
        trace.write(`UINavigationControllerImpl.popViewControllerAnimated(${animated}); transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);

        if (!animated || !navigationTransition) {
            return super.popViewControllerAnimated(animated);
        }

        var nativeTransition = _getNativeTransition(navigationTransition, false);
        if (!nativeTransition) {
            return super.popViewControllerAnimated(animated);
        }

        var duration = navigationTransition.duration ? navigationTransition.duration / 1000 : _defaultTransitionDuration;
        var curve = _getNativeCurve(navigationTransition);
        var id = _getTransitionId(nativeTransition, "pop");
        var transitionDelegate = TransitionDelegate.new().initWithOwnerId(this, id);
        UIView.animateWithDurationAnimations(duration, () => {
            UIView.setAnimationDelegate(transitionDelegate);
            UIView.setAnimationWillStartSelector("animationWillStart");
            UIView.setAnimationDidStopSelector("animationDidStop");
            UIView.setAnimationCurve(curve);
            super.popViewControllerAnimated(false);
            UIView.setAnimationTransitionForViewCache(nativeTransition, this.view, true);
        });
        return null;
    }

    public popToViewControllerAnimated(viewController: UIViewController, animated: boolean): NSArray {
        var lastViewController = this.viewControllers.lastObject;
        var navigationTransition = <definition.NavigationTransition>lastViewController[TRANSITION];
        trace.write(`UINavigationControllerImpl.popToViewControllerAnimated(${viewController}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);
        if (!animated || !navigationTransition) {
            return super.popToViewControllerAnimated(viewController, animated);
        }

        var nativeTransition = _getNativeTransition(navigationTransition, false);
        if (!nativeTransition) {
            return super.popToViewControllerAnimated(viewController, animated);
        }

        var duration = navigationTransition.duration ? navigationTransition.duration / 1000 : _defaultTransitionDuration;
        var curve = _getNativeCurve(navigationTransition);
        var id = _getTransitionId(nativeTransition, "popTo");
        var transitionDelegate = TransitionDelegate.new().initWithOwnerId(this, id);
        UIView.animateWithDurationAnimations(duration, () => {
            UIView.setAnimationDelegate(transitionDelegate);
            UIView.setAnimationWillStartSelector("animationWillStart");
            UIView.setAnimationDidStopSelector("animationDidStop");
            UIView.setAnimationCurve(curve);
            super.popToViewControllerAnimated(viewController, false);
            UIView.setAnimationTransitionForViewCache(nativeTransition, this.view, true);
        });
        return null;
    }

    public navigationControllerAnimationControllerForOperationFromViewControllerToViewController(navigationController: UINavigationController, operation: number, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
        var viewController: UIViewController;
        switch (operation) {
            case UINavigationControllerOperation.UINavigationControllerOperationPush:
                viewController = toVC;
                break;
            case UINavigationControllerOperation.UINavigationControllerOperationPop:
                viewController = fromVC;
                break;
        }

        if (!viewController) {
            return null;
        }

        var navigationTransition = <definition.NavigationTransition>viewController[TRANSITION];
        if (!navigationTransition) {
            return null;
        }

        trace.write(`UINavigationControllerImpl.navigationControllerAnimationControllerForOperationFromViewControllerToViewController(${operation}, ${fromVC}, ${toVC}), transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);
        var _transitionModule: typeof transitionModule = require("ui/transition");
        return _transitionModule._createIOSAnimatedTransitioning(navigationTransition, operation, fromVC, toVC);
    }
}

function _getTransitionId(nativeTransition: UIViewAnimationTransition, transitionType: string): string {
    var name;
    switch (nativeTransition) {
        case UIViewAnimationTransition.UIViewAnimationTransitionCurlDown: name = "CurlDown"; break;
        case UIViewAnimationTransition.UIViewAnimationTransitionCurlUp: name = "CurlUp"; break;
        case UIViewAnimationTransition.UIViewAnimationTransitionFlipFromLeft: name = "FlipFromLeft"; break;
        case UIViewAnimationTransition.UIViewAnimationTransitionFlipFromRight: name = "FlipFromRight"; break;
        case UIViewAnimationTransition.UIViewAnimationTransitionNone: name = "None"; break;
    }

    return `${name} ${transitionType}`;
}

function _getNativeTransition(navigationTransition: definition.NavigationTransition, push: boolean): UIViewAnimationTransition {
    if (navigationTransition.name) {
        switch (navigationTransition.name.toLowerCase()) {
            case "flip":
            case "flipright":
                return push ? UIViewAnimationTransition.UIViewAnimationTransitionFlipFromRight : UIViewAnimationTransition.UIViewAnimationTransitionFlipFromLeft;
            case "flipleft":
                return push ? UIViewAnimationTransition.UIViewAnimationTransitionFlipFromLeft : UIViewAnimationTransition.UIViewAnimationTransitionFlipFromRight;
            case "curl":
            case "curlup":
                return push ? UIViewAnimationTransition.UIViewAnimationTransitionCurlUp : UIViewAnimationTransition.UIViewAnimationTransitionCurlDown;
            case "curldown":
                return push ? UIViewAnimationTransition.UIViewAnimationTransitionCurlDown : UIViewAnimationTransition.UIViewAnimationTransitionCurlUp;
        }
    }
    return null;
}

export function _getNativeCurve(transition: definition.NavigationTransition) : UIViewAnimationCurve{
    if (transition.curve) {
      switch (transition.curve) {
          case enums.AnimationCurve.easeIn:
              trace.write("Transition curve resolved to UIViewAnimationCurve.UIViewAnimationCurveEaseIn.", trace.categories.Transition);
              return UIViewAnimationCurve.UIViewAnimationCurveEaseIn;
          case enums.AnimationCurve.easeOut:
              trace.write("Transition curve resolved to UIViewAnimationCurve.UIViewAnimationCurveEaseOut.", trace.categories.Transition);
              return UIViewAnimationCurve.UIViewAnimationCurveEaseOut;
          case enums.AnimationCurve.easeInOut:
              trace.write("Transition curve resolved to UIViewAnimationCurve.UIViewAnimationCurveEaseInOut.", trace.categories.Transition);
              return UIViewAnimationCurve.UIViewAnimationCurveEaseInOut;
          case enums.AnimationCurve.linear:
              trace.write("Transition curve resolved to UIViewAnimationCurve.UIViewAnimationCurveLinear.", trace.categories.Transition);
              return UIViewAnimationCurve.UIViewAnimationCurveLinear;
          default:
              trace.write("Transition curve resolved to original: " + transition.curve, trace.categories.Transition);
              return transition.curve;
      }
    }

    return UIViewAnimationCurve.UIViewAnimationCurveEaseInOut;
}

/* tslint:disable */
class iOSFrame implements definition.iOSFrame {
    /* tslint:enable */
    private _controller: UINavigationControllerImpl;
    private _showNavigationBar: boolean;
    private _navBarVisibility: string;

    constructor(owner: Frame) {
        this._controller = UINavigationControllerImpl.initWithOwner(new WeakRef(owner));
        this._controller.delegate = this._controller;
        this._controller.automaticallyAdjustsScrollViewInsets = false;
        //this.showNavigationBar = false;
        this._navBarVisibility = enums.NavigationBarVisibility.auto;
    }

    public get controller() {
        return this._controller;
    }

    public get showNavigationBar(): boolean {
        return this._showNavigationBar;
    }
    public set showNavigationBar(value: boolean) {
        var change = this._showNavigationBar !== value;
        this._showNavigationBar = value;
        this._controller.navigationBarHidden = !value;

        let currentPage = this._controller.owner.currentPage;
        if (currentPage && change) {
            currentPage.requestLayout();
        }
    }

    public get navBarVisibility(): string {
        return this._navBarVisibility;
    }
    public set navBarVisibility(value: string) {
        this._navBarVisibility = value;
    }
}
