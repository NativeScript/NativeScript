// Definitions.
import { View as ViewDefinition, Point, Size, dip, ShownModallyData } from '.';

import { booleanConverter, ShowModalOptions, ViewBase } from '../view-base';
import { getEventOrGestureName } from '../bindable';
import { layout } from '../../../utils';
import { Color } from '../../../color';
import { Property, InheritedProperty } from '../properties';
import { EventData } from '../../../data/observable';
import { Trace } from '../../../trace';
import { ViewHelper } from './view-helper';

import { HorizontalAlignment, VerticalAlignment, Visibility, Length, PercentLength, BackgroundRepeat } from '../../styling/style-properties';

import { observe as gestureObserve, GesturesObserver, GestureTypes, GestureEventData, fromString as gestureFromString } from '../../gestures';

import { CSSUtils } from '../../../css/system-classes';
import { Builder } from '../../builder';
import { sanitizeModuleName } from '../../builder/module-name-sanitizer';
import { StyleScope } from '../../styling/style-scope';
import { LinearGradient } from '../../styling/linear-gradient';
import { TextTransform } from '../../text-base';

import * as am from '../../animation';

// helpers (these are okay re-exported here)
export * from './view-helper';

let animationModule: typeof am;
function ensureAnimationModule() {
	if (!animationModule) {
		animationModule = require('../../animation');
	}
}

export function CSSType(type: string): ClassDecorator {
	return (cls) => {
		cls.prototype.cssType = type;
	};
}

export function viewMatchesModuleContext(view: ViewDefinition, context: ModuleContext, types: ModuleType[]): boolean {
	return context && view._moduleName && context.type && types.some((type) => type === context.type) && context.path && context.path.includes(view._moduleName);
}

export function PseudoClassHandler(...pseudoClasses: string[]): MethodDecorator {
	const stateEventNames = pseudoClasses.map((s) => ':' + s);
	const listeners = Symbol('listeners');

	return <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
		function update(change: number) {
			let prev = this[listeners] || 0;
			let next = prev + change;
			if (prev <= 0 && next > 0) {
				this[propertyKey](true);
			} else if (prev > 0 && next <= 0) {
				this[propertyKey](false);
			}
		}
		stateEventNames.forEach((s) => (target[s] = update));
	};
}

export const _rootModalViews = new Array<ViewBase>();

export abstract class ViewCommon extends ViewBase implements ViewDefinition {
	public static layoutChangedEvent = 'layoutChanged';
	public static shownModallyEvent = 'shownModally';
	public static showingModallyEvent = 'showingModally';

	protected _closeModalCallback: Function;
	public _manager: any;
	public _modalParent: ViewCommon;
	private _modalContext: any;
	private _modal: ViewCommon;

	private _measuredWidth: number;
	private _measuredHeight: number;

	protected _isLayoutValid: boolean;
	private _cssType: string;

	private _localAnimations: Set<am.Animation>;

	_currentWidthMeasureSpec: number;
	_currentHeightMeasureSpec: number;

	_setMinWidthNative: (value: Length) => void;
	_setMinHeightNative: (value: Length) => void;

	public _gestureObservers = {};

	get css(): string {
		const scope = this._styleScope;

		return scope && scope.css;
	}
	set css(value: string) {
		this._updateStyleScope(undefined, undefined, value);
	}

	public addCss(cssString: string): void {
		this._updateStyleScope(undefined, cssString);
	}

	public addCssFile(cssFileName: string) {
		this._updateStyleScope(cssFileName);
	}

	public changeCssFile(cssFileName: string): void {
		const scope = this._styleScope;
		if (scope && cssFileName) {
			scope.changeCssFile(cssFileName);
			this._onCssStateChange();
		}
	}

	public _updateStyleScope(cssFileName?: string, cssString?: string, css?: string): void {
		let scope = this._styleScope;
		if (!scope) {
			scope = new StyleScope();
			this.setScopeProperty(scope, cssFileName, cssString, css);
			this._inheritStyleScope(scope);
			this._isStyleScopeHost = true;
		} else {
			this.setScopeProperty(scope, cssFileName, cssString, css);
			this._onCssStateChange();
		}
	}

