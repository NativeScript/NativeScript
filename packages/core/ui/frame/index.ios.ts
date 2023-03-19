//Types
import { iOSFrame as iOSFrameDefinition, BackstackEntry, NavigationTransition } from '.';
import { FrameBase, NavigationType } from './frame-common';
import { Page } from '../page';
import { View } from '../core/view';
import { _createIOSAnimatedTransitioning } from './fragment.transitions';
import { IOSHelper } from '../core/view/view-helper';
import { Screen } from '../../platform';
import { profile } from '../../profiling';
import { iOSNativeHelper, layout } from '../../utils';
import { isNumber } from '../../utils/types';
import { Trace } from '../../trace';
import type { PageTransition } from '../transition/page-transition';
import { SharedTransition } from '../transition/shared-transition';
import { GestureStateTypes, PanGestureEventData } from '../gestures';

export * from './frame-common';

const majorVersion = iOSNativeHelper.MajorVersion;

const ENTRY = '_entry';
const DELEGATE = '_delegate';
const NAV_DEPTH = '_navDepth';
const TRANSITION = '_transition';
const NON_ANIMATED_TRANSITION = 'non-animated';

let navDepth = -1;

export class Frame extends FrameBase {
	viewController: UINavigationControllerImpl;
	_animatedDelegate: UINavigationControllerDelegate;
	transitionInteractiveCtrl: UIPercentDrivenInteractiveTransition;
	public _ios: iOSFrame;
	private _interactiveDismissGesture: (args: PanGestureEventData) => void;

	constructor() {
		super();
		this._ios = new iOSFrame(this);
		this.viewController = this._ios.controller;
	}

	createNativeView() {
		return this.viewController.view;
	}

	public disposeNativeView() {
		this._removeFromFrameStack();
		this.viewController = null;
		this._animatedDelegate = null;
		if (this._ios) {
			this._ios.controller = null;
			this._ios = null;
		}

		super.disposeNativeView();
	}

	// @ts-ignore
	public get ios(): iOSFrame {
		return this._ios;
	}

	public setCurrent(entry: BackstackEntry, navigationType: NavigationType): void {
		const current = this._currentEntry;
		const currentEntryChanged = current !== entry;
		if (entry?.resolvedPage && currentEntryChanged) {
			this._updateBackstack(entry, navigationType);

			super.setCurrent(entry, navigationType);
		}
	}

