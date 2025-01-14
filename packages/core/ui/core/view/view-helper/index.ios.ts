// Types
import { Position, View } from '..';

// Requires
import { ViewHelper } from './view-helper-common';
import { SDK_VERSION } from '../../../../utils/constants';
import { ios as iOSUtils, layout } from '../../../../utils';
import { Trace } from '../../../../trace';

export * from './view-helper-common';
export const AndroidHelper = 0;

@NativeClass
class UILayoutViewController extends UIViewController {
	public owner: WeakRef<View>;

	public static initWithOwner(owner: WeakRef<View>): UILayoutViewController {
		const controller = <UILayoutViewController>UILayoutViewController.new();
		controller.owner = owner;

		return controller;
	}

	public viewDidLoad(): void {
		super.viewDidLoad();

		// Unify translucent and opaque bars layout
		// this.edgesForExtendedLayout = UIRectEdgeBottom;
		this.extendedLayoutIncludesOpaqueBars = true;
	}

	public viewWillLayoutSubviews(): void {
		super.viewWillLayoutSubviews();
		const owner = this.owner?.deref();
		if (owner) {
			IOSHelper.updateConstraints(this, owner);
		}
	}

	public viewDidLayoutSubviews(): void {
		super.viewDidLayoutSubviews();
		const owner = this.owner?.deref();
		if (owner) {
			if (iOSUtils.MajorVersion >= 11) {
				// Handle nested UILayoutViewController safe area application.
				// Currently, UILayoutViewController can be nested only in a TabView.
				// The TabView itself is handled by the OS, so we check the TabView's parent (usually a Page, but can be a Layout).
				const tabViewItem = owner.parent;
				const tabView = tabViewItem && tabViewItem.parent;
				let parent = tabView && tabView.parent;

				// Handle Angular scenario where TabView is in a ProxyViewContainer
				// It is possible to wrap components in ProxyViewContainers indefinitely
				// Not using instanceof ProxyViewContainer to avoid circular dependency
				// TODO: Try moving UILayoutViewController out of view module
				while (parent && !parent.nativeViewProtected) {
					parent = parent.parent;
				}

				if (parent) {
					const parentPageInsetsTop = parent.nativeViewProtected.safeAreaInsets.top;
					const parentPageInsetsBottom = parent.nativeViewProtected.safeAreaInsets.bottom;
					let currentInsetsTop = this.view.safeAreaInsets.top;
					let currentInsetsBottom = this.view.safeAreaInsets.bottom;

					// Safe area insets include additional safe area insets too, so subtract old values
					if (this.additionalSafeAreaInsets) {
						currentInsetsTop -= this.additionalSafeAreaInsets.top;
						currentInsetsBottom -= this.additionalSafeAreaInsets.bottom;
					}

					const additionalInsetsTop = Math.max(parentPageInsetsTop - currentInsetsTop, 0);
					const additionalInsetsBottom = Math.max(parentPageInsetsBottom - currentInsetsBottom, 0);

					if (additionalInsetsTop > 0 || additionalInsetsBottom > 0) {
						const additionalInsets = new UIEdgeInsets({
							top: additionalInsetsTop,
							left: 0,
							bottom: additionalInsetsBottom,
							right: 0,
						});
						this.additionalSafeAreaInsets = additionalInsets;
					} else {
						this.additionalSafeAreaInsets = null;
					}
				}
			}

			IOSHelper.layoutView(this, owner);
		}
	}

	public viewWillAppear(animated: boolean): void {
		super.viewWillAppear(animated);
		const owner = this.owner?.deref();
		if (!owner) {
			return;
		}

		IOSHelper.updateAutoAdjustScrollInsets(this, owner);

		if (!owner.isLoaded && !owner.parent) {
			owner.callLoaded();
		}
	}

	public viewDidDisappear(animated: boolean): void {
		super.viewDidDisappear(animated);
		const owner = this.owner?.deref();
		if (owner && owner.isLoaded && !owner.parent) {
			owner.callUnloaded();
		}
	}