	private setScopeProperty(scope: StyleScope, cssFileName?: string, cssString?: string, css?: string): void {
		if (cssFileName !== undefined) {
			scope.addCssFile(cssFileName);
		} else if (cssString !== undefined) {
			scope.addCss(cssString);
		} else if (css !== undefined) {
			scope.css = css;
		}
	}

	public _closeAllModalViewsInternal(): boolean {
		if (_rootModalViews && _rootModalViews.length > 0) {
			_rootModalViews.forEach((v) => {
				v.closeModal();
			});

			return true;
		}

		return false;
	}

	public _getRootModalViews(): Array<ViewBase> {
		return _rootModalViews;
	}

	public _onLivesync(context?: ModuleContext): boolean {
		if (Trace.isEnabled()) {
			Trace.write(`${this}._onLivesync(${JSON.stringify(context)})`, Trace.categories.Livesync);
		}

		if (this._closeAllModalViewsInternal()) {
			return true;
		}

		if (this._handleLivesync(context)) {
			return true;
		}

		let handled = false;
		this.eachChildView((child: ViewCommon) => {
			if (child._onLivesync(context)) {
				handled = true;

				return false;
			}
		});

		return handled;
	}

	public _handleLivesync(context?: ModuleContext): boolean {
		if (Trace.isEnabled()) {
			Trace.write(`${this}._handleLivesync(${JSON.stringify(context)})`, Trace.categories.Livesync);
		}

		// Handle local CSS
		if (viewMatchesModuleContext(this, context, ['style'])) {
			if (Trace.isEnabled()) {
				Trace.write(`Change Handled: Changing CSS for ${this}`, Trace.categories.Livesync);
			}

			// Always load styles with ".css" extension. Even when changes are in ".scss" ot ".less" files
			const cssModuleName = `${sanitizeModuleName(context.path)}.css`;

			this.changeCssFile(cssModuleName);

			return true;
		}

		// Handle script/markup changes in custom components by falling back to page refresh
		if (viewMatchesModuleContext(this, context, ['markup', 'script']) && this.page && this.page.frame) {
			if (Trace.isEnabled()) {
				Trace.write(`Change Handled: Changing ${context.type} for ${this} inside ${this.page}`, Trace.categories.Livesync);
			}

			return this.page.frame._handleLivesync({
				type: context.type,
				path: this.page._moduleName,
			});
		}

		return false;
	}

	_setupAsRootView(context: any): void {
		super._setupAsRootView(context);
		if (!this._styleScope) {
			this._updateStyleScope();
		}
	}

	_observe(type: GestureTypes, callback: (args: GestureEventData) => void, thisArg?: any): void {
		if (!this._gestureObservers[type]) {
			this._gestureObservers[type] = [];
		}

		this._gestureObservers[type].push(gestureObserve(this, type, callback, thisArg));
	}

	public getGestureObservers(type: GestureTypes): Array<GesturesObserver> {
		return this._gestureObservers[type];
	}

	public addEventListener(arg: string | GestureTypes, callback: (data: EventData) => void, thisArg?: any) {
		if (typeof arg === 'string') {
			arg = getEventOrGestureName(arg);

			let gesture = gestureFromString(arg);
			if (gesture && !this._isEvent(arg)) {
				this._observe(gesture, callback, thisArg);
			} else {
				let events = arg.split(',');
				if (events.length > 0) {
					for (let i = 0; i < events.length; i++) {
						let evt = events[i].trim();
						let gst = gestureFromString(evt);
						if (gst && !this._isEvent(arg)) {
							this._observe(gst, callback, thisArg);
						} else {
							super.addEventListener(evt, callback, thisArg);
						}
					}
				} else {
					super.addEventListener(arg, callback, thisArg);
				}
			}
		} else if (typeof arg === 'number') {
			this._observe(<GestureTypes>arg, callback, thisArg);
		}
	}

	public removeEventListener(arg: string | GestureTypes, callback?: any, thisArg?: any) {
		if (typeof arg === 'string') {
			let gesture = gestureFromString(arg);
			if (gesture && !this._isEvent(arg)) {
				this._disconnectGestureObservers(gesture);
			} else {
				let events = arg.split(',');
				if (events.length > 0) {
					for (let i = 0; i < events.length; i++) {
						let evt = events[i].trim();
						let gst = gestureFromString(evt);
						if (gst && !this._isEvent(arg)) {
							this._disconnectGestureObservers(gst);
						} else {
							super.removeEventListener(evt, callback, thisArg);
						}
					}
				} else {
					super.removeEventListener(arg, callback, thisArg);
				}
			}
		} else if (typeof arg === 'number') {
			this._disconnectGestureObservers(<GestureTypes>arg);
		}
	}

