import type { Point, Position } from './view-interfaces';
import { ViewCommon, isEnabledProperty, originXProperty, originYProperty, isUserInteractionEnabledProperty, testIDProperty } from './view-common';
import { ShowModalOptions, hiddenProperty } from '../view-base';
import { Trace } from '../../../trace';
import { layout } from '../../../utils';
import { Background } from '../../styling/background';
import { visibilityProperty, opacityProperty, rotateProperty, scaleXProperty, scaleYProperty, translateXProperty, translateYProperty, zIndexProperty, backgroundInternalProperty, directionProperty } from '../../styling/style-properties';
import { CoreTypes } from '../../../core-types';
import { own, release } from '../../../utils/gtk.linux';
import { createContainer, insertChild, registerNativeView, unregisterNativeView } from './gtk-layout.linux';
import { px, releaseWidgetCss, setWidgetCss } from '../../styling/gtk-style.linux';

export * from './view-common';
export * from './view-helper';
export * from '../properties';

const PFLAG_FORCE_LAYOUT = 1;
const PFLAG_MEASURED_DIMENSION_SET = 1 << 1;
const PFLAG_LAYOUT_REQUIRED = 1 << 2;

// set while a root runs the layout pass: GTK is already allocating
let inLayoutPass = 0;

function backgroundCss(background: Background): string {
	if (!background) {
		return '';
	}
	let css = '';
	if (background.color) {
		css += `background-color:${background.color.linux};background-image:none;`;
	}
	const widths = [background.borderTopWidth, background.borderRightWidth, background.borderBottomWidth, background.borderLeftWidth];
	if (widths.some((w) => w > 0)) {
		const colors = [background.borderTopColor, background.borderRightColor, background.borderBottomColor, background.borderLeftColor];
		css += `border-style:solid;border-width:${widths.map(px).join(' ')};border-color:${colors.map((c) => (c ? c.linux : 'transparent')).join(' ')};`;
	}
	const radii = [background.borderTopLeftRadius, background.borderTopRightRadius, background.borderBottomRightRadius, background.borderBottomLeftRadius];
	if (radii.some((r) => r > 0)) {
		css += `border-radius:${radii.map(px).join(' ')};`;
	}
	return css;
}

export class View extends ViewCommon {
	// @ts-ignore
	nativeViewProtected: any;

	_linuxFrame: [number, number, number, number] | null = null;
	private _privateFlags: number = PFLAG_LAYOUT_REQUIRED | PFLAG_FORCE_LAYOUT;
	private _isLaidOut = false;

	get linux(): any {
		return this.nativeViewProtected;
	}

	get isLayoutRequired(): boolean {
		return (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED;
	}

	get isLayoutRequested(): boolean {
		return (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
	}

	get isLayoutValid(): boolean {
		return !!this.nativeViewProtected && !this.isLayoutRequested;
	}

	public setNativeView(value: any): void {
		if (value) {
			own(value);
			registerNativeView(value, this);
		}
		super.setNativeView(value);
	}

	disposeNativeView() {
		const nativeView = this.nativeViewProtected;
		super.disposeNativeView();
		if (nativeView) {
			unregisterNativeView(nativeView);
			releaseWidgetCss(nativeView);
			release(nativeView);
		}
		this._linuxFrame = null;
		this._isLaidOut = false;
	}

	public requestLayout(): void {
		this._privateFlags |= PFLAG_FORCE_LAYOUT;
		super.requestLayout();
		const nativeView = this.nativeViewProtected;
		if (nativeView && !inLayoutPass) {
			// GTK re-allocates up to the root, which re-runs the layout pass
			gtk_widget_queue_resize(nativeView);
		}
	}

	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const measureSpecsChanged = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
		if (this.nativeViewProtected && (this.isLayoutRequested || measureSpecsChanged)) {
			this._privateFlags &= ~PFLAG_MEASURED_DIMENSION_SET;
			this.onMeasure(widthMeasureSpec, heightMeasureSpec);
			this._privateFlags |= PFLAG_LAYOUT_REQUIRED;
			if ((this._privateFlags & PFLAG_MEASURED_DIMENSION_SET) !== PFLAG_MEASURED_DIMENSION_SET && Trace.isEnabled()) {
				Trace.write('onMeasure() did not set the measured dimension by calling setMeasuredDimension() ' + this, Trace.categories.Layout, Trace.messageType.error);
			}
		}
	}

	public layout(left: number, top: number, right: number, bottom: number, setFrame = true): void {
		const { boundsChanged } = this._setCurrentLayoutBounds(left, top, right, bottom);
		if (setFrame) {
			this.layoutNativeView(left, top, right, bottom);
		}
		if (boundsChanged || this.isLayoutRequired) {
			this.onLayout(left, top, right, bottom);
			this._privateFlags &= ~PFLAG_LAYOUT_REQUIRED;
		}
		this._privateFlags &= ~PFLAG_FORCE_LAYOUT;
	}

	public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
		super.setMeasuredDimension(measuredWidth, measuredHeight);
		this._privateFlags |= PFLAG_MEASURED_DIMENSION_SET;
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const nativeSize = this.nativeViewProtected ? layout.measureNativeView(this.nativeViewProtected, width, widthMode, height, heightMode) : { width: 0, height: 0 };
		const measureWidth = Math.min(Math.max(nativeSize.width, this.effectiveMinWidth), this.effectiveMaxWidth);
		const measureHeight = Math.min(Math.max(nativeSize.height, this.effectiveMinHeight), this.effectiveMaxHeight);

		this.setMeasuredDimension(View.resolveSizeAndState(measureWidth, width, widthMode, 0), View.resolveSizeAndState(measureHeight, height, heightMode, 0));
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		//
	}