	// Mind implementation for other controllers
	public traitCollectionDidChange(previousTraitCollection: UITraitCollection): void {
		super.traitCollectionDidChange(previousTraitCollection);

		if (iOSUtils.MajorVersion >= 13) {
			const owner = this.owner?.deref();
			if (owner && this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection && this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection(previousTraitCollection)) {
				owner.notify({
					eventName: IOSHelper.traitCollectionColorAppearanceChangedEvent,
					object: owner,
				});
			}
		}
	}
}

@NativeClass
class UIAdaptivePresentationControllerDelegateImp extends NSObject implements UIAdaptivePresentationControllerDelegate {
	public static ObjCProtocols = [UIAdaptivePresentationControllerDelegate];

	private owner: WeakRef<View>;
	private closedCallback: Function;

	public static initWithOwnerAndCallback(owner: WeakRef<View>, whenClosedCallback: Function): UIAdaptivePresentationControllerDelegateImp {
		const instance = <UIAdaptivePresentationControllerDelegateImp>super.new();
		instance.owner = owner;
		instance.closedCallback = whenClosedCallback;

		return instance;
	}

	public presentationControllerDidDismiss(presentationController: UIPresentationController) {
		const owner = this.owner?.deref();
		if (owner && typeof this.closedCallback === 'function') {
			this.closedCallback();
		}
	}
}

@NativeClass
class UIPopoverPresentationControllerDelegateImp extends NSObject implements UIPopoverPresentationControllerDelegate {
	public static ObjCProtocols = [UIPopoverPresentationControllerDelegate];

	private owner: WeakRef<View>;
	private closedCallback: Function;

	public static initWithOwnerAndCallback(owner: WeakRef<View>, whenClosedCallback: Function): UIPopoverPresentationControllerDelegateImp {
		const instance = <UIPopoverPresentationControllerDelegateImp>super.new();
		instance.owner = owner;
		instance.closedCallback = whenClosedCallback;

		return instance;
	}

	public popoverPresentationControllerDidDismissPopover(popoverPresentationController: UIPopoverPresentationController) {
		const owner = this.owner?.deref();
		if (owner && typeof this.closedCallback === 'function') {
			this.closedCallback();
		}
	}
}

export class IOSHelper {
	static traitCollectionColorAppearanceChangedEvent = 'traitCollectionColorAppearanceChanged';
	static UILayoutViewController = UILayoutViewController;
	static UIAdaptivePresentationControllerDelegateImp = UIAdaptivePresentationControllerDelegateImp;
	static UIPopoverPresentationControllerDelegateImp = UIPopoverPresentationControllerDelegateImp;

	static getParentWithViewController(view: View): View {
		while (view && !view.viewController) {
			view = view.parent as View;
		}

		// Note: Might return undefined if no parent with viewController is found
		return view;
	}

	static updateAutoAdjustScrollInsets(controller: UIViewController, owner: View): void {
		if (!__VISIONOS__ && SDK_VERSION <= 10) {
			owner._automaticallyAdjustsScrollViewInsets = false;
			// This API is deprecated, but has no alternative for <= iOS 10
			// Defaults to true and results to appliyng the insets twice together with our logic
			// for iOS 11+ we use the contentInsetAdjustmentBehavior property in scrollview
			// https://developer.apple.com/documentation/uikit/uiviewcontroller/1621372-automaticallyadjustsscrollviewin
			controller.automaticallyAdjustsScrollViewInsets = false;
		}
	}

	static updateConstraints(controller: UIViewController, owner: View): void {
		if (!__VISIONOS__ && SDK_VERSION <= 10) {
			const layoutGuide = IOSHelper.initLayoutGuide(controller);
			(<any>controller.view).safeAreaLayoutGuide = layoutGuide;
		}
	}