	public onBackPressed(): boolean {
		return false;
	}

	public _getFragmentManager(): any {
		return undefined;
	}

	private getModalOptions(args: IArguments): { view: ViewCommon; options: ShowModalOptions } {
		if (args.length === 0) {
			throw new Error('showModal without parameters is deprecated. Please call showModal on a view instance instead.');
		} else {
			let options: ShowModalOptions = null;

			if (args.length === 2) {
				options = <ShowModalOptions>args[1];
			} else {
				if (args[0] instanceof ViewCommon) {
					console.log('showModal(view: ViewBase, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean, stretched?: boolean) ' + 'is deprecated. Use showModal(view: ViewBase, modalOptions: ShowModalOptions) instead.');
				} else {
					console.log('showModal(moduleName: string, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean, stretched?: boolean) ' + 'is deprecated. Use showModal(moduleName: string, modalOptions: ShowModalOptions) instead.');
				}

				options = {
					context: args[1],
					closeCallback: args[2],
					fullscreen: args[3],
					animated: args[4],
					stretched: args[5],
				};
			}

			const firstArgument = args[0];
			const view = firstArgument instanceof ViewCommon ? firstArgument : <ViewCommon>Builder.createViewFromEntry({
							moduleName: firstArgument,
					  });

			return { view, options };
		}
	}

	public showModal(): ViewDefinition {
		const { view, options } = this.getModalOptions(arguments);

		view._showNativeModalView(this, options);

		return view;
	}

	public closeModal(...args) {
		let closeCallback = this._closeModalCallback;
		if (closeCallback) {
			closeCallback.apply(undefined, arguments);
		} else {
			let parent = this.parent;
			if (parent) {
				parent.closeModal(...args);
			}
		}
	}

	public get modal(): ViewCommon {
		return this._modal;
	}

	protected _showNativeModalView(parent: ViewCommon, options: ShowModalOptions) {
		_rootModalViews.push(this);

		this.cssClasses.add(CSSUtils.MODAL_ROOT_VIEW_CSS_CLASS);
		const modalRootViewCssClasses = CSSUtils.getSystemCssClasses();
		modalRootViewCssClasses.forEach((c) => this.cssClasses.add(c));

		parent._modal = this;
		this._modalParent = parent;
		this._modalContext = options.context;
		const that = this;
		this._closeModalCallback = function (...originalArgs) {
			if (that._closeModalCallback) {
				const modalIndex = _rootModalViews.indexOf(that);
				_rootModalViews.splice(modalIndex);
				that._modalParent = null;
				that._modalContext = null;
				that._closeModalCallback = null;
				that._dialogClosed();
				parent._modal = null;

				const whenClosedCallback = () => {
					if (typeof options.closeCallback === 'function') {
						options.closeCallback.apply(undefined, originalArgs);
					}
				};

				that._hideNativeModalView(parent, whenClosedCallback);
			}
		};
	}

	protected abstract _hideNativeModalView(parent: ViewCommon, whenClosedCallback: () => void);

	protected _raiseLayoutChangedEvent() {
		const args: EventData = {
			eventName: ViewCommon.layoutChangedEvent,
			object: this,
		};
		this.notify(args);
	}

	protected _raiseShownModallyEvent() {
		const args: ShownModallyData = {
			eventName: ViewCommon.shownModallyEvent,
			object: this,
			context: this._modalContext,
			closeCallback: this._closeModalCallback,
		};
		this.notify(args);
	}

	protected _raiseShowingModallyEvent() {
		const args: ShownModallyData = {
			eventName: ViewCommon.showingModallyEvent,
			object: this,
			context: this._modalContext,
			closeCallback: this._closeModalCallback,
		};
		this.notify(args);
	}

	private _isEvent(name: string): boolean {
		return this.constructor && `${name}Event` in this.constructor;
	}

	private _disconnectGestureObservers(type: GestureTypes): void {
		let observers = this.getGestureObservers(type);
		if (observers) {
			for (let i = 0; i < observers.length; i++) {
				observers[i].disconnect();
			}
		}
	}

