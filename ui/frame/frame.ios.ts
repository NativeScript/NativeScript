import frameCommon = require("./frame-common");
import definition = require("ui/frame");
import trace = require("trace");
import {Page} from "ui/page";
import {NavigationBarVisibility, AnimationCurve} from "ui/enums";
import utils = require("utils/utils");
import {View} from "ui/core/view";
import uiUtils = require("ui/utils");
import * as types from "utils/types";
import application = require("application");
import * as _transitionModule from "ui/transition";

var transitionModule: typeof _transitionModule;

global.moduleMerge(frameCommon, exports);

var ENTRY = "_entry";
var NAV_DEPTH = "_navDepth";
var TRANSITION = "_transition";
var DELEGATE = "_delegate";
var navDepth = -1;

export class Frame extends frameCommon.Frame {
    private _ios: iOSFrame;
    private _paramToNavigate: any;
    public _animatedDelegate = <UINavigationControllerDelegate>UINavigationControllerAnimatedDelegate.new();

    public _shouldSkipNativePop: boolean = false;
    public _navigateToEntry: definition.BackstackEntry;
    public _widthMeasureSpec: number;
    public _heightMeasureSpec: number;
    public _right: number;
    public _bottom: number;
    public _isInitialNavigation: boolean = true;

    constructor() {
        super();
        this._ios = new iOSFrame(this);

        // When there is a 40px high "in-call" status bar, nobody moves the navigationBar top from 20 to 40 and it remains underneath the status bar.
        let frameRef = new WeakRef(this);
        application.ios.addNotificationObserver(UIApplicationDidChangeStatusBarFrameNotification, (notification: NSNotification) => {
            let frame = frameRef.get();
            if (frame) {
                frame._handleHigherInCallStatusBarIfNeeded();
                if (frame.currentPage) {
                    frame.currentPage.requestLayout();
                }
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
            this._isInitialNavigation = false;
        }
        else {
            this._paramToNavigate = param;
        }
    }

    public _navigateCore(backstackEntry: definition.BackstackEntry) {
        trace.write(`${this}._navigateCore(page: ${backstackEntry.resolvedPage}, backstackVisible: ${this._isEntryBackstackVisible(backstackEntry)}, clearHistory: ${backstackEntry.entry.clearHistory}), navDepth: ${navDepth}`, trace.categories.Navigation);
        let viewController: UIViewController = backstackEntry.resolvedPage.ios;
        if (!viewController) {
            throw new Error("Required page does not have a viewController created.");
        }

        navDepth++;

        let navigationTransition: definition.NavigationTransition;
        let animated = this.currentPage ? this._getIsAnimatedNavigation(backstackEntry.entry) : false;
        if (animated) {
            navigationTransition = this._getNavigationTransition(backstackEntry.entry);
            if (navigationTransition) {
                viewController[TRANSITION] = navigationTransition;
            }
        }
        else {
            //https://github.com/NativeScript/NativeScript/issues/1787
            viewController[TRANSITION] = { name: "non-animated" };
        }

        let nativeTransition = _getNativeTransition(navigationTransition, true);
        if (!nativeTransition && navigationTransition) {
            this._ios.controller.delegate = this._animatedDelegate;
            viewController[DELEGATE] = this._animatedDelegate;
        }
        else {
            viewController[DELEGATE] = null;
            this._ios.controller.delegate = null;
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
        trace.write(`${this}._goBackCore(page: ${backstackEntry.resolvedPage}, backstackVisible: ${this._isEntryBackstackVisible(backstackEntry)}, clearHistory: ${backstackEntry.entry.clearHistory}), navDepth: ${navDepth}`, trace.categories.Navigation);

        if (!this._shouldSkipNativePop) {
            var controller = backstackEntry.resolvedPage.ios;
            var animated = this._currentEntry ? this._getIsAnimatedNavigation(this._currentEntry.entry) : false;

            this._updateActionBar(backstackEntry.resolvedPage);
            trace.write(`${this}.popToViewControllerAnimated(${controller}, ${animated}); depth = ${navDepth}`, trace.categories.Navigation);
            this._ios.controller.popToViewControllerAnimated(controller, animated);
        }
    }

    public _updateActionBar(page?: Page): void {
        super._updateActionBar(page);

        var page = page || this.currentPage;
        var newValue = this._getNavBarVisible(page);

        this._ios.showNavigationBar = newValue;
        if (this._ios.controller.navigationBar) {
            this._ios.controller.navigationBar.userInteractionEnabled = this.navigationQueueIsEmpty();
        }
    }

    public _getNavBarVisible(page: Page): boolean {
        switch (this._ios.navBarVisibility) {
            case NavigationBarVisibility.always:
                return true;

            case NavigationBarVisibility.never:
                return false;

            case NavigationBarVisibility.auto:
                let newValue: boolean;

                if (page && types.isDefined(page.actionBarHidden)) {
                    newValue = !page.actionBarHidden;
                }
                else {
                    newValue = this.ios.controller.viewControllers.count > 1 || (page && page.actionBar && !page.actionBar._isEmpty());
                }

                newValue = !!newValue; // Make sure it is boolean
                return newValue;
        }
    }

    public get ios(): iOSFrame {
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

        let widthAndState = View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        let heightAndState = View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public measurePage(page: Page): { measuredWidth: number; measuredHeight: number } {
        // If background does not span under statusbar - reduce available height.
        let heightSpec: number = this._heightMeasureSpec;
        if (page && !page.backgroundSpanUnderStatusBar && !this.parent) {
            let height = utils.layout.getMeasureSpecSize(this._heightMeasureSpec);
            let heightMode = utils.layout.getMeasureSpecMode(this._heightMeasureSpec);
            let statusBarHeight = uiUtils.ios.getStatusBarHeight();
            heightSpec = utils.layout.makeMeasureSpec(height - statusBarHeight, heightMode);
        }

        return View.measureChild(this, page, this._widthMeasureSpec, heightSpec);
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

    public layoutPage(page: Page): void {
        if (page && (<any>page)._viewWillDisappear) {
            //https://github.com/NativeScript/NativeScript/issues/1201
            return;
        }

        // If background does not span under statusbar - reduce available height and adjust top offset.
        let statusBarHeight = (page && !page.backgroundSpanUnderStatusBar && !this.parent) ? uiUtils.ios.getStatusBarHeight() : 0;

        View.layoutChild(this, page, 0, statusBarHeight, this._right, this._bottom);
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

    public _onNavigatingTo(backstackEntry: definition.BackstackEntry, isBack: boolean) {
        //
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

let transitionDelegates = new Array<TransitionDelegate>();

class TransitionDelegate extends NSObject {
    private _id: string;

    public static initWithOwnerId(id: string): TransitionDelegate {
        let delegate = <TransitionDelegate>TransitionDelegate.new();
        delegate._id = id;
        transitionDelegates.push(delegate);

        return delegate;
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

        var index = transitionDelegates.indexOf(this);
        if (index > -1) {
            transitionDelegates.splice(index, 1);
        }
    }

    public static ObjCExposedMethods = {
        "animationWillStart": { returns: interop.types.void, params: [NSString, NSObject] },
        "animationDidStop": { returns: interop.types.void, params: [NSString, NSNumber, NSObject] }
    };
}

var _defaultTransitionDuration = 0.35;

class UINavigationControllerAnimatedDelegate extends NSObject implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    navigationControllerAnimationControllerForOperationFromViewControllerToViewController(
        navigationController: UINavigationController,
        operation: number,
        fromVC: UIViewController,
        toVC: UIViewController): UIViewControllerAnimatedTransitioning {

        let viewController: UIViewController;
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

        let navigationTransition = <definition.NavigationTransition>viewController[TRANSITION];
        if (!navigationTransition) {
            return null;
        }

        trace.write(`UINavigationControllerImpl.navigationControllerAnimationControllerForOperationFromViewControllerToViewController(${operation}, ${fromVC}, ${toVC}), transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);
        if (!transitionModule) {
            transitionModule = require("ui/transition");
        }

        let curve = _getNativeCurve(navigationTransition);
        let animationController = transitionModule._createIOSAnimatedTransitioning(navigationTransition, curve, operation, fromVC, toVC);
        return animationController;
    }
}

class UINavigationControllerImpl extends UINavigationController {
    private _owner: WeakRef<Frame>;

    public static initWithOwner(owner: WeakRef<Frame>): UINavigationControllerImpl {
        var controller = <UINavigationControllerImpl>UINavigationControllerImpl.new();
        controller._owner = owner;
        return controller;
    }

    get owner(): Frame {
        return this._owner.get();
    }

    public viewDidLoad(): void {
        super.viewDidLoad();
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

    private animateWithDuration(navigationTransition: definition.NavigationTransition,
        nativeTransition: UIViewAnimationTransition,
        transitionType: string,
        baseCallback: Function): void {

        let duration = navigationTransition.duration ? navigationTransition.duration / 1000 : _defaultTransitionDuration;
        let curve = _getNativeCurve(navigationTransition);

        let transitionTraced = trace.isCategorySet(trace.categories.Transition);
        let transitionDelegate: TransitionDelegate;
        if (transitionTraced) {
            let id = _getTransitionId(nativeTransition, transitionType);
            transitionDelegate = TransitionDelegate.initWithOwnerId(id);
        }

        UIView.animateWithDurationAnimations(duration, () => {
            if (transitionTraced) {
                UIView.setAnimationDelegate(transitionDelegate);
            }

            UIView.setAnimationWillStartSelector("animationWillStart");
            UIView.setAnimationDidStopSelector("animationDidStop");
            UIView.setAnimationCurve(curve);
            baseCallback();
            UIView.setAnimationTransitionForViewCache(nativeTransition, this.view, true);
        });
    }

    public pushViewControllerAnimated(viewController: UIViewController, animated: boolean): void {
        let navigationTransition = <definition.NavigationTransition>viewController[TRANSITION];
        trace.write(`UINavigationControllerImpl.pushViewControllerAnimated(${viewController}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);

        let nativeTransition = _getNativeTransition(navigationTransition, true);
        if (!animated || !navigationTransition || !nativeTransition) {
            super.pushViewControllerAnimated(viewController, animated);
            return;
        }

        this.animateWithDuration(navigationTransition, nativeTransition, "push", () => {
            super.pushViewControllerAnimated(viewController, false);
        });
    }

    public setViewControllersAnimated(viewControllers: NSArray, animated: boolean): void {
        var viewController = viewControllers.lastObject;
        var navigationTransition = <definition.NavigationTransition>viewController[TRANSITION];
        trace.write(`UINavigationControllerImpl.setViewControllersAnimated(${viewControllers}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);

        let nativeTransition = _getNativeTransition(navigationTransition, true);
        if (!animated || !navigationTransition || !nativeTransition) {
            super.setViewControllersAnimated(viewControllers, animated);
            return;
        }

        this.animateWithDuration(navigationTransition, nativeTransition, "set", () => {
            super.setViewControllersAnimated(viewControllers, false);
        });
    }

    public popViewControllerAnimated(animated: boolean): UIViewController {
        var lastViewController = this.viewControllers.lastObject;
        var navigationTransition = <definition.NavigationTransition>lastViewController[TRANSITION];
        trace.write(`UINavigationControllerImpl.popViewControllerAnimated(${animated}); transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);

        if (navigationTransition && navigationTransition.name === "non-animated") {
            //https://github.com/NativeScript/NativeScript/issues/1787
            return super.popViewControllerAnimated(false);
        }

        var nativeTransition = _getNativeTransition(navigationTransition, false);
        if (!animated || !navigationTransition || !nativeTransition) {
            return super.popViewControllerAnimated(animated);
        }

        this.animateWithDuration(navigationTransition, nativeTransition, "pop", () => {
            super.popViewControllerAnimated(false);
        });

        return null;
    }

    public popToViewControllerAnimated(viewController: UIViewController, animated: boolean): NSArray {
        let lastViewController = this.viewControllers.lastObject;
        let navigationTransition = <definition.NavigationTransition>lastViewController[TRANSITION];
        trace.write(`UINavigationControllerImpl.popToViewControllerAnimated(${viewController}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, trace.categories.NativeLifecycle);

        if (navigationTransition && navigationTransition.name === "non-animated") {
            //https://github.com/NativeScript/NativeScript/issues/1787
            return super.popToViewControllerAnimated(viewController, false);
        }

        let nativeTransition = _getNativeTransition(navigationTransition, false);
        if (!animated || !navigationTransition || !nativeTransition) {
            return super.popToViewControllerAnimated(viewController, animated);
        }

        this.animateWithDuration(navigationTransition, nativeTransition, "popTo", () => {
            super.popToViewControllerAnimated(viewController, false);
        });

        return null;
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
    if (navigationTransition && navigationTransition.name) {
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

export function _getNativeCurve(transition: definition.NavigationTransition): UIViewAnimationCurve {
    if (transition.curve) {
        switch (transition.curve) {
            case AnimationCurve.easeIn:
                trace.write("Transition curve resolved to UIViewAnimationCurve.UIViewAnimationCurveEaseIn.", trace.categories.Transition);
                return UIViewAnimationCurve.UIViewAnimationCurveEaseIn;
            case AnimationCurve.easeOut:
                trace.write("Transition curve resolved to UIViewAnimationCurve.UIViewAnimationCurveEaseOut.", trace.categories.Transition);
                return UIViewAnimationCurve.UIViewAnimationCurveEaseOut;
            case AnimationCurve.easeInOut:
                trace.write("Transition curve resolved to UIViewAnimationCurve.UIViewAnimationCurveEaseInOut.", trace.categories.Transition);
                return UIViewAnimationCurve.UIViewAnimationCurveEaseInOut;
            case AnimationCurve.linear:
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
    private _frame: Frame;

    constructor(frame: Frame) {
        this._frame = frame;
        this._controller = UINavigationControllerImpl.initWithOwner(new WeakRef(frame));
        this._controller.automaticallyAdjustsScrollViewInsets = false;
        //this.showNavigationBar = false;
        this._navBarVisibility = NavigationBarVisibility.auto;
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

        let animated = !this._frame._isInitialNavigation;
        this._controller.setNavigationBarHiddenAnimated(!value, animated);

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