	static initLayoutGuide(controller: UIViewController) {
		const rootView = controller.view;
		const layoutGuide = UILayoutGuide.new();
		rootView.addLayoutGuide(layoutGuide);
		NSLayoutConstraint.activateConstraints(<any>[layoutGuide.topAnchor.constraintEqualToAnchor(controller.topLayoutGuide.bottomAnchor), layoutGuide.bottomAnchor.constraintEqualToAnchor(controller.bottomLayoutGuide.topAnchor), layoutGuide.leadingAnchor.constraintEqualToAnchor(rootView.leadingAnchor), layoutGuide.trailingAnchor.constraintEqualToAnchor(rootView.trailingAnchor)]);

		return layoutGuide;
	}

	static layoutView(controller: UIViewController, owner: View): void {
		let layoutGuide = controller.view.safeAreaLayoutGuide;
		if (!layoutGuide) {
			Trace.write(`safeAreaLayoutGuide during layout of ${owner}. Creating fallback constraints, but layout might be wrong.`, Trace.categories.Layout, Trace.messageType.error);

			layoutGuide = IOSHelper.initLayoutGuide(controller);
		}
		const safeArea = layoutGuide.layoutFrame;
		let position = IOSHelper.getPositionFromFrame(safeArea);
		const safeAreaSize = safeArea.size;

		const hasChildViewControllers = controller.childViewControllers.count > 0;
		if (hasChildViewControllers) {
			const fullscreen = controller.view.frame;
			position = IOSHelper.getPositionFromFrame(fullscreen);
		}

		const safeAreaWidth = layout.round(layout.toDevicePixels(safeAreaSize.width));
		const safeAreaHeight = layout.round(layout.toDevicePixels(safeAreaSize.height));

		const widthSpec = layout.makeMeasureSpec(safeAreaWidth, layout.EXACTLY);
		const heightSpec = layout.makeMeasureSpec(safeAreaHeight, layout.EXACTLY);

		ViewHelper.measureChild(null, owner, widthSpec, heightSpec);
		ViewHelper.layoutChild(null, owner, position.left, position.top, position.right, position.bottom);

		if (owner.parent) {
			owner.parent._layoutParent();
		}
	}

	static getPositionFromFrame(frame: CGRect): Position {
		const left = layout.round(layout.toDevicePixels(frame.origin.x));
		const top = layout.round(layout.toDevicePixels(frame.origin.y));
		const right = layout.round(layout.toDevicePixels(frame.origin.x + frame.size.width));
		const bottom = layout.round(layout.toDevicePixels(frame.origin.y + frame.size.height));

		return { left, right, top, bottom };
	}

	static getFrameFromPosition(position: Position, insets?: Position): CGRect {
		insets = insets || { left: 0, top: 0, right: 0, bottom: 0 };

		const left = layout.toDeviceIndependentPixels(position.left + insets.left);
		const top = layout.toDeviceIndependentPixels(position.top + insets.top);
		let width = layout.toDeviceIndependentPixels(position.right - position.left - insets.left - insets.right);
		let height = layout.toDeviceIndependentPixels(position.bottom - position.top - insets.top - insets.bottom);
		if (width < 0) {
			width = 0;
		}
		if (height < 0) {
			height = 0;
		}
		return CGRectMake(left, top, width, height);
	}

	static shrinkToSafeArea(view: View, frame: CGRect): CGRect {
		const insets = view.getSafeAreaInsets();
		if (insets.left || insets.top) {
			const position = IOSHelper.getPositionFromFrame(frame);
			const adjustedFrame = IOSHelper.getFrameFromPosition(position, insets);

			if (Trace.isEnabled()) {
				Trace.write(`${view} :shrinkToSafeArea: ${JSON.stringify(IOSHelper.getPositionFromFrame(adjustedFrame))}`, Trace.categories.Layout);
			}

			return adjustedFrame;
		}

		return null;
	}

