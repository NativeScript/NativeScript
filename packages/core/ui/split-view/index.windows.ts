export * from './split-view-common';

import { SplitViewBase, displayModeProperty, splitBehaviorProperty, preferredPrimaryColumnWidthFractionProperty, preferredSupplementaryColumnWidthFractionProperty, preferredInspectorColumnWidthFractionProperty, navigationBarTintColorProperty } from './split-view-common';
import { View } from '../core/view';
import { layout } from '../../utils';
import { FrameBase } from '../frame/frame-common';
import { Color } from '../../color';
import type { SplitRole } from '.';

export class SplitView extends SplitViewBase {
	static instance: SplitView;
	static getInstance(): SplitViewBase | null {
		return SplitView.instance;
	}
	primaryButtonAttached = false;
	inspectorButtonAttached = false;
	inspectorShowing = false;
	primaryShowing = true;
	nativeViewProtected: Windows.UI.Xaml.Controls.Grid;
	private _grid: Windows.UI.Xaml.Controls.Grid;
	// role -> container/native element and role -> child view
	private _containers = new Map<SplitRole, any>();
	private _children = new Map<SplitRole, View>();

	constructor() {
		super();
		this._grid = new Windows.UI.Xaml.Controls.Grid();
		try { this._grid.HorizontalAlignment = Windows.UI.Xaml.HorizontalAlignment.Stretch; } catch (_e) {}
		try { this._grid.VerticalAlignment = Windows.UI.Xaml.VerticalAlignment.Stretch; } catch (_e) {}
	}

	get windows(): Windows.UI.Xaml.Controls.Grid {
		return this._grid;
	}

	public createNativeView() {
		SplitView.instance = this;
		try { this.nativeViewProtected = this._grid; } catch (_e) {}
		return this._grid;
	}

	public initNativeView(): void {
		super.initNativeView && super.initNativeView();
		this._applyPreferences();
	}