	// START Style property shortcuts
	get borderColor(): string | Color {
		return this.style.borderColor;
	}
	set borderColor(value: string | Color) {
		this.style.borderColor = value;
	}

	get borderTopColor(): Color {
		return this.style.borderTopColor;
	}
	set borderTopColor(value: Color) {
		this.style.borderTopColor = value;
	}

	get borderRightColor(): Color {
		return this.style.borderRightColor;
	}
	set borderRightColor(value: Color) {
		this.style.borderRightColor = value;
	}

	get borderBottomColor(): Color {
		return this.style.borderBottomColor;
	}
	set borderBottomColor(value: Color) {
		this.style.borderBottomColor = value;
	}

	get borderLeftColor(): Color {
		return this.style.borderLeftColor;
	}
	set borderLeftColor(value: Color) {
		this.style.borderLeftColor = value;
	}

	get borderWidth(): string | Length {
		return this.style.borderWidth;
	}
	set borderWidth(value: string | Length) {
		this.style.borderWidth = value;
	}

	get borderTopWidth(): Length {
		return this.style.borderTopWidth;
	}
	set borderTopWidth(value: Length) {
		this.style.borderTopWidth = value;
	}

	get borderRightWidth(): Length {
		return this.style.borderRightWidth;
	}
	set borderRightWidth(value: Length) {
		this.style.borderRightWidth = value;
	}

	get borderBottomWidth(): Length {
		return this.style.borderBottomWidth;
	}
	set borderBottomWidth(value: Length) {
		this.style.borderBottomWidth = value;
	}

	get borderLeftWidth(): Length {
		return this.style.borderLeftWidth;
	}
	set borderLeftWidth(value: Length) {
		this.style.borderLeftWidth = value;
	}

	get borderRadius(): string | Length {
		return this.style.borderRadius;
	}
	set borderRadius(value: string | Length) {
		this.style.borderRadius = value;
	}

	get borderTopLeftRadius(): Length {
		return this.style.borderTopLeftRadius;
	}
	set borderTopLeftRadius(value: Length) {
		this.style.borderTopLeftRadius = value;
	}

	get borderTopRightRadius(): Length {
		return this.style.borderTopRightRadius;
	}
	set borderTopRightRadius(value: Length) {
		this.style.borderTopRightRadius = value;
	}

	get borderBottomRightRadius(): Length {
		return this.style.borderBottomRightRadius;
	}
	set borderBottomRightRadius(value: Length) {
		this.style.borderBottomRightRadius = value;
	}

	get borderBottomLeftRadius(): Length {
		return this.style.borderBottomLeftRadius;
	}
	set borderBottomLeftRadius(value: Length) {
		this.style.borderBottomLeftRadius = value;
	}

	get color(): Color {
		return this.style.color;
	}
	set color(value: Color) {
		this.style.color = value;
	}

	get background(): string {
		return this.style.background;
	}
	set background(value: string) {
		this.style.background = value;
	}

	get backgroundColor(): Color {
		return this.style.backgroundColor;
	}
	set backgroundColor(value: Color) {
		this.style.backgroundColor = value;
	}

	get backgroundImage(): string | LinearGradient {
		return this.style.backgroundImage;
	}
	set backgroundImage(value: string | LinearGradient) {
		this.style.backgroundImage = value;
	}

	get backgroundSize(): string {
		return this.style.backgroundSize;
	}
	set backgroundSize(value: string) {
		this.style.backgroundSize = value;
	}

	get backgroundPosition(): string {
		return this.style.backgroundPosition;
	}
	set backgroundPosition(value: string) {
		this.style.backgroundPosition = value;
	}

	get backgroundRepeat(): BackgroundRepeat {
		return this.style.backgroundRepeat;
	}
	set backgroundRepeat(value: BackgroundRepeat) {
		this.style.backgroundRepeat = value;
	}

	get minWidth(): Length {
		return this.style.minWidth;
	}
	set minWidth(value: Length) {
		this.style.minWidth = value;
	}

	get minHeight(): Length {
		return this.style.minHeight;
	}
	set minHeight(value: Length) {
		this.style.minHeight = value;
	}

	get width(): PercentLength {
		return this.style.width;
	}
	set width(value: PercentLength) {
		this.style.width = value;
	}

	get height(): PercentLength {
		return this.style.height;
	}
	set height(value: PercentLength) {
		this.style.height = value;
	}

