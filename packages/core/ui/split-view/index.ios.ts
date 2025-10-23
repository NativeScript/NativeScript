import { SplitViewBase, SplitRole, displayModeProperty, splitBehaviorProperty, preferredPrimaryColumnWidthFractionProperty, preferredSupplementaryColumnWidthFractionProperty } from './split-view-common';
import { View } from '../core/view';
import { layout } from '../../utils';

@NativeClass
class UISplitViewControllerDelegateImpl extends NSObject implements UISplitViewControllerDelegate {
	public static ObjCProtocols = [UISplitViewControllerDelegate];
	private _owner: WeakRef<SplitView>;

	public static initWithOwner(owner: WeakRef<SplitView>): UISplitViewControllerDelegateImpl {
		const d = <UISplitViewControllerDelegateImpl>UISplitViewControllerDelegateImpl.new();
		d._owner = owner;
		return d;
	}

	splitViewControllerCollapseSecondaryViewControllerOntoPrimaryViewController(splitViewController: UISplitViewController, secondaryViewController: UIViewController, primaryViewController: UIViewController): boolean {
		const owner = this._owner.deref();
		if (owner) {
			// Notify the owner about the collapse action
			owner.onSecondaryViewCollapsed(secondaryViewController, primaryViewController);
		}
		return true;
	}

	splitViewControllerDidCollapse(svc: UISplitViewController): void {
		// Can be used to notify owner if needed
	}

	splitViewControllerDidExpand(svc: UISplitViewController): void {
		// Can be used to notify owner if needed
	}

	splitViewControllerDidHideColumn(svc: UISplitViewController, column: UISplitViewControllerColumn): void {
		// Can be used to notify owner if needed
	}

	splitViewControllerDidShowColumn(svc: UISplitViewController, column: UISplitViewControllerColumn): void {
		// Can be used to notify owner if needed
	}

	splitViewControllerDisplayModeForExpandingToProposedDisplayMode(svc: UISplitViewController, proposedDisplayMode: UISplitViewControllerDisplayMode): UISplitViewControllerDisplayMode {
		return UISplitViewControllerDisplayMode.TwoBesideSecondary;
	}

	splitViewControllerTopColumnForCollapsingToProposedTopColumn(svc: UISplitViewController, proposedTopColumn: UISplitViewControllerColumn): UISplitViewControllerColumn {
		return UISplitViewControllerColumn.Secondary;
	}

	toggleSidebar(sender: UIBarButtonItem): void {
		const owner = this._owner.deref();
		if (owner) {
			owner.showPrimary();
		}
	}

	static ObjCExposedMethods = {
		'toggleSidebar:': { returns: interop.types.void, params: [UIBarButtonItem] },
	};
}

export class SplitView extends SplitViewBase {
	static instance: SplitView;
	static getInstance(): SplitViewBase | null {
		return SplitView.instance;
	}

	public viewController: UISplitViewController;
	private _delegate: UISplitViewControllerDelegateImpl;
	// Keep role -> controller
	private _controllers = new Map<SplitRole, UIViewController | UINavigationController>();
	private _children = new Map<SplitRole, View>();

	constructor() {
		super();
		// Prefer modern initializer when available; otherwise default
		console.log('this._getSplitStyle(): ', this._getSplitStyle());
		this.viewController = UISplitViewController.alloc().initWithStyle(this._getSplitStyle());
	}

	createNativeView() {
		SplitView.instance = this;
		this._delegate = UISplitViewControllerDelegateImpl.initWithOwner(new WeakRef(this));
		this.viewController.delegate = this._delegate;
		this.viewController.presentsWithGesture = true;

		// Apply initial preferences
		this._applyPreferences();

		return this.viewController.view;
	}

	disposeNativeView(): void {
		super.disposeNativeView();
		this._controllers.clear();
		this._children.clear();
		this.viewController = null;
		this._delegate = null;
	}

	private _getSplitStyle() {
		switch (SplitView.SplitStyle) {
			case 'triple':
				return UISplitViewControllerStyle.TripleColumn;
			default:
				// default to double always
				return UISplitViewControllerStyle.DoubleColumn;
		}
	}