	public disposeNativeView(): void {
		try {
			if (this._grid) {
				try { (this._grid as any).ColumnDefinitions.Clear(); } catch (_e) {}
				try { (this._grid as any).Children.Clear(); } catch (_e) {}
			}
		} catch (_e) {}

		this._containers.clear();
		this._children.clear();
		SplitView.instance = null;
		this._grid = null;
		super.disposeNativeView && super.disposeNativeView();
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
		// Call base implementation so the native/logic parent relationships and layout
		// bookkeeping are performed. This ensures measurement and layout work correctly.
		let res = true;
		try { res = super._addViewToNativeVisualTree(child, atIndex); } catch (_e) { res = true; }

		try {
			const role = this._resolveRoleForChild(child, atIndex);
			// Register logical child mapping so consumers can find it
			this._children.set(role, child);

			const nativeChild = (child as any).nativeViewProtected as any;
			// Store native child as the container for this role (avoid wrapping/reparenting)
			let container = this._containers.get(role);
			if (!container && nativeChild) {
				// nativeChild was appended to this._grid by super; keep it there and track it
				try { nativeChild.HorizontalAlignment = Windows.UI.Xaml.HorizontalAlignment.Stretch; } catch (_e) {}
				try { nativeChild.VerticalAlignment = Windows.UI.Xaml.VerticalAlignment.Stretch; } catch (_e) {}
				this._containers.set(role, nativeChild);
				container = nativeChild;
			}

			// Lightweight debug: walk the native child's subtree to locate ListView-like elements
			if (nativeChild) {
				try {
					const walk = (node: any, depth = 0) => {
						if (!node || depth > 6) return;
						try {
							const ctor = node && node.constructor ? node.constructor.name : null;
							try { console.log('[SplitView] native node', depth, ctor || (node as any).GetType?.Name || 'unknown'); } catch (_e) {}
						} catch (_e) {}
						try {
							const children = node.Children as any;
							if (children && typeof children.Size === 'number') {
								for (let i = 0; i < (children.Size ?? 0); i++) {
									try { walk(children.GetAt(i), depth + 1); } catch (_e) {}
								}
							} else {
								// If leaf, check for Items/ItemsSource
								try { if ((node as any).Items) { console.log('[SplitView] found Items with Size=', (node as any).Items?.Size ?? 'unknown'); } } catch (_e) {}
								try { if ((node as any).ItemsSource) { console.log('[SplitView] found ItemsSource'); } } catch (_e) {}
							}
						} catch (_e) {}
					};
					walk(nativeChild);
				} catch (_e) {}
			}

			this._syncColumns();

			// Ensure native layout pass occurs so children (ListView, Pages) can measure and render.
			try { Windows.UI.Xaml.Controls.Grid.SetRow(container, 0); } catch (_e) {}
			try { (container as any).InvalidateMeasure && (container as any).InvalidateMeasure(); } catch (_e) {}
			try { (container as any).UpdateLayout && (container as any).UpdateLayout(); } catch (_e) {}
			try { (this._grid as any).InvalidateMeasure && (this._grid as any).InvalidateMeasure(); } catch (_e) {}
			try { (this._grid as any).UpdateLayout && (this._grid as any).UpdateLayout(); } catch (_e) {}
			this._invalidateAllChildLayouts();
		} catch (_e) {}

		return res;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		try {
			const role = this._findRoleByChild(child);
			if (role) {
				const container = this._containers.get(role);
				if (container) {
					// Remove the container element (could be a native child or a wrapper grid)
					try { (this._grid as any).Children.Remove(container); } catch (_e) {}
				}
				// Cleanup any attached buttons/handlers on the removed child
				try {
					const childView: any = child as any;
					const cmdBar = this._findCommandBarFor(childView);

					if (childView._splitViewPrimaryNavigatedHandler) {
						try { childView.off && childView.off(FrameBase.navigatedToEvent, childView._splitViewPrimaryNavigatedHandler); } catch (_e) {}
						childView._splitViewPrimaryNavigatedHandler = null;
					}
					if (childView._splitViewPrimaryButton && cmdBar) {
						try {
							const cmds = (cmdBar as any).PrimaryCommands;
							const size = cmds?.Size ?? 0;
							for (let i = size - 1; i >= 0; i--) {
								try { if (cmds.GetAt(i) === childView._splitViewPrimaryButton) { cmds.RemoveAt(i); break; } } catch (_e) {}
							}
						} catch (_e) {}
						childView._splitViewPrimaryButton = null;
						this.primaryButtonAttached = false;
					}

					if (childView._splitViewNavigatedHandler) {
						try { childView.off && childView.off(FrameBase.navigatedToEvent, childView._splitViewNavigatedHandler); } catch (_e) {}
						childView._splitViewNavigatedHandler = null;
					}
					if (childView._splitViewInspectorButton && cmdBar) {
						try {
							const cmds = (cmdBar as any).PrimaryCommands;
							const size = cmds?.Size ?? 0;
							for (let i = size - 1; i >= 0; i--) {
								try { if (cmds.GetAt(i) === childView._splitViewInspectorButton) { cmds.RemoveAt(i); break; } } catch (_e) {}
							}
						} catch (_e) {}
						childView._splitViewInspectorButton = null;
						this.inspectorButtonAttached = false;
					}
				} catch (_e) {}

				this._containers.delete(role);
				this._children.delete(role);
				this._syncColumns();
			}
		} catch (_e) {}

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

	public _invalidateAllChildLayouts(): void {
		// Wait a short time to allow native transitions to finish
		setTimeout(() => this.invalidateChildLayouts(), 350);
	}

	invalidateChildLayouts(delay: number = 0): void {
		const refreshLayouts = () => {
			for (const [role, child] of this._children.entries()) {
				try { child.requestLayout && child.requestLayout(); } catch (_e) {}
				try {
					const native = (child as any).nativeViewProtected as any;
					if (native) {
						try { native.InvalidateMeasure && native.InvalidateMeasure(); } catch (_e) {}
						try { native.UpdateLayout && native.UpdateLayout(); } catch (_e) {}
					}
				} catch (_e) {}

				if ((child as FrameBase)?.currentPage?.requestLayout) {
					try { (child as FrameBase).currentPage.requestLayout(); } catch (_e) {}
					try {
						const np = (child as FrameBase).currentPage.nativeViewProtected as any;
						if (np) {
							try { np.InvalidateMeasure && np.InvalidateMeasure(); } catch (_e) {}
							try { np.UpdateLayout && np.UpdateLayout(); } catch (_e) {}
						}
					} catch (_e) {}
				}
			}

			try { this.requestLayout(); } catch (_e) {}
			try {
				if (this._grid) {
					try { (this._grid as any).InvalidateMeasure && (this._grid as any).InvalidateMeasure(); } catch (_e) {}
					try { (this._grid as any).UpdateLayout && (this._grid as any).UpdateLayout(); } catch (_e) {}
				}
			} catch (_e) {}
		};

		if (delay > 0) {
			setTimeout(refreshLayouts, delay);
		} else {
			refreshLayouts();
		}
	}

	private _resolveRoleForChild(child: SplitViewBase, atIndex: number): SplitRole {
		const explicit = SplitViewBase.getRole(child);
		if (explicit) return explicit;
		return this._roleByIndex(atIndex) as SplitRole;
	}

	private _findRoleByChild(child: View): SplitRole | null {
		for (const [role, c] of this._children.entries()) {
			if (c === child) return role;
		}
		return null;
	}

	private _syncColumns(): void {
		if (!this._grid) return;

		try {
			const ORDER: SplitRole[] = ['primary', 'secondary', 'supplementary', 'inspector'];
			try { console.log('[SplitView] _syncColumns start'); } catch (_e) {}
			const activeRoles = ORDER.filter((r) => this._children.has(r));
			try { console.log('[SplitView] activeRoles=', activeRoles); } catch (_e) {}

			// Build fractions map
			const specified = new Map<SplitRole, number>();
			let sumSpecified = 0;
			if (activeRoles.indexOf('primary') >= 0 && typeof this.preferredPrimaryColumnWidthFraction === 'number' && this.preferredPrimaryColumnWidthFraction > 0) {
				specified.set('primary', this.preferredPrimaryColumnWidthFraction);
				sumSpecified += this.preferredPrimaryColumnWidthFraction;
			}
			if (activeRoles.indexOf('supplementary') >= 0 && typeof this.preferredSupplementaryColumnWidthFraction === 'number' && this.preferredSupplementaryColumnWidthFraction > 0) {
				specified.set('supplementary', this.preferredSupplementaryColumnWidthFraction);
				sumSpecified += this.preferredSupplementaryColumnWidthFraction;
			}
			if (activeRoles.indexOf('inspector') >= 0 && typeof this.preferredInspectorColumnWidthFraction === 'number' && this.preferredInspectorColumnWidthFraction > 0) {
				specified.set('inspector', this.preferredInspectorColumnWidthFraction);
				sumSpecified += this.preferredInspectorColumnWidthFraction;
			}

			const unspecifiedCount = activeRoles.length - specified.size;
			const remaining = Math.max(0, 1 - sumSpecified);

			const fractions: number[] = [];
			for (const role of activeRoles) {
				if (specified.has(role)) {
					fractions.push(specified.get(role));
				} else {
					fractions.push(unspecifiedCount > 0 ? remaining / unspecifiedCount : 0);
				}
			}
			try { console.log('[SplitView] fractions=', fractions); } catch (_e) {}

			// Create ColumnDefinitions
			const colDefs: any[] = [];
			for (let i = 0; i < fractions.length; i++) {
				try {
					const cd = new Windows.UI.Xaml.Controls.ColumnDefinition();
					// Use star sizing based on fraction weight
					const weight = fractions[i] > 0 ? fractions[i] : 1;
					cd.Width = new Windows.UI.Xaml.GridLength(weight, Windows.UI.Xaml.GridUnitType.star);
					colDefs.push(cd);
				} catch (_e) {}
			}

			// Replace native column definitions
			try { (this._grid as any).ColumnDefinitions.ReplaceAll(colDefs); } catch (_e) {
				try { (this._grid as any).ColumnDefinitions.Clear(); } catch (_e2) {}
				for (const cd of colDefs) {
					try { (this._grid as any).ColumnDefinitions.Append(cd); } catch (_e3) {}
				}
			}
			try { console.log('[SplitView] applied', colDefs.length, 'ColumnDefinitions'); } catch (_e) {}

			// Ensure containers are in correct columns and present
			for (let i = 0; i < activeRoles.length; i++) {
				const role = activeRoles[i];
				let container = this._containers.get(role);
				if (!container) {
					container = new Windows.UI.Xaml.Controls.Grid();
					container.HorizontalAlignment = Windows.UI.Xaml.HorizontalAlignment.Stretch;
					container.VerticalAlignment = Windows.UI.Xaml.VerticalAlignment.Stretch;
					this._containers.set(role, container);
					try { (this._grid as any).Children.Append(container); } catch (_e) {}
				}
				try { Windows.UI.Xaml.Controls.Grid.SetColumn(container, i); } catch (_e) {}
			}
			try {
				for (let i = 0; i < activeRoles.length; i++) {
					const role = activeRoles[i];
					const container = this._containers.get(role) as any;
					const ctorName = container && container.constructor ? (container.constructor.name || (container as any).GetType?.Name) : 'none';
					const childCount = container ? (container.Children?.Size ?? 0) : 0;
					try { console.log('[SplitView] container', role, 'ctor=', ctorName, 'children=', childCount); } catch (_e) {}
				}
			} catch (_e) {}

			// Remove any containers for roles no longer active
			for (const [role, container] of Array.from(this._containers.entries())) {
				if (activeRoles.indexOf(role) === -1) {
					try { (this._grid as any).Children.Remove(container); } catch (_e) {}
					this._containers.delete(role);
				}
			}

			this._applyPreferences();
		} catch (_e) {}
	}

	private _applyPreferences(): void {
		if (!this._grid) return;

		try {
			// Ensure column visibility according to simple displayMode heuristics
			const ORDER: SplitRole[] = ['primary', 'secondary', 'supplementary', 'inspector'];
			const activeRoles = ORDER.filter((r) => this._children.has(r));

			// Update column widths if ColumnDefinitions exist
			const cols = (this._grid as any).ColumnDefinitions as any;
			const colCount = cols?.Size ?? 0;
			for (let i = 0; i < colCount; i++) {
				try {
					const cd = cols.GetAt(i);
					// keep existing star sizing; nothing to change per-column here since _syncColumns sets fractions
				} catch (_e) {}
			}

			// Show/hide specific columns based on explicit show/hide calls by client
			// (Client code should call showPrimary/hidePrimary etc.)
			// If preferred fractions are set, we already applied them in _syncColumns
			// Attach toggle buttons to Frame command bars when possible (methods defined at class scope)
			try {
				const primary = this._children.get('primary');
				if (primary) {
					this.attachPrimaryButton();
				}
				const inspector = this._children.get('inspector');
				if (inspector) {
					this.attachInspectorButton();
				}
			} catch (_e) {}

			// Show/hide specific columns based on explicit show/hide calls by client
			// (Client code should call showPrimary/hidePrimary etc.)
			// If preferred fractions are set, we already applied them in _syncColumns
			// Attach toggle buttons to Frame command bars when possible
			try {
				const primary = this._children.get('primary');
				if (primary) {
					this.attachPrimaryButton();
				}
				const inspector = this._children.get('inspector');
				if (inspector) {
					this.attachInspectorButton();
				}
			} catch (_e) {}
		} catch (_e) {}
	}

	showPrimary(): void {
		const container = this._containers.get('primary');
		if (!container) return;
		try { container.Visibility = Windows.UI.Xaml.Visibility.Visible; } catch (_e) {}
		this.primaryShowing = true;
		this._invalidateAllChildLayouts();
	}

	hidePrimary(): void {
		const container = this._containers.get('primary');
		if (!container) return;
		try { container.Visibility = Windows.UI.Xaml.Visibility.Collapsed; } catch (_e) {}
		this.primaryShowing = false;
		this._invalidateAllChildLayouts();
	}

	showSecondary(): void {
		const container = this._containers.get('secondary');
		if (!container) return;
		try { container.Visibility = Windows.UI.Xaml.Visibility.Visible; } catch (_e) {}
		this._invalidateAllChildLayouts();
	}

	hideSecondary(): void {
		const container = this._containers.get('secondary');
		if (!container) return;
		try { container.Visibility = Windows.UI.Xaml.Visibility.Collapsed; } catch (_e) {}
		this._invalidateAllChildLayouts();
	}

	showSupplementary(): void {
		const container = this._containers.get('supplementary');
		if (!container) return;
		try { container.Visibility = Windows.UI.Xaml.Visibility.Visible; } catch (_e) {}
		this._invalidateAllChildLayouts();
	}

	hideSupplementary(): void {
		const container = this._containers.get('supplementary');
		if (!container) return;
		try { container.Visibility = Windows.UI.Xaml.Visibility.Collapsed; } catch (_e) {}
		this._invalidateAllChildLayouts();
	}

	showInspector(): void {
		const container = this._containers.get('inspector');
		if (!container) return;
		try { container.Visibility = Windows.UI.Xaml.Visibility.Visible; } catch (_e) {}
		this.notifyInspectorChange(true);
		this._invalidateAllChildLayouts();
	}

	hideInspector(): void {
		const container = this._containers.get('inspector');
		if (!container) return;
		try { container.Visibility = Windows.UI.Xaml.Visibility.Collapsed; } catch (_e) {}
		this.notifyInspectorChange(false);
		this._invalidateAllChildLayouts();
	}

	notifyInspectorChange(showing: boolean): void {
		this.inspectorShowing = showing;
		this.notify({
			eventName: 'inspectorChange',
			object: this,
			data: { showing },
		});
	}

	private _findCommandBarFor(childView: any): any {
		try {
			const native = (childView && (childView.nativeViewProtected || childView.windows || childView)) as any;
			if (!native) return null;
			const visited = new Set<any>();
			const walk = (node: any, depth = 0): any => {
				if (!node || depth > 8 || visited.has(node)) return null;
				visited.add(node);
				try { if ((node as any).PrimaryCommands !== undefined) return node; } catch (_e) {}
				try {
					const children = node.Children as any;
					if (children && typeof children.Size === 'number') {
						for (let i = 0; i < (children.Size ?? 0); i++) {
							try {
								const el = children.GetAt(i);
								const found = walk(el, depth + 1);
								if (found) return found;
							} catch (_e) {}
						}
					}
				} catch (_e) {}
				return null;
			};
			return walk(native, 0);
		} catch (_e) {}
		return null;
	}

	private attachPrimaryButton(): void {
		if (this.primaryButtonAttached) return;

		const primaryChild = this._children.get('primary') as any;
		if (!primaryChild) return;

		const cmdBar = this._findCommandBarFor(primaryChild);
		if (!cmdBar) {
			// Wait for frame navigation so the command bar exists
			if (primaryChild && primaryChild.on && !primaryChild._splitViewPrimaryNavigatedHandler) {
				primaryChild._splitViewPrimaryNavigatedHandler = () => {
					setTimeout(() => this.attachPrimaryButton(), 0);
				};
				try { primaryChild.on(FrameBase.navigatedToEvent, primaryChild._splitViewPrimaryNavigatedHandler); } catch (_e) {}
			}
			return;
		}

		// Avoid duplicates
		if (primaryChild._splitViewPrimaryButton) return;

		try {
			const btn = new (Windows.UI.Xaml.Controls as any).AppBarButton();
			try {
				const fontIcon = new Windows.UI.Xaml.Controls.FontIcon();
				fontIcon.Glyph = '\u2630';
				(btn as any).Icon = fontIcon;
			} catch (_e) {}

			const that = new WeakRef(this);
			let delegate: any = null;
			try {
				delegate = new Windows.UI.Xaml.RoutedEventHandler(() => {
					const owner = that.deref();
					if (!owner) return;
					if (owner.primaryShowing) {
						owner.hidePrimary();
						owner.primaryShowing = false;
					} else {
						owner.showPrimary();
						owner.primaryShowing = true;
					}
				});
				(btn as any).Click = delegate as never;
			} catch (_e) {
				delegate = () => {
					const owner = that.deref();
					if (!owner) return;
					if (owner.primaryShowing) {
						owner.hidePrimary();
						owner.primaryShowing = false;
					} else {
						owner.showPrimary();
						owner.primaryShowing = true;
					}
				};
				try { (btn as any).Click = delegate as never; } catch (_e2) { try { if (typeof (btn as any).addEventListener === 'function') (btn as any).addEventListener('click', delegate); } catch (_e3) {} }
			}

			try { (cmdBar as any).PrimaryCommands.Append(btn); } catch (_e) {}
			primaryChild._splitViewPrimaryButton = btn;
			this.primaryButtonAttached = true;
		} catch (_e) {}
	}

	private attachInspectorButton(): void {
		if (this.inspectorButtonAttached) return;

		const inspectorChild = this._children.get('inspector') as any;
		if (!inspectorChild) return;

		const cmdBar = this._findCommandBarFor(inspectorChild);
		if (!cmdBar) {
			if (inspectorChild && inspectorChild.on && !inspectorChild._splitViewNavigatedHandler) {
				inspectorChild._splitViewNavigatedHandler = () => {
					setTimeout(() => this.attachInspectorButton(), 100);
				};
				try { inspectorChild.on(FrameBase.navigatedToEvent, inspectorChild._splitViewNavigatedHandler); } catch (_e) {}
			}
			return;
		}

		if (inspectorChild._splitViewInspectorButton) return;

		try {
			const btn = new (Windows.UI.Xaml.Controls as any).AppBarButton();
			try {
				const fontIcon = new Windows.UI.Xaml.Controls.FontIcon();
				fontIcon.Glyph = '\u25A3';
				(btn as any).Icon = fontIcon;
			} catch (_e) {}

			const that = new WeakRef(this);
			let delegate: any = null;
			try {
				delegate = new Windows.UI.Xaml.RoutedEventHandler(() => {
					const owner = that.deref();
					if (!owner) return;
					if (owner.inspectorShowing) {
						owner.hideInspector();
					} else {
						owner.showInspector();
					}
				});
				(btn as any).Click = delegate as never;
			} catch (_e) {
				delegate = () => {
					const owner = that.deref();
					if (!owner) return;
					if (owner.inspectorShowing) {
						owner.hideInspector();
					} else {
						owner.showInspector();
					}
				};
				try { (btn as any).Click = delegate as never; } catch (_e2) { try { if (typeof (btn as any).addEventListener === 'function') (btn as any).addEventListener('click', delegate); } catch (_e3) {} }
			}

			try { (cmdBar as any).PrimaryCommands.Append(btn); } catch (_e) {}
			inspectorChild._splitViewInspectorButton = btn;
			this.inspectorButtonAttached = true;
		} catch (_e) {}
	}

	[displayModeProperty.setNative](value: string) {
		this._syncColumns();
	}

	[splitBehaviorProperty.setNative](value: string) {
		this._syncColumns();
	}

	[preferredPrimaryColumnWidthFractionProperty.setNative](value: number) {
		this._syncColumns();
	}

	[preferredSupplementaryColumnWidthFractionProperty.setNative](value: number) {
		this._syncColumns();
	}

	[preferredInspectorColumnWidthFractionProperty.setNative](value: number) {
		this._syncColumns();
	}

	[navigationBarTintColorProperty.setNative](value: Color) {
		// No-op on Windows for now; keep API parity
	}
}

