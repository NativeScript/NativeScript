export * from './split-view-common';

import { SplitViewBase, displayModeProperty, preferredPrimaryColumnWidthFractionProperty, preferredSupplementaryColumnWidthFractionProperty, preferredInspectorColumnWidthFractionProperty } from './split-view-common';
import { View } from '../core/view';
import { layout } from '../../utils';
import type { SplitRole } from '.';

const ORDER: SplitRole[] = ['primary', 'supplementary', 'secondary', 'inspector'];

/** Columns laid out by NativeScript: primary | supplementary | secondary | inspector. */
export class SplitView extends SplitViewBase {
	static instance: SplitView;
	static getInstance(): SplitViewBase | null {
		return SplitView.instance;
	}

	private _hidden = new Set<SplitRole>(['inspector']);

	public createNativeView() {
		SplitView.instance = this;
		return super.createNativeView();
	}

	public disposeNativeView(): void {
		if (SplitView.instance === this) {
			SplitView.instance = null;
		}
		super.disposeNativeView();
	}

	private _roles(): Map<SplitRole, View> {
		const roles = new Map<SplitRole, View>();
		let index = 0;
		this.eachLayoutChild((child: View) => {
			// splitRole defaults to 'primary': unannotated children take roles by position
			let role = ((child as any).splitRole as SplitRole) || this._roleByIndex(index);
			if (roles.has(role)) {
				role = this._roleByIndex(index);
			}
			index++;
			if (!roles.has(role)) {
				roles.set(role, child);
			}
		});
		return roles;
	}

	private _visible(role: SplitRole, roles: Map<SplitRole, View>): boolean {
		if (!roles.has(role) || this._hidden.has(role)) {
			return false;
		}
		return !(this.displayMode === 'secondaryOnly' && role !== 'secondary');
	}

	/** Column widths for the visible roles; the secondary column takes the rest. */
	private _columns(width: number): [SplitRole, number][] {
		const roles = this._roles();
		const fraction: Record<string, number> = {
			primary: this.preferredPrimaryColumnWidthFraction || 0.3,
			supplementary: this.preferredSupplementaryColumnWidthFraction || 0.25,
			inspector: this.preferredInspectorColumnWidthFraction || 0.25,
		};
		const columns: [SplitRole, number][] = [];
		let used = 0;
		for (const role of ORDER) {
			if (role !== 'secondary' && this._visible(role, roles)) {
				const w = Math.round(width * fraction[role]);
				columns.push([role, w]);
				used += w;
			}
		}
		if (this._visible('secondary', roles)) {
			columns.splice(columns.findIndex(([r]) => r === 'inspector') >= 0 ? columns.length - 1 : columns.length, 0, ['secondary', Math.max(0, width - used)]);
		}
		return columns;
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);
		const roles = this._roles();
		let measuredHeight = 0;
		for (const [role, w] of this._columns(width)) {
			const child = roles.get(role);
			const size = View.measureChild(this, child, layout.makeMeasureSpec(w, layout.EXACTLY), heightMeasureSpec);
			measuredHeight = Math.max(measuredHeight, size.measuredHeight);
		}
		// hidden roles are measured to nothing
		for (const [role, child] of roles) {
			if (!this._visible(role, roles)) {
				View.measureChild(this, child, layout.makeMeasureSpec(0, layout.EXACTLY), layout.makeMeasureSpec(0, layout.EXACTLY));
			}
		}
		this.setMeasuredDimension(View.resolveSizeAndState(width, width, widthMode, 0), View.resolveSizeAndState(measuredHeight, height, heightMode, 0));
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		const roles = this._roles();
		let x = 0;
		for (const [role, w] of this._columns(right - left)) {
			View.layoutChild(this, roles.get(role), x, 0, x + w, bottom - top);
			x += w;
		}
		for (const [role, child] of roles) {
			if (!this._visible(role, roles)) {
				View.layoutChild(this, child, 0, 0, 0, 0);
			}
		}
	}

	private _toggle(role: SplitRole, show: boolean) {
		if (show) {
			this._hidden.delete(role);
		} else {
			this._hidden.add(role);
		}
		this.requestLayout();
	}

	showPrimary() {
		this._toggle('primary', true);
	}

	hidePrimary() {
		this._toggle('primary', false);
	}

	showSecondary() {
		this._toggle('secondary', true);
	}

	hideSecondary() {
		this._toggle('secondary', false);
	}

	showSupplementary() {
		this._toggle('supplementary', true);
	}

	hideSupplementary() {
		this._toggle('supplementary', false);
	}

	showInspector() {
		this._toggle('inspector', true);
	}

	hideInspector() {
		this._toggle('inspector', false);
	}

	invalidateChildLayouts(_delay = 0): void {
		this.requestLayout();
	}

	[displayModeProperty.setNative]() {
		this.requestLayout();
	}

	[preferredPrimaryColumnWidthFractionProperty.setNative]() {
		this.requestLayout();
	}

	[preferredSupplementaryColumnWidthFractionProperty.setNative]() {
		this.requestLayout();
	}

	[preferredInspectorColumnWidthFractionProperty.setNative]() {
		this.requestLayout();
	}
}