	static expandBeyondSafeArea(view: View, frame: CGRect): CGRect {
		const availableSpace = IOSHelper.getAvailableSpaceFromParent(view, frame);
		const safeArea = availableSpace.safeArea;
		const fullscreen = availableSpace.fullscreen;
		const inWindow = availableSpace.inWindow;

		const position = IOSHelper.getPositionFromFrame(frame);
		const safeAreaPosition = IOSHelper.getPositionFromFrame(safeArea);
		const fullscreenPosition = IOSHelper.getPositionFromFrame(fullscreen);
		const inWindowPosition = IOSHelper.getPositionFromFrame(inWindow);

		const adjustedPosition = position;

		if (position.left && inWindowPosition.left <= safeAreaPosition.left) {
			adjustedPosition.left = fullscreenPosition.left;
		}

		if (position.top && inWindowPosition.top <= safeAreaPosition.top) {
			adjustedPosition.top = fullscreenPosition.top;
		}

		if (inWindowPosition.right < fullscreenPosition.right && inWindowPosition.right >= safeAreaPosition.right + fullscreenPosition.left) {
			adjustedPosition.right += fullscreenPosition.right - inWindowPosition.right;
		}

		if (inWindowPosition.bottom < fullscreenPosition.bottom && inWindowPosition.bottom >= safeAreaPosition.bottom + fullscreenPosition.top) {
			adjustedPosition.bottom += fullscreenPosition.bottom - inWindowPosition.bottom;
		}

		const adjustedFrame = CGRectMake(layout.toDeviceIndependentPixels(adjustedPosition.left), layout.toDeviceIndependentPixels(adjustedPosition.top), layout.toDeviceIndependentPixels(adjustedPosition.right - adjustedPosition.left), layout.toDeviceIndependentPixels(adjustedPosition.bottom - adjustedPosition.top));

		if (Trace.isEnabled()) {
			Trace.write(view + ' :expandBeyondSafeArea: ' + JSON.stringify(IOSHelper.getPositionFromFrame(adjustedFrame)), Trace.categories.Layout);
		}

		return adjustedFrame;
	}

	static getAvailableSpaceFromParent(view: View, frame: CGRect): { safeArea: CGRect; fullscreen: CGRect; inWindow: CGRect } {
		if (!view) {
			return;
		}

		let scrollView = null;
		let viewControllerView = null;

		if (view.viewController) {
			viewControllerView = view.viewController.view;
		} else {
			let parent = view.parent as View;
			while (parent && !parent.viewController && !(parent.nativeViewProtected instanceof UIScrollView)) {
				parent = parent.parent as View;
			}

			if (parent.nativeViewProtected instanceof UIScrollView) {
				scrollView = parent.nativeViewProtected;
			} else if (parent.viewController) {
				viewControllerView = parent.viewController.view;
			}
		}

		let fullscreen = null;
		let safeArea = null;
		let controllerInWindow = { x: 0, y: 0 };

		if (viewControllerView) {
			safeArea = viewControllerView.safeAreaLayoutGuide.layoutFrame;
			fullscreen = viewControllerView.frame;
			controllerInWindow = viewControllerView.convertPointToView(viewControllerView.bounds.origin, null);
		} else if (scrollView) {
			const insets = scrollView.safeAreaInsets;
			safeArea = CGRectMake(insets.left, insets.top, scrollView.contentSize.width - insets.left - insets.right, scrollView.contentSize.height - insets.top - insets.bottom);
			fullscreen = CGRectMake(0, 0, scrollView.contentSize.width, scrollView.contentSize.height);
		}

		// We take into account the controller position inside the window.
		// for example with a bottomsheet the controller will be "offset"
		const locationInWindow = view.getLocationInWindow();
		let inWindowLeft = locationInWindow.x - controllerInWindow.x;
		let inWindowTop = locationInWindow.y - controllerInWindow.y;

		if (scrollView) {
			inWindowLeft += scrollView.contentOffset.x;
			inWindowTop += scrollView.contentOffset.y;
		}

		const inWindow = CGRectMake(inWindowLeft, inWindowTop, frame.size.width, frame.size.height);

		return {
			safeArea: safeArea,
			fullscreen: fullscreen,
			inWindow: inWindow,
		};
	}
}