	get margin(): string | PercentLength {
		return this.style.margin;
	}
	set margin(value: string | PercentLength) {
		this.style.margin = value;
	}

	get marginLeft(): PercentLength {
		return this.style.marginLeft;
	}
	set marginLeft(value: PercentLength) {
		this.style.marginLeft = value;
	}

	get marginTop(): PercentLength {
		return this.style.marginTop;
	}
	set marginTop(value: PercentLength) {
		this.style.marginTop = value;
	}

	get marginRight(): PercentLength {
		return this.style.marginRight;
	}
	set marginRight(value: PercentLength) {
		this.style.marginRight = value;
	}

	get marginBottom(): PercentLength {
		return this.style.marginBottom;
	}
	set marginBottom(value: PercentLength) {
		this.style.marginBottom = value;
	}

	get horizontalAlignment(): HorizontalAlignment {
		return this.style.horizontalAlignment;
	}
	set horizontalAlignment(value: HorizontalAlignment) {
		this.style.horizontalAlignment = value;
	}

	get verticalAlignment(): VerticalAlignment {
		return this.style.verticalAlignment;
	}
	set verticalAlignment(value: VerticalAlignment) {
		this.style.verticalAlignment = value;
	}

	get visibility(): Visibility {
		return this.style.visibility;
	}
	set visibility(value: Visibility) {
		this.style.visibility = value;
	}

	get opacity(): number {
		return this.style.opacity;
	}
	set opacity(value: number) {
		this.style.opacity = value;
	}

	get rotate(): number {
		return this.style.rotate;
	}
	set rotate(value: number) {
		this.style.rotate = value;
	}

	get rotateX(): number {
		return this.style.rotateX;
	}
	set rotateX(value: number) {
		this.style.rotateX = value;
	}

	get rotateY(): number {
		return this.style.rotateY;
	}
	set rotateY(value: number) {
		this.style.rotateY = value;
	}

	get perspective(): number {
		return this.style.perspective;
	}
	set perspective(value: number) {
		this.style.perspective = value;
	}

	get textTransform(): TextTransform {
		return this.style.textTransform;
	}
	set textTransform(value: TextTransform) {
		this.style.textTransform = value;
	}

	get translateX(): dip {
		return this.style.translateX;
	}
	set translateX(value: dip) {
		this.style.translateX = value;
	}

	get translateY(): dip {
		return this.style.translateY;
	}
	set translateY(value: dip) {
		this.style.translateY = value;
	}

	get scaleX(): number {
		return this.style.scaleX;
	}
	set scaleX(value: number) {
		this.style.scaleX = value;
	}

	get scaleY(): number {
		return this.style.scaleY;
	}
	set scaleY(value: number) {
		this.style.scaleY = value;
	}

	get androidElevation(): number {
		return this.style.androidElevation;
	}
	set androidElevation(value: number) {
		this.style.androidElevation = value;
	}

	get androidDynamicElevationOffset(): number {
		return this.style.androidDynamicElevationOffset;
	}
	set androidDynamicElevationOffset(value: number) {
		this.style.androidDynamicElevationOffset = value;
	}

	//END Style property shortcuts

	public automationText: string;
	public originX: number;
	public originY: number;
	public isEnabled: boolean;
	public isUserInteractionEnabled: boolean;
	public iosOverflowSafeArea: boolean;
	public iosOverflowSafeAreaEnabled: boolean;

	get isLayoutValid(): boolean {
		return this._isLayoutValid;
	}

	get cssType(): string {
		if (!this._cssType) {
			this._cssType = this.typeName.toLowerCase();
		}

		return this._cssType;
	}
	set cssType(type: string) {
		this._cssType = type.toLowerCase();
	}