	// !!! THIS PROFILE DECORATOR CREATES A CIRCULAR DEPENDENCY
	// !!! BECAUSE THE PARAMETER TYPE IS EVALUATED WITH TYPEOF
	@profile
	public _navigateCore(backstackEntry: any) {
		super._navigateCore(backstackEntry);

		const viewController: UIViewController = backstackEntry.resolvedPage.ios;
		if (!viewController) {
			throw new Error('Required page does not have a viewController created.');
		}

		const clearHistory = backstackEntry.entry.clearHistory;
		if (clearHistory) {
			navDepth = -1;
		}

		const isReplace = this._executingContext && this._executingContext.navigationType === NavigationType.replace;
		if (!isReplace) {
			navDepth++;
		}

		let navigationTransition: NavigationTransition;
		const animated = this.currentPage ? this._getIsAnimatedNavigation(backstackEntry.entry) : false;
		if (animated) {
			navigationTransition = this._getNavigationTransition(backstackEntry.entry);
			if (navigationTransition) {
				viewController[TRANSITION] = navigationTransition;
			}
		} else {
			//https://github.com/NativeScript/NativeScript/issues/1787
			viewController[TRANSITION] = { name: NON_ANIMATED_TRANSITION };
		}

		const nativeTransition = _getNativeTransition(navigationTransition, true);
		if (!nativeTransition && navigationTransition) {
			if (!this._animatedDelegate) {
				this._animatedDelegate = <UINavigationControllerDelegate>UINavigationControllerAnimatedDelegate.initWithOwner(new WeakRef(this));
			}
			this._ios.controller.delegate = this._animatedDelegate;
			viewController[DELEGATE] = this._animatedDelegate;
			const transitionState = SharedTransition.getState(navigationTransition.instance.id);
			if (transitionState?.interactive?.dismiss) {
				this._updateInteractiveTransition({
					options: transitionState?.interactive?.dismiss,
				});
				// interactive transitions via gestures
				// TODO - allow users to define their own custom gesture dismissals
				this._interactiveDismissGesture = this._interactiveDismissGestureHandler.bind(this);
				this.on('pan', this._interactiveDismissGesture);
			}
		} else {
			viewController[DELEGATE] = null;
			this._ios.controller.delegate = null;
		}

		backstackEntry[NAV_DEPTH] = navDepth;
		viewController[ENTRY] = backstackEntry;

		if (!animated && majorVersion > 10) {
			// Reset back button title before pushing view controller to prevent
			// displaying default 'back' title (when NavigaitonButton custom title is set).
			const barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction('', UIBarButtonItemStyle.Plain, null, null);
			viewController.navigationItem.backBarButtonItem = barButtonItem;
		}

		// First navigation.
		if (!this._currentEntry) {
			// Update action-bar with disabled animations before the initial navigation.
			this._updateActionBar(backstackEntry.resolvedPage, true);
			// Core defaults modalPresentationStyle to 1 for standard frame navigation
			// for all others, it's modal presentation
			this.pushViewControllerAnimated(viewController, animated, this._ios?.controller?.modalPresentationStyle !== 1);
			if (Trace.isEnabled()) {
				Trace.write(`${this}.pushViewControllerAnimated(${viewController}, ${animated}); depth = ${navDepth}`, Trace.categories.Navigation);
			}

			return;
		}

		// We should clear the entire history.
		if (clearHistory) {
			viewController.navigationItem.hidesBackButton = true;
			const newControllers = NSMutableArray.alloc().initWithCapacity(1);
			newControllers.addObject(viewController);

			// Mark all previous ViewControllers as cleared
			const oldControllers = this._ios.controller.viewControllers;
			for (let i = 0; i < oldControllers.count; i++) {
				(<any>oldControllers.objectAtIndex(i)).isBackstackCleared = true;
			}

			this._ios.controller.setViewControllersAnimated(newControllers, animated);
			if (Trace.isEnabled()) {
				Trace.write(`${this}.setViewControllersAnimated([${viewController}], ${animated}); depth = ${navDepth}`, Trace.categories.Navigation);
			}

			return;
		}

		// We should hide the current entry from the back stack.
		// This is the case for HMR when NavigationType.replace.
		if (!Frame._isEntryBackstackVisible(this._currentEntry) || isReplace) {
			const newControllers = NSMutableArray.alloc<UIViewController>().initWithArray(this._ios.controller.viewControllers);
			if (newControllers.count === 0) {
				throw new Error('Wrong controllers count.');
			}

			// the code below fixes a phantom animation that appears on the Back button in this case
			// TODO: investigate why the animation happens at first place before working around it
			viewController.navigationItem.hidesBackButton = this.backStack.length === 0;

			// swap the top entry with the new one
			const skippedNavController = newControllers.lastObject;
			(<any>skippedNavController).isBackstackSkipped = true;
			newControllers.removeLastObject();
			newControllers.addObject(viewController);

			// replace the controllers instead of pushing directly
			this._ios.controller.setViewControllersAnimated(newControllers, animated);
			if (Trace.isEnabled()) {
				Trace.write(`${this}.setViewControllersAnimated([originalControllers - lastController + ${viewController}], ${animated}); depth = ${navDepth}`, Trace.categories.Navigation);
			}

			return;
		}

		// General case.
		this._ios.controller.pushViewControllerAnimated(viewController, animated);
		if (Trace.isEnabled()) {
			Trace.write(`${this}.pushViewControllerAnimated(${viewController}, ${animated}); depth = ${navDepth}`, Trace.categories.Navigation);
		}
	}