	// Controller-backed container: intercept native tree operations
	public _addViewToNativeVisualTree(child: SplitViewBase, atIndex: number): boolean {
		const role = this._resolveRoleForChild(child, atIndex);
		const controller = this._ensureControllerForChild(child);
		console.log('set controllers for role: ' + role);
		console.log('controller: ', controller);
		this._children.set(role, child);
		this._controllers.set(role, controller);
		this._syncControllers();
		return true;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		const role = this._findRoleByChild(child);
		if (role) {
			this._children.delete(role);
			this._controllers.delete(role);
			this._syncControllers();
		}
		super._removeViewFromNativeVisualTree(child);
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);

		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const horizontal = this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
		const vertical = this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;

		const measuredWidth = Math.max(widthMode === layout.UNSPECIFIED ? 0 : width, this.effectiveMinWidth) + (widthMode === layout.UNSPECIFIED ? horizontal : 0);
		const measuredHeight = Math.max(heightMode === layout.UNSPECIFIED ? 0 : height, this.effectiveMinHeight) + (heightMode === layout.UNSPECIFIED ? vertical : 0);

		const widthAndState = View.resolveSizeAndState(measuredWidth, width, widthMode, 0);
		const heightAndState = View.resolveSizeAndState(measuredHeight, height, heightMode, 0);
		this.setMeasuredDimension(widthAndState, heightAndState);
	}

	public onRoleChanged(view: View, oldValue: SplitRole, newValue: SplitRole) {
		// Move child mapping to new role and resync
		const oldRole = this._findRoleByChild(view);
		if (oldRole) {
			const controller = this._controllers.get(oldRole);
			this._controllers.delete(oldRole);
			this._children.delete(oldRole);
			if (controller) {
				this._controllers.set(newValue, controller);
			}
			this._children.set(newValue, view);
			this._syncControllers();
		}
	}

	onSecondaryViewCollapsed(secondaryViewController: UIViewController, primaryViewController: UIViewController): void {
		// Default implementation: do nothing.
		// Subclasses may override to customize behavior when secondary is collapsed onto primary.
	}

	showPrimary(): void {
		if (!this.viewController) return;
		this.viewController.showColumn(UISplitViewControllerColumn.Primary);
	}

	hidePrimary(): void {
		if (!this.viewController) return;
		this.viewController.hideColumn(UISplitViewControllerColumn.Primary);
	}

	showSecondary(): void {
		if (!this.viewController) return;
		this.viewController.showColumn(UISplitViewControllerColumn.Secondary);
	}

	hideSecondary(): void {
		if (!this.viewController) return;
		this.viewController.hideColumn(UISplitViewControllerColumn.Secondary);
	}

	showSupplementary(): void {
		if (!this.viewController) return;
		this.viewController.showColumn(UISplitViewControllerColumn.Supplementary);
	}

	private _resolveRoleForChild(child: SplitViewBase, atIndex: number): SplitRole {
		const explicit = SplitViewBase.getRole(child);
		if (explicit) {
			return explicit;
		}
		// Fallback by index if no explicit role set
		return this._roleByIndex(atIndex) as SplitRole;
	}

	private _findRoleByChild(child: View): SplitRole | null {
		for (const [role, c] of this._children.entries()) {
			if (c === child) {
				return role;
			}
		}
		return null;
	}

	private _ensureControllerForChild(child: View): UIViewController {
		// If child is controller-backed (Page/Frame/etc.), reuse its controller
		const vc = (child.ios instanceof UIViewController ? (child.ios as any) : (child as any).viewController) as UIViewController | null;
		if (vc) {
			return vc;
		}
		// Fallback: basic wrapper (not expected in current usage where children are Frames/Pages)
		const wrapper = UIViewController.new();
		if (!wrapper.view) {
			wrapper.view = UIView.new();
		}
		if (child.nativeViewProtected) {
			wrapper.view.addSubview(child.nativeViewProtected);
		}
		return wrapper;
	}

	private _syncControllers(): void {
		if (!this.viewController) {
			return;
		}
		// Prefer modern API if present; otherwise fall back to setting viewControllers array
		const primary = this._controllers.get('primary');
		const secondary = this._controllers.get('secondary');
		const supplementary = this._controllers.get('supplementary');

		if (primary) {
			this.viewController.setViewControllerForColumn(primary, UISplitViewControllerColumn.Primary);
		}
		if (secondary) {
			this.viewController.setViewControllerForColumn(secondary, UISplitViewControllerColumn.Secondary);
		}
		if (supplementary) {
			this.viewController.setViewControllerForColumn(supplementary, UISplitViewControllerColumn.Supplementary);
		}

		this._applyPreferences();
	}

	private _applyPreferences(): void {
		if (!this.viewController) {
			return;
		}

		// displayMode
		let preferredDisplayMode = UISplitViewControllerDisplayMode.Automatic;
		switch (this.displayMode) {
			case 'secondaryOnly':
				preferredDisplayMode = UISplitViewControllerDisplayMode.SecondaryOnly;
				break;
			case 'oneBesideSecondary':
				preferredDisplayMode = UISplitViewControllerDisplayMode.OneBesideSecondary;
				break;
			case 'oneOverSecondary':
				preferredDisplayMode = UISplitViewControllerDisplayMode.OneOverSecondary;
				break;
			case 'twoBesideSecondary':
				preferredDisplayMode = UISplitViewControllerDisplayMode.TwoBesideSecondary;
				break;
			case 'twoOverSecondary':
				preferredDisplayMode = UISplitViewControllerDisplayMode.TwoOverSecondary;
				break;
			case 'twoDisplaceSecondary':
				preferredDisplayMode = UISplitViewControllerDisplayMode.TwoDisplaceSecondary;
				break;
		}
		this.viewController.preferredDisplayMode = preferredDisplayMode;

		// splitBehavior (iOS 14+)
		const sb = this.splitBehavior;
		let preferredSplitBehavior = UISplitViewControllerSplitBehavior.Automatic;
		switch (sb) {
			case 'tile':
				preferredSplitBehavior = UISplitViewControllerSplitBehavior.Tile;
				break;
			case 'overlay':
				preferredSplitBehavior = UISplitViewControllerSplitBehavior.Overlay ?? UISplitViewControllerSplitBehavior.Automatic;
				break;
			case 'displace':
				preferredSplitBehavior = UISplitViewControllerSplitBehavior.Displace ?? UISplitViewControllerSplitBehavior.Automatic;
				break;
		}
		this.viewController.preferredSplitBehavior = preferredSplitBehavior;

		const primary = this._controllers.get('primary');
		const secondary = this._controllers.get('secondary');
		const supplementary = this._controllers.get('supplementary');
		if (secondary instanceof UINavigationController && secondary.navigationItem) {
			// TODO: add properties to customize this
			secondary.navigationItem.leftBarButtonItem = this.viewController.displayModeButtonItem;

			// Optional: slightly larger symbol weight/size
			// const cfg = UIImageSymbolConfiguration.configurationWithPointSizeWeightScale(18, UIImageSymbolWeight.Regular, UIImageSymbolScale.Medium);
			// const image = UIImage.systemImageNamedWithConfiguration('sidebar.left', cfg);

			// const item = UIBarButtonItem.alloc().initWithImageStyleTargetAction(image, UIBarButtonItemStyle.Plain, this._delegate, 'toggleSidebar:');
			// secondary.navigationItem.leftBarButtonItem = item;
			secondary.navigationItem.leftItemsSupplementBackButton = true;
		}
		if (supplementary) {
			this.showSupplementary();
		}

		// Width fractions
		if (typeof this.preferredPrimaryColumnWidthFraction === 'number' && !isNaN(this.preferredPrimaryColumnWidthFraction)) {
			this.viewController.preferredPrimaryColumnWidthFraction = this.preferredPrimaryColumnWidthFraction;
		}
		if (SplitView.SplitStyle === 'triple') {
			// supplementary only applies in triple style
			if (typeof this.preferredSupplementaryColumnWidthFraction === 'number' && !isNaN(this.preferredSupplementaryColumnWidthFraction)) {
				this.viewController.preferredSupplementaryColumnWidthFraction = this.preferredSupplementaryColumnWidthFraction;
			}
		}
	}

	[displayModeProperty.setNative](value: string) {
		this._applyPreferences();
	}

	[splitBehaviorProperty.setNative](value: string) {
		this._applyPreferences();
	}

	[preferredPrimaryColumnWidthFractionProperty.setNative](value: number) {
		this._applyPreferences();
	}

	[preferredSupplementaryColumnWidthFractionProperty.setNative](value: number) {
		this._applyPreferences();
	}
}