	get isLayoutRequired(): boolean {
		return true;
	}

	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
	}

	public layout(left: number, top: number, right: number, bottom: number): void {
		this._setCurrentLayoutBounds(left, top, right, bottom);
	}

	public getMeasuredWidth(): number {
		return this._measuredWidth & layout.MEASURED_SIZE_MASK || 0;
	}

	public getMeasuredHeight(): number {
		return this._measuredHeight & layout.MEASURED_SIZE_MASK || 0;
	}

	public getMeasuredState(): number {
		return (this._measuredWidth & layout.MEASURED_STATE_MASK) | ((this._measuredHeight >> layout.MEASURED_HEIGHT_STATE_SHIFT) & (layout.MEASURED_STATE_MASK >> layout.MEASURED_HEIGHT_STATE_SHIFT));
	}

	public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
		this._measuredWidth = measuredWidth;
		this._measuredHeight = measuredHeight;
		if (Trace.isEnabled()) {
			Trace.write(this + ' :setMeasuredDimension: ' + measuredWidth + ', ' + measuredHeight, Trace.categories.Layout);
		}
	}

	public requestLayout(): void {
		this._isLayoutValid = false;
		super.requestLayout();
	}

	public abstract onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;
	public abstract onLayout(left: number, top: number, right: number, bottom: number): void;
	public abstract layoutNativeView(left: number, top: number, right: number, bottom: number): void;

	public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number {
		return ViewHelper.resolveSizeAndState(size, specSize, specMode, childMeasuredState);
	}

	public static combineMeasuredStates(curState: number, newState): number {
		return ViewHelper.combineMeasuredStates(curState, newState);
	}

	public static layoutChild(parent: ViewDefinition, child: ViewDefinition, left: number, top: number, right: number, bottom: number, setFrame: boolean = true): void {
		ViewHelper.layoutChild(parent, child, left, top, right, bottom);
	}

	public static measureChild(parent: ViewCommon, child: ViewCommon, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number } {
		return ViewHelper.measureChild(parent, child, widthMeasureSpec, heightMeasureSpec);
	}

	_setCurrentMeasureSpecs(widthMeasureSpec: number, heightMeasureSpec: number): boolean {
		let changed: boolean = this._currentWidthMeasureSpec !== widthMeasureSpec || this._currentHeightMeasureSpec !== heightMeasureSpec;
		this._currentWidthMeasureSpec = widthMeasureSpec;
		this._currentHeightMeasureSpec = heightMeasureSpec;

		return changed;
	}

	_getCurrentLayoutBounds(): {
		left: number;
		top: number;
		right: number;
		bottom: number;
	} {
		return { left: 0, top: 0, right: 0, bottom: 0 };
	}

	/**
	 * Returns two booleans - the first if "boundsChanged" the second is "sizeChanged".
	 */
	_setCurrentLayoutBounds(left: number, top: number, right: number, bottom: number): { boundsChanged: boolean; sizeChanged: boolean } {
		this._isLayoutValid = true;
		let boundsChanged: boolean = this._oldLeft !== left || this._oldTop !== top || this._oldRight !== right || this._oldBottom !== bottom;
		let sizeChanged: boolean = this._oldRight - this._oldLeft !== right - left || this._oldBottom - this._oldTop !== bottom - top;
		this._oldLeft = left;
		this._oldTop = top;
		this._oldRight = right;
		this._oldBottom = bottom;

		return { boundsChanged, sizeChanged };
	}

	public eachChild(callback: (child: ViewBase) => boolean): void {
		this.eachChildView(<any>callback);
	}

	public eachChildView(callback: (view: ViewDefinition) => boolean) {
		//
	}

	_getNativeViewsCount(): number {
		return this._isAddedToNativeVisualTree ? 1 : 0;
	}

	_eachLayoutView(callback: (View) => void): void {
		return callback(this);
	}

	public focus(): boolean {
		return undefined;
	}

	public getSafeAreaInsets(): { left; top; right; bottom } {
		return { left: 0, top: 0, right: 0, bottom: 0 };
	}

	public getLocationInWindow(): Point {
		return undefined;
	}

	public getLocationOnScreen(): Point {
		return undefined;
	}

	public getLocationRelativeTo(otherView: ViewDefinition): Point {
		return undefined;
	}

	public getActualSize(): Size {
		let currentBounds = this._getCurrentLayoutBounds();
		if (!currentBounds) {
			return undefined;
		}

		return {
			width: layout.toDeviceIndependentPixels(currentBounds.right - currentBounds.left),
			height: layout.toDeviceIndependentPixels(currentBounds.bottom - currentBounds.top),
		};
	}

	public animate(animation: any): am.AnimationPromise {
		return this.createAnimation(animation).play();
	}

	public createAnimation(animation: any): am.Animation {
		ensureAnimationModule();
		if (!this._localAnimations) {
			this._localAnimations = new Set();
		}
		animation.target = this;
		const anim = new animationModule.Animation([animation]);
		this._localAnimations.add(anim);

		return anim;
	}

	public _removeAnimation(animation: am.Animation): boolean {
		const localAnimations = this._localAnimations;
		if (localAnimations && localAnimations.has(animation)) {
			localAnimations.delete(animation);
			if (animation.isPlaying) {
				animation.cancel();
			}

			return true;
		}

		return false;
	}

	public resetNativeView(): void {
		if (this._localAnimations) {
			this._localAnimations.forEach((a) => this._removeAnimation(a));
		}

		super.resetNativeView();
	}

	public _setNativeViewFrame(nativeView: any, frame: any) {
		//
	}

	public _getValue(): never {
		throw new Error('The View._getValue is obsolete. There is a new property system.');
	}

	public _setValue(): never {
		throw new Error('The View._setValue is obsolete. There is a new property system.');
	}

	_updateEffectiveLayoutValues(parentWidthMeasureSize: number, parentWidthMeasureMode: number, parentHeightMeasureSize: number, parentHeightMeasureMode: number): void {
		const style = this.style;

		const availableWidth = parentWidthMeasureMode === layout.UNSPECIFIED ? -1 : parentWidthMeasureSize;

		this.effectiveWidth = PercentLength.toDevicePixels(style.width, -2, availableWidth);
		this.effectiveMarginLeft = PercentLength.toDevicePixels(style.marginLeft, 0, availableWidth);
		this.effectiveMarginRight = PercentLength.toDevicePixels(style.marginRight, 0, availableWidth);

		const availableHeight = parentHeightMeasureMode === layout.UNSPECIFIED ? -1 : parentHeightMeasureSize;

		this.effectiveHeight = PercentLength.toDevicePixels(style.height, -2, availableHeight);
		this.effectiveMarginTop = PercentLength.toDevicePixels(style.marginTop, 0, availableHeight);
		this.effectiveMarginBottom = PercentLength.toDevicePixels(style.marginBottom, 0, availableHeight);
	}

	public _setNativeClipToBounds() {
		//
	}

	public _redrawNativeBackground(value: any): void {
		//
	}

	_onAttachedToWindow(): void {
		//
	}

	_onDetachedFromWindow(): void {
		//
	}

	_hasAncestorView(ancestorView: ViewDefinition): boolean {
		let matcher = (view: ViewDefinition) => view === ancestorView;

		for (let parent = this.parent; parent != null; parent = parent.parent) {
			if (matcher(<ViewDefinition>parent)) {
				return true;
			}
		}

		return false;
	}
}