	private _interactiveDismissGestureHandler(args: PanGestureEventData) {
		if (args?.ios?.view) {
			this._updateInteractiveTransition({
				began: true,
				cancelled: false,
			});
			const percent = this.interactiveTransition?.options.percentFormula ? this.interactiveTransition?.options.percentFormula(args) : args.deltaX / (args.ios.view.bounds.size.width / 2);
			if (SharedTransition.DEBUG) {
				console.log('Interactive dismissal percentage:', percent);
			}
			switch (args.state) {
				case GestureStateTypes.began:
					this._ios.controller.popViewControllerAnimated(true);
					break;
				case GestureStateTypes.changed:
					if (percent < 1) {
						if (this.transitionInteractiveCtrl) {
							this.transitionInteractiveCtrl.updateInteractiveTransition(percent);
						}
					}
					break;
				case GestureStateTypes.cancelled:
				case GestureStateTypes.ended:
					if (this.transitionInteractiveCtrl) {
						const finishThreshold = isNumber(this.interactiveTransition?.options?.finishThreshold) ? this.interactiveTransition?.options?.finishThreshold : 0.5;
						if (percent > finishThreshold) {
							this.off('pan', this._interactiveDismissGesture);
							this.transitionInteractiveCtrl.finishInteractiveTransition();
							// TODO: may wanna null this out at some later point
							// this.transitionInteractiveCtrl = null;
						} else {
							this._updateInteractiveTransition({
								cancelled: true,
							});
							this.transitionInteractiveCtrl.cancelInteractiveTransition();
						}
					}
					break;
			}
		}
	}

	private pushViewControllerAnimated(viewController: UIViewController, animated: boolean, isModal: boolean) {
		const transitionCoordinator = this._ios.controller.transitionCoordinator;
		if (!isModal && transitionCoordinator) {
			transitionCoordinator.animateAlongsideTransitionCompletion(null, () => {
				this._ios.controller.pushViewControllerAnimated(viewController, animated);
			});
		} else {
			// modal should always push immediately without transition coordinator
			this._ios.controller.pushViewControllerAnimated(viewController, animated);
		}
	}

	public _goBackCore(backstackEntry: BackstackEntry) {
		super._goBackCore(backstackEntry);
		navDepth = backstackEntry[NAV_DEPTH];

		const controller = backstackEntry.resolvedPage.ios;
		const animated = this._currentEntry ? this._getIsAnimatedNavigation(this._currentEntry.entry) : false;

		this._updateActionBar(backstackEntry.resolvedPage);

		if (Trace.isEnabled()) {
			Trace.write(`${this}.popToViewControllerAnimated(${controller}, ${animated}); depth = ${navDepth}`, Trace.categories.Navigation);
		}

		this._ios.controller.popToViewControllerAnimated(controller, animated);
	}

	public _updateActionBar(page?: Page, disableNavBarAnimation = false): void {
		super._updateActionBar(page);

		if (page && this.currentPage && this.currentPage.modal === page) {
			return;
		}

		page = page || this.currentPage;
		const newValue = this._getNavBarVisible(page);
		const disableNavBarAnimationCache = this._ios._disableNavBarAnimation;

		if (disableNavBarAnimation) {
			this._ios._disableNavBarAnimation = true;
		}

		// when showing/hiding navigationbar, the page needs a relayout to avoid overlapping or hidden layouts
		const needsPageLayout = this._ios.showNavigationBar !== newValue;
		this._ios.showNavigationBar = newValue;

		if (disableNavBarAnimation) {
			this._ios._disableNavBarAnimation = disableNavBarAnimationCache;
		}

		if (this._ios.controller?.navigationBar) {
			this._ios.controller.navigationBar.userInteractionEnabled = this.navigationQueueIsEmpty();
		}

		if (needsPageLayout && page) {
			page.requestLayout();
		}
	}