	public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
		if (!this.nativeViewProtected) {
			return;
		}
		const frame: [number, number, number, number] = [left, top, right - left, bottom - top];
		const old = this._linuxFrame;
		const changed = !old || old[0] !== frame[0] || old[1] !== frame[1] || old[2] !== frame[2] || old[3] !== frame[3];
		this._linuxFrame = frame;
		if (changed || !this._isLaidOut) {
			this._isLaidOut = true;
			if (Trace.isEnabled()) {
				Trace.write(`${this} :layoutNativeView: ${frame.join(',')}`, Trace.categories.Layout);
			}
			this._raiseLayoutChangedEvent();
		}
	}

	/** @internal Runs the layout pass for a root view at the size GTK allocated. */
	_linuxLayoutRoot(width: number, height: number): void {
		inLayoutPass++;
		try {
			View.measureChild(null, this, layout.makeMeasureSpec(width, layout.EXACTLY), layout.makeMeasureSpec(height, layout.EXACTLY));
			View.layoutChild(null, this, 0, 0, width, height);
		} finally {
			inLayoutPass--;
		}
	}

	/** @internal Transform applied when the parent allocates this view. */
	_linuxTransform(width: number, height: number): any {
		const rotate = this.rotate || 0;
		const scaleX = this.scaleX ?? 1;
		const scaleY = this.scaleY ?? 1;
		const translateX = layout.toDevicePixels(this.translateX || 0);
		const translateY = layout.toDevicePixels(this.translateY || 0);
		if (!rotate && scaleX === 1 && scaleY === 1 && !translateX && !translateY) {
			return null;
		}
		const originX = width * (this.originX ?? 0.5);
		const originY = height * (this.originY ?? 0.5);
		let t = gsk_transform_translate(null, new _graphene_point_t({ x: translateX + originX, y: translateY + originY }) as any);
		if (rotate) {
			t = gsk_transform_rotate(t, rotate);
		}
		if (scaleX !== 1 || scaleY !== 1) {
			t = gsk_transform_scale(t, scaleX, scaleY);
		}
		return gsk_transform_translate(t, new _graphene_point_t({ x: -originX, y: -originY }) as any);
	}

	public updateNativeTransform() {
		const parent = this.nativeViewProtected && gtk_widget_get_parent(this.nativeViewProtected);
		if (parent) {
			gtk_widget_queue_allocate(parent);
		}
	}

	public _getCurrentLayoutBounds(): Position {
		const frame = this._linuxFrame;
		if (!frame) {
			return { left: 0, top: 0, right: 0, bottom: 0 };
		}
		return { left: frame[0], top: frame[1], right: frame[0] + frame[2], bottom: frame[1] + frame[3] };
	}

	private _pointIn(target: any): Point | undefined {
		const widget = this.nativeViewProtected;
		if (!widget || !target) {
			return undefined;
		}
		const point = new _graphene_point_t({ x: 0, y: 0 }) as any;
		const result = new _graphene_point_t();
		if (!gtk_widget_compute_point(widget, target, point, result as any)) {
			return undefined;
		}
		return { x: result.x, y: result.y };
	}

	public getLocationInWindow(): Point {
		const widget = this.nativeViewProtected;
		return widget ? this._pointIn(gtk_widget_get_root(widget)) : undefined;
	}

	public getLocationOnScreen(): Point {
		// Wayland doesn't expose window positions
		return this.getLocationInWindow();
	}

	public getLocationRelativeTo(otherView: View): Point {
		return this._pointIn(otherView?.nativeViewProtected);
	}

	public focus(): boolean {
		const widget = this.nativeViewProtected;
		return widget ? !!gtk_widget_grab_focus(widget) : false;
	}

	_modalWindow: any = null;

	protected _showNativeModalView(parent: View, options: ShowModalOptions) {
		super._showNativeModalView(parent, options);
		const window: any = gtk_window_new();
		this._modalWindow = window;
		const parentWindow: any = parent.nativeViewProtected && gtk_widget_get_root(parent.nativeViewProtected);
		if (parentWindow) {
			gtk_window_set_transient_for(window, parentWindow);
		}
		gtk_window_set_modal(window, 1);
		const size = parentWindow ? [gtk_widget_get_width(parentWindow), gtk_widget_get_height(parentWindow)] : [640, 480];
		if (options.fullscreen) {
			gtk_window_set_default_size(window, size[0], size[1]);
		} else {
			gtk_window_set_default_size(window, Math.round(size[0] * 0.6), Math.round(size[1] * 0.6));
		}
		this._setupAsRootView({});
		gtk_window_set_child(window, this.nativeViewProtected);
		gtk_window_present(window);
		this.callLoaded();
		this._raiseShownModallyEvent();
	}

	protected _hideNativeModalView(parent: View, whenClosedCallback: () => void) {
		const window = this._modalWindow;
		this._modalWindow = null;
		if (window) {
			gtk_window_set_child(window, null);
			gtk_window_destroy(window);
		}
		this.callUnloaded();
		this._tearDownUI(true);
		whenClosedCallback();
	}

	[isEnabledProperty.setNative](value: boolean) {
		gtk_widget_set_sensitive(this.nativeViewProtected, value ? 1 : 0);
	}

	[originXProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[originYProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[testIDProperty.setNative](value: string) {
		gtk_widget_set_name(this.nativeViewProtected, value || '');
	}

	[isUserInteractionEnabledProperty.setNative](value: boolean) {
		gtk_widget_set_can_target(this.nativeViewProtected, value ? 1 : 0);
	}

	[hiddenProperty.setNative](value: boolean) {
		gtk_widget_set_visible(this.nativeViewProtected, value ? 0 : 1);
	}

	[visibilityProperty.setNative](value: CoreTypes.VisibilityType) {
		gtk_widget_set_visible(this.nativeViewProtected, value === CoreTypes.Visibility.visible ? 1 : 0);
		if (value === CoreTypes.Visibility.collapse || value === CoreTypes.Visibility.visible) {
			this.requestLayout();
		}
	}

	[opacityProperty.setNative](value: number) {
		gtk_widget_set_opacity(this.nativeViewProtected, value);
	}

	[rotateProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[scaleXProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[scaleYProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[translateXProperty.setNative](value: CoreTypes.dip) {
		this.updateNativeTransform();
	}

	[translateYProperty.setNative](value: CoreTypes.dip) {
		this.updateNativeTransform();
	}

	[zIndexProperty.setNative](value: number) {
		// siblings draw in order: move after the last sibling with a lower or equal z-index
		const widget = this.nativeViewProtected;
		const parent = widget && gtk_widget_get_parent(widget);
		if (!parent || !this.parent) {
			return;
		}
		let after: any = null;
		(this.parent as View).eachChildView((child: View) => {
			if (child !== this && child.nativeViewProtected && ((child as any).zIndex || 0) <= (value || 0)) {
				after = child.nativeViewProtected;
			}
			return true;
		});
		gtk_widget_insert_after(widget, parent, after);
	}

	[backgroundInternalProperty.setNative](value: Background) {
		this._redrawNativeBackground(value);
	}

	_redrawNativeBackground(value: Background): void {
		setWidgetCss(this.nativeViewProtected, 'background', backgroundCss(value instanceof Background ? value : null));
	}

	[directionProperty.setNative](value: CoreTypes.LayoutDirectionType) {
		gtk_widget_set_direction(this.nativeViewProtected, value === CoreTypes.LayoutDirection.rtl ? GtkTextDirection.RTL : GtkTextDirection.LTR);
	}
}

export class ContainerView extends View {}

export class CustomLayoutView extends ContainerView {
	createNativeView() {
		return createContainer();
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		// subclasses measure their children
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
		super._addViewToNativeVisualTree(child);
		const parent = this.nativeViewProtected;
		const nativeChild = child.nativeViewProtected;
		if (!parent || !nativeChild) {
			return false;
		}
		if (gtk_widget_get_parent(nativeChild)) {
			gtk_widget_unparent(nativeChild);
		}
		insertChild(parent, nativeChild, atIndex);
		return true;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		const nativeChild = child.nativeViewProtected;
		if (nativeChild && gtk_widget_get_parent(nativeChild)) {
			gtk_widget_unparent(nativeChild);
		}
		super._removeViewFromNativeVisualTree(child);
	}
}