export const automationTextProperty = new Property<ViewCommon, string>({
	name: 'automationText',
});
automationTextProperty.register(ViewCommon);

export const originXProperty = new Property<ViewCommon, number>({
	name: 'originX',
	defaultValue: 0.5,
	valueConverter: (v) => parseFloat(v),
});
originXProperty.register(ViewCommon);

export const originYProperty = new Property<ViewCommon, number>({
	name: 'originY',
	defaultValue: 0.5,
	valueConverter: (v) => parseFloat(v),
});
originYProperty.register(ViewCommon);

export const isEnabledProperty = new Property<ViewCommon, boolean>({
	name: 'isEnabled',
	defaultValue: true,
	valueConverter: booleanConverter,
	valueChanged(this: void, target, oldValue, newValue): void {
		target._goToVisualState(newValue ? 'normal' : 'disabled');
	},
});
isEnabledProperty.register(ViewCommon);

export const isUserInteractionEnabledProperty = new Property<ViewCommon, boolean>({
	name: 'isUserInteractionEnabled',
	defaultValue: true,
	valueConverter: booleanConverter,
});
isUserInteractionEnabledProperty.register(ViewCommon);

export const iosOverflowSafeAreaProperty = new Property<ViewCommon, boolean>({
	name: 'iosOverflowSafeArea',
	defaultValue: false,
	valueConverter: booleanConverter,
});
iosOverflowSafeAreaProperty.register(ViewCommon);

export const iosOverflowSafeAreaEnabledProperty = new InheritedProperty<ViewCommon, boolean>({
	name: 'iosOverflowSafeAreaEnabled',
	defaultValue: true,
	valueConverter: booleanConverter,
});
iosOverflowSafeAreaEnabledProperty.register(ViewCommon);