	public _getNavBarVisible(page: Page): boolean {
		switch (this.actionBarVisibility) {
			case 'always':
				return true;

			case 'never':
				return false;

			case 'auto':
				switch (this._ios.navBarVisibility) {
					case 'always':
						return true;

					case 'never':
						return false;

					case 'auto': {
						let newValue: boolean;

						if (page && page.actionBarHidden !== undefined) {
							newValue = !page.actionBarHidden;
						} else {
							newValue = this.ios.controller.viewControllers.count > 1 || (page && page.actionBar && !page.actionBar._isEmpty());
						}

						newValue = !!newValue;

						return newValue;
					}
				}
		}
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

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const widthAndState = View.resolveSizeAndState(width, width, widthMode, 0);
		const heightAndState = View.resolveSizeAndState(height, height, heightMode, 0);

		this.setMeasuredDimension(widthAndState, heightAndState);
	}

	public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
		//
	}

	public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {
		//
	}

	public _onNavigatingTo(backstackEntry: BackstackEntry, isBack: boolean) {
		// for now to not break iOS events chain (calling navigation events from controller delegates)
		// we dont call super(which would also trigger events) but only notify the frame of the navigation
		// though it means events are not triggered at the same time (lifecycle) on iOS / Android
		this.notify({
			eventName: Page.navigatingToEvent,
			object: this,
			isBack,
			entry: backstackEntry,
			fromEntry: this._currentEntry,
		});
	}
}

const transitionDelegates = new Array<TransitionDelegate>();

@NativeClass
class TransitionDelegate extends NSObject {
	private _id: string;

	public static initWithOwnerId(id: string): TransitionDelegate {
		const delegate = <TransitionDelegate>TransitionDelegate.new();
		delegate._id = id;
		transitionDelegates.push(delegate);

		return delegate;
	}

	public animationWillStart(animationID: string, context: any): void {
		if (Trace.isEnabled()) {
			Trace.write(`START ${this._id}`, Trace.categories.Transition);
		}
	}

	public animationDidStop(animationID: string, finished: boolean, context: any): void {
		if (finished) {
			if (Trace.isEnabled()) {
				Trace.write(`END ${this._id}`, Trace.categories.Transition);
			}
		} else {
			if (Trace.isEnabled()) {
				Trace.write(`CANCEL ${this._id}`, Trace.categories.Transition);
			}
		}

		const index = transitionDelegates.indexOf(this);
		if (index > -1) {
			transitionDelegates.splice(index, 1);
		}
	}

	public static ObjCExposedMethods = {
		animationWillStart: {
			returns: interop.types.void,
			params: [NSString, NSObject],
		},
		animationDidStop: {
			returns: interop.types.void,
			params: [NSString, NSNumber, NSObject],
		},
	};
}

const _defaultTransitionDuration = 0.35;

@NativeClass
class UINavigationControllerAnimatedDelegate extends NSObject implements UINavigationControllerDelegate {
	public static ObjCProtocols = [UINavigationControllerDelegate];
	owner: WeakRef<Frame>;
	transition: PageTransition;

	static initWithOwner(owner: WeakRef<Frame>) {
		const delegate = <UINavigationControllerAnimatedDelegate>UINavigationControllerAnimatedDelegate.new();
		delegate.owner = owner;
		return delegate;
	}

	navigationControllerAnimationControllerForOperationFromViewControllerToViewController(navigationController: UINavigationController, operation: number, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
		let viewController: UIViewController;
		switch (operation) {
			case UINavigationControllerOperation.Push:
				viewController = toVC;
				break;
			case UINavigationControllerOperation.Pop:
				viewController = fromVC;
				break;
		}

		if (!viewController) {
			return null;
		}

		const navigationTransition = <NavigationTransition>viewController[TRANSITION];
		if (!navigationTransition) {
			return null;
		}

		if (Trace.isEnabled()) {
			Trace.write(`UINavigationControllerImpl.navigationControllerAnimationControllerForOperationFromViewControllerToViewController(${operation}, ${fromVC}, ${toVC}), transition: ${JSON.stringify(navigationTransition)}`, Trace.categories.NativeLifecycle);
		}

		this.transition = navigationTransition.instance;

		const curve = _getNativeCurve(navigationTransition);
		const animationController = _createIOSAnimatedTransitioning(navigationTransition, curve, operation, fromVC, toVC);

		return animationController;
	}

