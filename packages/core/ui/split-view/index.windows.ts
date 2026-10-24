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
	nativeViewProtected: Microsoft.UI.Xaml.Controls.Grid;
	private _grid: Microsoft.UI.Xaml.Controls.Grid;
	private _containers = new Map<SplitRole, any>();
	private _children = new Map<SplitRole, View>();
	private _primaryDelegate: any = null;
	private _inspectorDelegate: any = null;

	get windows(): Microsoft.UI.Xaml.Controls.Grid {
		return this._grid;
	}

	public createNativeView() {
		this._grid = new Microsoft.UI.Xaml.Controls.Grid();
		this._grid.HorizontalAlignment = Microsoft.UI.Xaml.HorizontalAlignment.Stretch;
		this._grid.VerticalAlignment = Microsoft.UI.Xaml.VerticalAlignment.Stretch;
		SplitView.instance = this;
		this.nativeViewProtected = this._grid;
		return this._grid;
	}

	public initNativeView(): void {
		super.initNativeView && super.initNativeView();
		this._applyPreferences();
	}

	public disposeNativeView(): void {
		if (this._grid) {
			this._grid.ColumnDefinitions.Clear();
			this._grid.Children.Clear();
		}

		this._containers.clear();
		this._children.clear();
		this._primaryDelegate = null;
		this._inspectorDelegate = null;
		SplitView.instance = null;
		this._grid = null;
		super.disposeNativeView && super.disposeNativeView();
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
		// Call base so native/logic parent relationships and layout bookkeeping are set up correctly.
		let res = true;
		try { res = super._addViewToNativeVisualTree(child, atIndex); } catch (_e) { res = true; }

		try {
			const role = this._resolveRoleForChild(child as SplitViewBase, atIndex);
			this._children.set(role, child);

			const nativeChild = (child as any).nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
			let container = this._containers.get(role) as Microsoft.UI.Xaml.FrameworkElement;
			if (!container && nativeChild) {
				// nativeChild was appended to this._grid by super; keep it there and track it
				nativeChild.HorizontalAlignment = Microsoft.UI.Xaml.HorizontalAlignment.Stretch;
				nativeChild.VerticalAlignment = Microsoft.UI.Xaml.VerticalAlignment.Stretch;
				this._containers.set(role, nativeChild);
				container = nativeChild;
			}

			this._syncColumns();

			// Ensure native layout pass occurs so children (ListView, Pages) can measure and render.
			if (container) {
				Microsoft.UI.Xaml.Controls.Grid.SetRow(container, 0);
				container.InvalidateMeasure();
				container.UpdateLayout();
			}
			this._grid.InvalidateMeasure();
			this._grid.UpdateLayout();
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
					(this._grid as any).Children.Remove(container);
				}
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
		setTimeout(() => this.invalidateChildLayouts(), 0);
	}

	invalidateChildLayouts(delay: number = 0): void {
		const refreshLayouts = () => {
			for (const [role, child] of this._children.entries()) {
				try { child.requestLayout && child.requestLayout(); } catch (_e) {}
				const native = (child as any).nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
				if (native) {
					native.InvalidateMeasure();
					native.UpdateLayout();
				}

				if ((child as FrameBase)?.currentPage?.requestLayout) {
					try { (child as FrameBase).currentPage.requestLayout(); } catch (_e) {}
					const np = (child as FrameBase).currentPage.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
					if (np) {
						np.InvalidateMeasure();
						np.UpdateLayout();
					}
				}
			}

			try { this.requestLayout(); } catch (_e) {}
			if (this._grid) {
				this._grid.InvalidateMeasure();
				this._grid.UpdateLayout();
			}
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
			const activeRoles = ORDER.filter((r) => this._children.has(r));

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

			const colDefs: Microsoft.UI.Xaml.Controls.ColumnDefinition[] = [];
			for (let i = 0; i < fractions.length; i++) {
				const cd = new Microsoft.UI.Xaml.Controls.ColumnDefinition();
				const weight = fractions[i] > 0 ? fractions[i] : 1;
				cd.Width = Microsoft.UI.Xaml.GridLengthHelper.FromValueAndType(weight, Microsoft.UI.Xaml.GridUnitType.Star);
				colDefs.push(cd);
			}

			try { this._grid.ColumnDefinitions.ReplaceAll(colDefs); } catch (_e) {
				try { this._grid.ColumnDefinitions.Clear(); } catch (_e2) {}
				for (const cd of colDefs) {
					try { this._grid.ColumnDefinitions.Append(cd); } catch (_e3) {}
				}
			}

			for (let i = 0; i < activeRoles.length; i++) {
				const role = activeRoles[i];
				let container = this._containers.get(role) as Microsoft.UI.Xaml.FrameworkElement;
				if (!container) {
					const grid = new Microsoft.UI.Xaml.Controls.Grid();
					grid.HorizontalAlignment = Microsoft.UI.Xaml.HorizontalAlignment.Stretch;
					grid.VerticalAlignment = Microsoft.UI.Xaml.VerticalAlignment.Stretch;
					this._containers.set(role, grid);
					container = grid;
					this._grid.Children.Append(grid);
				}
				Microsoft.UI.Xaml.Controls.Grid.SetColumn(container, i);
			}

			for (const [role, container] of Array.from(this._containers.entries())) {
				if (activeRoles.indexOf(role) === -1) {
					try { (this._grid.Children as any).Remove(container); } catch (_e) {}
					this._containers.delete(role);
				}
			}

			this._applyPreferences();
		} catch (_e) {}
	}

	private _applyPreferences(): void {
		if (!this._grid) return;

		try {
			const ORDER: SplitRole[] = ['primary', 'secondary', 'supplementary', 'inspector'];
			const activeRoles = ORDER.filter((r) => this._children.has(r));

			const cols = this._grid.ColumnDefinitions;
			const colCount = cols?.Size ?? 0;
			for (let i = 0; i < colCount; i++) {
				try {
					const cd = cols.GetAt(i);
					// star sizing already set by _syncColumns; nothing to change per-column here
				} catch (_e) {}
			}

			// Attach toggle buttons to Frame command bars (show/hide primary/inspector columns).
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
		const container = this._containers.get('primary') as Microsoft.UI.Xaml.UIElement;
		if (!container) return;
		container.Visibility = Microsoft.UI.Xaml.Visibility.Visible;
		this.primaryShowing = true;
		this._invalidateAllChildLayouts();
	}

	hidePrimary(): void {
		const container = this._containers.get('primary') as Microsoft.UI.Xaml.UIElement;
		if (!container) return;
		container.Visibility = Microsoft.UI.Xaml.Visibility.Collapsed;
		this.primaryShowing = false;
		this._invalidateAllChildLayouts();
	}

	showSecondary(): void {
		const container = this._containers.get('secondary') as Microsoft.UI.Xaml.UIElement;
		if (!container) return;
		container.Visibility = Microsoft.UI.Xaml.Visibility.Visible;
		this._invalidateAllChildLayouts();
	}

	hideSecondary(): void {
		const container = this._containers.get('secondary') as Microsoft.UI.Xaml.UIElement;
		if (!container) return;
		container.Visibility = Microsoft.UI.Xaml.Visibility.Collapsed;
		this._invalidateAllChildLayouts();
	}

	showSupplementary(): void {
		const container = this._containers.get('supplementary') as Microsoft.UI.Xaml.UIElement;
		if (!container) return;
		container.Visibility = Microsoft.UI.Xaml.Visibility.Visible;
		this._invalidateAllChildLayouts();
	}

	hideSupplementary(): void {
		const container = this._containers.get('supplementary') as Microsoft.UI.Xaml.UIElement;
		if (!container) return;
		container.Visibility = Microsoft.UI.Xaml.Visibility.Collapsed;
		this._invalidateAllChildLayouts();
	}

	showInspector(): void {
		const container = this._containers.get('inspector') as Microsoft.UI.Xaml.UIElement;
		if (!container) return;
		container.Visibility = Microsoft.UI.Xaml.Visibility.Visible;
		this.notifyInspectorChange(true);
		this._invalidateAllChildLayouts();
	}

	hideInspector(): void {
		const container = this._containers.get('inspector') as Microsoft.UI.Xaml.UIElement;
		if (!container) return;
		container.Visibility = Microsoft.UI.Xaml.Visibility.Collapsed;
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

		if (primaryChild._splitViewPrimaryButton) return;

		const btn = new Microsoft.UI.Xaml.Controls.AppBarButton();
		const fontIcon = new Microsoft.UI.Xaml.Controls.FontIcon();
		fontIcon.Glyph = '\u2630';
		btn.Icon = fontIcon;

		const that = new WeakRef(this);
		this._primaryDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.RoutedEventHandler', () => {
			const owner = that.deref();
			if (!owner) return;
			if (owner.primaryShowing) { owner.hidePrimary(); } else { owner.showPrimary(); }
		});
		btn.Click = this._primaryDelegate as never;
		try { (cmdBar as any).PrimaryCommands.Append(btn); } catch (_e) {}
		primaryChild._splitViewPrimaryButton = btn;
		this.primaryButtonAttached = true;
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

		const btn = new Microsoft.UI.Xaml.Controls.AppBarButton();
		const fontIcon = new Microsoft.UI.Xaml.Controls.FontIcon();
		fontIcon.Glyph = '\u25A3';
		btn.Icon = fontIcon;

		const that = new WeakRef(this);
		this._inspectorDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.RoutedEventHandler', () => {
			const owner = that.deref();
			if (!owner) return;
			if (owner.inspectorShowing) { owner.hideInspector(); } else { owner.showInspector(); }
		});
		btn.Click = this._inspectorDelegate as never;
		try { (cmdBar as any).PrimaryCommands.Append(btn); } catch (_e) {}
		inspectorChild._splitViewInspectorButton = btn;
		this.inspectorButtonAttached = true;
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
		// iOS-only tint color; no-op on Windows.
	}
}