	navigationControllerInteractionControllerForAnimationController(navigationController: UINavigationController, animationController: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning {
		const owner = this.owner?.deref();
		if (owner) {
			if (owner.interactiveTransition?.began) {
				owner.transitionInteractiveCtrl = PercentInteractiveController.initWithOwner(new WeakRef(this.transition));
				return owner.transitionInteractiveCtrl;
			}
		}

		return null;
	}
}

@NativeClass()
class PercentInteractiveController extends UIPercentDrivenInteractiveTransition implements UIViewControllerInteractiveTransitioning {
	static ObjCProtocols = [UIViewControllerInteractiveTransitioning];
	owner: WeakRef<PageTransition>;
	started = false;
	transitionContext: UIViewControllerContextTransitioning;
	backgroundAnimation: UIViewPropertyAnimator;

	static initWithOwner(owner: WeakRef<PageTransition>) {
		const ctrl = <PercentInteractiveController>PercentInteractiveController.new();
		ctrl.owner = owner;
		return ctrl;
	}

	startInteractiveTransition(transitionContext: UIViewControllerContextTransitioning) {
		console.log('startInteractiveTransition');
		this.transitionContext = transitionContext;

		// Using insertSubviewBelowSubview solves view stack visually but leaves a controller overlapping
		// TODO: need to find out solution here
		// console.log('this.transitionContext.containerView.subviews.count:', this.transitionContext.containerView.subviews.count)
		const owner: any = this.owner?.deref();
		if (owner) {
			// console.log('owner.presenting:', owner.presenting)
			// console.log('owner.presented:', owner.presented)
			if (owner.presenting) {
				this.transitionContext.containerView.insertSubviewBelowSubview(owner.presenting.view, owner.presented.view);
			}
		}
	}

	updateInteractiveTransition(percentComplete: number) {
		const owner: any = this.owner?.deref();
		if (owner) {
			if (!this.started) {
				this.started = true;
				for (const p of owner.sharedElements.presented) {
					p.view.opacity = 0;
				}
				for (const p of owner.sharedElements.presenting) {
					p.snapshot.alpha = p.endOpacity;
					this.transitionContext.containerView.addSubview(p.snapshot);
				}
				const state = SharedTransition.getState(owner.id);
				const props = state.fromPageEnd;
				this.backgroundAnimation = UIViewPropertyAnimator.alloc().initWithDurationDampingRatioAnimations(1, 1, () => {
					for (const p of owner.sharedElements.presenting) {
						p.snapshot.frame = p.startFrame;
						iOSNativeHelper.copyLayerProperties(p.snapshot, p.view.ios);

						p.snapshot.alpha = 1;
					}
					owner.presented.view.alpha = isNumber(props?.opacity) ? props?.opacity : 0;
					const endX = isNumber(props?.x) ? props?.x : Screen.mainScreen.widthDIPs;
					const endY = isNumber(props?.y) ? props?.y : 0;
					const endWidth = isNumber(props?.width) ? props?.width : Screen.mainScreen.widthDIPs;
					const endHeight = isNumber(props?.height) ? props?.height : Screen.mainScreen.heightDIPs;
					owner.presented.view.frame = CGRectMake(endX, endY, endWidth, endHeight);
				});
			}

			this.backgroundAnimation.fractionComplete = percentComplete;
		}
	}

	cancelInteractiveTransition() {
		// console.log('cancelInteractiveTransition');
		const owner: any = this.owner?.deref();
		if (owner && this.started) {
			const state = SharedTransition.getState(owner.id);
			if (!state) {
				return;
			}
			if (this.backgroundAnimation) {
				this.backgroundAnimation.reversed = true;
				const duration = isNumber(state.toPageStart?.duration) ? state.toPageStart?.duration / 1000 : 0.35;
				this.backgroundAnimation.continueAnimationWithTimingParametersDurationFactor(null, duration);
				setTimeout(() => {
					for (const p of owner.sharedElements.presented) {
						p.view.opacity = 1;
					}
					for (const p of owner.sharedElements.presenting) {
						p.snapshot.removeFromSuperview();
					}
					owner.presented.view.alpha = 1;
					this.backgroundAnimation = null;
					this.started = false;
					this.transitionContext.completeTransition(false);
				}, duration * 1000);
			}
		}
	}

	finishInteractiveTransition() {
		// console.log('finishInteractiveTransition');
		const owner: any = this.owner?.deref();
		if (owner && this.started) {
			if (this.backgroundAnimation) {
				this.backgroundAnimation.reversed = false;
				const state = SharedTransition.getState(owner.id);
				if (!state) {
					SharedTransition.finishState(owner.id);
					this.transitionContext.completeTransition(true);
					return;
				}

				const duration = isNumber(state.fromPageEnd?.duration) ? state.fromPageEnd?.duration / 1000 : 0.35;
				this.backgroundAnimation.continueAnimationWithTimingParametersDurationFactor(null, duration);
				setTimeout(() => {
					for (const presenting of owner.sharedElements.presenting) {
						presenting.view.opacity = presenting.startOpacity;
						presenting.snapshot.removeFromSuperview();
					}

					SharedTransition.finishState(owner.id);
					this.backgroundAnimation = null;
					this.started = false;
					// console.log('this.transitionContext.containerView.subviews.count:', this.transitionContext.containerView.subviews.count)
					// this.transitionContext.containerView.subviews.objectAtIndex(this.transitionContext.containerView.subviews.count-1).removeFromSuperview();
					this.transitionContext.completeTransition(true);
					console.log('completeTransition!');
					// console.log('this.transitionContext.containerView.subviews.count:', this.transitionContext.containerView.subviews.count)
				}, duration * 1001);
			}
		}
	}
}

@NativeClass
class UINavigationControllerImpl extends UINavigationController {
	private _owner: WeakRef<Frame>;

	public static initWithOwner(owner: WeakRef<Frame>): UINavigationControllerImpl {
		const controller = <UINavigationControllerImpl>UINavigationControllerImpl.new();
		controller._owner = owner;

		return controller;
	}

	get owner(): Frame {
		return this._owner?.deref?.();
	}

	@profile
	public viewWillAppear(animated: boolean): void {
		super.viewWillAppear(animated);
		const owner = this._owner?.deref?.();
		if (owner && !owner.isLoaded && !owner.parent) {
			owner.callLoaded();
		}
	}

	@profile
	public viewDidDisappear(animated: boolean): void {
		super.viewDidDisappear(animated);
		const owner = this._owner?.deref?.();
		if (owner && owner.isLoaded && !owner.parent && !this.presentedViewController) {
			owner.callUnloaded();
			owner._tearDownUI(true);
		}
	}

	private animateWithDuration(navigationTransition: NavigationTransition, nativeTransition: UIViewAnimationTransition, transitionType: string, baseCallback: Function): void {
		const duration = navigationTransition.duration ? navigationTransition.duration / 1000 : _defaultTransitionDuration;
		const curve = _getNativeCurve(navigationTransition);

		const transitionTraced = Trace.isCategorySet(Trace.categories.Transition);
		let transitionDelegate: TransitionDelegate;
		if (transitionTraced) {
			const id = _getTransitionId(nativeTransition, transitionType);
			transitionDelegate = TransitionDelegate.initWithOwnerId(id);
		}

		UIView.animateWithDurationAnimations(duration, () => {
			if (transitionTraced) {
				UIView.setAnimationDelegate(transitionDelegate);
			}

			UIView.setAnimationWillStartSelector('animationWillStart');
			UIView.setAnimationDidStopSelector('animationDidStop');
			UIView.setAnimationCurve(curve);
			baseCallback();
			UIView.setAnimationTransitionForViewCache(nativeTransition, this.view, true);
		});
	}

	@profile
	public pushViewControllerAnimated(viewController: UIViewController, animated: boolean): void {
		const navigationTransition = <NavigationTransition>viewController[TRANSITION];
		if (Trace.isEnabled()) {
			Trace.write(`UINavigationControllerImpl.pushViewControllerAnimated(${viewController}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, Trace.categories.NativeLifecycle);
		}

		const nativeTransition = _getNativeTransition(navigationTransition, true);
		if (!animated || !navigationTransition || !nativeTransition) {
			super.pushViewControllerAnimated(viewController, animated);

			return;
		}

		this.animateWithDuration(navigationTransition, nativeTransition, 'push', () => {
			super.pushViewControllerAnimated(viewController, false);
		});
	}

	@profile
	public setViewControllersAnimated(viewControllers: NSArray<any>, animated: boolean): void {
		const viewController = viewControllers.lastObject;
		const navigationTransition = <NavigationTransition>viewController[TRANSITION];

		if (Trace.isEnabled()) {
			Trace.write(`UINavigationControllerImpl.setViewControllersAnimated(${viewControllers}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, Trace.categories.NativeLifecycle);
		}

		const nativeTransition = _getNativeTransition(navigationTransition, true);
		if (!animated || !navigationTransition || !nativeTransition) {
			super.setViewControllersAnimated(viewControllers, animated);

			return;
		}

		this.animateWithDuration(navigationTransition, nativeTransition, 'set', () => {
			super.setViewControllersAnimated(viewControllers, false);
		});
	}

	public popViewControllerAnimated(animated: boolean): UIViewController {
		const lastViewController = this.viewControllers.lastObject;
		const navigationTransition = <NavigationTransition>lastViewController[TRANSITION];
		if (Trace.isEnabled()) {
			Trace.write(`UINavigationControllerImpl.popViewControllerAnimated(${animated}); transition: ${JSON.stringify(navigationTransition)}`, Trace.categories.NativeLifecycle);
		}

		if (navigationTransition && navigationTransition.name === NON_ANIMATED_TRANSITION) {
			//https://github.com/NativeScript/NativeScript/issues/1787
			return super.popViewControllerAnimated(false);
		}

		const nativeTransition = _getNativeTransition(navigationTransition, false);
		if (!animated || !navigationTransition || !nativeTransition) {
			return super.popViewControllerAnimated(animated);
		}

		this.animateWithDuration(navigationTransition, nativeTransition, 'pop', () => {
			super.popViewControllerAnimated(false);
		});

		return null;
	}

	public popToViewControllerAnimated(viewController: UIViewController, animated: boolean): NSArray<UIViewController> {
		const lastViewController = this.viewControllers.lastObject;
		const navigationTransition = <NavigationTransition>lastViewController[TRANSITION];
		if (Trace.isEnabled()) {
			Trace.write(`UINavigationControllerImpl.popToViewControllerAnimated(${viewController}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, Trace.categories.NativeLifecycle);
		}

		if (navigationTransition && navigationTransition.name === NON_ANIMATED_TRANSITION) {
			//https://github.com/NativeScript/NativeScript/issues/1787
			return super.popToViewControllerAnimated(viewController, false);
		}

		const nativeTransition = _getNativeTransition(navigationTransition, false);
		if (!animated || !navigationTransition || !nativeTransition) {
			return super.popToViewControllerAnimated(viewController, animated);
		}

		this.animateWithDuration(navigationTransition, nativeTransition, 'popTo', () => {
			super.popToViewControllerAnimated(viewController, false);
		});

		return null;
	}

	// Mind implementation for other controllers
	public traitCollectionDidChange(previousTraitCollection: UITraitCollection): void {
		super.traitCollectionDidChange(previousTraitCollection);

		if (majorVersion >= 13) {
			const owner = this._owner?.deref?.();
			if (owner && this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection && this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection(previousTraitCollection)) {
				owner.notify({
					eventName: IOSHelper.traitCollectionColorAppearanceChangedEvent,
					object: owner,
				});
			}
		}
	}
}

function _getTransitionId(nativeTransition: UIViewAnimationTransition, transitionType: string): string {
	let name;
	switch (nativeTransition) {
		case UIViewAnimationTransition.CurlDown:
			name = 'CurlDown';
			break;
		case UIViewAnimationTransition.CurlUp:
			name = 'CurlUp';
			break;
		case UIViewAnimationTransition.FlipFromLeft:
			name = 'FlipFromLeft';
			break;
		case UIViewAnimationTransition.FlipFromRight:
			name = 'FlipFromRight';
			break;
		case UIViewAnimationTransition.None:
			name = 'None';
			break;
	}

	return `${name} ${transitionType}`;
}

function _getNativeTransition(navigationTransition: NavigationTransition, push: boolean): UIViewAnimationTransition {
	if (navigationTransition && navigationTransition.name) {
		switch (navigationTransition.name.toLowerCase()) {
			case 'flip':
			case 'flipright':
				return push ? UIViewAnimationTransition.FlipFromRight : UIViewAnimationTransition.FlipFromLeft;
			case 'flipleft':
				return push ? UIViewAnimationTransition.FlipFromLeft : UIViewAnimationTransition.FlipFromRight;
			case 'curl':
			case 'curlup':
				return push ? UIViewAnimationTransition.CurlUp : UIViewAnimationTransition.CurlDown;
			case 'curldown':
				return push ? UIViewAnimationTransition.CurlDown : UIViewAnimationTransition.CurlUp;
		}
	}

	return null;
}

export function _getNativeCurve(transition: NavigationTransition): UIViewAnimationCurve {
	if (transition.curve) {
		switch (transition.curve) {
			case 'easeIn':
				if (Trace.isEnabled()) {
					Trace.write('Transition curve resolved to UIViewAnimationCurve.EaseIn.', Trace.categories.Transition);
				}

				return UIViewAnimationCurve.EaseIn;

			case 'easeOut':
				if (Trace.isEnabled()) {
					Trace.write('Transition curve resolved to UIViewAnimationCurve.EaseOut.', Trace.categories.Transition);
				}

				return UIViewAnimationCurve.EaseOut;

			case 'easeInOut':
				if (Trace.isEnabled()) {
					Trace.write('Transition curve resolved to UIViewAnimationCurve.EaseInOut.', Trace.categories.Transition);
				}

				return UIViewAnimationCurve.EaseInOut;

			case 'linear':
				if (Trace.isEnabled()) {
					Trace.write('Transition curve resolved to UIViewAnimationCurve.Linear.', Trace.categories.Transition);
				}

				return UIViewAnimationCurve.Linear;

			default:
				if (Trace.isEnabled()) {
					Trace.write('Transition curve resolved to original: ' + transition.curve, Trace.categories.Transition);
				}

				return transition.curve;
		}
	}

	return UIViewAnimationCurve.EaseInOut;
}

/* tslint:disable */
class iOSFrame implements iOSFrameDefinition {
	/* tslint:enable */
	private _controller: UINavigationControllerImpl;
	private _showNavigationBar: boolean;
	private _navBarVisibility: 'auto' | 'never' | 'always' = 'auto';

	// TabView uses this flag to disable animation while showing/hiding the navigation bar because of the "< More" bar.
	// See the TabView._handleTwoNavigationBars method for more details.
	public _disableNavBarAnimation: boolean;

	constructor(frame: Frame) {
		this._controller = UINavigationControllerImpl.initWithOwner(new WeakRef(frame));
	}

	public get controller() {
		return this._controller;
	}
	public set controller(value: UINavigationControllerImpl) {
		this._controller = value;
	}

	public get showNavigationBar(): boolean {
		return this._showNavigationBar;
	}
	public set showNavigationBar(value: boolean) {
		this._showNavigationBar = value;
		if (this._controller) {
			this._controller.setNavigationBarHiddenAnimated(!value, !this._disableNavBarAnimation);
		}
	}

	public get navBarVisibility(): 'auto' | 'never' | 'always' {
		return this._navBarVisibility;
	}
	public set navBarVisibility(value: 'auto' | 'never' | 'always') {
		this._navBarVisibility = value;
	}
}

export function setActivityCallbacks(activity: any): void {}
